const {test}=require('node:test');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
test('delivered application contains the resolved hook environment',()=>{assert.equal(execFileSync(process.execPath,['dist/index.cjs'],{encoding:'utf8'}).trim(),'Hello from tasks: '+process.env.GREETING_MODE+'.');});
