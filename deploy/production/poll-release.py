#!/usr/bin/env python3
"""Deploy tested public GitHub releases without inbound SSH or GitHub credentials."""
import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import tarfile
import urllib.error
import urllib.request

BASE = pathlib.Path('/opt/scriptorium')
REPO = 'myk0laUA/Scriptorium-CSC309'

def request(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={
        'User-Agent': 'scriptorium-deployer', 'Accept': 'application/vnd.github+json',
    }), timeout=120)

def main():
    BASE.mkdir(parents=True, exist_ok=True)
    try:
        with request(f'https://api.github.com/repos/{REPO}/releases/latest') as response:
            release = json.load(response)
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return
        raise
    tag = release['tag_name']
    if release['draft'] or release['prerelease'] or not re.fullmatch(r'deploy-[a-f0-9]{40}', tag):
        return
    marker = BASE / 'deployed-release'
    failed = BASE / 'failed-release'
    if any(p.exists() and p.read_text().strip() == tag for p in (marker, failed)):
        return
    sha = tag.removeprefix('deploy-')
    directory = BASE / 'releases' / sha
    directory.mkdir(parents=True, exist_ok=True)
    assets = {asset['name']: asset['browser_download_url'] for asset in release['assets']}
    for name in ('SHA256SUMS', 'deployment.tar.gz', 'app-image.tar.gz'):
        url = assets[name]
        expected = f'https://github.com/{REPO}/releases/download/{tag}/{name}'
        if url != expected:
            raise ValueError('Unexpected release asset URL')
        with request(url) as response, (directory / name).open('wb') as destination:
            shutil.copyfileobj(response, destination)
    checksums = {}
    for line in (directory / 'SHA256SUMS').read_text().splitlines():
        digest, name = line.split()
        checksums[name] = digest
    for name in ('deployment.tar.gz', 'app-image.tar.gz'):
        with (directory / name).open('rb') as asset:
            digest = hashlib.file_digest(asset, 'sha256').hexdigest()
        if digest != checksums[name]:
            raise ValueError(f'Checksum mismatch: {name}')
    # Python 3.12's data filter rejects traversal and unsafe archive members.
    with tarfile.open(directory / 'deployment.tar.gz') as archive:
        archive.extractall(directory, filter='data')
    try:
        subprocess.run(['docker', 'load', '-i', str(directory / 'app-image.tar.gz')], check=True)
        subprocess.run(['bash', str(directory / 'deploy/production/deploy.sh'), sha], check=True)
    except subprocess.CalledProcessError:
        failed.write_text(tag + '\n')
        raise
    marker.write_text(tag + '\n')
    # Compressed image copies are disposable; keep the installed image and DB backups.
    (directory / 'app-image.tar.gz').unlink()
    # Retain current and previous app images; never prune database/runner images.
    keep = {(BASE / name).read_text().strip() for name in ('current-image', 'previous-image')}
    installed = subprocess.check_output([
        'docker', 'images', '--filter', 'reference=scriptorium:*', '--format', '{{.Repository}}:{{.Tag}}'
    ], text=True).splitlines()
    for image in installed:
        if re.fullmatch(r'scriptorium:[a-f0-9]{40}', image) and image not in keep:
            subprocess.run(['docker', 'image', 'rm', image], check=False)
    shutil.copyfile(directory / 'deploy/production/poll-release.py', BASE / 'poll-release.py')
    print(f'Deployment complete: {tag}', flush=True)

if __name__ == '__main__':
    main()
