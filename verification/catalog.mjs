// Structural catalog checks and generated navigation only. This never runs a
// project or grants a verified status; real CLI/consumer proofs are separate.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const coverage = read('catalog/coverage.json');
const learning = read('catalog/learning-paths.json');
const ids = new Set();
const descriptions = new Map();
function add(item) {
  if (!/^[a-z][a-z0-9-]*$/.test(item.id) || ids.has(item.id)) throw Error('Invalid or duplicate catalog ID: ' + item.id);
  ids.add(item.id);
  descriptions.set(item.id, item);
}
for (const item of coverage.recipes) {
  if (!/^[a-z0-9/-]+$/.test(item.path) || item.path.includes('..')) throw Error('Invalid recipe path');
  const metadata = read(item.path + '/example.json');
  if (metadata.id !== item.id || metadata.slug !== item.id || !fs.statSync(path.join(root, item.path, 'project')).isDirectory()) throw Error('Recipe identity/project mismatch');
  if (!fs.existsSync(path.join(root, item.path, 'project/LICENSE'))) throw Error('Copied project needs its license: ' + item.id);
  if (!/^# /m.test(fs.readFileSync(path.join(root, item.path, 'README.md'), 'utf8'))) throw Error('Recipe title missing');
  add({...metadata, path: item.path});
}
for (const item of coverage.gaps) {
  if (!item.currentGap || !item.nextProof || item.maturity !== 'planned') throw Error('Gap needs a concrete missing capability and next proof');
  add(item);
}
const pathIds = new Set();
for (const item of learning.paths) {
  if (pathIds.has(item.id) || item.steps.some(id => !ids.has(id))) throw Error('Duplicate learning path or missing step');
  pathIds.add(item.id);
}
if (coverage.traceability?.length !== 58 || new Set(coverage.traceability.map(item => item.id)).size !== 58 ||
    coverage.traceability.some(item => !/^EX-\d{3}$/.test(item.id) || !Array.isArray(item.acceptance) || !item.source?.revision)) throw Error('Preserve the 58 source-design identities and acceptance mappings');
const link = id => {
  const item = descriptions.get(id);
  return item.path ? `[${item.title}](../${item.path}/README.md)` : `[${item.title}](#${id})`;
};
let content = '# Learning paths and coverage\n\nGenerated from coverage.json, learning-paths.json and per-recipe metadata.\nUse verification records for exact subjects; structural checks do not run builds.\n\n';
for (const item of learning.paths) content += `## ${item.title}\n\n${item.outcome}.\n\n` + item.steps.map((id, i) => `${i + 1}. ${link(id)}`).join('\n') + '\n\n';
content += '## Native baselines\n\n| Recipe | Product support | Recipe readiness |\n| --- | --- | --- |\n';
for (const item of coverage.recipes) {
  const value = descriptions.get(item.id);
  content += `| ${link(item.id)} | ${value.productSupport} | ${value.maturity} |\n`;
}
content += '\n## Gaps and assessments\n\nNo runnable project or Run action is supplied for these entries. Product support\nand missing example qualification remain separate facts.\n\n';
for (const item of coverage.gaps) content += `### ${item.id}\n\n**${item.title}**. Product support: ${item.productSupport}; recipe readiness: ${item.maturity}.\n\n${item.currentGap}\n\nNext proof: ${item.nextProof}\n\n`;
const output = path.join(root, 'catalog/README.md');
if (process.argv.includes('--write')) fs.writeFileSync(output, content);
else if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== content) throw Error('Generated catalog is stale; run node verification/catalog.mjs --write');
console.log(`Catalog structure passed: ${coverage.recipes.length} projects, ${coverage.gaps.length} explicit gaps, ${learning.paths.length} paths and 58 source mappings. No builds executed.`);
