/**
 * Comprehensive flowchart validation tests
 * Based on mermaid.js test patterns and real-world usage
 */

import { validateMermaid } from '../index.js';
import { createTestSuite, createTestCase, assertValidationResult } from './setup.js';

export const flowchartTests = createTestSuite(
  'Flowchart Tests',
  'Tests for flowchart diagram validation including nodes, arrows, directions, and styling',
  [
    // Basic valid flowcharts
    createTestCase(
      'Simple two-node flowchart',
      `flowchart TD
        A --> B`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Graph keyword instead of flowchart',
      `graph TD
        A --> B`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with all directions',
      `flowchart TD
        A --> B
        C --> D`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Left-right direction',
      `flowchart LR
        A --> B --> C`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Bottom-top direction',
      `flowchart BT
        A --> B`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Right-left direction',
      `flowchart RL
        A --> B`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Node shapes and labels
    createTestCase(
      'Rectangular nodes with labels',
      `flowchart TD
        A[Start] --> B[Process] --> C[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Round nodes with labels',
      `flowchart TD
        A(Start) --> B(Process) --> C(End)`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Diamond nodes with labels',
      `flowchart TD
        A{Decision} --> B[Process]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Mixed node shapes',
      `flowchart TD
        A[Start] --> B(Process) --> C{Decision} --> D[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Nodes with quoted labels',
      `flowchart TD
        A["Start Process"] --> B["End Process"]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Nodes with multi-word labels',
      `flowchart TD
        A[Start Process] --> B[End Process]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Arrow labels
    createTestCase(
      'Arrows with labels',
      `flowchart TD
        A -->|Yes| B
        A -->|No| C`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Arrows with quoted labels',
      `flowchart TD
        A -->|"Yes"| B
        A -->|"No"| C`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Arrows with multi-word labels',
      `flowchart TD
        A -->|Start Process| B
        A -->|End Process| C`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Complex flowcharts
    createTestCase(
      'Complex flowchart with multiple paths',
      `flowchart TD
        A[Start] --> B{Is it working?}
        B -->|Yes| C[Great!]
        B -->|No| D{Debug}
        D -->|Fix it| E[Try again]
        E --> B
        C --> F[End]
        D -->|Give up| F`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with subgraphs',
      `flowchart TD
        A[Start] --> B[Process]
        subgraph Main
          B --> C[Continue]
        end
        C --> D[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Styling and special statements
    createTestCase(
      'Flowchart with classDef',
      `flowchart TD
        classDef startEnd fill:#f9f,stroke:#333,stroke-width:2px
        classDef process fill:#bbf,stroke:#333,stroke-width:2px
        A[Start] --> B[Process]
        class A startEnd
        class B process`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with comments',
      `flowchart TD
        %% This is a comment
        A[Start] --> B[Process]
        %% Another comment
        B --> C[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Error cases
    createTestCase(
      'Empty flowchart',
      `flowchart TD`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Adjacent nodes without arrow',
      `flowchart TD
        A B`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithCode: 'MISSING_ARROW'
      }
    ),

    createTestCase(
      'Unclosed bracket in node',
      `flowchart TD
        A[Start --> B[End]`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithMessage: 'Expected closing bracket'
      }
    ),

    createTestCase(
      'Unclosed parenthesis in node',
      `flowchart TD
        A(Start --> B(End)`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithMessage: 'Expected closing parenthesis'
      }
    ),

    createTestCase(
      'Unclosed brace in node',
      `flowchart TD
        A{Start --> B{End}`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithMessage: 'Expected closing brace'
      }
    ),

    createTestCase(
      'Invalid direction',
      `flowchart INVALID
        A --> B`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Edge cases
    createTestCase(
      'Single node',
      `flowchart TD
        A[Single Node]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Self-referencing node',
      `flowchart TD
        A[Loop] --> A`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Multiple arrows from same node',
      `flowchart TD
        A[Start] --> B[Path 1]
        A --> C[Path 2]
        A --> D[Path 3]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Long node labels',
      `flowchart TD
        A["This is a very long node label that should still be valid"] --> B["Another long label"]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Special characters in labels',
      `flowchart TD
        A["Node with special chars: @#$%"] --> B["Another: &*()"]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Numbers in node IDs',
      `flowchart TD
        A1[Start] --> B2[Process] --> C3[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Underscores in node IDs',
      `flowchart TD
        start_node[Start] --> process_node[Process] --> end_node[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    )
  ]
);

// Run the tests
export function runFlowchartTests(): void {
  console.log(`\n🧪 Running ${flowchartTests.name}`);
  console.log(`📝 ${flowchartTests.description}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of flowchartTests.testCases) {
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
  
  console.log(`\n📊 Flowchart Tests Results: ${passed} passed, ${failed} failed`);
}
