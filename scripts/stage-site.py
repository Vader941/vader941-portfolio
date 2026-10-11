"""Copy the explicit public allowlist to a new staging directory (stdlib only)."""

import argparse
from pathlib import Path, PurePosixPath
import shutil


def stage(destination: Path) -> None:
    root = Path(__file__).resolve().parents[1]
    manifest = root / "deploy/public-files.txt"
    entries = [line.strip() for line in manifest.read_text(encoding="utf-8").splitlines()
               if line.strip() and not line.lstrip().startswith("#")]
    if not entries or len(entries) != len(set(entries)):
        raise ValueError("The upload allowlist must be nonempty and contain no duplicates")

    sources = []
    for entry in entries:
        relative = PurePosixPath(entry)
        if (relative.is_absolute() or ".." in relative.parts
                or "\\" in entry or ":" in entry or relative.as_posix() != entry):
            raise ValueError(f"Invalid allowlist path: {entry}")
        source = root / entry
        if any(part.is_symlink() for part in [source, *source.parents]):
            raise ValueError(f"Symlinks are not allowed: {entry}")
        if not source.is_file() or not source.resolve().is_relative_to(root):
            raise ValueError(f"Missing public file or path outside repository: {entry}")
        sources.append((entry, source))

    # Never merge with a stale directory that could contain unapproved files.
    destination.mkdir(parents=True, exist_ok=False)
    for entry, source in sources:
        target = destination / entry
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        print(entry)
    print(f"Staged {len(sources)} public files.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    stage(parser.parse_args().destination)
