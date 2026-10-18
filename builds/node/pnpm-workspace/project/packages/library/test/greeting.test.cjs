const {test} = require('node:test');
const assert = require('node:assert/strict');
const {greeting} = require('../index.cjs');
test('greet a named reader', () => {
  assert.equal(greeting('reader'), 'Hello, reader, from the delivered workspace.');
});
