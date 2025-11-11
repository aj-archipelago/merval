/**
 * Comprehensive Flowchart Test Cases
 * 
 * Tests all flowchart syntax variations, edge cases, and error conditions
 * to ensure 100% compatibility with Mermaid CLI.
 */

export const flowchartTests = [
  // BASIC VALID CASES
  {
    name: 'Simple flowchart TD',
    code: `flowchart TD
  A --> B`,
    expectedValid: true,
    category: 'flowchart-basic'
  },
  {
    name: 'Simple flowchart LR',
    code: `flowchart LR
  A --> B`,
    expectedValid: true,
    category: 'flowchart-basic'
  },
  {
    name: 'Simple flowchart BT',
    code: `flowchart BT
  A --> B`,
    expectedValid: true,
    category: 'flowchart-basic'
  },
  {
    name: 'Simple flowchart RL',
    code: `flowchart RL
  A --> B`,
    expectedValid: true,
    category: 'flowchart-basic'
  },
  {
    name: 'Flowchart with graph keyword',
    code: `graph TD
  A --> B`,
    expectedValid: true,
    category: 'flowchart-basic'
  },
  {
    name: 'Empty flowchart',
    code: `flowchart TD`,
    expectedValid: true,
    category: 'flowchart-basic'
  },

  // NODE SHAPES
  {
    name: 'Flowchart with rectangular nodes',
    code: `flowchart TD
  A[Rect] --> B[Rect]`,
    expectedValid: true,
    category: 'flowchart-nodes'
  },
  {
    name: 'Flowchart with round nodes',
    code: `flowchart TD
  A(Round) --> B(Round)`,
    expectedValid: true,
    category: 'flowchart-nodes'
  },
  {
    name: 'Flowchart with diamond nodes',
    code: `flowchart TD
  A{Diamond} --> B{Diamond}`,
    expectedValid: true,
    category: 'flowchart-nodes'
  },
  {
    name: 'Flowchart with double-circle nodes',
    code: `flowchart TD
  A((Double)) --> B((Double))`,
    expectedValid: true,
    category: 'flowchart-nodes'
  },
  {
    name: 'Flowchart with mixed node shapes',
    code: `flowchart TD
  A[Rect] --> B(Round)
  B --> C{Diamond}
  C --> D((Double))`,
    expectedValid: true,
    category: 'flowchart-nodes'
  },
  {
    name: 'Flowchart with empty node labels',
    code: `flowchart TD
  A[] --> B[]`,
    expectedValid: false, // Mermaid CLI rejects empty labels
    category: 'flowchart-nodes'
  },
  {
    name: 'Flowchart with quoted labels',
    code: `flowchart TD
  A["Label with spaces"] --> B["Another label"]`,
    expectedValid: true,
    category: 'flowchart-nodes'
  },
  {
    name: 'Flowchart with special characters in labels',
    code: `flowchart TD
  A["Label & with <special> chars"] --> B["More: chars"]`,
    expectedValid: true,
    category: 'flowchart-nodes'
  },

  // ARROWS
  {
    name: 'Flowchart with arrow labels',
    code: `flowchart TD
  A -->|Label| B`,
    expectedValid: true,
    category: 'flowchart-arrows'
  },
  {
    name: 'Flowchart with quoted arrow labels',
    code: `flowchart TD
  A -->|"Label with spaces"| B`,
    expectedValid: true,
    category: 'flowchart-arrows'
  },
  {
    name: 'Flowchart with dotted arrow',
    code: `flowchart TD
  A -.-> B`,
    expectedValid: true,
    category: 'flowchart-arrows'
  },
  {
    name: 'Flowchart with dotted arrow and label',
    code: `flowchart TD
  A -.->|Label| B`,
    expectedValid: true,
    category: 'flowchart-arrows'
  },
  {
    name: 'Flowchart with thick arrow',
    code: `flowchart TD
  A ==> B`,
    expectedValid: true,
    category: 'flowchart-arrows'
  },
  {
    name: 'Flowchart with thick arrow and label',
    code: `flowchart TD
  A ==>|Label| B`,
    expectedValid: true,
    category: 'flowchart-arrows'
  },
  {
    name: 'Flowchart with bidirectional arrow',
    code: `flowchart TD
  A <--> B`,
    expectedValid: true, // Mermaid CLI accepts this, but our validator needs to support it
    category: 'flowchart-arrows'
  },
  {
    name: 'Flowchart with multiple arrows from same node',
    code: `flowchart TD
  A --> B
  A --> C
  A --> D`,
    expectedValid: true,
    category: 'flowchart-arrows'
  },
  {
    name: 'Flowchart with self-referencing node',
    code: `flowchart TD
  A --> A`,
    expectedValid: true,
    category: 'flowchart-arrows'
  },

  // SUBGRAPHS
  {
    name: 'Flowchart with subgraph',
    code: `flowchart TD
  A --> B
  subgraph Sub
    C --> D
  end`,
    expectedValid: true,
    category: 'flowchart-subgraphs'
  },
  {
    name: 'Flowchart with nested subgraphs',
    code: `flowchart TD
  A --> B
  subgraph Sub1
    C --> D
    subgraph Sub2
      E --> F
    end
  end`,
    expectedValid: true,
    category: 'flowchart-subgraphs'
  },
  {
    name: 'Flowchart with subgraph label',
    code: `flowchart TD
  subgraph "Subgraph Label"
    A --> B
  end`,
    expectedValid: true,
    category: 'flowchart-subgraphs'
  },
  {
    name: 'Flowchart with subgraph and external connections',
    code: `flowchart TD
  A --> B
  subgraph Sub
    C --> D
  end
  A --> C
  D --> B`,
    expectedValid: true,
    category: 'flowchart-subgraphs'
  },

  // STYLING
  {
    name: 'Flowchart with classDef',
    code: `flowchart TD
  A --> B
  classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
  class A startNode`,
    expectedValid: true,
    category: 'flowchart-styling'
  },
  {
    name: 'Flowchart with multiple classDef',
    code: `flowchart TD
  A --> B --> C
  classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
  classDef endNode fill:#9f9,stroke:#333,stroke-width:2px
  class A startNode
  class C endNode`,
    expectedValid: true,
    category: 'flowchart-styling'
  },
  {
    name: 'Flowchart with linkStyle',
    code: `flowchart TD
  A --> B
  linkStyle 0 stroke:#ff0000,stroke-width:2px`,
    expectedValid: true,
    category: 'flowchart-styling'
  },
  {
    name: 'Flowchart with multiple linkStyle',
    code: `flowchart TD
  A --> B --> C
  linkStyle 0 stroke:#ff0000,stroke-width:2px
  linkStyle 1 stroke:#00ff00,stroke-width:3px`,
    expectedValid: true,
    category: 'flowchart-styling'
  },
  {
    name: 'Flowchart with style directive',
    code: `flowchart TD
  A --> B
  style A fill:#f9f,stroke:#333,stroke-width:2px`,
    expectedValid: true,
    category: 'flowchart-styling'
  },
  {
    name: 'Flowchart with click handler',
    code: `flowchart TD
  A --> B
  click A "https://example.com"`,
    expectedValid: true,
    category: 'flowchart-styling'
  },
  {
    name: 'Flowchart with click handler and tooltip',
    code: `flowchart TD
  A --> B
  click A "https://example.com" "Tooltip"`,
    expectedValid: true,
    category: 'flowchart-styling'
  },
  {
    name: 'Flowchart with all styling',
    code: `flowchart TD
  A --> B --> C
  classDef startNode fill:#f9f,stroke:#333,stroke-width:2px
  class A startNode
  linkStyle 0 stroke:#ff0000,stroke-width:2px
  style B fill:#9f9,stroke:#333,stroke-width:2px
  click C "https://example.com"`,
    expectedValid: true,
    category: 'flowchart-styling'
  },

  // COMPLEX CASES
  {
    name: 'Flowchart with decision points',
    code: `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Process]
  B -->|No| D[End]
  C --> D`,
    expectedValid: true,
    category: 'flowchart-complex'
  },
  {
    name: 'Flowchart with multiple paths',
    code: `flowchart TD
  A --> B
  A --> C
  B --> D
  C --> D
  D --> E`,
    expectedValid: true,
    category: 'flowchart-complex'
  },
  {
    name: 'Flowchart with loops',
    code: `flowchart TD
  A --> B
  B --> C
  C -->|Loop| B
  C --> D`,
    expectedValid: true,
    category: 'flowchart-complex'
  },
  {
    name: 'Flowchart with many nodes',
    code: `flowchart TD
  A --> B --> C --> D --> E --> F --> G --> H --> I --> J`,
    expectedValid: true,
    category: 'flowchart-complex'
  },

  // INVALID CASES
  {
    name: 'Flowchart adjacent nodes without arrow',
    code: `flowchart TD
  A B`,
    expectedValid: false,
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart unclosed bracket',
    code: `flowchart TD
  A[Start --> B[End]`,
    expectedValid: false,
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart unclosed parenthesis',
    code: `flowchart TD
  A(Start --> B(End)`,
    expectedValid: false,
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart unclosed brace',
    code: `flowchart TD
  A{Start --> B{End}`,
    expectedValid: false,
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart unclosed double parentheses',
    code: `flowchart TD
  A((Start --> B((End))`,
    expectedValid: false,
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart invalid direction',
    code: `flowchart INVALID
  A --> B`,
    expectedValid: false, // Mermaid CLI rejects invalid directions
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart linkStyle out of bounds',
    code: `flowchart TD
  A --> B
  linkStyle 5 stroke:#ff0000`,
    expectedValid: false,
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart classDef without class assignment',
    code: `flowchart TD
  A --> B
  classDef startNode fill:#f9f`,
    expectedValid: true, // This is actually valid - classDef can exist without assignments
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart class assignment without classDef',
    code: `flowchart TD
  A --> B
  class A startNode`,
    expectedValid: true, // Actually Mermaid CLI accepts this (classDef might be optional)
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart standalone note (invalid)',
    code: `flowchart TD
  A --> B
  note for A: This is invalid`,
    expectedValid: false,
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart subgraph without end',
    code: `flowchart TD
  subgraph Sub
    A --> B`,
    expectedValid: false,
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart malformed arrow',
    code: `flowchart TD
  A - B`,
    expectedValid: false,
    category: 'flowchart-errors'
  },
  {
    name: 'Flowchart incomplete arrow label',
    code: `flowchart TD
  A -->| B`,
    expectedValid: false,
    category: 'flowchart-errors'
  }
];

