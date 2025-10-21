/**
 * Comprehensive sequence diagram validation tests
 * Based on mermaid.js test patterns and real-world usage
 */

import { validateMermaid } from '../index.js';
import { createTestSuite, createTestCase, assertValidationResult } from './setup.js';

export const sequenceTests = createTestSuite(
  'Sequence Diagram Tests',
  'Tests for sequence diagram validation including participants, messages, and arrows',
  [
    // Basic valid sequence diagrams
    createTestCase(
      'Simple sequence diagram',
      `sequenceDiagram
        Alice->>Bob: Hello Bob, how are you?
        Bob-->>Alice: Great!
        Alice-)Bob: See you later!`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Sequence with participants',
      `sequenceDiagram
        participant Alice
        participant Bob
        Alice->>Bob: Hello Bob, how are you?
        Bob-->>Alice: Great!`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Sequence with participant aliases',
      `sequenceDiagram
        participant A as Alice
        participant B as Bob
        A->>B: Hello Bob, how are you?
        B-->>A: Great!`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Sequence with mixed participant declarations',
      `sequenceDiagram
        participant Alice
        participant B as Bob
        participant Charlie
        Alice->>B: Hello Bob
        B->>Charlie: Hi Charlie
        Charlie-->>Alice: Hello Alice`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    // Different arrow types
    createTestCase(
      'All arrow types',
      `sequenceDiagram
        participant A
        participant B
        A->>B: Solid arrow
        A-->>B: Dotted arrow
        A-)B: Solid with cross
        A--)B: Dotted with cross`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Messages with quotes',
      `sequenceDiagram
        participant A
        participant B
        A->>B: "Hello there!"
        B-->>A: "How are you?"`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Messages with multi-word text',
      `sequenceDiagram
        participant A
        participant B
        A->>B: Hello there how are you
        B-->>A: I am doing great today`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    // Complex sequence diagrams
    createTestCase(
      'Complex sequence with loops and conditions',
      `sequenceDiagram
        participant User
        participant System
        participant Database
        
        User->>System: Login request
        System->>Database: Check credentials
        Database-->>System: Credentials valid
        System-->>User: Login successful
        
        User->>System: Request data
        System->>Database: Query data
        Database-->>System: Return data
        System-->>User: Display data`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Sequence with multiple participants',
      `sequenceDiagram
        participant Client
        participant API
        participant Auth
        participant Database
        participant Cache
        
        Client->>API: Request
        API->>Auth: Validate token
        Auth-->>API: Token valid
        API->>Cache: Check cache
        Cache-->>API: Cache miss
        API->>Database: Query data
        Database-->>API: Return data
        API-->>Client: Response`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    // Error cases
    createTestCase(
      'Empty sequence diagram',
      `sequenceDiagram`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Message without participant declaration',
      `sequenceDiagram
        Alice->>Bob: Hello Bob, how are you?`,
      true,
      { 
        expectedDiagramType: 'sequence',
        description: 'Participants can be implicitly defined in Mermaid'
      }
    ),

    createTestCase(
      'Mixed declared and undeclared participants',
      `sequenceDiagram
        participant Alice
        Alice->>Bob: Hello Bob, how are you?
        Bob-->>Charlie: Hi Charlie`,
      true,
      { 
        expectedDiagramType: 'sequence',
        description: 'Mixing explicit and implicit participant declarations is valid in Mermaid'
      }
    ),

    createTestCase(
      'Message to undeclared participant',
      `sequenceDiagram
        participant Alice
        Alice->>Bob: Hello Bob, how are you?`,
      true,
      { 
        expectedDiagramType: 'sequence',
        description: 'Participants can be implicitly defined when first used'
      }
    ),

    createTestCase(
      'Message from undeclared participant',
      `sequenceDiagram
        participant Bob
        Alice->>Bob: Hello Bob, how are you?`,
      true,
      { 
        expectedDiagramType: 'sequence',
        description: 'Participants can be implicitly defined when first used'
      }
    ),

    // Edge cases
    createTestCase(
      'Single participant',
      `sequenceDiagram
        participant Alice
        Alice->>Alice: Self message`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Participants only, no messages',
      `sequenceDiagram
        participant Alice
        participant Bob
        participant Charlie`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Long participant names',
      `sequenceDiagram
        participant VeryLongParticipantName
        participant AnotherVeryLongParticipantName
        VeryLongParticipantName->>AnotherVeryLongParticipantName: Message`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Special characters in participant names',
      `sequenceDiagram
        participant "Alice & Bob"
        participant "Charlie-David"
        "Alice & Bob"->>"Charlie-David": Hello`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Numbers in participant names',
      `sequenceDiagram
        participant User1
        participant User2
        User1->>User2: Message`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Empty message',
      `sequenceDiagram
        participant A
        participant B
        A->>B:`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Message with special characters',
      `sequenceDiagram
        participant A
        participant B
        A->>B: Message with @#$%^&*()`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Very long message',
      `sequenceDiagram
        participant A
        participant B
        A->>B: This is a very long message that contains multiple words and should still be valid in the sequence diagram`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Multiple messages between same participants',
      `sequenceDiagram
        participant A
        participant B
        A->>B: First message
        A->>B: Second message
        A->>B: Third message
        B-->>A: Response 1
        B-->>A: Response 2`,
      true,
      { expectedDiagramType: 'sequence' }
    )
  ]
);
export function runSequenceTests(): void {
  console.log(`\n🧪 Running ${sequenceTests.name}`);
  console.log(`📝 ${sequenceTests.description}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of sequenceTests.testCases) {
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
  
  console.log(`\n📊 Sequence Tests Results: ${passed} passed, ${failed} failed`);
}
