/**
 * Tests for other diagram types (class, state, charts, etc.)
 * Based on mermaid.js test patterns and real-world usage
 */

import { validateMermaid } from '../index.js';
import { createTestSuite, createTestCase, assertValidationResult } from './setup.js';

export const otherDiagramTests = createTestSuite(
  'Other Diagram Types Tests',
  'Tests for class diagrams, state diagrams, charts, and other diagram types',
  [
    // Class diagrams
    createTestCase(
      'Basic class diagram',
      `classDiagram
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
      true,
      { expectedDiagramType: 'class' }
    ),

    createTestCase(
      'Empty class diagram',
      `classDiagram`,
      true,
      { expectedDiagramType: 'class' }
    ),

    // State diagrams
    createTestCase(
      'Basic state diagram',
      `stateDiagram-v2
        [*] --> Still
        Still --> [*]
        Still --> Moving
        Moving --> Still
        Moving --> Crash
        Crash --> [*]`,
      true,
      { expectedDiagramType: 'state' }
    ),

    createTestCase(
      'State diagram v1',
      `stateDiagram
        [*] --> Still
        Still --> [*]
        Still --> Moving`,
      true,
      { expectedDiagramType: 'state' }
    ),

    createTestCase(
      'Empty state diagram',
      `stateDiagram-v2`,
      true,
      { expectedDiagramType: 'state' }
    ),

    // Pie charts
    createTestCase(
      'Basic pie chart',
      `pie title Pets adopted by volunteers
        "Dogs" : 386
        "Cats" : 85
        "Rats" : 15`,
      true,
      { expectedDiagramType: 'pie' }
    ),

    createTestCase(
      'Empty pie chart',
      `pie`,
      true,
      { expectedDiagramType: 'pie' }
    ),

    // XY Charts
    createTestCase(
      'Basic XY chart',
      `xychart-beta
        title "Sales Revenue"
        x-axis [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
        y-axis "Revenue (in $)" 0 --> 1000
        bar [500, 600, 750, 800, 950, 1050, 1100, 1000, 900, 850, 700, 600]`,
      true,
      { expectedDiagramType: 'xychart' }
    ),

    createTestCase(
      'XY chart with line',
      `xychart-beta
        title "Website Traffic"
        x-axis [Jan, Feb, Mar, Apr, May, Jun]
        y-axis "Visitors" 0 --> 1000
        line [100, 200, 300, 400, 500, 600]`,
      true,
      { expectedDiagramType: 'xychart' }
    ),

    createTestCase(
      'XY chart with multiple series',
      `xychart-beta
        title "Sales vs Marketing"
        x-axis [Q1, Q2, Q3, Q4]
        y-axis "Budget (in $)" 0 --> 10000
        bar [5000, 6000, 7000, 8000]
        line [3000, 4000, 5000, 6000]`,
      true,
      { expectedDiagramType: 'xychart' }
    ),

    createTestCase(
      'Empty XY chart',
      `xychart-beta`,
      false,
      { 
        expectedDiagramType: 'xychart',
        hasErrorWithCode: 'MISSING_DATA'
      }
    ),

    // XY chart edge cases (unsupported chart types)
    createTestCase(
      'XY chart with area (unsupported)',
      `xychart-beta
  title "Sales Revenue"
  x-axis [jan, feb, mar, apr, may, jun]
  y-axis "Revenue (in $)" 4000 --> 11000
  area [5000, 6000, 7500, 8200, 9500, 10500]`,
      false,
      { 
        expectedDiagramType: 'xychart',
        hasErrorWithCode: 'UNSUPPORTED_CHART_TYPE'
      }
    ),

    createTestCase(
      'XY chart with scatter (unsupported)',
      `xychart-beta
  title "Performance Metrics"
  x-axis [1, 2, 3, 4, 5]
  y-axis "Score" 0 --> 100
  scatter [85, 92, 78, 96, 88]`,
      false,
      { 
        expectedDiagramType: 'xychart',
        hasErrorWithCode: 'UNSUPPORTED_CHART_TYPE'
      }
    ),

    // Journey diagrams
    createTestCase(
      'Basic journey diagram',
      `journey
        title My working day
        section Go to work
          Make tea: 5: Me
          Go upstairs: 3: Me
          Do work: 1: Me, Cat
        section Go home
          Go downstairs: 5: Me
          Sit down: 5: Me`,
      true,
      { expectedDiagramType: 'journey' }
    ),

    createTestCase(
      'Empty journey diagram',
      `journey`,
      true,
      { expectedDiagramType: 'journey' }
    ),

    // Gitgraph diagrams
    createTestCase(
      'Basic gitgraph',
      `gitgraph
        commit
        branch develop
        commit
        branch feature
        commit
        commit
        checkout develop
        commit
        checkout main
        merge develop`,
      true,
      { expectedDiagramType: 'gitgraph' }
    ),

    createTestCase(
      'Empty gitgraph',
      `gitgraph`,
      true,
      { expectedDiagramType: 'gitgraph' }
    ),

    // Mindmap diagrams
    createTestCase(
      'Basic mindmap',
      `mindmap
        root((mindmap))
          Origins
            Long history
            ::icon(fa fa-book)
            Popularisation
              British popular psychology author Tony Buzan
              Rethinking using visual diagrams
            ::icon(fa fa-book)
          Research
            On effectiveness<br/>and features
            On Automatic creation
              Uses
                Creative techniques
                Strategic planning
                Argument mapping`,
      true,
      { expectedDiagramType: 'mindmap' }
    ),

    createTestCase(
      'Empty mindmap',
      `mindmap`,
      true,
      { expectedDiagramType: 'mindmap' }
    ),

    // Timeline diagrams
    createTestCase(
      'Basic timeline',
      `timeline
        title History of Social Media Platform
        2002 : LinkedIn
        2004 : Facebook
             : Google
        2005 : Youtube
        2006 : Twitter`,
      true,
      { expectedDiagramType: 'timeline' }
    ),

    createTestCase(
      'Empty timeline',
      `timeline`,
      true,
      { expectedDiagramType: 'timeline' }
    ),

    // Gantt charts
    createTestCase(
      'Basic gantt chart',
      `gantt
        title A Gantt Diagram
        dateFormat  YYYY-MM-DD
        section Section
        A task           :a1, 2014-01-01, 30d
        Another task     :after a1  , 20d`,
      true,
      { expectedDiagramType: 'gantt' }
    ),

    createTestCase(
      'Empty gantt chart',
      `gantt`,
      true,
      { expectedDiagramType: 'gantt' }
    ),

    // ER diagrams
    createTestCase(
      'Basic ER diagram',
      `erDiagram
        CUSTOMER ||--o{ ORDER : places
        ORDER ||--|{ LINE-ITEM : contains
        CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
      true,
      { expectedDiagramType: 'er' }
    ),

    createTestCase(
      'Empty ER diagram',
      `erDiagram`,
      true,
      { expectedDiagramType: 'er' }
    ),

    // Block diagrams
    createTestCase(
      'Basic block diagram',
      `block-beta
  columns 3
  A["Block A"] B["Block B"] C["Block C"]
  D["Block D"] E["Block E"] F["Block F"]`,
      true,
      { expectedDiagramType: 'block' }
    ),

    createTestCase(
      'Block diagram without columns',
      `block-beta
  A["Block A"] B["Block B"] C["Block C"]`,
      true,
      { expectedDiagramType: 'block' }
    ),

    createTestCase(
      'Empty block diagram',
      `block-beta`,
      true,
      { expectedDiagramType: 'block' }
    ),

    // Error cases
    createTestCase(
      'Unknown diagram type',
      `unknownDiagram
        some content`,
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithMessage: 'Unsupported diagram type'
      }
    ),

    // Unsupported diagram types (not supported by Mermaid CLI)
    createTestCase(
      'Requirement diagram (unsupported)',
      `req
  title Requirements
  requirement "Functional Requirements" {
    req1: "User Authentication"
    req2: "Data Validation"
  }`,
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithMessage: 'Unsupported diagram type'
      }
    ),

    createTestCase(
      'C4 Context diagram (unsupported)',
      `c4Context
  title System Context diagram for Internet Banking System
  Person(customer, "Banking Customer", "A customer of the bank, with personal bank accounts.")
  System(banking_system, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")
  Rel(customer, banking_system, "Uses")`,
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithMessage: 'Unsupported diagram type'
      }
    ),

    createTestCase(
      'Empty input',
      ``,
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithCode: 'EMPTY_INPUT'
      }
    ),

    createTestCase(
      'Whitespace only input',
      `   \n  \t  `,
      false,
      { 
        expectedDiagramType: 'unknown',
        hasErrorWithCode: 'EMPTY_INPUT'
      }
    )
  ]
);

// Run the tests
export function runOtherDiagramTests(): void {
  console.log(`\n🧪 Running ${otherDiagramTests.name}`);
  console.log(`📝 ${otherDiagramTests.description}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of otherDiagramTests.testCases) {
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
  
  console.log(`\n📊 Other Diagram Tests Results: ${passed} passed, ${failed} failed`);
}
