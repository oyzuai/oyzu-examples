import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const candidates = ['first-build', 'node-application', 'go-command', 'python-package', 'maven-application', 'maven-reactor', 'polyglot-service', 'developer-tool', 'affected-builds'];
const coverage = JSON.parse(fs.readFileSync('catalog/coverage.json'));
const base = process.env.EXAMPLES_BASE_SHA;
let files = null;
if (base && !/^0+$/.test(base)) {
  if (!/^[a-f0-9]{40}$/.test(base)) throw Error('Invalid example comparison commit');
  const diff = spawnSync('git', ['diff', '--name-only', base, 'HEAD'], {encoding: 'utf8'});
  if (diff.status !== 0) throw Error('Required comparison commit is unavailable');
  files = diff.stdout.trim().split('\n');
}
const common = !files || files.some(name => (name.startsWith('verification/') && !name.startsWith('verification/records/')) || name.startsWith('.github/workflows/'));
const affected = coverage.recipes.filter(item => {
  if (common || files.some(name => name.startsWith(item.path + '/'))) return true;
  const metadata = JSON.parse(fs.readFileSync(item.path + '/example.json'));
  return files.some(name => metadata.verification?.includes(name));
});
const recipes = affected.filter(item => candidates.includes(item.id)).map(item => item.id);
const requiredExternalRecipes = affected.filter(item => !candidates.includes(item.id)).map(item => item.id);
// Editorial/catalog changes still verify the first-build baseline before a docs
// update. Blocked or externally provisioned recipes never become synthetic passes.
if (!recipes.length && !requiredExternalRecipes.length && files?.some(name => name === 'README.md' || name.startsWith('catalog/'))) recipes.push('first-build');
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT,
  'recipes=' + JSON.stringify(recipes) + '\nrequired_external_recipes=' + JSON.stringify(requiredExternalRecipes) + '\n');
console.log(JSON.stringify({selectedNativeRecipes: recipes, requiredExternalRecipes, limits: 'Only selected native consumers run here. Changes requiring provided executors, live destinations or blocked capabilities prevent automatic docs notification; a baseline check never substitutes for those proofs.'}));
