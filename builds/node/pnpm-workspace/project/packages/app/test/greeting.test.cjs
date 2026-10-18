const {test} = require('node:test');
const assert = require('node:assert/strict');
const {greet} = require('../index.cjs');
test('use the workspace library', () => {
  assert.equal(greet('developer'), 'Hello, developer, from the delivered workspace.');
});
