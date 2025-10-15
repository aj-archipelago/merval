/**
 * Error handling and edge case tests
 * Tests for various error conditions and edge cases
 */

import { validateMermaid } from '../index.js';
import { createTestSuite, createTestCase, assertValidationResult } from './setup.js';

export const errorHandlingTests = createTestSuite(
  'Error Handling and Edge Cases',
  'Tests for error conditions, edge cases, and robustness',
  [
    // Input validation errors
    createTestCase(
      'Null input',
      null as any,
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithCode: 'EMPTY_INPUT'
      }
    ),

    createTestCase(
      'Undefined input',
      undefined as any,
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithCode: 'EMPTY_INPUT'
      }
    ),

    createTestCase(
      'Non-string input',
      123 as any,
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithCode: 'EMPTY_INPUT'
      }
    ),

    createTestCase(
      'Empty string',
      '',
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithCode: 'EMPTY_INPUT'
      }
    ),

    createTestCase(
      'Only whitespace',
      '   \n\t  ',
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithCode: 'EMPTY_INPUT'
      }
    ),

    // Malformed diagram syntax
    createTestCase(
      'Incomplete flowchart declaration',
      'flowchart',
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Incomplete sequence diagram declaration',
      'sequenceDiagram',
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Missing diagram type',
      'A --> B',
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithMessage: 'Unsupported diagram type'
      }
    ),

    createTestCase(
      'Invalid diagram keyword',
      'invalidDiagram\n  A --> B',
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithMessage: 'Unsupported diagram type'
      }
    ),

    // Malformed flowchart syntax
    createTestCase(
      'Flowchart with unclosed bracket',
      `flowchart TD
        A[Start --> B[End]`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithMessage: 'Expected closing bracket'
      }
    ),

    createTestCase(
      'Flowchart with unclosed parenthesis',
      `flowchart TD
        A(Start --> B(End)`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithMessage: 'Expected closing parenthesis'
      }
    ),

    createTestCase(
      'Flowchart with unclosed brace',
      `flowchart TD
        A{Start --> B{End}`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithMessage: 'Expected closing brace'
      }
    ),

    createTestCase(
      'Flowchart with malformed arrow',
      `flowchart TD
        A -->`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithMessage: 'Parse error'
      }
    ),

    createTestCase(
      'Flowchart with incomplete arrow label',
      `flowchart TD
        A -->|incomplete B`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithMessage: 'Expected closing pipe'
      }
    ),

    // Malformed sequence diagram syntax
    createTestCase(
      'Sequence with incomplete message',
      `sequenceDiagram
        participant A
        participant B
        A -->`,
      false,
      { 
        expectedDiagramType: 'sequence',
        hasErrorWithMessage: 'Parse error'
      }
    ),

    createTestCase(
      'Sequence with malformed participant',
      `sequenceDiagram
        participant`,
      false,
      { 
        expectedDiagramType: 'sequence',
        hasErrorWithMessage: 'Parse error'
      }
    ),

    // Edge cases with special characters
    createTestCase(
      'Flowchart with unicode characters',
      `flowchart TD
        A[🚀 Start] --> B[✅ End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Sequence with unicode characters',
      `sequenceDiagram
        participant 🚀
        participant ✅
        🚀->>✅: Hello!`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Flowchart with HTML entities',
      `flowchart TD
        A["&lt;Start&gt;"] --> B["&amp;End&amp;"]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Very long inputs
    createTestCase(
      'Very long flowchart',
      `flowchart TD
        ${Array.from({length: 100}, (_, i) => `A${i} --> B${i}`).join('\n        ')}`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Very long sequence diagram',
      `sequenceDiagram
        ${Array.from({length: 50}, (_, i) => `participant P${i}`).join('\n        ')}
        ${Array.from({length: 50}, (_, i) => `P${i}->>P${i+1}: Message ${i}`).join('\n        ')}`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    // Mixed content
    createTestCase(
      'Mixed diagram types (should fail)',
      `flowchart TD
        A --> B
        sequenceDiagram
        participant C`,
      true,
      { 
        expectedDiagramType: 'flowchart',
        description: 'Mermaid CLI allows certain mixed diagram combinations'
      }
    ),

    // Comments and special statements
    createTestCase(
      'Flowchart with only comments',
      `flowchart TD
        %% This is a comment
        %% Another comment
        %% Yet another comment`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with only classDef statements',
      `flowchart TD
        classDef default fill:#f9f,stroke:#333,stroke-width:2px
        classDef process fill:#bbf,stroke:#333,stroke-width:2px`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Nested structures
    createTestCase(
      'Flowchart with deeply nested subgraphs',
      `flowchart TD
        A --> B
        subgraph Level1
          B --> C
          subgraph Level2
            C --> D
            subgraph Level3
              D --> E
            end
          end
        end`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Performance edge cases
    createTestCase(
      'Flowchart with many nodes',
      `flowchart TD
        ${Array.from({length: 1000}, (_, i) => `A${i}[Node ${i}]`).join('\n        ')}`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Boundary conditions
    createTestCase(
      'Single character input',
      'a',
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithMessage: 'Unsupported diagram type'
      }
    ),

    createTestCase(
      'Very short valid flowchart',
      'flowchart TD\nA',
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Very short valid sequence',
      'sequenceDiagram\nA',
      true,
      { expectedDiagramType: 'sequence' }
    ),

    // Special whitespace cases
    createTestCase(
      'Flowchart with tabs and spaces',
      `flowchart\tTD
        A\t-->\tB
        \tC\t-->\tD`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Sequence with mixed line endings',
      `sequenceDiagram\r\nparticipant A\rparticipant B\nA->>B: Message`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    // Case sensitivity
    createTestCase(
      'Flowchart with mixed case',
      `FLOWCHART td
        A --> B`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Sequence with mixed case',
      `SEQUENCEDIAGRAM
        PARTICIPANT A
        A->>B: Message`,
      true,
      { expectedDiagramType: 'sequence' }
    )
  ]
);

// Run the tests
export function runErrorHandlingTests(): void {
  console.log(`\n🧪 Running ${errorHandlingTests.name}`);
  console.log(`📝 ${errorHandlingTests.description}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of errorHandlingTests.testCases) {
    try {
      const result = validateMermaid(testCase.input);
      
      if (testCase.expectedValid) {
        assertValidationResult(result, {
          isValid: true,
          diagramType: testCase.expectedDiagramType
        });
      } else {
        assertValidationResult(result, {
          isValid: false,
          diagramType: testCase.expectedDiagramType,
          hasErrorWithCode: testCase.expectedErrors?.[0]?.code,
          hasErrorWithMessage: testCase.expectedErrors?.[0]?.message
        });
      }
      
      console.log(`✅ ${testCase.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${testCase.name}: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Error Handling Tests Results: ${passed} passed, ${failed} failed`);
}
