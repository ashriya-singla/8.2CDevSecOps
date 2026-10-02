const { test } = require('node:test');
const assert = require('node:assert/strict');
const utils = require('../utils.js');
test('random integer includes both ends of the requested range', () => {
  const originalRandom = Math.random;
  try {
    Math.random = () => 0;
    assert.equal(utils.ran_no(3, 7), 3);
    Math.random = () => 0.999999;
    assert.equal(utils.ran_no(3, 7), 7);
    assert.equal(utils.ran_no(5, 5), 5);
  } finally { Math.random = originalRandom; }
});
test('identifier has the requested length and uses only allowed characters', () => {
  assert.equal(utils.uid(0), '');
  for (const length of [1, 12, 32]) {
    const value = utils.uid(length);
    assert.equal(value.length, length);
    assert.match(value, /^[A-Za-z0-9]+$/);
  }
});
test('forbidden response sends HTTP 403, plain text and correct content length', () => {
  const headers = {};
  let body;
  const response = {
    setHeader(name, value) { headers[name] = value; },
    end(value) { body = value; }
  };
  utils.forbidden(response);
  assert.equal(response.statusCode, 403);
  assert.equal(headers['Content-Type'], 'text/plain');
  assert.equal(headers['Content-Length'], Buffer.byteLength(body));
  assert.equal(body, 'Forbidden');
});
