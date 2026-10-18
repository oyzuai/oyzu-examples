import {readFileSync} from 'node:fs';
for (const name of ['build.mjs', 'check-format.mjs', 'src/index.cjs', 'test/greeting.test.cjs']) {
  const text = readFileSync(name, 'utf8');
  if (text.includes('\r') || !text.endsWith('\n') || /[ \t]+$/m.test(text)) {
    throw Error(`${name}: expected LF, a final newline and no trailing whitespace`);
  }
}
