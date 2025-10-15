#!/usr/bin/env node

/**
 * Simple test runner script for mermaid-validator
 * Can be run with: node test-runner.js [suite-name]
 */

import { runAllTests, runTestSuite } from './dist/test/index.test.js';

const args = process.argv.slice(2);
const suiteName = args[0];

if (suiteName) {
  runTestSuite(suiteName);
} else {
  runAllTests();
}
