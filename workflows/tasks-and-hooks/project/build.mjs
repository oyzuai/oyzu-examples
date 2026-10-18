import {mkdirSync,readFileSync,writeFileSync,copyFileSync} from 'node:fs';
const data=JSON.parse(readFileSync('generated.json','utf8'));
mkdirSync('dist',{recursive:true});
writeFileSync('dist/index.cjs','console.log('+JSON.stringify(data.message)+');\n');
copyFileSync('LICENSE','dist/LICENSE');
