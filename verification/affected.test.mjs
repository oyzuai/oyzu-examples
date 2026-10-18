import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const source = path.dirname(fileURLToPath(import.meta.url));
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oyzu-affected-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const write = (name, content) => {
    fs.mkdirSync(path.dirname(path.join(root, name)), {recursive: true});
    fs.writeFileSync(path.join(root, name), content);
  };
  const run = (exe, args, env = {}) => {
    const result = spawnSync(exe, args, {cwd: root, encoding: 'utf8', env: {...process.env, ...env}});
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  for (const name of ['affected.mjs', '../.github/workflows/verify.yml', '../.github/workflows/provided-executors.yml']) {
    write(path.posix.join('verification', name), fs.readFileSync(path.join(source, name)));
  }
  const recipes = [
    {id: 'first-build', path: 'getting-started/first-build'},
    {id: 'go-command', path: 'builds/go/command'},
    {id: 'gradle-application', path: 'builds/gradle/application'},
    {id: 'go-workspace', path: 'builds/go/workspace'},
    {id: 'npm-package', path: 'builds/node/npm-package'}
  ];
  write('catalog/coverage.json', JSON.stringify({recipes}));
  write('README.md', '# Examples\n');
  for (const item of recipes) {
    write(item.path + '/project/source', 'original\n');
    write(item.path + '/example.json', JSON.stringify({verification: ['verification/records/' + item.id + '.json']}));
  }
  run('git', ['init', '--template=', '-b', 'main']);
  run('git', ['add', '.']);
  run('git', ['-c', 'user.name=Example test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-m', 'baseline']);
  const base = run('git', ['rev-parse', 'HEAD']);
  return {write, select: () => {
    run('git', ['add', '.']);
    if (run('git', ['diff', '--cached', '--name-only'])) {
      run('git', ['-c', 'user.name=Example test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-m', 'changed inputs']);
    }
    return JSON.parse(run(process.execPath, ['verification/affected.mjs'], {EXAMPLES_BASE_SHA: base, GITHUB_OUTPUT: ''}));
  }};
}

test('captured recipe edits require their own proof and never select a substitute baseline', t => {
  const {write, select} = fixture(t);
  write('builds/go/workspace/project/source', 'changed\n');
  write('builds/node/npm-package/project/source', 'changed\n');
  const result = select();
  assert.deepEqual(result.selectedNativeRecipes, []);
  assert.deepEqual(result.requiredExternalRecipes, ['go-workspace', 'npm-package']);
});

test('mixed edits retain native work and missing executor obligations independently', t => {
  const {write, select} = fixture(t);
  write('builds/go/command/project/source', 'changed\n');
  write('builds/go/workspace/project/source', 'changed\n');
  const result = select();
  assert.deepEqual(result.selectedNativeRecipes, ['go-command']);
  assert.deepEqual(result.requiredExternalRecipes, ['go-workspace']);
});

test('editorial changes verify the baseline, common verifier changes retain all proof obligations', t => {
  const {write, select} = fixture(t);
  write('README.md', '# Updated examples\n');
  assert.deepEqual(select().selectedNativeRecipes, ['first-build']);
  assert.deepEqual(select().requiredExternalRecipes, []);
  write('verification/new-check.mjs', '// shared verification change\n');
  assert.deepEqual(select().selectedNativeRecipes, ['first-build', 'go-command', 'gradle-application']);
  assert.deepEqual(select().requiredExternalRecipes, ['go-workspace', 'npm-package']);
});

test('CI retains failed subject records and gates notification on external proof obligations', () => {
  const workflow = fs.readFileSync(path.join(source, '../.github/workflows/verify.yml'), 'utf8');
  assert.match(workflow, /uses: actions\/upload-artifact@[^\n]+\n\s+if: always\(\)/);
  assert.match(workflow, /if: .*needs\.native\.result == 'success' && needs\.catalog\.outputs\.required_external_recipes == '\[\]'/);
  const provided = fs.readFileSync(path.join(source, '../.github/workflows/provided-executors.yml'), 'utf8');
  assert.match(provided, /options: \[npm-package, go-workspace,/);
});

test('a record update requires its recipe proof without invoking unrelated captured recipes', t => {
  const {write, select} = fixture(t);
  write('verification/records/first-build.json', '{"result":"passed","execution":"native-host"}\n');
  assert.deepEqual(select().selectedNativeRecipes, ['first-build']);
  assert.deepEqual(select().requiredExternalRecipes, []);
  write('verification/records/npm-package.json', '{"result":"failed"}\n');
  assert.deepEqual(select().requiredExternalRecipes, ['npm-package']);
});

test('a host-capable recipe cannot qualify an updated captured proof with only its host job', t => {
  const {write,select}=fixture(t);
  write('verification/records/gradle-application.json',JSON.stringify({result:'passed',execution:'captured'}));
  assert.deepEqual(select().selectedNativeRecipes,['gradle-application']);
  assert.deepEqual(select().requiredExternalRecipes,['gradle-application']);
  write('verification/records/gradle-application.json',JSON.stringify({result:'passed',execution:'native-host'}));
  assert.deepEqual(select().requiredExternalRecipes,[]);
});
