const {test} = require('node:test');
const assert = require('node:assert/strict');
const {hello} = require('../index.cjs');
test('greets the downstream caller', () => assert.equal(hello('developer'), 'Hello, developer, from the delivered package.'));
