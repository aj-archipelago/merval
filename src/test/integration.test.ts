/**
 * Integration tests for complex scenarios
 * Tests that combine multiple features and real-world usage patterns
 */

import { validateMermaid } from '../index.js';
import { createTestSuite, createTestCase, assertValidationResult } from './setup.js';

export const integrationTests = createTestSuite(
  'Integration Tests',
  'Tests for complex scenarios combining multiple features',
  [
    // Real-world flowchart examples
    createTestCase(
      'Complete user authentication flow',
      `flowchart TD
        A[User Login] --> B{Valid Credentials?}
        B -->|Yes| C[Generate Token]
        B -->|No| D[Show Error]
        C --> E[Redirect to Dashboard]
        D --> F[Return to Login]
        F --> A
        
        classDef error fill:#ffcccc,stroke:#ff0000,stroke-width:2px
        classDef success fill:#ccffcc,stroke:#00ff00,stroke-width:2px
        classDef process fill:#cceeff,stroke:#0066cc,stroke-width:2px
        
        class A,F process
        class B,C,E success
        class D error`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'E-commerce checkout process',
      `flowchart TD
        A[Add to Cart] --> B[View Cart]
        B --> C{Items Available?}
        C -->|No| D[Show Out of Stock]
        C -->|Yes| E[Proceed to Checkout]
        E --> F[Enter Shipping Info]
        F --> G[Enter Payment Info]
        G --> H{Payment Valid?}
        H -->|No| I[Payment Error]
        H -->|Yes| J[Process Order]
        J --> K[Send Confirmation]
        K --> L[Order Complete]
        
        I --> G
        D --> A`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'API request flow with error handling',
      `flowchart TD
        A[Client Request] --> B[API Gateway]
        B --> C{Rate Limit OK?}
        C -->|No| D[Return 429]
        C -->|Yes| E[Validate Token]
        E --> F{Token Valid?}
        F -->|No| G[Return 401]
        F -->|Yes| H[Route to Service]
        H --> I[Process Request]
        I --> J{Success?}
        J -->|No| K[Return Error]
        J -->|Yes| L[Return Response]
        
        D --> M[Client]
        G --> M
        K --> M
        L --> M`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    // Real-world sequence diagram examples
    createTestCase(
      'Complete online payment sequence',
      `sequenceDiagram
        participant User
        participant WebApp
        participant PaymentGateway
        participant Bank
        participant Database
        
        User->>WebApp: Submit Payment Form
        WebApp->>Database: Validate User
        Database-->>WebApp: User Valid
        WebApp->>PaymentGateway: Process Payment
        PaymentGateway->>Bank: Authorize Transaction
        Bank-->>PaymentGateway: Authorization Code
        PaymentGateway-->>WebApp: Payment Success
        WebApp->>Database: Update Order Status
        Database-->>WebApp: Order Updated
        WebApp-->>User: Payment Confirmation
        
        Note over User,Database: Payment processed successfully`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    createTestCase(
      'Microservices communication flow',
      `sequenceDiagram
        participant Client
        participant API Gateway
        participant Auth Service
        participant User Service
        participant Notification Service
        participant Database
        
        Client->>API Gateway: Request User Data
        API Gateway->>Auth Service: Validate Token
        Auth Service-->>API Gateway: Token Valid
        API Gateway->>User Service: Get User Data
        User Service->>Database: Query User
        Database-->>User Service: User Data
        User Service-->>API Gateway: User Response
        API Gateway->>Notification Service: Log Access
        Notification Service-->>API Gateway: Logged
        API Gateway-->>Client: User Data`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    // Complex chart examples
    createTestCase(
      'Business metrics dashboard',
      `xychart-beta
        title "Monthly Business Metrics"
        x-axis [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
        y-axis "Revenue (in $)" 0 --> 50000
        bar [15000, 18000, 22000, 25000, 28000, 32000, 35000, 38000, 42000, 45000, 48000, 50000]
        line [12000, 15000, 18000, 20000, 22000, 25000, 27000, 29000, 32000, 35000, 37000, 40000]`,
      true,
      { expectedDiagramType: 'xychart' }
    ),

    createTestCase(
      'Customer journey mapping',
      `journey
        title Customer Journey
        section Discovery
          Visit Website: 5: Customer
          Browse Products: 4: Customer
          Read Reviews: 3: Customer
        section Consideration
          Compare Products: 4: Customer
          Check Prices: 5: Customer
          Add to Wishlist: 3: Customer
        section Purchase
          Add to Cart: 4: Customer
          Checkout: 3: Customer
          Complete Payment: 5: Customer
        section Post-Purchase
          Receive Confirmation: 5: Customer
          Track Shipment: 4: Customer
          Receive Product: 5: Customer
          Leave Review: 3: Customer`,
      true,
      { expectedDiagramType: 'journey' }
    ),

    // Mixed complexity scenarios
    createTestCase(
      'Flowchart with extensive styling',
      `flowchart TD
        A[Start] --> B{Decision}
        B -->|Yes| C[Process A]
        B -->|No| D[Process B]
        C --> E[End A]
        D --> F[End B]
        
        classDef startEnd fill:#e1f5fe,stroke:#01579b,stroke-width:3px,color:#000
        classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
        classDef process fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000
        classDef success fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#000
        classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
        
        class A startEnd
        class B decision
        class C,D process
        class E,F success`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Sequence with complex message patterns',
      `sequenceDiagram
        participant Frontend
        participant Backend
        participant Database
        participant Cache
        participant ExternalAPI
        
        Frontend->>Backend: User Login Request
        Backend->>Database: Validate Credentials
        Database-->>Backend: User Data
        Backend->>Cache: Store Session
        Cache-->>Backend: Session Stored
        Backend-->>Frontend: Login Success
        
        Frontend->>Backend: Request Protected Data
        Backend->>Cache: Check Session
        Cache-->>Backend: Session Valid
        Backend->>Database: Query Data
        Database-->>Backend: Data Retrieved
        Backend->>ExternalAPI: Enrich Data
        ExternalAPI-->>Backend: Enriched Data
        Backend-->>Frontend: Complete Response
        
        Note over Frontend,ExternalAPI: All systems operational`,
      true,
      { expectedDiagramType: 'sequence' }
    ),

    // Edge cases in complex scenarios
    createTestCase(
      'Flowchart with many decision points',
      `flowchart TD
        A[Start] --> B{First Decision}
        B -->|Option 1| C{Second Decision}
        B -->|Option 2| D{Third Decision}
        B -->|Option 3| E{Fourth Decision}
        C -->|Yes| F[Process 1A]
        C -->|No| G[Process 1B]
        D -->|Yes| H[Process 2A]
        D -->|No| I[Process 2B]
        E -->|Yes| J[Process 3A]
        E -->|No| K[Process 3B]
        F --> L[End]
        G --> L
        H --> L
        I --> L
        J --> L
        K --> L`,
      true,
      { expectedDiagramType: 'flowchart' }
    ),

    createTestCase(
      'Sequence with many participants',
      `sequenceDiagram
        participant A as Alice
        participant B as Bob
        participant C as Charlie
        participant D as David
        participant E as Eve
        participant F as Frank
        participant G as Grace
        participant H as Henry
        
        A->>B: Message 1
        B->>C: Message 2
        C->>D: Message 3
        D->>E: Message 4
        E->>F: Message 5
        F->>G: Message 6
        G->>H: Message 7
        H-->>A: Final Response`,
      true,
      { expectedDiagramType: 'sequence' }
    )
  ]
);

// Run the tests
export function runIntegrationTests(): void {
  console.log(`\n🧪 Running ${integrationTests.name}`);
  console.log(`📝 ${integrationTests.description}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of integrationTests.testCases) {
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
  
  console.log(`\n📊 Integration Tests Results: ${passed} passed, ${failed} failed`);
}
