/**
 * Comprehensive Edge Cases and Error Condition Tests
 * 
 * Tests edge cases, boundary conditions, and error scenarios
 * to ensure 100% compatibility with Mermaid CLI.
 */

export const edgeCasesTests = [
  // INPUT VALIDATION
  {
    name: 'Empty input',
    code: '',
    expectedValid: false,
    category: 'edge-input'
  },
  {
    name: 'Whitespace only',
    code: '   \n\t  ',
    expectedValid: false,
    category: 'edge-input'
  },
  {
    name: 'Only newlines',
    code: '\n\n\n',
    expectedValid: false,
    category: 'edge-input'
  },
  {
    name: 'Single character',
    code: 'a',
    expectedValid: false,
    category: 'edge-input'
  },
  {
    name: 'Unknown diagram type',
    code: `unknownDiagram
  some content`,
    expectedValid: false,
    category: 'edge-input'
  },
  {
    name: 'Incomplete diagram declaration',
    code: `flowchart`,
    expectedValid: true, // Empty flowchart is valid
    category: 'edge-input'
  },
  {
    name: 'Incomplete sequence declaration',
    code: `sequence`,
    expectedValid: false,
    category: 'edge-input'
  },

  // DIRECTIVES
  {
    name: 'Flowchart with init directive',
    code: `%%{init: {'theme':'base'}}%%
flowchart TD
  A --> B`,
    expectedValid: true,
    category: 'edge-directives'
  },
  {
    name: 'Flowchart with config directive',
    code: `%%{config: {'theme':'base'}}%%
flowchart TD
  A --> B`,
    expectedValid: true,
    category: 'edge-directives'
  },
  {
    name: 'Flowchart with multiple directives',
    code: `%%{init: {'theme':'base'}}%%
%%{config: {'theme':'base'}}%%
flowchart TD
  A --> B`,
    expectedValid: true,
    category: 'edge-directives'
  },
  {
    name: 'Directive with malformed JSON',
    code: `%%{init: {'theme':'base'}%%
flowchart TD
  A --> B`,
    expectedValid: true, // Mermaid CLI is lenient with malformed directives
    category: 'edge-directives'
  },
  {
    name: 'Directive with nested braces',
    code: `%%{init: {'theme':{'base':'dark'}}}%%
flowchart TD
  A --> B`,
    expectedValid: true,
    category: 'edge-directives'
  },

  // COMMENTS
  {
    name: 'Flowchart with standalone comment',
    code: `flowchart TD
  %% This is a comment
  A --> B`,
    expectedValid: true,
    category: 'edge-comments'
  },
  {
    name: 'Flowchart with inline comment (invalid)',
    code: `flowchart TD
  A --> B %% inline comment`,
    expectedValid: false,
    category: 'edge-comments'
  },
  {
    name: 'Flowchart with multiple comments',
    code: `flowchart TD
  %% Comment 1
  A --> B
  %% Comment 2
  B --> C`,
    expectedValid: true,
    category: 'edge-comments'
  },
  {
    name: 'Flowchart with only comments',
    code: `flowchart TD
  %% Comment 1
  %% Comment 2`,
    expectedValid: true,
    category: 'edge-comments'
  },

  // UNICODE AND SPECIAL CHARACTERS
  {
    name: 'Flowchart with unicode in labels',
    code: `flowchart TD
  A["🚀 Start"] --> B["✅ End"]`,
    expectedValid: true,
    category: 'edge-unicode'
  },
  {
    name: 'Flowchart with emojis in node IDs',
    code: `flowchart TD
  🚀 --> ✅`,
    expectedValid: false, // Mermaid CLI rejects emojis in node IDs - updated to match CLI behavior
    category: 'edge-unicode'
  },
  {
    name: 'Flowchart with special characters in IDs',
    code: `flowchart TD
  A1 --> B2
  A_1 --> B_2`,
    expectedValid: true,
    category: 'edge-special-chars'
  },
  {
    name: 'Flowchart with HTML entities',
    code: `flowchart TD
  A["&lt;Start&gt;"] --> B["&amp;End"]`,
    expectedValid: true,
    category: 'edge-special-chars'
  },

  // MIXED DIAGRAMS
  {
    name: 'Flowchart followed by sequence',
    code: `flowchart TD
  A --> B
  sequenceDiagram
  Alice --> Bob`,
    expectedValid: true,
    category: 'edge-mixed'
  },
  {
    name: 'Sequence followed by flowchart',
    code: `sequenceDiagram
  Alice --> Bob
  flowchart TD
  A --> B`,
    expectedValid: false, // Mermaid CLI rejects multiple diagram types - updated to match CLI behavior
    category: 'edge-mixed'
  },
  {
    name: 'Multiple flowcharts',
    code: `flowchart TD
  A --> B
  flowchart LR
  C --> D`,
    expectedValid: false, // Mermaid CLI rejects multiple diagram types - updated to match CLI behavior
    category: 'edge-mixed'
  },

  // CASE SENSITIVITY
  {
    name: 'Flowchart uppercase',
    code: `FLOWCHART TD
  A --> B`,
    expectedValid: false, // Mermaid CLI rejects uppercase diagram types - updated to match CLI behavior
    category: 'edge-case'
  },
  {
    name: 'Flowchart mixed case',
    code: `FlOwChArT TD
  A --> B`,
    expectedValid: false, // Mermaid CLI rejects mixed case diagram types - updated to match CLI behavior
    category: 'edge-case'
  },
  {
    name: 'Sequence diagram uppercase',
    code: `SEQUENCEDIAGRAM
  A --> B`,
    expectedValid: false, // Mermaid CLI rejects uppercase diagram types - updated to match CLI behavior
    category: 'edge-case'
  },
  {
    name: 'Graph keyword uppercase',
    code: `GRAPH TD
  A --> B`,
    expectedValid: false, // Mermaid CLI rejects uppercase diagram types - updated to match CLI behavior
    category: 'edge-case'
  },

  // WHITESPACE VARIATIONS
  {
    name: 'Flowchart with tabs',
    code: `flowchart TD
\tA --> B`,
    expectedValid: true,
    category: 'edge-whitespace'
  },
  {
    name: 'Flowchart with multiple spaces',
    code: `flowchart TD
    A    -->    B`,
    expectedValid: true,
    category: 'edge-whitespace'
  },
  {
    name: 'Flowchart with mixed line endings',
    code: `flowchart TD\r\n  A --> B\n  B --> C`,
    expectedValid: true,
    category: 'edge-whitespace'
  },
  {
    name: 'Flowchart with trailing whitespace',
    code: `flowchart TD  
  A --> B  `,
    expectedValid: true,
    category: 'edge-whitespace'
  },

  // BOUNDARY CONDITIONS
  {
    name: 'Flowchart with very long label',
    code: `flowchart TD
  A["${'A'.repeat(1000)}"] --> B`,
    expectedValid: true,
    category: 'edge-boundary'
  },
  {
    name: 'Flowchart with many nodes',
    code: `flowchart TD
  ${Array.from({length: 50}, (_, i) => `N${i} --> N${i+1}`).join('\n  ')}`,
    expectedValid: true,
    category: 'edge-boundary'
  },
  {
    name: 'Flowchart with many arrows',
    code: `flowchart TD
  A --> B --> C --> D --> E --> F --> G --> H --> I --> J`,
    expectedValid: true,
    category: 'edge-boundary'
  },
  {
    name: 'Sequence with many participants',
    code: `sequenceDiagram
  ${Array.from({length: 20}, (_, i) => `participant P${i}`).join('\n  ')}
  P0 --> P1`,
    expectedValid: false, // Mermaid CLI rejects flowchart arrows (-->) in sequence diagrams - updated to match CLI behavior
    category: 'edge-boundary'
  },

  // SYNTAX ERRORS
  {
    name: 'Flowchart with unclosed bracket',
    code: `flowchart TD
  A[Start --> B[End]`,
    expectedValid: false,
    category: 'edge-syntax-error'
  },
  {
    name: 'Flowchart with unclosed parenthesis',
    code: `flowchart TD
  A(Start --> B(End)`,
    expectedValid: false,
    category: 'edge-syntax-error'
  },
  {
    name: 'Flowchart with unclosed brace',
    code: `flowchart TD
  A{Start --> B{End}`,
    expectedValid: false,
    category: 'edge-syntax-error'
  },
  {
    name: 'Flowchart with malformed arrow',
    code: `flowchart TD
  A - B`,
    expectedValid: false,
    category: 'edge-syntax-error'
  },
  {
    name: 'Flowchart with incomplete arrow',
    code: `flowchart TD
  A -->`,
    expectedValid: false,
    category: 'edge-syntax-error'
  },
  {
    name: 'Sequence with incomplete message',
    code: `sequenceDiagram
  A -->`,
    expectedValid: false,
    category: 'edge-syntax-error'
  },
  {
    name: 'Sequence with malformed participant',
    code: `sequenceDiagram
  participant`,
    expectedValid: false,
    category: 'edge-syntax-error'
  },
  {
    name: 'Class diagram with unclosed class',
    code: `classDiagram
  class Animal {
    +String name`,
    expectedValid: false,
    category: 'edge-syntax-error'
  },
  {
    name: 'State diagram with unclosed state',
    code: `stateDiagram-v2
  [*] --> State1
  State1 -->`,
    expectedValid: false,
    category: 'edge-syntax-error'
  },

  // INVALID COMBINATIONS
  {
    name: 'Flowchart with sequence arrow',
    code: `flowchart TD
  A ->> B`,
    expectedValid: false,
    category: 'edge-invalid-combo'
  },
  {
    name: 'Sequence with flowchart arrow',
    code: `sequenceDiagram
  A --> B`,
    expectedValid: false, // Mermaid CLI rejects flowchart arrows in sequence diagrams
    category: 'edge-invalid-combo'
  },
  {
    name: 'Flowchart with classDef equals syntax (invalid)',
    code: `flowchart TD
  A --> B
  classDef startNode = fill:#f9f`,
    expectedValid: false,
    category: 'edge-invalid-combo'
  },
  {
    name: 'Flowchart with invalid linkStyle index',
    code: `flowchart TD
  A --> B
  linkStyle 10 stroke:#ff0000`,
    expectedValid: false,
    category: 'edge-invalid-combo'
  },
  {
    name: 'Flowchart with negative linkStyle index',
    code: `flowchart TD
  A --> B
  linkStyle -1 stroke:#ff0000`,
    expectedValid: false,
    category: 'edge-invalid-combo'
  },

  // EMPTY AND MINIMAL CASES
  {
    name: 'Minimal valid flowchart',
    code: `flowchart TD
A-->B`,
    expectedValid: true,
    category: 'edge-minimal'
  },
  {
    name: 'Minimal valid sequence',
    code: `sequenceDiagram
A->>B:`,
    expectedValid: true,
    category: 'edge-minimal'
  },
  {
    name: 'Flowchart with single node',
    code: `flowchart TD
  A`,
    expectedValid: true,
    category: 'edge-minimal'
  },
  {
    name: 'Sequence with single participant',
    code: `sequenceDiagram
  participant A`,
    expectedValid: true,
    category: 'edge-minimal'
  }
];

