/**
 * Test setup and utilities for mermaid-validator
 */

import { ValidationResult, ValidationError } from '../ast/index.js';

export interface TestCase {
  name: string;
  input: string;
  expectedValid: boolean;
  expectedDiagramType?: string;
  expectedErrors?: Partial<ValidationError>[];
  description?: string;
  hasErrorWithCode?: string;
  hasErrorWithMessage?: string;
}

export interface TestSuite {
  name: string;
  description: string;
  testCases: TestCase[];
}

export interface TestStats {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  suites: {
    name: string;
    passed: number;
    failed: number;
    total: number;
  }[];
}

/**
 * Helper function to create a test case
 */
export function createTestCase(
  name: string,
  input: string,
  expectedValid: boolean,
  options: {
    expectedDiagramType?: string;
    expectedErrors?: Partial<ValidationError>[];
    description?: string;
    hasErrorWithCode?: string;
    hasErrorWithMessage?: string;
  } = {}
): TestCase {
  return {
    name,
    input,
    expectedValid,
    ...options
  };
}

/**
 * Helper function to create a test suite
 */
export function createTestSuite(
  name: string,
  description: string,
  testCases: TestCase[]
): TestSuite {
  return {
    name,
    description,
    testCases
  };
}

/**
 * Assert that a validation result matches expected values
 */
export function assertValidationResult(
  result: ValidationResult,
  expected: {
    isValid: boolean;
    diagramType?: string;
    errorCount?: number;
    hasErrorWithCode?: string;
    hasErrorWithMessage?: string;
  }
): void {
  if (result.isValid !== expected.isValid) {
    throw new Error(
      `Expected isValid to be ${expected.isValid}, but got ${result.isValid}`
    );
  }

  if (expected.diagramType && result.diagramType !== expected.diagramType) {
    throw new Error(
      `Expected diagramType to be '${expected.diagramType}', but got '${result.diagramType}'`
    );
  }

  if (expected.errorCount !== undefined && result.errors.length !== expected.errorCount) {
    throw new Error(
      `Expected ${expected.errorCount} errors, but got ${result.errors.length}. Errors: ${JSON.stringify(result.errors, null, 2)}`
    );
  }

  if (expected.hasErrorWithCode) {
    const hasError = result.errors.some(error => error.code === expected.hasErrorWithCode);
    if (!hasError) {
      throw new Error(
        `Expected error with code '${expected.hasErrorWithCode}', but found errors: ${JSON.stringify(result.errors.map(e => e.code), null, 2)}`
      );
    }
  }

  if (expected.hasErrorWithMessage) {
    const hasError = result.errors.some(error => 
      error.message.includes(expected.hasErrorWithMessage!)
    );
    if (!hasError) {
      throw new Error(
        `Expected error with message containing '${expected.hasErrorWithMessage}', but found errors: ${JSON.stringify(result.errors.map(e => e.message), null, 2)}`
      );
    }
  }
}
