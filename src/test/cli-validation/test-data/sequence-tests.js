/**
 * Comprehensive Sequence Diagram Test Cases
 * 
 * Tests all sequence diagram syntax variations, edge cases, and error conditions
 * to ensure 100% compatibility with Mermaid CLI.
 */

export const sequenceTests = [
  // BASIC VALID CASES
  {
    name: 'Empty sequence diagram',
    code: `sequenceDiagram`,
    expectedValid: true,
    category: 'sequence-basic'
  },
  {
    name: 'Sequence with implicit participants',
    code: `sequenceDiagram
  Alice->>Bob: Hello`,
    expectedValid: true,
    category: 'sequence-basic'
  },
  {
    name: 'Sequence with participant declaration',
    code: `sequenceDiagram
  participant Alice
  participant Bob
  Alice->>Bob: Hello`,
    expectedValid: true,
    category: 'sequence-basic'
  },
  {
    name: 'Sequence with participant aliases',
    code: `sequenceDiagram
  participant A as Alice
  participant B as Bob
  A->>B: Hello`,
    expectedValid: true,
    category: 'sequence-basic'
  },
  {
    name: 'Sequence with mixed declarations',
    code: `sequenceDiagram
  participant Alice
  participant Bob as B
  Alice->>Bob: Hello
  Bob->>Alice: Hi`,
    expectedValid: true,
    category: 'sequence-basic'
  },

  // ARROW TYPES
  {
    name: 'Sequence with solid arrow',
    code: `sequenceDiagram
  A->>B: Message`,
    expectedValid: true,
    category: 'sequence-arrows'
  },
  {
    name: 'Sequence with dotted arrow',
    code: `sequenceDiagram
  A-->>B: Message`,
    expectedValid: true,
    category: 'sequence-arrows'
  },
  {
    name: 'Sequence with solid arrow without arrowhead',
    code: `sequenceDiagram
  A->B: Message`,
    expectedValid: true,
    category: 'sequence-arrows'
  },
  {
    name: 'Sequence with dotted arrow without arrowhead',
    code: `sequenceDiagram
  A--B: Message`,
    expectedValid: false, // Mermaid CLI rejects this syntax
    category: 'sequence-arrows'
  },
  {
    name: 'Sequence with solid arrow with cross',
    code: `sequenceDiagram
  A-xB: Message`,
    expectedValid: true,
    category: 'sequence-arrows'
  },
  {
    name: 'Sequence with dotted arrow with cross',
    code: `sequenceDiagram
  A--xB: Message`,
    expectedValid: true,
    category: 'sequence-arrows'
  },
  {
    name: 'Sequence with all arrow types',
    code: `sequenceDiagram
  A->>B: Solid
  A-->>B: Dotted
  A->B: Solid no head
  A--B: Dotted no head
  A-xB: Cross
  A--xB: Dotted cross`,
    expectedValid: false, // Contains invalid A--B: pattern
    category: 'sequence-arrows'
  },

  // MESSAGES
  {
    name: 'Sequence with quoted message',
    code: `sequenceDiagram
  A->>B: "Hello World"`,
    expectedValid: true,
    category: 'sequence-messages'
  },
  {
    name: 'Sequence with multi-word message',
    code: `sequenceDiagram
  A->>B: Hello Bob, how are you?`,
    expectedValid: true,
    category: 'sequence-messages'
  },
  {
    name: 'Sequence with empty message',
    code: `sequenceDiagram
  A->>B:`,
    expectedValid: true,
    category: 'sequence-messages'
  },
  {
    name: 'Sequence with special characters in message',
    code: `sequenceDiagram
  A->>B: Hello & goodbye <test>`,
    expectedValid: true,
    category: 'sequence-messages'
  },
  {
    name: 'Sequence with unicode in message',
    code: `sequenceDiagram
  A->>B: Hello 🚀 World`,
    expectedValid: true,
    category: 'sequence-messages'
  },

  // PARTICIPANTS
  {
    name: 'Sequence with quoted participant names',
    code: `sequenceDiagram
  participant "Alice & Bob"
  participant "Charlie-David"
  "Alice & Bob"->>"Charlie-David": Hello`,
    expectedValid: true,
    category: 'sequence-participants'
  },
  {
    name: 'Sequence with unicode participants',
    code: `sequenceDiagram
  participant 🚀
  participant ✅
  🚀->>✅: Hello!`,
    expectedValid: true,
    category: 'sequence-participants'
  },
  {
    name: 'Sequence with numbers in participant names',
    code: `sequenceDiagram
  participant User1
  participant User2
  User1->>User2: Message`,
    expectedValid: true,
    category: 'sequence-participants'
  },
  {
    name: 'Sequence with underscores in participant names',
    code: `sequenceDiagram
  participant User_1
  participant User_2
  User_1->>User_2: Message`,
    expectedValid: true,
    category: 'sequence-participants'
  },

  // ACTIVATION
  {
    name: 'Sequence with activation',
    code: `sequenceDiagram
  A->>B: Message
  activate B
  B->>A: Response
  deactivate B`,
    expectedValid: true,
    category: 'sequence-activation'
  },
  {
    name: 'Sequence with multiple activations',
    code: `sequenceDiagram
  A->>B: Message1
  activate B
  B->>C: Message2
  activate C
  C->>B: Response2
  deactivate C
  B->>A: Response1
  deactivate B`,
    expectedValid: true,
    category: 'sequence-activation'
  },
  {
    name: 'Sequence with activation without deactivation',
    code: `sequenceDiagram
  A->>B: Message
  activate B`,
    expectedValid: true, // This is valid - deactivation is optional
    category: 'sequence-activation'
  },

  // NOTES
  {
    name: 'Sequence with note right',
    code: `sequenceDiagram
  A->>B: Message
  Note right of B: This is a note`,
    expectedValid: true,
    category: 'sequence-notes'
  },
  {
    name: 'Sequence with note left',
    code: `sequenceDiagram
  A->>B: Message
  Note left of A: This is a note`,
    expectedValid: true,
    category: 'sequence-notes'
  },
  {
    name: 'Sequence with note over',
    code: `sequenceDiagram
  A->>B: Message
  Note over A,B: This is a note`,
    expectedValid: true,
    category: 'sequence-notes'
  },
  {
    name: 'Sequence with note over multiple',
    code: `sequenceDiagram
  participant A
  participant B
  participant C
  A->>B: Message
  Note over A,C: This is a note`,
    expectedValid: true,
    category: 'sequence-notes'
  },

  // LOOPS AND CONDITIONS
  {
    name: 'Sequence with loop',
    code: `sequenceDiagram
  loop Loop label
    A->>B: Message
  end`,
    expectedValid: true,
    category: 'sequence-control'
  },
  {
    name: 'Sequence with alt',
    code: `sequenceDiagram
  alt Condition
    A->>B: Message1
  else Else condition
    A->>B: Message2
  end`,
    expectedValid: true,
    category: 'sequence-control'
  },
  {
    name: 'Sequence with opt',
    code: `sequenceDiagram
  opt Optional
    A->>B: Message
  end`,
    expectedValid: true,
    category: 'sequence-control'
  },
  {
    name: 'Sequence with par',
    code: `sequenceDiagram
  par Parallel
    A->>B: Message1
  and
    A->>C: Message2
  end`,
    expectedValid: true,
    category: 'sequence-control'
  },
  {
    name: 'Sequence with critical',
    code: `sequenceDiagram
  critical Critical section
    A->>B: Message
  end`,
    expectedValid: true,
    category: 'sequence-control'
  },
  {
    name: 'Sequence with break',
    code: `sequenceDiagram
  break Break condition
    A->>B: Message
  end`,
    expectedValid: true,
    category: 'sequence-control'
  },
  {
    name: 'Sequence with nested control structures',
    code: `sequenceDiagram
  loop Outer loop
    alt Condition
      A->>B: Message
    end
  end`,
    expectedValid: true,
    category: 'sequence-control'
  },

  // COMPLEX CASES
  {
    name: 'Sequence with many participants',
    code: `sequenceDiagram
  participant A
  participant B
  participant C
  participant D
  participant E
  A->>B: Message1
  B->>C: Message2
  C->>D: Message3
  D->>E: Message4`,
    expectedValid: true,
    category: 'sequence-complex'
  },
  {
    name: 'Sequence with complex flow',
    code: `sequenceDiagram
  participant A
  participant B
  participant C
  A->>B: Request
  activate B
  B->>C: Forward
  activate C
  C-->>B: Response
  deactivate C
  B-->>A: Reply
  deactivate B`,
    expectedValid: true,
    category: 'sequence-complex'
  },

  // INVALID CASES
  {
    name: 'Sequence incomplete message',
    code: `sequenceDiagram
  participant A
  participant B
  A -->`,
    expectedValid: false,
    category: 'sequence-errors'
  },
  {
    name: 'Sequence malformed participant',
    code: `sequenceDiagram
  participant`,
    expectedValid: false,
    category: 'sequence-errors'
  },
  {
    name: 'Sequence malformed arrow',
    code: `sequenceDiagram
  A - B`,
    expectedValid: false,
    category: 'sequence-errors'
  },
  {
    name: 'Sequence loop without end',
    code: `sequenceDiagram
  loop Label
    A->>B: Message`,
    expectedValid: false,
    category: 'sequence-errors'
  },
  {
    name: 'Sequence alt without end',
    code: `sequenceDiagram
  alt Condition
    A->>B: Message`,
    expectedValid: false,
    category: 'sequence-errors'
  },
  {
    name: 'Sequence activate without participant',
    code: `sequenceDiagram
  activate`,
    expectedValid: false,
    category: 'sequence-errors'
  },
  {
    name: 'Sequence note without of',
    code: `sequenceDiagram
  A->>B: Message
  Note A: Invalid`,
    expectedValid: false,
    category: 'sequence-errors'
  },
  {
    name: 'Sequence with classDef (invalid)',
    code: `sequenceDiagram
  participant A
  participant B
  A->>B: Hello
  classDef participant fill:#f9f`,
    expectedValid: false,
    category: 'sequence-errors'
  },
  {
    name: 'Sequence with linkStyle (invalid)',
    code: `sequenceDiagram
  A->>B: Message
  linkStyle 0 stroke:#ff0000`,
    expectedValid: false,
    category: 'sequence-errors'
  },
  {
    name: 'Sequence with double-parentheses in participant (invalid)',
    code: `sequenceDiagram
  participant A
  participant B((Invalid))
  A->>B: Hello`,
    expectedValid: true, // Mermaid CLI actually accepts this - updated to match CLI behavior
    category: 'sequence-errors'
  }
];

