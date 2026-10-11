# Manual IONOS SFTP deployment

The workflow `.github/workflows/deploy-ionos.yml` runs only on manual dispatch
and skips any ref other than `refs/heads/main`. The script independently checks
that ref. No website build is needed: the site uses local HTML/CSS/JavaScript,
images, a PDF, and the existing PHP mail handler. No PHP configuration or form
behavior is changed by deployment preparation.

## Upload contents

`deploy/public-files.txt` is the complete, file-by-file upload contract. It
contains 59 files, preserving their repository-relative paths:

- Root: `index.html`, `about.html`, `projects.html`, `tech.html`, `hobbies.html`,
  `resume.html`, `contact.php`, `able_nathan_resume.pdf`.
- `css/`: `layout.css`, `home.css`, `about.css`, `projects.css`, `tech.css`,
  `hobbies.css`, `resume.css`, `contact.css`.
- `js/`: `site.js`, `home.js`, `projects.js`, `hobbies.js`, `contact.js`.
- `images/`: `Amazon_logo.svg`, `Database-icon.svg`, `Microsoft_Office_Excel.svg`,
  `Microsoft_VBA.png`, `Sql_logo.svg`, `Sys_admin.png`, `Tableau_Logo.png`,
  `Trello_logo.svg`, `charity.jpg`, `chrome.png`, `cloudflare.svg`, `css3.svg`,
  `django_logo.svg`, `favicon.ico`, `github.svg`, `hobby0.jpg`, `hobby1.jpg`,
  `hobby2.jpg`, `hobby3.jpg`, `hobby4.jpg`, `hobby5.jpg`, `hobby6.jpg`,
  `hobby7.jpg`, `hobby8.jpg`, `hobby9.jpg`, `html5.svg`, `javascript.svg`,
  `loreal.jpg`, `me.png`, `me2.png`, `minigame.jpg`, `nasa.jpg`, `nodejs.svg`,
  `og-card-nathan-able.png`, `python.svg`, `react.svg`, `vite.svg`, `wip.png`.

Directories are not uploaded wholesale. Unreferenced `images/notion.svg`,
`images/render.svg`, and `images/vscode.svg` are excluded. Guidance, README,
documentation, deployment scripts, workflows, source-control files, local
configuration, credentials, and server configuration such as `.htaccess`
are excluded. New website dependencies must be added explicitly to the allowlist.
Staging fails on missing entries, duplicate entries, symlinks, unsafe paths,
or an existing staging directory.

## Secrets and verified host keys

Keep the existing repository Actions secrets `SFTP_HOST`, `SFTP_USER`,
`SFTP_PASSWORD`, and `SFTP_REMOTE_DIR`. The remote directory is currently `/`:
confirm in your trusted FileZilla session that this is the website directory
within the SFTP account's visible filesystem. The hostname must be the exact
IONOS SFTP hostname (without `sftp://`), not necessarily the website domain.
Port 22 is used. If your actual trusted connection uses a different port,
update the script's port and the host-key collection command before running.

Add repository Actions secret `SFTP_KNOWN_HOSTS`, containing verified OpenSSH
known_hosts lines for that exact hostname. On a trusted computer with OpenSSH,
collect candidate **public** keys (replace the example hostname):

```sh
ssh-keyscan -p 22 -t ed25519,ecdsa,rsa sftp-host.example > ionos-candidate-known-hosts
ssh-keygen -lf ionos-candidate-known-hosts -E sha256
```

`ssh-keyscan` does not verify identity. Before saving anything, compare each
candidate's key type and SHA256 fingerprint with the host key shown by your
already trusted FileZilla connection to the same host and port. FileZilla's
host-key dialog/connection details should show that fingerprint. Do not trust
a fresh connection prompt merely because it matches the unverified scan.
If FileZilla uses a different fingerprint format, compare the same format
(`ssh-keygen -lf ionos-candidate-known-hosts -E md5`), or obtain independent
confirmation from IONOS. Keep only independently verified key lines; one
verified supported key is sufficient. Save those full lines, not just the
fingerprints, as `SFTP_KNOWN_HOSTS`. Never save a private key or password in
that file. For nonstandard ports, known_hosts uses `[hostname]:port` entries.

The workflow never scans or automatically accepts keys. Unknown or changed
keys fail the connection. A legitimate host-key rotation requires rechecking
the fingerprint and updating the secret; do not disable strict checking.
Public host keys are written temporarily with restricted permissions and
cleaned up. The password is supplied only through `LFTP_PASSWORD` and
`--env-password`; no credential file or shell tracing is used.

## First dry run, then a real upload

1. After you separately review and place these files on the repository's
   default branch/main, open GitHub **Actions → Deploy website to IONOS →
   Run workflow**. This preparation does not commit or push anything.
2. Select **main** and leave **dry_run** checked (the default). Run the workflow.
   Review the staged-file list and planned transfers in the logs. A dry run
   authenticates and reads remote listings but makes no server changes. Confirm
   the target directory against FileZilla before proceeding.
3. For a real upload, run the same workflow from **main** with **dry_run**
   unchecked. Review the result, then check all pages, assets, and the PDF on
   the live site. Retest contact-form delivery on IONOS after deployment.
4. Selecting another branch skips deployment. A single concurrency group
   serializes dry runs and uploads without cancelling an active upload.
   GitHub may replace an older pending run if several are queued.

Connection/transfer failures fail the job. The job has read-only repository
permissions, does not retain checkout credentials, and times out after 20
minutes. Its only action is pinned to the verified full commit for
[actions/checkout v4.3.1](https://github.com/actions/checkout/commit/34e114876b0b11c390a56381ad16ebd13914f8d5).
Transfer options follow the [official lftp manual](https://lftp.yar.ru/lftp-man.html).

## Local checks and limitations

Stage locally without network access into a new temporary directory:

```sh
python scripts/stage-site.py /path/to/new/temporary/portfolio-public
bash -n scripts/deploy-sftp.sh
```

Do not run the deployment script locally with live secrets during preparation.
The GitHub runner installs lftp and OpenSSH from Ubuntu packages; those packages
are not fixed to particular versions. No external JavaScript/PHP build
dependencies are needed.

Uploads use lftp reverse mirror with no delete option and no permission changes.
Existing server configuration and files outside the allowlist remain in place.
Allowlisted paths are intentionally overwritten when selected for transfer.
Comparison uses file sizes/timestamps, not content hashes; fresh checkout
timestamps may cause unchanged files to be uploaded again. Obsolete remote
files are **not removed**, including previous public assets no longer in use.
Uploads are not an atomic release: an interruption can leave a partially updated
site. A subsequent run can complete it. SFTP connectivity, actual host-key trust,
remote permissions, document-root mapping, and PHP mail delivery require the
first authorized GitHub dry run/live checks; they cannot be verified offline.
