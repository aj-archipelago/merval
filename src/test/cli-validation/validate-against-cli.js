#!/usr/bin/env node

/**
 * CLI Validation Test Suite
 * 
 * This test suite validates our mermaid-validator against the real Mermaid CLI
 * to ensure 100% compatibility. It tests various edge cases and scenarios to
 * guarantee that no chart will pass our validator and then fail to render.
 * 
 * Usage: 
 *   node src/test/cli-validation/validate-against-cli.js                    # Run all tests
 *   node src/test/cli-validation/validate-against-cli.js --category gitgraph # Run only gitgraph tests
 *   node src/test/cli-validation/validate-against-cli.js --name "duplicate"  # Run tests matching name
 *   node src/test/cli-validation/validate-against-cli.js --index 1-10       # Run tests 1-10
 *   node src/test/cli-validation/validate-against-cli.js --mismatch          # Run only mismatched tests
 */

import { validateMermaid } from '../../../dist/index.js';
import { execSync } from 'child_process';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { gitgraphTests } from './test-data/gitgraph-tests.js';
import { flowchartTests } from './test-data/flowchart-tests.js';
import { sequenceTests } from './test-data/sequence-tests.js';
import { otherDiagramsTests } from './test-data/other-diagrams-tests.js';
import { edgeCasesTests } from './test-data/edge-cases-tests.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE = path.join(__dirname, '.mermaid-cli-cache.json');

// Combine all test cases
const allTestCases = [
  ...gitgraphTests,
  ...flowchartTests,
  ...sequenceTests,
  ...otherDiagramsTests,
  ...edgeCasesTests
];

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    category: null,
    name: null,
    index: null,
    mismatch: false,
    help: false,
    regenerateCache: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--category' || arg === '-c') {
      options.category = args[++i];
    } else if (arg === '--name' || arg === '-n') {
      options.name = args[++i];
    } else if (arg === '--index' || arg === '-i') {
      options.index = args[++i];
    } else if (arg === '--mismatch' || arg === '-m') {
      options.mismatch = true;
    } else if (arg === '--regenerate-cache' || arg === '--refresh-cache' || arg === '-r') {
      options.regenerateCache = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log('🔍 CLI Validation Test Suite');
  console.log('============================\n');
  console.log('Usage:');
  console.log('  node src/test/cli-validation/validate-against-cli.js [options]\n');
  console.log('Options:');
  console.log('  --category, -c <category>     Run only tests in this category');
  console.log('  --name, -n <pattern>          Run only tests matching name pattern');
  console.log('  --index, -i <range>           Run tests by index (e.g., "1-10" or "5")');
  console.log('  --mismatch, -m                Run only previously mismatched tests');
  console.log('  --regenerate-cache, -r       Regenerate CLI result cache (slow)');
  console.log('  --help, -h                    Show this help message\n');
  console.log('Examples:');
  console.log('  node validate-against-cli.js --category gitgraph-basic');
  console.log('  node validate-against-cli.js --name "duplicate"');
  console.log('  node validate-against-cli.js --index 1-20');
  console.log('  node validate-against-cli.js --index 5');
  console.log('  node validate-against-cli.js --mismatch');
  console.log('  node validate-against-cli.js --regenerate-cache\n');
  console.log('Note: CLI results are cached by default for faster runs.');
  console.log('      Use --regenerate-cache to refresh the cache.\n');
  console.log('Available categories:');
  const categories = [...new Set(allTestCases.map(t => t.category))].sort();
  categories.forEach(cat => {
    const count = allTestCases.filter(t => t.category === cat).length;
    console.log(`  - ${cat} (${count} tests)`);
  });
  process.exit(0);
}

function filterTests(tests, options) {
  let filtered = tests;

  if (options.category) {
    filtered = filtered.filter(t => t.category === options.category);
  }

  if (options.name) {
    const pattern = new RegExp(options.name, 'i');
    filtered = filtered.filter(t => pattern.test(t.name));
  }

  if (options.index) {
    if (options.index.includes('-')) {
      const [start, end] = options.index.split('-').map(Number);
      filtered = filtered.slice(start - 1, end);
    } else {
      const idx = Number(options.index) - 1;
      filtered = filtered.slice(idx, idx + 1);
    }
  }

  if (options.mismatch) {
    // This will be populated after first run - for now, return empty
    console.log('⚠️  --mismatch requires a previous run. Running all tests instead.');
  }

  return filtered;
}

const options = parseArgs();

if (options.help) {
  showHelp();
}

// Filter tests based on options
let testCases = filterTests(allTestCases, options);

if (testCases.length === 0) {
  console.error('❌ No tests match the specified criteria.');
  process.exit(1);
}

console.log('🔍 CLI Validation Test Suite');
console.log('============================\n');

// Load cache
const cache = options.regenerateCache ? {} : loadCache();
const cacheSize = Object.keys(cache).length;

if (options.regenerateCache) {
  console.log('🔄 Regenerating CLI result cache...\n');
} else if (cacheSize > 0) {
  console.log(`💾 Using cached CLI results (${cacheSize} entries). Use --regenerate-cache to refresh.\n`);
} else {
  console.log('⚠️  No cache found. Running CLI tests (this may take a while)...\n');
}

console.log(`Testing ${testCases.length} of ${allTestCases.length} test cases against ${options.regenerateCache ? 'real Mermaid CLI' : 'cached CLI results'}...\n`);

let totalTests = testCases.length;
let matches = 0;
let discrepancies = [];
const categoryStats = {};
const detailedDiscrepancies = [];
let cacheMisses = 0;
let cacheHits = 0;

// Initialize category stats
testCases.forEach(test => {
  if (!categoryStats[test.category]) {
    categoryStats[test.category] = { total: 0, matches: 0, discrepancies: [] };
  }
  categoryStats[test.category].total++;
});

// Cache management functions
function getCacheHash(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) {
    return {};
  }
  try {
    const cacheData = fs.readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(cacheData);
  } catch (error) {
    console.warn(`⚠️  Warning: Could not load cache file: ${error.message}`);
    return {};
  }
}

function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (error) {
    console.warn(`⚠️  Warning: Could not save cache file: ${error.message}`);
  }
}

// Test execution function
function testWithMermaidCLI(code, useCache = true, cache = {}) {
  const codeHash = getCacheHash(code);
  
  // Check cache first (only if useCache is true)
  if (useCache && cache[codeHash]) {
    return cache[codeHash];
  }
  
  // Run actual CLI test
  const tempFile = '/tmp/merval-cli-test.mmd';
  const outputFile = '/tmp/merval-cli-test.png';
  
  let result;
  try {
    fs.writeFileSync(tempFile, code, 'utf8');
    execSync(`mmdc -i ${tempFile} -o ${outputFile}`, { 
      stdio: 'pipe',
      timeout: 10000,
      encoding: 'utf8'
    });
    
    result = { isValid: true, error: null };
  } catch (error) {
    result = { 
      isValid: false, 
      error: error.message || String(error)
    };
  } finally {
    // Clean up temp files
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
  }
  
  // Always cache the result (for both normal runs and regeneration)
  cache[codeHash] = result;
  
  return result;
}

// Run tests
for (let i = 0; i < testCases.length; i++) {
  const testCase = testCases[i];
  const progress = `[${i + 1}/${totalTests}]`;
  
  process.stdout.write(`${progress} Testing: ${testCase.name} (${testCase.category})... `);
  
  // Test with our validator
  const ourResult = validateMermaid(testCase.code);
  
  // Test with Mermaid CLI (use cache unless regenerating)
  const codeHash = getCacheHash(testCase.code);
  const wasCached = !options.regenerateCache && cache[codeHash] !== undefined;
  if (wasCached) {
    cacheHits++;
  } else {
    cacheMisses++;
  }
  
  const mermaidResult = testWithMermaidCLI(testCase.code, !options.regenerateCache, cache);
  
  // Save cache immediately after running CLI test (so Ctrl+C doesn't lose progress)
  if (!wasCached) {
    saveCache(cache);
  }
  
  // Compare results
  const matchesExpected = ourResult.isValid === testCase.expectedValid;
  const matchesCLI = ourResult.isValid === mermaidResult.isValid;
  
  if (matchesCLI && matchesExpected) {
    console.log(`✅ MATCH${wasCached ? ' (cached)' : ''}`);
    matches++;
    categoryStats[testCase.category].matches++;
  } else {
    console.log(`❌ MISMATCH${wasCached ? ' (cached)' : ''}`);
    
    const discrepancy = {
      name: testCase.name,
      category: testCase.category,
      code: testCase.code,
      expectedValid: testCase.expectedValid,
      ourResult: ourResult.isValid,
      mermaidResult: mermaidResult.isValid,
      ourErrors: ourResult.errors,
      mermaidError: mermaidResult.error,
      issue: ''
    };
    
    // Determine the issue type
    if (!matchesExpected) {
      discrepancy.issue = 'EXPECTATION_MISMATCH';
      discrepancy.issueDetail = `Expected ${testCase.expectedValid ? 'valid' : 'invalid'}, but our validator says ${ourResult.isValid ? 'valid' : 'invalid'}`;
    } else if (!matchesCLI) {
      if (ourResult.isValid && !mermaidResult.isValid) {
        discrepancy.issue = 'FALSE_POSITIVE';
        discrepancy.issueDetail = 'Our validator accepts but Mermaid CLI rejects - this is CRITICAL';
      } else if (!ourResult.isValid && mermaidResult.isValid) {
        discrepancy.issue = 'FALSE_NEGATIVE';
        discrepancy.issueDetail = 'Our validator rejects but Mermaid CLI accepts - less critical but should be fixed';
      }
    }
    
    discrepancies.push(discrepancy);
    detailedDiscrepancies.push(discrepancy);
    categoryStats[testCase.category].discrepancies = categoryStats[testCase.category].discrepancies || [];
    categoryStats[testCase.category].discrepancies.push(discrepancy);
  }
}

// Show cache summary (cache is saved incrementally during test execution)
if (cacheMisses > 0 || options.regenerateCache) {
  const totalEntries = Object.keys(cache).length;
  if (options.regenerateCache) {
    console.log(`\n💾 Cache regenerated: ${totalEntries} entries saved.`);
  } else if (cacheMisses > 0) {
    console.log(`\n💾 Cache updated: ${cacheMisses} new entries added (${totalEntries} total).`);
  }
}

console.log('\n📊 DETAILED RESULTS:');
console.log('===================\n');

// Category breakdown
Object.entries(categoryStats).sort((a, b) => {
  // Sort by match rate (lowest first) then by total
  const aRate = a[1].matches / a[1].total;
  const bRate = b[1].matches / b[1].total;
  if (aRate !== bRate) return aRate - bRate;
  return b[1].total - a[1].total;
}).forEach(([category, stats]) => {
  const matchRate = ((stats.matches / stats.total) * 100).toFixed(1);
  const discrepancyCount = stats.discrepancies ? stats.discrepancies.length : 0;
  const status = matchRate === '100.0' ? '✅' : '❌';
  console.log(`${status} ${category}: ${stats.matches}/${stats.total} (${matchRate}%)${discrepancyCount > 0 ? ` - ${discrepancyCount} discrepancy(ies)` : ''}`);
});

console.log(`\n📈 OVERALL SUMMARY:`);
console.log(`   Total tests: ${totalTests}`);
console.log(`   Matches: ${matches}`);
console.log(`   Discrepancies: ${discrepancies.length}`);
console.log(`   Match rate: ${((matches / totalTests) * 100).toFixed(1)}%`);
if (!options.regenerateCache && cacheHits > 0) {
  console.log(`   Cache hits: ${cacheHits} (${((cacheHits / totalTests) * 100).toFixed(1)}%)`);
  console.log(`   Cache misses: ${cacheMisses} (${((cacheMisses / totalTests) * 100).toFixed(1)}%)`);
}

// Critical issues (false positives)
const falsePositives = discrepancies.filter(d => d.issue === 'FALSE_POSITIVE');
const falseNegatives = discrepancies.filter(d => d.issue === 'FALSE_NEGATIVE');
const expectationMismatches = discrepancies.filter(d => d.issue === 'EXPECTATION_MISMATCH');

if (falsePositives.length > 0) {
  console.log(`\n🚨 CRITICAL ISSUES (False Positives): ${falsePositives.length}`);
  console.log('   These are ACCEPTED by our validator but REJECTED by Mermaid CLI.');
  console.log('   This means users will get validation success but rendering will fail!');
  falsePositives.forEach((d, i) => {
    console.log(`\n   ${i + 1}. ${d.name} (${d.category})`);
    console.log(`      Code: ${d.code.substring(0, 100)}${d.code.length > 100 ? '...' : ''}`);
    console.log(`      Mermaid CLI Error: ${d.mermaidError ? d.mermaidError.substring(0, 150) : 'Unknown error'}`);
    if (d.ourErrors.length > 0) {
      console.log(`      Our Errors: ${d.ourErrors.map(e => e.message).join(', ')}`);
    }
  });
}

if (falseNegatives.length > 0) {
  console.log(`\n⚠️  FALSE NEGATIVES: ${falseNegatives.length}`);
  console.log('   These are REJECTED by our validator but ACCEPTED by Mermaid CLI.');
  console.log('   Less critical but should be fixed for better compatibility.');
  falseNegatives.forEach((d, i) => {
    console.log(`\n   ${i + 1}. ${d.name} (${d.category})`);
    console.log(`      Code: ${d.code.substring(0, 100)}${d.code.length > 100 ? '...' : ''}`);
    if (d.ourErrors.length > 0) {
      console.log(`      Our Errors: ${d.ourErrors.map(e => e.message).join(', ')}`);
    }
  });
}

if (expectationMismatches.length > 0) {
  console.log(`\n📝 EXPECTATION MISMATCHES: ${expectationMismatches.length}`);
  console.log('   These tests have incorrect expectedValid values.');
  console.log('   The test expectations need to be updated based on actual Mermaid CLI behavior.');
  expectationMismatches.forEach((d, i) => {
    console.log(`\n   ${i + 1}. ${d.name} (${d.category})`);
    console.log(`      Expected: ${d.expectedValid ? 'valid' : 'invalid'}`);
    console.log(`      Our Result: ${d.ourResult ? 'valid' : 'invalid'}`);
    console.log(`      Mermaid CLI: ${d.mermaidResult ? 'valid' : 'invalid'}`);
  });
}

if (discrepancies.length === 0) {
  console.log('\n🎉 PERFECT MATCH!');
  console.log('✅ Our validator behaves identically to Mermaid CLI.');
  console.log('✅ No chart will pass our validator and then fail to render.');
  console.log('✅ No valid chart will be incorrectly rejected.');
  console.log('\n🚀 Validator is production-ready!');
} else {
  console.log('\n⚠️  DISCREPANCIES FOUND:');
  console.log(`   Total: ${discrepancies.length}`);
  console.log(`   Critical (False Positives): ${falsePositives.length}`);
  console.log(`   False Negatives: ${falseNegatives.length}`);
  console.log(`   Expectation Mismatches: ${expectationMismatches.length}`);
  
  if (falsePositives.length > 0) {
    console.log('\n🔧 CRITICAL: These discrepancies MUST be fixed before production.');
    console.log('   False positives allow invalid diagrams to pass validation.');
  } else {
    console.log('\n🔧 These discrepancies should be investigated and fixed.');
  }
  console.log('❌ Validator is NOT ready for production until critical issues are resolved.');
}

console.log('\n📝 Note: This test suite ensures 100% compatibility with Mermaid CLI.');
console.log('   Run this before any production deployment to verify compatibility.');
console.log(`\n📋 Test files:`);
console.log(`   - gitgraph-tests.js: ${gitgraphTests.length} tests`);
console.log(`   - flowchart-tests.js: ${flowchartTests.length} tests`);
console.log(`   - sequence-tests.js: ${sequenceTests.length} tests`);
console.log(`   - other-diagrams-tests.js: ${otherDiagramsTests.length} tests`);
console.log(`   - edge-cases-tests.js: ${edgeCasesTests.length} tests`);

if (testCases.length < allTestCases.length) {
  console.log(`\n💡 Tip: Run without filters to test all ${allTestCases.length} cases`);
}

// Exit with appropriate code
process.exit(discrepancies.length === 0 ? 0 : 1);
