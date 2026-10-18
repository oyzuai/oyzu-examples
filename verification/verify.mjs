// Collection verification, never an alternative Oyzu engine. Copy a committed
// project outside the repository and exercise the real CLI and delivered output.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function run(exe, args, cwd) {
  const result = spawnSync(exe, args, {cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024});
  if (result.status !== 0) throw Error(`${path.basename(exe)} ${args.join(' ')} failed (${result.status}):\n${result.stderr}\n${result.stdout}`);
  return result.stdout.trim();
}

export function recipeDigest(repo, commit, recipe) {
  const names = run('git', ['ls-tree', '-r', '--name-only', commit, '--', recipe], repo).split('\n').filter(Boolean);
  if (!names.length) throw Error('Missing committed recipe');
  return sha256(names.map(name => {
    const bytes = spawnSync('git', ['show', `${commit}:${name}`], {cwd: repo, encoding: null}).stdout;
    return `${name}\0${bytes.length}\0${sha256(bytes)}\n`;
  }).join(''));
}

function verifyFirstBuild(cli, output) {
  const recipe = 'getting-started/first-build';
  const commit = run('git', ['rev-parse', 'HEAD'], root);
  if (run('git', ['status', '--porcelain', '--', recipe], root)) throw Error('Commit recipe changes before recording verification');
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'oyzu-example-first-build-'));
  const commands = [];
  const invoke = args => {commands.push(['oyzu', ...args]); return run(cli, args, scratch);};
  try {
    fs.cpSync(path.join(root, recipe, 'project'), scratch, {recursive: true});
    invoke(['install', '--frozen']);
    invoke(['build', '--plan']);
    invoke(['build', '--full']);
    invoke(['inspect', 'dist']);
    const manifest = JSON.parse(fs.readFileSync(path.join(scratch, 'dist', 'manifest.json'), 'utf8'));
    if (manifest.status !== 'succeeded' || manifest.artifacts.length !== 1) throw Error('Expected one delivered application');
    const artifact = manifest.artifacts[0];
    const executable = path.resolve(scratch, 'dist', artifact.path);
    if (!executable.startsWith(path.join(scratch, 'dist') + path.sep)) throw Error('Artifact leaves bundle');
    commands.push(['<delivered executable>', 'developer']);
    const actual = run(executable, ['developer'], scratch);
    if (actual !== 'Hello, developer! Built with Oyzu.') throw Error('Delivered application returned unexpected output');
    if (!manifest.reports.some(report => report.kind === 'junit' || /junit/i.test(JSON.stringify(report)))) throw Error('Native test report missing');
    const record = {
      recipe: 'first-build', subject: {commit, recipe_sha256: recipeDigest(root, commit, recipe)},
      oyzu: {version: run(cli, ['--version'], scratch), binary_sha256: sha256(fs.readFileSync(cli))},
      host: {os: process.platform, arch: process.arch}, execution: 'host', target: manifest.targets[0].platform,
      commands, result: 'passed', artifact: {digest: artifact.digest, output: actual},
      reports: manifest.reports.map(report => ({kind: report.kind, digest: report.digest})),
      limits: ['No captured execution, cross-compilation or other host qualification'],
      recordedAt: new Date().toISOString()
    };
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.writeFileSync(output, JSON.stringify(record, null, 2) + '\n');
    console.log('Verified committed first-build recipe, native reports and delivered application.');
  } finally {fs.rmSync(scratch, {recursive: true, force: true});}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [id, cli, output] = process.argv.slice(2);
    if (id !== 'first-build' || !cli || !path.isAbsolute(cli) || !output) throw Error('Usage: node verification/verify.mjs first-build <absolute-oyzu-path> <record-path>');
    verifyFirstBuild(cli, path.resolve(output));
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
