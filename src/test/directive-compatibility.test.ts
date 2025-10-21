/**
 * Directive compatibility tests
 * Tests for Mermaid directive syntax compatibility across all diagram types
 */

import { validateMermaid } from '../index.js';
import { createTestSuite, createTestCase, assertValidationResult } from './setup.js';

export const directiveCompatibilityTests = createTestSuite(
  'Directive Compatibility Tests',
  'Tests for Mermaid directive syntax compatibility across all diagram types',
  [
    // Flowchart directive tests
    createTestCase(
      'Flowchart with init directive',
      `%%{init: {"theme": "dark"}}%%
flowchart TD
    A[Start] --> B[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with config directive',
      `%%{config: {"flowchart": {"htmlLabels": true}}}%%
flowchart TD
    A[Start] --> B[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with flowchart-specific directive',
      `%%{flowchart: {"htmlLabels": true}}%%
flowchart TD
    A[Start] --> B[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with wrap directive',
      `%%{wrap}%%
flowchart TD
    A[Start] --> B[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with multiple directives',
      `%%{init: {"theme": "dark"}}%%
%%{config: {"flowchart": {"htmlLabels": true}}}%%
flowchart TD
    A[Start] --> B[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with complex directive JSON',
      `%%{init: {"theme": "dark", "flowchart": {"htmlLabels": true, "curve": "basis"}}}%%
flowchart TD
    A[Start] --> B[End]`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Sequence diagram directive tests
    createTestCase(
      'Sequence diagram with init directive',
      `%%{init: {"theme": "dark"}}%%
sequenceDiagram
    Alice->>Bob: Hello`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Sequence diagram with config directive',
      `%%{config: {"sequence": {"mirrorActors": true}}}%%
sequenceDiagram
    Alice->>Bob: Hello`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Sequence diagram with sequence-specific directive',
      `%%{sequence: {"mirrorActors": true}}%%
sequenceDiagram
    Alice->>Bob: Hello`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Sequence diagram with multiple directives',
      `%%{init: {"theme": "dark"}}%%
%%{config: {"sequence": {"mirrorActors": true}}}%%
sequenceDiagram
    Alice->>Bob: Hello`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    // Class diagram directive tests
    createTestCase(
      'Class diagram with init directive',
      `%%{init: {"theme": "dark"}}%%
classDiagram
    class Animal {
        +String name
        +makeSound()
    }`,
      true,
      { expectedDiagramType: 'class' }
    ),

    createTestCase(
      'Class diagram with config directive',
      `%%{config: {"class": {"diagramMarginX": 50}}}%%
classDiagram
    class Animal {
        +String name
        +makeSound()
    }`,
      true,
      { expectedDiagramType: 'class' }
    ),

    // State diagram directive tests
    createTestCase(
      'State diagram with init directive',
      `%%{init: {"theme": "dark"}}%%
stateDiagram-v2
    [*] --> Still
    Still --> [*]`,
      true,
      { expectedDiagramType: 'state' }
    ),

    createTestCase(
      'State diagram with config directive',
      `%%{config: {"state": {"diagramMarginX": 50}}}%%
stateDiagram-v2
    [*] --> Still
    Still --> [*]`,
      true,
      { expectedDiagramType: 'state' }
    ),

    // XY chart directive tests
    createTestCase(
      'XY chart with init directive',
      `%%{init: {"theme": "dark"}}%%
xychart-beta
    title "Sales Revenue"
    x-axis ["Jan", "Feb", "Mar", "Apr", "May"]
    y-axis "Revenue" 0 --> 1000
    bar [500, 600, 750, 800, 950]`,
      true,
      { expectedDiagramType: 'xychart' }
    ),

    createTestCase(
      'XY chart with config directive',
      `%%{config: {"xychart": {"width": 1000}}}%%
xychart-beta
    title "Sales Revenue"
    x-axis ["Jan", "Feb", "Mar", "Apr", "May"]
    y-axis "Revenue" 0 --> 1000
    bar [500, 600, 750, 800, 950]`,
      true,
      { expectedDiagramType: 'xychart' }
    ),

    // Pie chart directive tests
    createTestCase(
      'Pie chart with init directive',
      `%%{init: {"theme": "dark"}}%%
pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,
      true,
      { expectedDiagramType: 'pie' }
    ),

    createTestCase(
      'Pie chart with config directive',
      `%%{config: {"pie": {"textPosition": 0.5}}}%%
pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,
      true,
      { expectedDiagramType: 'pie' }
    ),

    // Journey diagram directive tests
    createTestCase(
      'Journey diagram with init directive',
      `%%{init: {"theme": "dark"}}%%
journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat`,
      true,
      { expectedDiagramType: 'journey' }
    ),

    createTestCase(
      'Journey diagram with config directive',
      `%%{config: {"journey": {"diagramMarginX": 50}}}%%
journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat`,
      true,
      { expectedDiagramType: 'journey' }
    ),

    // Edge cases and error handling
    createTestCase(
      'Directive with malformed JSON (should still parse)',
      `%%{init: {"theme": "dark", "invalid": }}%%
flowchart TD
    A --> B`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Multiple directives with different types',
      `%%{init: {"theme": "dark"}}%%
%%{config: {"flowchart": {"htmlLabels": true}}}%%
%%{wrap}%%
flowchart TD
    A --> B`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Directive with nested braces',
      `%%{init: {"theme": "dark", "flowchart": {"htmlLabels": true, "curve": "basis"}}}%%
flowchart TD
    A --> B`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Directive with multi-line JSON',
      `%%{init: {
    "theme": "dark",
    "flowchart": {
        "htmlLabels": true,
        "curve": "basis"
    }
}}%%
flowchart TD
    A --> B`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // classDef directive compatibility tests
    createTestCase(
      'Flowchart with classDef colon syntax (should pass)',
      `flowchart LR
    A[Node A]:::classA
    B[Node B]:::classB
    A --> B
    
    classDef classA fill:#f9f,stroke:#333,stroke-width:2px
    classDef classB fill:#bbf,stroke:#333,stroke-width:2px`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Flowchart with classDef equals syntax (should fail)',
      `flowchart LR
    A[Node A]:::classA
    B[Node B]:::classB
    A --> B
    
    classDef classA fill=lightblue,stroke=#333,stroke-width=2px
    classDef classB fill=pink,stroke=#333,stroke-width=2px`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithCode: 'UNSUPPORTED_CLASSDEF_EQUALS_SYNTAX'
      }
    ),

    createTestCase(
      'Flowchart with mixed classDef syntax (should fail)',
      `flowchart TD
    J["Jason L"]:::jason
    L["Luna (playful)"]:::luna
    D["Ember the Dragon"]:::dragon
    
    J --> L
    L --> D
    
    classDef jason fill:#f9f,stroke:#333,stroke-width:1px
    classDef luna fill=pink,stroke:#333,stroke-width:1px
    classDef dragon fill:#bbf,stroke:#333,stroke-width:1px`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithCode: 'UNSUPPORTED_CLASSDEF_EQUALS_SYNTAX'
      }
    ),

    createTestCase(
      'Flowchart with out-of-bounds linkStyle (should fail)',
      `flowchart TD
    A["Node A"]
    B["Node B"]
    C["Node C"]
    spacer[" "]
    
    A --> B
    B --> C
    spacer --> A
    
    linkStyle 5 stroke-opacity:0
    linkStyle 6 stroke-opacity:0`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithCode: 'INVALID_LINKSTYLE_INDEX'
      }
    ),

    createTestCase(
      'Directive with unmatched "end" keyword',
      `%%{init: {"theme": "dark"}}%%
flowchart TD
    A[Start] --> B[End]
    end`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithCode: 'UNMATCHED_END'
      }
    ),

    createTestCase(
      'Flowchart with subgraph and unmatched "end" keyword at top level',
      `flowchart TD
    A[Node A]
    subgraph SG["Subgraph"]
        B[Node B]
    end
    A --> B
    end`,
      false,
      { 
        expectedDiagramType: 'flowchart',
        hasErrorWithCode: 'UNMATCHED_END'
      }
    )
  ]
);

// Run the tests
export function runDirectiveCompatibilityTests(): void {
  console.log(`\n🧪 Running ${directiveCompatibilityTests.name}`);
  console.log(`📝 ${directiveCompatibilityTests.description}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of directiveCompatibilityTests.testCases) {
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
  
  console.log(`\n📊 Directive Compatibility Tests Results: ${passed} passed, ${failed} failed`);
}
