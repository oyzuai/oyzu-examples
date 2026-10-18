import {readFileSync} from 'node:fs';
for (const name of ['build.mjs', 'check-format.mjs', 'serve.mjs', 'index.html']) {
  const text = readFileSync(name, 'utf8');
  if (text.includes('\r') || !text.endsWith('\n') || /[ \t]+$/m.test(text)) {
    throw Error(`${name}: expected LF, a final newline and no trailing whitespace`);
  }
}
