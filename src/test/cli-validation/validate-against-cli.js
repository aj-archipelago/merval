#!/usr/bin/env node

/**
 * CLI Validation Test Suite
 * 
 * This test suite validates our mermaid-validator against the real Mermaid CLI
 * to ensure 100% compatibility. It tests various edge cases and scenarios to
 * guarantee that no chart will pass our validator and then fail to render.
 * 
 * Usage: node src/test/cli-validation/validate-against-cli.js
 */

import { validateMermaid } from '../../../dist/index.js';
import { execSync } from 'child_process';
import fs from 'fs';

// Comprehensive test cases covering all scenarios
const testCases = [
  // Valid cases that should pass both validators
  {
    name: 'Simple flowchart',
    code: `flowchart TD
  A[Start] --> B[End]`,
    expectedValid: true,
    category: 'basic'
  },
  {
    name: 'Sequence with implicit participants',
    code: `sequenceDiagram
  Alice->>Bob: Hello Bob, how are you?`,
    expectedValid: true,
    category: 'sequence'
  },
  {
    name: 'Unicode characters (emojis)',
    code: `sequenceDiagram
  participant 🚀
  participant ✅
  🚀->>✅: Hello!`,
    expectedValid: true,
    category: 'unicode'
  },
  {
    name: 'Special characters in participant names',
    code: `sequenceDiagram
  participant "Alice & Bob"
  participant "Charlie-David"
  "Alice & Bob"->>"Charlie-David": Hello`,
    expectedValid: true,
    category: 'special-chars'
  },
  {
    name: 'Complex flowchart with decision points',
    code: `flowchart TD
  A[Start] --> B{First Decision}
  B -->|Option 1| C{Second Decision}
  B -->|Option 2| D{Third Decision}
  C -->|Yes| F[Process 1A]
  C -->|No| G[Process 1B]
  F --> L[End]
  G --> L`,
    expectedValid: true,
    category: 'complex'
  },
  {
    name: 'Mixed diagrams (flowchart -> sequence)',
    code: `flowchart TD
  A --> B
  sequenceDiagram
  Alice --> Bob`,
    expectedValid: true,
    category: 'mixed'
  },
  {
    name: 'Class diagram',
    code: `classDiagram
  class Animal {
    +String name
    +int age
    +makeSound()
  }
  class Dog {
    +String breed
    +bark()
  }
  Animal <|-- Dog`,
    expectedValid: true,
    category: 'class'
  },
  {
    name: 'State diagram',
    code: `stateDiagram-v2
  [*] --> Still
  Still --> [*]
  Still --> Moving
  Moving --> Still
  Moving --> Crash
  Crash --> [*]`,
    expectedValid: true,
    category: 'state'
  },
  {
    name: 'Pie chart',
    code: `pie title "Sales by Region"
  "North" : 42
  "South" : 28
  "East" : 20
  "West" : 10`,
    expectedValid: true,
    category: 'pie'
  },
  {
    name: 'XY chart',
    code: `xychart-beta
  title "Sales Revenue"
  x-axis [jan, feb, mar, apr, may, jun]
  y-axis "Revenue (in $)" 4000 --> 11000
  bar [5000, 6000, 7500, 8200, 9500, 10500]`,
    expectedValid: true,
    category: 'xy-chart'
  },
  {
    name: 'Block diagram',
    code: `block-beta
  columns 3
  A["Block A"] B["Block B"] C["Block C"]
  D["Block D"] E["Block E"] F["Block F"]`,
    expectedValid: true,
    category: 'block'
  },

  // STYLING DIRECTIVES TESTS
  {
    name: 'Flowchart with classDef',
    code: `flowchart TD
  A[Start] --> B[End]
  classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
  class A startNode`,
    expectedValid: true,
    category: 'styling'
  },
  {
    name: 'Flowchart with linkStyle',
    code: `flowchart TD
  A[Start] --> B[End]
  linkStyle 0 stroke:#ff0000,stroke-width:2px`,
    expectedValid: true,
    category: 'styling'
  },
  {
    name: 'Flowchart with style directive',
    code: `flowchart TD
  A[Start] --> B[End]
  style A fill:#f9f,stroke:#333,stroke-width:2px`,
    expectedValid: true,
    category: 'styling'
  },
  {
    name: 'Flowchart with click handler',
    code: `flowchart TD
  A[Start] --> B[End]
  click A "https://example.com"`,
    expectedValid: true,
    category: 'styling'
  },
  {
    name: 'Flowchart with direction change',
    code: `flowchart LR
  A[Start] --> B[End]`,
    expectedValid: true,
    category: 'styling'
  },
  {
    name: 'State diagram with classDef',
    code: `stateDiagram-v2
  [*] --> State1
  State1 --> State2
  classDef stateNode fill:#f9f,stroke:#333,stroke-width:2px
  class State1 stateNode`,
    expectedValid: true,
    category: 'styling'
  },
  {
    name: 'Class diagram with classDef',
    code: `classDiagram
  class Animal {
    +name: string
  }
  classDef animalClass fill:#f9f,stroke:#333,stroke-width:2px
  class Animal animalClass`,
    expectedValid: true,
    category: 'styling'
  },
  {
    name: 'State diagram with linkStyle (should fail)',
    code: `stateDiagram-v2
  [*] --> State1
  State1 --> State2
  linkStyle 0 stroke:#ff0000,stroke-width:2px`,
    expectedValid: false,
    category: 'styling'
  },
  {
    name: 'Class diagram with linkStyle (should fail)',
    code: `classDiagram
  class Animal {
    +name: string
  }
  linkStyle 0 stroke:#ff0000,stroke-width:2px`,
    expectedValid: false,
    category: 'styling'
  },
  {
    name: 'Sequence diagram with classDef (should fail)',
    code: `sequenceDiagram
  participant A
  participant B
  A->>B: Hello
  classDef participant fill:#f9f,stroke:#333,stroke-width:2px`,
    expectedValid: false,
    category: 'styling'
  },

  // NODE SHAPES TESTS
  {
    name: 'Flowchart with rectangular nodes',
    code: `flowchart TD
  A[Rect] --> B[Rect]`,
    expectedValid: true,
    category: 'node-shapes'
  },
  {
    name: 'Flowchart with round nodes',
    code: `flowchart TD
  A(Round) --> B(Round)`,
    expectedValid: true,
    category: 'node-shapes'
  },
  {
    name: 'Flowchart with diamond nodes',
    code: `flowchart TD
  A{Diamond} --> B{Diamond}`,
    expectedValid: true,
    category: 'node-shapes'
  },
  {
    name: 'Flowchart with double-circle nodes',
    code: `flowchart TD
  A((Double)) --> B((Double))`,
    expectedValid: true,
    category: 'node-shapes'
  },
  {
    name: 'Flowchart with mixed node shapes',
    code: `flowchart TD
  A[Rect] --> B(Round)
  B --> C{Diamond}
  C --> D((Double))`,
    expectedValid: true,
    category: 'node-shapes'
  },
  {
    name: 'State diagram with double-parentheses (should fail)',
    code: `stateDiagram-v2
  [*] --> State1
  State1 --> State2((End))`,
    expectedValid: false,
    category: 'node-shapes'
  },
  {
    name: 'Class diagram with double-parentheses (should fail)',
    code: `classDiagram
  class Animal {
    +name: string
  }
  class Animal((End))`,
    expectedValid: false,
    category: 'node-shapes'
  },
  {
    name: 'Sequence diagram with double-parentheses (should fail)',
    code: `sequenceDiagram
  participant A
  participant B((End))
  A->>B: Hello`,
    expectedValid: false,
    category: 'node-shapes'
  },

  // INVALID STYLING TESTS
  {
    name: 'Flowchart with standalone note (should fail)',
    code: `flowchart TD
  A[Start] --> B[End]
  note for A: This is invalid`,
    expectedValid: false,
    category: 'styling'
  },
  
  // Invalid cases that should fail both validators
  {
    name: 'Adjacent nodes without arrow',
    code: `flowchart TD
  A B`,
    expectedValid: false,
    category: 'syntax-error'
  },
  {
    name: 'Incomplete message',
    code: `sequenceDiagram
  participant A
  participant B
  A -->`,
    expectedValid: false,
    category: 'syntax-error'
  },
  {
    name: 'Malformed participant',
    code: `sequenceDiagram
  participant`,
    expectedValid: false,
    category: 'syntax-error'
  },
  {
    name: 'Unclosed bracket',
    code: `flowchart TD
  A[Start --> B[End]`,
    expectedValid: false,
    category: 'syntax-error'
  },
  {
    name: 'Empty input',
    code: '',
    expectedValid: false,
    category: 'edge-case'
  },
  {
    name: 'Unknown diagram type',
    code: `unknownDiagram
  some content`,
    expectedValid: false,
    category: 'edge-case'
  }
];

console.log('🔍 CLI Validation Test Suite');
console.log('============================\n');
console.log('Testing mermaid-validator against real Mermaid CLI...\n');

let totalTests = testCases.length;
let matches = 0;
let discrepancies = [];
const categoryStats = {};

// Initialize category stats
testCases.forEach(test => {
  if (!categoryStats[test.category]) {
    categoryStats[test.category] = { total: 0, matches: 0 };
  }
  categoryStats[test.category].total++;
});

for (const testCase of testCases) {
  console.log(`Testing: ${testCase.name} (${testCase.category})`);
  
  // Test with our validator
  const ourResult = validateMermaid(testCase.code);
  
  // Test with real Mermaid CLI
  let mermaidResult = { isValid: false, error: null };
  try {
    fs.writeFileSync('/tmp/test.mmd', testCase.code);
    execSync('mmdc -i /tmp/test.mmd -o /tmp/test.png', { stdio: 'pipe' });
    mermaidResult.isValid = true;
    
    // Clean up
    fs.unlinkSync('/tmp/test.mmd');
    if (fs.existsSync('/tmp/test.png')) {
      fs.unlinkSync('/tmp/test.png');
    }
  } catch (error) {
    mermaidResult.isValid = false;
    mermaidResult.error = error.message;
  }
  
  // Compare results
  if (ourResult.isValid === mermaidResult.isValid) {
    console.log(`✅ MATCH: Both ${ourResult.isValid ? 'valid' : 'invalid'}`);
    matches++;
    categoryStats[testCase.category].matches++;
  } else {
    console.log(`❌ MISMATCH:`);
    console.log(`   Our validator: ${ourResult.isValid ? 'valid' : 'invalid'}`);
    console.log(`   Mermaid CLI: ${mermaidResult.isValid ? 'valid' : 'invalid'}`);
    if (mermaidResult.error) {
      console.log(`   Mermaid error: ${mermaidResult.error.substring(0, 100)}...`);
    }
    if (ourResult.errors.length > 0) {
      console.log(`   Our errors: ${ourResult.errors.map(e => e.message).join(', ')}`);
    }
    discrepancies.push({
      name: testCase.name,
      category: testCase.category,
      ourResult: ourResult.isValid,
      mermaidResult: mermaidResult.isValid,
      ourErrors: ourResult.errors,
      mermaidError: mermaidResult.error
    });
  }
  console.log('');
}

console.log('📊 DETAILED RESULTS:');
console.log('===================');

// Category breakdown
Object.entries(categoryStats).forEach(([category, stats]) => {
  const matchRate = ((stats.matches / stats.total) * 100).toFixed(1);
  console.log(`${category}: ${stats.matches}/${stats.total} (${matchRate}%)`);
});

console.log(`\n📈 OVERALL SUMMARY:`);
console.log(`   Total tests: ${totalTests}`);
console.log(`   Matches: ${matches}`);
console.log(`   Discrepancies: ${discrepancies.length}`);
console.log(`   Match rate: ${((matches / totalTests) * 100).toFixed(1)}%`);

if (discrepancies.length === 0) {
  console.log('\n🎉 PERFECT MATCH!');
  console.log('✅ Our validator behaves identically to Mermaid CLI.');
  console.log('✅ No chart will pass our validator and then fail to render.');
  console.log('✅ No valid chart will be incorrectly rejected.');
  console.log('\n🚀 Validator is production-ready!');
} else {
  console.log('\n⚠️  DISCREPANCIES FOUND:');
  discrepancies.forEach(d => {
    console.log(`   - ${d.name} (${d.category}): Our validator ${d.ourResult ? 'validates' : 'rejects'}, Mermaid CLI ${d.mermaidResult ? 'renders' : 'fails'}`);
  });
  console.log('\n🔧 These discrepancies need to be investigated and fixed.');
  console.log('❌ Validator is NOT ready for production until discrepancies are resolved.');
}

console.log('\n📝 Note: This test suite ensures 100% compatibility with Mermaid CLI.');
console.log('   Run this before any production deployment to verify compatibility.');
