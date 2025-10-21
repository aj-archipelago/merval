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
      'Flowchart with linkStyle',
      `flowchart TD
        A[Start] --> B[Process]
        B --> C[End]
        linkStyle 0 stroke:#ff0000,stroke-width:2px
        linkStyle 1 stroke:#00ff00,stroke-width:3px`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with both classDef and linkStyle',
      `flowchart TD
        A[Start] --> B[Process]
        B --> C[End]
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
        classDef processNode fill:#bbf,stroke:#333,stroke-width:2px
        classDef endNode fill:#bfb,stroke:#333,stroke-width:2px
        class A startNode
        class B processNode
        class C endNode
        linkStyle 0 stroke:#ff0000,stroke-width:2px
        linkStyle 1 stroke:#00ff00,stroke-width:3px`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with complex classDef styling',
      `flowchart TD
        A[Start] --> B[Process]
        B --> C[End]
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
        classDef processNode fill:#bbf,stroke:#333,stroke-width:2px,color:#fff
        classDef endNode fill:#bfb,stroke:#333,stroke-width:2px,stroke-dasharray: 10 5
        class A startNode
        class B processNode
        class C endNode`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with complex linkStyle styling',
      `flowchart TD
        A[Start] --> B[Process]
        B --> C[End]
        linkStyle 0 stroke:#ff0000,stroke-width:2px,stroke-dasharray: 5 5
        linkStyle 1 stroke:#00ff00,stroke-width:3px,stroke-dasharray: 10 5`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with multiple classDef definitions',
      `flowchart TD
        A[Start] --> B[Process]
        B --> C[End]
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
        classDef processNode fill:#bbf,stroke:#333,stroke-width:2px
        classDef endNode fill:#bfb,stroke:#333,stroke-width:2px
        classDef errorNode fill:#fbb,stroke:#333,stroke-width:2px
        class A startNode
        class B processNode
        class C endNode`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with multiple linkStyle definitions',
      `flowchart TD
    A[Start] --> B[Process]
    B --> C[End]
    C --> D[Final]
    linkStyle 0 stroke:#ff0000,stroke-width:2px
    linkStyle 1 stroke:#00ff00,stroke-width:3px
    linkStyle 2 stroke:#0000ff,stroke-width:4px`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with style directive',
      `flowchart TD
    A[Start] --> B[Process]
    style A fill:#f9f,stroke:#333,stroke-width:4px
    style B fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with dotted arrows',
      `flowchart TD
    A[Start] --> B[Process]
    A -.-> C[Note]
    B -.-> D[Another Note]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with dotted arrows and labels',
      `flowchart TD
    A[Start] --> B[Process]
    A -.->|note| C[Note]
    B -.->|another note| D[Another Note]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with all styling directives',
      `flowchart TD
    A[Start] --> B[Process]
    B --> C[End]
    
    classDef red fill:#f00,stroke:#000,stroke-width:2px
    classDef blue fill:#00f,stroke:#000,stroke-width:2px
    
    class A red
    class B blue
    
    style C fill:#0f0,stroke:#000,stroke-width:2px
    
    linkStyle 0 stroke:#ff0000,stroke-width:2px
    linkStyle 1 stroke:#0000ff,stroke-width:2px
    
    click A "https://example.com"
    direction TB`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with invalid standalone note (should fail)',
      `flowchart TD
    A[Start] --> B[Process]
    note for A: This is a note`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithCode: 'INVALID_NOTE_SYNTAX'
      }
    ),

    // Additional comprehensive styling tests
    createTestCase(
      'Flowchart with style directive and complex CSS',
      `flowchart TD
        A[Start] --> B[Process]
        style A fill:#f9f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
        style B fill:#bbf,stroke:#333,stroke-width:2px,color:#fff`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with multiple style directives',
      `flowchart TD
        A[Start] --> B[Process]
        B --> C[End]
        style A fill:#f9f,stroke:#333,stroke-width:2px
        style B fill:#bbf,stroke:#333,stroke-width:2px
        style C fill:#bfb,stroke:#333,stroke-width:2px`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with style and classDef together',
      `flowchart TD
        A[Start] --> B[Process]
        B --> C[End]
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
        style A fill:#bbf,stroke:#333,stroke-width:2px
        class B startNode`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with all styling directives combined',
      `flowchart TD
        A[Start] --> B[Process]
        B --> C[End]
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
        classDef processNode fill:#bbf,stroke:#333,stroke-width:2px
        class A startNode
        class B processNode
        style C fill:#bfb,stroke:#333,stroke-width:2px
        linkStyle 0 stroke:#ff0000,stroke-width:2px
        linkStyle 1 stroke:#00ff00,stroke-width:3px`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with dotted arrows and all styling',
      `flowchart TD
        A[Start] --> B[Process]
        A -.->|Note| C[End]
        B -.-> D[Another End]
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
        classDef processNode fill:#bbf,stroke:#333,stroke-width:2px
        class A startNode
        class B processNode
        style C fill:#bfb,stroke:#333,stroke-width:2px
        linkStyle 0 stroke:#ff0000,stroke-width:2px
        linkStyle 1 stroke:#00ff00,stroke-width:3px`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with click handlers and styling',
      `flowchart TD
        A[Start] --> B[Process]
        click A "https://example.com" "Click me"
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
        class A startNode`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with direction and styling',
      `flowchart LR
        A[Start] --> B[Process]
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
        class A startNode`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with subgraph and styling',
      `flowchart TD
        A[Start] --> B[Process]
        subgraph "Group"
          C[End]
        end
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
        class A startNode`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with complex node shapes and styling',
      `flowchart TD
        A[Start] --> B(Process)
        B --> C{Decision}
        C -->|Yes| D[End]
        C -->|No| E((End))
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
        classDef processNode fill:#bbf,stroke:#333,stroke-width:2px
        classDef decisionNode fill:#fbf,stroke:#333,stroke-width:2px
        class A startNode
        class B processNode
        class C decisionNode`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Edge cases and error handling for styling
    createTestCase(
      'Flowchart with style directive referencing non-existent node',
      `flowchart TD
        A[Start] --> B[Process]
        style C fill:#f9f,stroke:#333,stroke-width:2px`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with linkStyle referencing non-existent link',
      `flowchart TD
        A[Start] --> B[Process]
        linkStyle 5 stroke:#ff0000,stroke-width:2px`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithCode: 'INVALID_LINKSTYLE_INDEX'
      }
    ),

    createTestCase(
      'Flowchart with classDef but no class assignments',
      `flowchart TD
        A[Start] --> B[Process]
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with class assignment but no classDef',
      `flowchart TD
        A[Start] --> B[Process]
        class A startNode`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with multiple note arrows and styling',
      `flowchart TD
        A[Start] --> B[Process]
        A -.->|Note 1| C[End]
        B -.->|Note 2| D[End]
        classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
        class A startNode`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Double-circle node tests
    createTestCase(
      'Flowchart with double-circle nodes',
      `flowchart TD
        A[Start] --> B(Process)
        B --> C{Decision}
        C -->|Yes| D[End]
        C -->|No| E((End))`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with multiple double-circle nodes',
      `flowchart TD
        A[Start] --> B(Process)
        B --> C{Decision}
        C -->|Yes| D((Success))
        C -->|No| E((Failure))
        D --> F((Complete))
        E --> F`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with double-circle nodes and labels',
      `flowchart TD
        A[Start] --> B(Process)
        B --> C{Decision}
        C -->|Yes| D((Success))
        C -->|No| E((Failure))`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with double-circle nodes and styling',
      `flowchart TD
        A[Start] --> B(Process)
        B --> C{Decision}
        C -->|Yes| D((Success))
        C -->|No| E((Failure))
        classDef successNode fill:#90EE90,stroke:#333,stroke-width:2px
        classDef failureNode fill:#FFB6C1,stroke:#333,stroke-width:2px
        class D successNode
        class E failureNode`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with all node shapes',
      `flowchart TD
        A[Rectangular] --> B(Round)
        B --> C{Diamond}
        C -->|Yes| D((Double Circle))
        C -->|No| E[Back to Rect]`,
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
