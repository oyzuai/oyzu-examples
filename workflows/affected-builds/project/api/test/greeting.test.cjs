const {test} = require('node:test');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
test('application greets its reader', () => {
  assert.equal(execFileSync(process.execPath, ['src/index.cjs'], {encoding: 'utf8'}).trim(), 'Hello from api.');
});
