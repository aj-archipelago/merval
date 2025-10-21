#!/usr/bin/env node

/**
 * CLI Test Utility for Merval vs Mermaid CLI
 * 
 * Usage:
 *   node cli-test.js "flowchart TD\nA --> B"
 *   node cli-test.js -f diagram.mmd
 *   echo "flowchart TD\nA --> B" | node cli-test.js
 */

import { validateMermaid } from './dist/index.js';
import { execSync } from 'child_process';
import fs from 'fs';

function testWithMerval(code) {
  const result = validateMermaid(code);
  return {
    valid: result.isValid,
    diagramType: result.diagramType,
    errors: result.errors || []
  };
}

function testWithCLI(code) {
  try {
    // Write to temp file
    const tempFile = '/tmp/merval-test.mmd';
    fs.writeFileSync(tempFile, code);
    
    // Test with Mermaid CLI
    execSync(`mmdc -i ${tempFile} -o /tmp/merval-test.png`, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 5000 
    });
    
    // Clean up
    fs.unlinkSync(tempFile);
    if (fs.existsSync('/tmp/merval-test.png')) {
      fs.unlinkSync('/tmp/merval-test.png');
    }
    
    return { valid: true, error: null };
  } catch (error) {
    // Clean up temp file
    if (fs.existsSync('/tmp/merval-test.mmd')) {
      fs.unlinkSync('/tmp/merval-test.mmd');
    }
    if (fs.existsSync('/tmp/merval-test.png')) {
      fs.unlinkSync('/tmp/merval-test.png');
    }
    
    return { valid: false, error: error.message };
  }
}

function formatError(error) {
  if (!error) return '';
  
  // Extract the meaningful part of the error
  const lines = error.split('\n');
  const meaningfulLine = lines.find(line => 
    line.includes('Error:') || 
    line.includes('Parse error') || 
    line.includes('Lexical error') ||
    line.includes('Syntax error')
  );
  
  return meaningfulLine || lines[0] || error;
}

function printResults(mervalResult, cliResult, code) {
  console.log('🔍 MERMAID VALIDATION COMPARISON');
  console.log('================================\n');
  
  console.log('📝 Input:');
  console.log('```mermaid');
  console.log(code);
  console.log('```\n');
  
  console.log('📊 Results:');
  console.log(`Merval:    ${mervalResult.valid ? '✅ VALID' : '❌ INVALID'}`);
  console.log(`Mermaid:   ${cliResult.valid ? '✅ VALID' : '❌ INVALID'}`);
  console.log(`Match:     ${mervalResult.valid === cliResult.valid ? '✅ YES' : '❌ NO'}\n`);
  
  if (mervalResult.diagramType) {
    console.log(`Diagram Type: ${mervalResult.diagramType}\n`);
  }
  
  if (!mervalResult.valid && mervalResult.errors.length > 0) {
    console.log('🚨 Merval Errors:');
    mervalResult.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.message}`);
      console.log(`     Location: Line ${error.line}, Column ${error.column}`);
      if (error.code) {
        console.log(`     Code: ${error.code}`);
      }
      if (error.suggestion) {
        console.log(`     Suggestion: ${error.suggestion}`);
      }
    });
    console.log('');
  }
  
  if (!cliResult.valid && cliResult.error) {
    console.log('🚨 Mermaid CLI Error:');
    console.log(`  ${formatError(cliResult.error)}\n`);
  }
  
  if (mervalResult.valid === cliResult.valid) {
    console.log('🎉 Perfect match! Both validators agree.');
  } else {
    console.log('⚠️  Discrepancy found! Validators disagree.');
    console.log('   This indicates a compatibility issue that needs investigation.');
  }
}

function showHelp() {
  console.log('🔍 Merval CLI Test Utility');
  console.log('==========================\n');
  console.log('Usage:');
  console.log('  node cli-test.js "flowchart TD\\nA --> B"');
  console.log('  node cli-test.js -f diagram.mmd');
  console.log('  echo "flowchart TD\\nA --> B" | node cli-test.js\n');
  console.log('Examples:');
  console.log('  node cli-test.js "flowchart TD\\nA[Start] --> B[End]"');
  console.log('  node cli-test.js "sequenceDiagram\\nAlice->>Bob: Hello"');
  console.log('  node cli-test.js "classDiagram\\nclass Animal"');
}

function runTest(code) {
  try {
    const mervalResult = testWithMerval(code);
    const cliResult = testWithCLI(code);
    
    printResults(mervalResult, cliResult, code);
    
    // Exit with appropriate code
    if (mervalResult.valid === cliResult.valid) {
      process.exit(0); // Success - they match
    } else {
      process.exit(1); // Discrepancy found
    }
  } catch (error) {
    console.error(`❌ Error running test: ${error.message}`);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  // Handle different input methods
  if (args.length === 0) {
    // Check if input is piped
    if (process.stdin.readable && process.stdin.readableEnded === false) {
      // Read from stdin
      const chunks = [];
      process.stdin.on('data', chunk => chunks.push(chunk));
      process.stdin.on('end', () => {
        const code = chunks.join('').trim();
        if (code) {
          runTest(code);
        } else {
          console.error('❌ No input provided');
          process.exit(1);
        }
      });
      return;
    }
    
    // Show help
    showHelp();
    process.exit(0);
  }
  
  // Handle file input
  if (args[0] === '-f' && args[1]) {
    try {
      const code = fs.readFileSync(args[1], 'utf8').trim();
      runTest(code);
    } catch (error) {
      console.error(`❌ Error reading file: ${error.message}`);
      process.exit(1);
    }
    return;
  }
  
  // Handle command line input
  const code = args.join(' ').trim();
  if (!code) {
    console.error('❌ No diagram code provided');
    process.exit(1);
  }
  
  runTest(code);
}

main();
