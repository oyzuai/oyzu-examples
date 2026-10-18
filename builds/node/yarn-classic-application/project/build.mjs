import {mkdirSync, copyFileSync} from 'node:fs';
mkdirSync('dist', {recursive: true});
copyFileSync('src/index.cjs', 'dist/index.cjs');
copyFileSync('LICENSE', 'dist/LICENSE');
