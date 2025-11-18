#!/usr/bin/env node
/*
 * Simple test runner for Node. It scans the tests directory for any
 * files ending in `.test.js` and executes them. Each test file should
 * declare tests using the global `test` function and `assert`.
 */

const fs = require('fs');
const path = require('path');

let failures = 0;

global.assert = require('assert');

global.test = function (name, fn) {
  try {
    fn();
    console.log('✓', name);
  } catch (err) {
    failures++;
    console.error('✗', name);
    console.error(err.stack || err);
  }
};

function run() {
  const testsDir = path.join(__dirname, 'tests');
  const testFiles = fs.readdirSync(testsDir).filter((f) => f.endsWith('.test.js'));
  for (const file of testFiles) {
    require(path.join(testsDir, file));
  }
  if (failures > 0) {
    console.error(`\n${failures} test(s) failed`);
    process.exit(1);
  } else {
    console.log('\nAll tests passed');
  }
}

run();