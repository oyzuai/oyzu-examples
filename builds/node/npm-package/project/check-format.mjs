import {readFileSync} from 'node:fs';
for (const name of ['index.cjs', 'test/greeting.test.cjs']) { const text = readFileSync(name, 'utf8'); if (!text.endsWith('\n') || /[ \t]+$/m.test(text)) throw Error('Unexpected whitespace in ' + name); }
