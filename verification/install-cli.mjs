// CI bootstrap consumes an operator-selected public GitHub release artifact.
// It never builds private source or treats a missing release as a successful run.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const {OYZU_RELEASE_TAG: tag, OYZU_RELEASE_ASSET: asset, OYZU_RELEASE_SHA256: digest} = process.env;
if (!tag || tag === 'latest' || !asset || !/^[a-f0-9]{64}$/.test(digest ?? '')) throw Error('Configure OYZU_RELEASE_TAG, OYZU_RELEASE_ASSET and OYZU_RELEASE_SHA256 for an exact published Oyzu GitHub artifact. No public release is assumed to exist yet.');
const headers = {Accept: 'application/vnd.github+json', ...(process.env.GH_TOKEN ? {Authorization: 'Bearer ' + process.env.GH_TOKEN} : {})};
const response = await fetch('https://api.github.com/repos/oyzuai/oyzu/releases/tags/' + encodeURIComponent(tag), {headers});
if (!response.ok) throw Error('Selected public Oyzu release is unavailable: HTTP ' + response.status);
const release = await response.json();
const selected = release.assets?.filter(item => item.name === asset) ?? [];
if (release.draft || selected.length !== 1 || !selected[0].browser_download_url.startsWith('https://github.com/oyzuai/oyzu/releases/download/')) throw Error('Select one existing public artifact from the exact Oyzu release');
const download = await fetch(selected[0].browser_download_url);
if (!download.ok) throw Error('Oyzu artifact download failed: HTTP ' + download.status);
const bytes = Buffer.from(await download.arrayBuffer());
if (crypto.createHash('sha256').update(bytes).digest('hex') !== digest) throw Error('Oyzu artifact checksum mismatch');
const storage = path.resolve('.oyzu/ci');
fs.mkdirSync(storage, {recursive: true});
const archive = path.join(storage, 'download');
fs.writeFileSync(archive, bytes);
const contents = path.join(storage, 'release');
fs.mkdirSync(contents, {recursive: true});
let executable;
if (/\.(?:tar\.gz|tar\.xz|tgz|zip)$/.test(asset)) {
  const listing = spawnSync('tar', ['-tf', archive], {encoding: 'utf8'});
  const details = spawnSync('tar', ['-tvf', archive], {encoding: 'utf8'});
  if (listing.status !== 0 || details.status !== 0 || details.stdout.split('\n').filter(Boolean).some(line => !/^[-d]/.test(line)) ||
      listing.stdout.split('\n').filter(Boolean).some(name => name.startsWith('/') || name.includes('\\') || name.split('/').includes('..'))) throw Error('Release archive contains unsupported or unsafe entries');
  const unpack = spawnSync('tar', ['-xf', archive, '-C', contents], {encoding: 'utf8'});
  if (unpack.status !== 0) throw Error('Cannot extract the selected release artifact');
  executable = path.resolve(contents, process.env.OYZU_RELEASE_EXECUTABLE || 'oyzu');
  if (!executable.startsWith(contents + path.sep)) throw Error('Release executable leaves the selected archive');
} else {
  executable = path.join(contents, process.platform === 'win32' ? 'oyzu.exe' : 'oyzu');
  fs.copyFileSync(archive, executable);
}
if (!fs.existsSync(executable) || fs.lstatSync(executable).isSymbolicLink() || !fs.statSync(executable).isFile()) throw Error('Configure OYZU_RELEASE_EXECUTABLE to the real relative executable in the selected archive');
fs.chmodSync(executable, 0o755);
const check = spawnSync(executable, ['--version'], {encoding: 'utf8'});
if (check.status !== 0) throw Error('The verified artifact does not run on this CI host');
fs.writeFileSync(path.join(storage, 'identity.json'), JSON.stringify({tag, asset, sha256: digest, version: check.stdout.trim()}, null, 2) + '\n');
if (process.env.GITHUB_ENV) fs.appendFileSync(process.env.GITHUB_ENV, 'OYZU_CLI=' + executable + '\n');
console.log('Installed checksummed public Oyzu release artifact: ' + tag + ' / ' + asset);
