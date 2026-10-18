import test from 'node:test';
import assert from 'node:assert/strict';
import {executionProfile} from './verify.mjs';

test('daemonless, Docker and unknown sandbox proofs retain their captured obligation',()=>{
  for(const backend of ['docker','crun','future-backend']) {
    assert.equal(executionProfile([{target:'app',sandbox:{backend}},{target:'app'}],'app',false),'captured');
  }
  assert.equal(executionProfile([{target:'app',sandbox:{}}],'app',false),'captured');
});
test('host proof requires native selection and producing actions without sandbox records',()=>{
  assert.equal(executionProfile([{target:'app'}],'app',false),'native-host');
  assert.equal(executionProfile([{target:'other',sandbox:{backend:'crun'}},{target:'app'}],'app',false),'native-host');
  assert.equal(executionProfile([{target:'app'}],'app',true),'recorded-in-bundle');
  assert.equal(executionProfile([],'app',false),'recorded-in-bundle');
});