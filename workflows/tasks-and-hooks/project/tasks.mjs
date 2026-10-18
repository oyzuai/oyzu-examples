import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const operation=process.argv[2];
if(operation==='verify'){if(!['local','preview'].includes(process.env.GREETING_MODE))throw Error('Choose local or preview');}
else if(operation==='prepare'){writeFileSync('generated.json',JSON.stringify({message:'Hello from tasks: '+process.env.GREETING_MODE+'.'}));}
else if(operation==='check'){if(!existsSync('dist/index.cjs'))throw Error('Build output missing');}
else throw Error('Unknown native task');
