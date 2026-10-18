import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const candidates = ['first-build', 'node-application', 'go-command', 'python-package', 'maven-application', 'gradle-application'];
const coverage = JSON.parse(fs.readFileSync('catalog/coverage.json'));
const base = process.env.EXAMPLES_BASE_SHA;
let files = null;
if (base && !/^0+$/.test(base)) {
  if (!/^[a-f0-9]{40}$/.test(base)) throw Error('Invalid example comparison commit');
  const diff = spawnSync('git', ['diff', '--name-only', base, 'HEAD'], {encoding: 'utf8'});
  if (diff.status !== 0) throw Error('Required comparison commit is unavailable');
  files = diff.stdout.trim().split('\n');
}
const common = !files || files.some(name => name.startsWith('verification/') || name.startsWith('.github/workflows/'));
const recipes = coverage.recipes.filter(item => candidates.includes(item.id) && (common || files.some(name => name.startsWith(item.path + '/')))).map(item => item.id);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'recipes=' + JSON.stringify(recipes) + '\n');
console.log(JSON.stringify({selectedNativeRecipes: recipes, limits: 'Only these native consumers are included. Planned/blocked and live publication/deployment checks are separate, never counted as passes.'}));
