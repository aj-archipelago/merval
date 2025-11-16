/**
 * Comprehensive Tests for Other Diagram Types
 * 
 * Tests class diagrams, state diagrams, charts, and other diagram types
 * to ensure 100% compatibility with Mermaid CLI.
 */

export const otherDiagramsTests = [
  // CLASS DIAGRAMS
  {
    name: 'Empty class diagram',
    code: `classDiagram`,
    expectedValid: false, // Mermaid CLI rejects empty class diagrams - updated to match CLI behavior
    category: 'class-basic'
  },
  {
    name: 'Class diagram with single class',
    code: `classDiagram
  class Animal {
    +String name
    +int age
  }`,
    expectedValid: true,
    category: 'class-basic'
  },
  {
    name: 'Class diagram with inheritance',
    code: `classDiagram
  class Animal {
    +String name
  }
  class Dog {
    +String breed
  }
  Animal <|-- Dog`,
    expectedValid: true,
    category: 'class-basic'
  },
  {
    name: 'Class diagram with composition',
    code: `classDiagram
  class Car {
    +Engine engine
  }
  class Engine {
    +int horsepower
  }
  Car *-- Engine`,
    expectedValid: true,
    category: 'class-relationships'
  },
  {
    name: 'Class diagram with aggregation',
    code: `classDiagram
  class University {
    +String name
  }
  class Student {
    +String name
  }
  University o-- Student`,
    expectedValid: true,
    category: 'class-relationships'
  },
  {
    name: 'Class diagram with association',
    code: `classDiagram
  class Person {
    +String name
  }
  class Company {
    +String name
  }
  Person --> Company`,
    expectedValid: true,
    category: 'class-relationships'
  },
  {
    name: 'Class diagram with dependency',
    code: `classDiagram
  class Client {
    +void use()
  }
  class Service {
    +void execute()
  }
  Client ..> Service`,
    expectedValid: true,
    category: 'class-relationships'
  },
  {
    name: 'Class diagram with classDef',
    code: `classDiagram
  class Animal {
    +name: string
  }
  classDef animalClass fill:#f9f,stroke:#333,stroke-width:2px
  class Animal animalClass`,
    expectedValid: true,
    category: 'class-styling'
  },
  {
    name: 'Class diagram with linkStyle (invalid)',
    code: `classDiagram
  class Animal {
    +name: string
  }
  linkStyle 0 stroke:#ff0000`,
    expectedValid: true, // Mermaid CLI actually accepts linkStyle in class diagrams - updated to match CLI behavior
    category: 'class-errors'
  },
  {
    name: 'Class diagram with double-parentheses (invalid)',
    code: `classDiagram
  class Animal {
    +name: string
  }
  class Animal((Invalid))`,
    expectedValid: false, // Mermaid CLI rejects double-parentheses in class names - updated to match CLI behavior
    category: 'class-errors'
  },

  // STATE DIAGRAMS
  {
    name: 'Empty state diagram v2',
    code: `stateDiagram-v2`,
    expectedValid: true,
    category: 'state-basic'
  },
  {
    name: 'State diagram v2 basic',
    code: `stateDiagram-v2
  [*] --> Still
  Still --> [*]`,
    expectedValid: true,
    category: 'state-basic'
  },
  {
    name: 'State diagram v2 with transitions',
    code: `stateDiagram-v2
  [*] --> Still
  Still --> Moving
  Moving --> Still
  Moving --> Crash
  Crash --> [*]`,
    expectedValid: true,
    category: 'state-basic'
  },
  {
    name: 'State diagram v2 with notes',
    code: `stateDiagram-v2
  [*] --> State1
  State1 --> State2
  note right of State1
    This is a note
  end note`,
    expectedValid: true,
    category: 'state-notes'
  },
  {
    name: 'State diagram v2 with classDef',
    code: `stateDiagram-v2
  [*] --> State1
  State1 --> State2
  classDef stateNode fill:#f9f,stroke:#333,stroke-width:2px
  class State1 stateNode`,
    expectedValid: true,
    category: 'state-styling'
  },
  {
    name: 'State diagram v2 with linkStyle (invalid)',
    code: `stateDiagram-v2
  [*] --> State1
  State1 --> State2
  linkStyle 0 stroke:#ff0000`,
    expectedValid: true, // Mermaid CLI actually accepts linkStyle in state diagrams - updated to match CLI behavior
    category: 'state-errors'
  },
  {
    name: 'State diagram v2 with double-parentheses (invalid)',
    code: `stateDiagram-v2
  [*] --> State1
  State1 --> State2((Invalid))`,
    expectedValid: true, // Mermaid CLI actually accepts this - updated to match CLI behavior
    category: 'state-errors'
  },
  {
    name: 'State diagram v1',
    code: `stateDiagram
  [*] --> State1
  State1 --> [*]`,
    expectedValid: true,
    category: 'state-basic'
  },

  // PIE CHARTS
  {
    name: 'Empty pie chart',
    code: `pie`,
    expectedValid: true,
    category: 'pie-basic'
  },
  {
    name: 'Pie chart basic',
    code: `pie title "Sales"
  "North" : 42
  "South" : 28`,
    expectedValid: true,
    category: 'pie-basic'
  },
  {
    name: 'Pie chart with multiple slices',
    code: `pie title "Sales by Region"
  "North" : 42
  "South" : 28
  "East" : 20
  "West" : 10`,
    expectedValid: true,
    category: 'pie-basic'
  },
  {
    name: 'Pie chart without title',
    code: `pie
  "North" : 42
  "South" : 28`,
    expectedValid: true,
    category: 'pie-basic'
  },

  // XY CHARTS
  {
    name: 'Empty XY chart',
    code: `xychart-beta`,
    expectedValid: false, // Mermaid CLI rejects empty XY charts - updated to match CLI behavior
    category: 'xychart-basic'
  },
  {
    name: 'XY chart with bar',
    code: `xychart-beta
  title "Sales Revenue"
  x-axis [jan, feb, mar]
  y-axis "Revenue" 4000 --> 11000
  bar [5000, 6000, 7500]`,
    expectedValid: true,
    category: 'xychart-basic'
  },
  {
    name: 'XY chart with line',
    code: `xychart-beta
  title "Sales Revenue"
  x-axis [jan, feb, mar]
  y-axis "Revenue" 4000 --> 11000
  line [5000, 6000, 7500]`,
    expectedValid: true,
    category: 'xychart-basic'
  },
  {
    name: 'XY chart with multiple series',
    code: `xychart-beta
  title "Sales Revenue"
  x-axis [jan, feb, mar]
  y-axis "Revenue" 4000 --> 11000
  bar [5000, 6000, 7500]
  line [4500, 5500, 7000]`,
    expectedValid: true,
    category: 'xychart-basic'
  },
  {
    name: 'XY chart with area (unsupported)',
    code: `xychart-beta
  title "Sales Revenue"
  x-axis [jan, feb, mar]
  y-axis "Revenue" 4000 --> 11000
  area [5000, 6000, 7500]`,
    expectedValid: false,
    category: 'xychart-errors'
  },
  {
    name: 'XY chart with scatter (unsupported)',
    code: `xychart-beta
  title "Sales Revenue"
  x-axis [jan, feb, mar]
  y-axis "Revenue" 4000 --> 11000
  scatter [5000, 6000, 7500]`,
    expectedValid: false,
    category: 'xychart-errors'
  },
  {
    name: 'XY chart with invalid y-axis syntax',
    code: `xychart-beta
  title "Sales Revenue"
  x-axis [jan, feb, mar]
  y-axis "Revenue" min 0 max 10
  bar [5000, 6000, 7500]`,
    expectedValid: false,
    category: 'xychart-errors'
  },
  {
    name: 'XY chart with unsupported x-axis-label, y-axis-label, and orientation',
    code: `xychart-beta
    title "Median Household Income - Southern States (2023)"
    x-axis-label "Median Household Income ($)"
    y-axis-label "State"
    orientation horizontal
    y-axis ["Virginia", "Georgia", "Texas", "North Carolina", "Florida", "Tennessee", "South Carolina", "Alabama", "Arkansas", "Mississippi", "Louisiana", "West Virginia"]
    x-axis [60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000, 105000]
    bar [100000, 81000, 79000, 77000, 74000, 74000, 71000, 67000, 67000, 62000, 61000, 61000]`,
    expectedValid: false,
    category: 'xychart-errors'
  },
  {
    name: 'XY chart with y-axis using list format (invalid)',
    code: `xychart-beta
    title "2024 GDP by State (in billions USD)"
    x-axis ["GDP (billions USD)"]
    y-axis [ "California", "Texas", "New York" ]
    bar [4103.124, 2709.393, 2297.028]`,
    expectedValid: false,
    category: 'xychart-errors'
  },

  // JOURNEY DIAGRAMS
  {
    name: 'Empty journey diagram',
    code: `journey`,
    expectedValid: true,
    category: 'journey-basic'
  },
  {
    name: 'Journey diagram basic',
    code: `journey
  title My working day
  section Go to work
    Make tea: 5: Me
    Go upstairs: 3: Me
  section Go home
    Go downstairs: 5: Me`,
    expectedValid: true,
    category: 'journey-basic'
  },
  {
    name: 'Journey diagram with multiple sections',
    code: `journey
  title My working day
  section Morning
    Wake up: 5: Me
    Breakfast: 3: Me
  section Afternoon
    Lunch: 4: Me
    Work: 1: Me, Cat`,
    expectedValid: true,
    category: 'journey-basic'
  },

  // GANTT CHARTS
  {
    name: 'Empty gantt chart',
    code: `gantt`,
    expectedValid: true,
    category: 'gantt-basic'
  },
  {
    name: 'Gantt chart basic',
    code: `gantt
  title A Gantt Diagram
  dateFormat YYYY-MM-DD
  section Section
  A task :a1, 2024-01-01, 30d
  Another task :after a1, 20d`,
    expectedValid: true,
    category: 'gantt-basic'
  },

  // ER DIAGRAMS
  {
    name: 'Empty ER diagram',
    code: `erDiagram`,
    expectedValid: true,
    category: 'er-basic'
  },
  {
    name: 'ER diagram basic',
    code: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE-ITEM : contains`,
    expectedValid: true,
    category: 'er-basic'
  },
  {
    name: 'ER diagram with attributes',
    code: `erDiagram
  CUSTOMER {
    string name
    int id
  }
  ORDER {
    int id
    date orderDate
  }
  CUSTOMER ||--o{ ORDER : places`,
    expectedValid: true,
    category: 'er-basic'
  },

  // BLOCK DIAGRAMS
  {
    name: 'Empty block diagram',
    code: `block-beta`,
    expectedValid: false, // Mermaid CLI rejects empty block diagrams - updated to match CLI behavior
    category: 'block-basic'
  },
  {
    name: 'Block diagram basic',
    code: `block-beta
  columns 3
  A["Block A"] B["Block B"] C["Block C"]`,
    expectedValid: true,
    category: 'block-basic'
  },
  {
    name: 'Block diagram without columns',
    code: `block-beta
  A["Block A"] B["Block B"] C["Block C"]`,
    expectedValid: true,
    category: 'block-basic'
  },

  // MINDMAPS
  {
    name: 'Empty mindmap',
    code: `mindmap`,
    expectedValid: false, // Mermaid CLI rejects empty mindmaps - updated to match CLI behavior
    category: 'mindmap-basic'
  },
  {
    name: 'Mindmap basic',
    code: `mindmap
  root((mindmap))
    Origins
      Long history
      Popularisation`,
    expectedValid: true,
    category: 'mindmap-basic'
  },

  // TIMELINES
  {
    name: 'Empty timeline',
    code: `timeline`,
    expectedValid: true,
    category: 'timeline-basic'
  },
  {
    name: 'Timeline basic',
    code: `timeline
  title History of the Internet
  1969 : ARPANET
  1991 : World Wide Web`,
    expectedValid: true,
    category: 'timeline-basic'
  },

  // GITGRAPH (additional edge cases)
  {
    name: 'Gitgraph with merge tag containing newlines',
    code: `gitGraph
  commit
  branch feature
  commit
  checkout main
  merge feature tag: "Merge feature\nWith newline"`,
    expectedValid: true,
    category: 'gitgraph-edge'
  },
  {
    name: 'Gitgraph with commit tag containing newlines',
    code: `gitGraph
  commit tag: "Version 1.0\nRelease"`,
    expectedValid: true,
    category: 'gitgraph-edge'
  }
];

