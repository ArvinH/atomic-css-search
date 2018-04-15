/* global describe, it */
const fs = require('fs');

const assert = require('assert');
describe('test ruleArray file', function () {
  it('should have ruleArray file', function () {
    fs.readFile('./ruleArray.json', (err, data) => {
      if (err) throw err;
      assert.equal(typeof data, 'Array');
    });
  });
});