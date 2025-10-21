/**
 * Main test runner for mermaid-validator
 * Runs all test suites and provides comprehensive reporting
 */

import { runFlowchartTests } from './flowchart.test.js';
import { runSequenceTests } from './sequence.test.js';
import { runOtherDiagramTests } from './other-diagrams.test.js';
import { runErrorHandlingTests } from './error-handling.test.js';
import { runIntegrationTests } from './integration.test.js';
import { runDirectiveCompatibilityTests } from './directive-compatibility.test.js';

// Test statistics
interface TestStats {
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

// Capture console output to count test results
let testStats: TestStats = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  suites: []
};

// Override console.log to capture test results
const originalLog = console.log;
console.log = (...args: any[]) => {
  const message = args.join(' ');
  
  // Count test results - only match the specific pattern: "✅ " or "❌ " at the start (after trimming)
  // Skip summary lines that contain "Passed:" or "Failed:"
  const trimmed = message.trimStart();
  if (trimmed.startsWith('✅ ') && !trimmed.includes('Passed:')) {
    testStats.passedTests++;
    testStats.totalTests++;
  } else if (trimmed.startsWith('❌ ') && !trimmed.includes('Failed:')) {
    testStats.failedTests++;
    testStats.totalTests++;
  }
  
  // Capture suite results
  if (message.includes('Tests Results:')) {
    const match = message.match(/(\d+) passed, (\d+) failed/);
    if (match) {
      const passed = parseInt(match[1]);
      const failed = parseInt(match[2]);
      const suiteName = message.split(' ')[1]; // Extract suite name
      testStats.suites.push({
        name: suiteName,
        passed,
        failed,
        total: passed + failed
      });
    }
  }
  
  // Call original console.log
  originalLog(...args);
};

/**
 * Run all test suites
 */
export function runAllTests(): void {
  console.log('🚀 Starting Mermaid Validator Test Suite');
  console.log('=====================================\n');
  
  const startTime = Date.now();
  
  try {
    // Run all test suites
    runFlowchartTests();
    runSequenceTests();
    runOtherDiagramTests();
    runErrorHandlingTests();
    runIntegrationTests();
    runDirectiveCompatibilityTests();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Print final summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL TEST SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`\n🎯 Overall Results:`);
    console.log(`   Total Tests: ${testStats.totalTests}`);
    console.log(`   ✅ Passed: ${testStats.passedTests}`);
    console.log(`   ❌ Failed: ${testStats.failedTests}`);
    console.log(`   📈 Success Rate: ${((testStats.passedTests / testStats.totalTests) * 100).toFixed(1)}%`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    
    console.log(`\n📋 Suite Breakdown:`);
    testStats.suites.forEach(suite => {
      const successRate = ((suite.passed / suite.total) * 100).toFixed(1);
      console.log(`   ${suite.name}: ${suite.passed}/${suite.total} (${successRate}%)`);
    });
    
    // Calculate total failed from suites (more reliable than counting individual test messages)
    const totalFailed = testStats.suites.reduce((sum, suite) => sum + suite.failed, 0);
    
    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed! The mermaid validator is working correctly.');
    } else {
      console.log(`\n⚠️  ${totalFailed} test(s) failed. Please review the output above.`);
    }
    
    console.log('\n' + '='.repeat(50));
    
  } catch (error) {
    console.error('❌ Test runner encountered an error:', error);
  } finally {
    // Restore original console.log
    console.log = originalLog;
  }
}

/**
 * Run specific test suite
 */
export function runTestSuite(suiteName: string): void {
  console.log(`🚀 Running ${suiteName} Test Suite`);
  console.log('='.repeat(40) + '\n');
  
  switch (suiteName.toLowerCase()) {
    case 'flowchart':
      runFlowchartTests();
      break;
    case 'sequence':
      runSequenceTests();
      break;
    case 'other':
    case 'other-diagrams':
      runOtherDiagramTests();
      break;
    case 'error':
    case 'error-handling':
      runErrorHandlingTests();
      break;
    case 'integration':
      runIntegrationTests();
      break;
    case 'directive':
    case 'directive-compatibility':
      runDirectiveCompatibilityTests();
      break;
    default:
      console.log(`❌ Unknown test suite: ${suiteName}`);
      console.log('Available suites: flowchart, sequence, other-diagrams, error-handling, integration, directive-compatibility');
  }
}

/**
 * Run tests with specific pattern
 */
export function runTestsWithPattern(pattern: string): void {
  console.log(`🔍 Running tests matching pattern: ${pattern}`);
  console.log('='.repeat(50) + '\n');
  
  // This would require more sophisticated test filtering
  // For now, just run all tests and filter output
  runAllTests();
}

// Export test utilities
export { TestStats } from './setup.js';

// If this file is run directly, run all tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}
