#!/usr/bin/env bash
# Never trace expansions of secret environment variables.
set +x
set -euo pipefail

fail() { printf '%s\n' "$1" >&2; exit 1; }
[[ "${GITHUB_REF:-}" == 'refs/heads/main' ]] || fail 'Deployment is allowed only from main.'
[[ "${DRY_RUN:-}" == true || "${DRY_RUN:-}" == false ]] || fail 'DRY_RUN must be true or false.'
for variable in SFTP_HOST SFTP_USER LFTP_PASSWORD SFTP_REMOTE_DIR SFTP_KNOWN_HOSTS; do
  [[ -n "${!variable:-}" ]] || fail "Required secret is missing: $variable"
done

# Restrict connection/path syntax so secrets cannot inject lftp commands.
# IONOS hostnames and account names fit these formats; use a hostname, not a URL.
[[ "$SFTP_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || fail 'Invalid SFTP hostname.'
[[ "$SFTP_USER" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_.@-]*$ ]] || fail 'Invalid SFTP username.'
[[ "$SFTP_REMOTE_DIR" =~ ^/[a-zA-Z0-9_./-]*$ ]] || fail 'Use an absolute remote path without spaces or shell syntax.'
[[ "/${SFTP_REMOTE_DIR#/}/" != *'/../'* ]] || fail 'Remote path must not contain parent traversal.'
stage_dir="$(realpath -- "${1:?Pass the staging directory}")"
[[ -d "$stage_dir" && -f "$stage_dir/index.html" ]] || fail 'Public staging directory is missing.'
[[ "$stage_dir" =~ ^/[a-zA-Z0-9_./-]+$ ]] || fail 'Staging path contains unsupported characters.'
command -v lftp >/dev/null || fail 'lftp is required.'

umask 077
key_dir="$(mktemp -d /tmp/portfolio-sftp.XXXXXXXX)"
trap 'rm -rf -- "$key_dir"' EXIT
# These are public host keys, never the authentication password.
printf '%s\n' "$SFTP_KNOWN_HOSTS" > "$key_dir/known_hosts"
ssh-keygen -l -f "$key_dir/known_hosts" >/dev/null 2>&1 || fail 'SFTP_KNOWN_HOSTS is not a valid host-key file.'
unset SFTP_KNOWN_HOSTS

mirror_options='--reverse --verbose --no-perms --no-symlinks --max-errors=1'
if [[ "$DRY_RUN" == true ]]; then
  mirror_options+=' --dry-run'
  printf '%s\n' 'Dry run: listing planned transfers; no remote changes.'
else
  printf '%s\n' 'Uploading allowlisted public files; remote deletion is disabled.'
fi

# --norc ignores user startup files. Strict checking uses only the verified keys.
# No password occurs in commands, arguments, generated files, or logs.
lftp --norc --env-password --user "$SFTP_USER" -p 22 "sftp://$SFTP_HOST" <<EOF
set cmd:fail-exit yes
set net:max-retries 1
set net:timeout 20
set sftp:auto-confirm no
set sftp:connect-program "ssh -a -x -F /dev/null -oStrictHostKeyChecking=yes -oUserKnownHostsFile=$key_dir/known_hosts -oGlobalKnownHostsFile=/dev/null -oUpdateHostKeys=no -oPreferredAuthentications=password -oPubkeyAuthentication=no -oNumberOfPasswordPrompts=1 -oConnectTimeout=20"
set log:enabled no
set log:enabled/xfer no
cd "$SFTP_REMOTE_DIR"
mirror $mirror_options "$stage_dir/" .
bye
EOF
