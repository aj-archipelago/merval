# 🌊 Merval

The world's first **zero-dependency** Mermaid diagram validator. Instant syntax validation without CLI calls or heavy dependencies.

## 🎯 Why Merval?

Tired of installing `@mermaid-js/mermaid-cli` and its 400+ dependencies (Puppeteer, Chromium, etc.) just to validate a simple diagram? **Merval** gives you instant Mermaid syntax validation with zero dependencies.

- ⚡ **Instant**: No CLI calls, no external processes
- 🪶 **Zero Dependencies**: Pure JavaScript, no Puppeteer, no Chromium
- 🎯 **100% Compatible**: Tested against Mermaid CLI v11.12.0
- 🚀 **Lightning Fast**: Direct parsing, no rendering overhead
- 🛡️ **Type Safe**: Built with TypeScript for robust validation

## Supported Diagram Types

- [x] Flowchart (graph/flowchart)
- [x] Sequence Diagram
- [x] Class Diagram
- [x] State Diagram
- [x] Entity Relationship Diagram
- [x] User Journey
- [x] Gantt Chart
- [x] Pie Chart
- [x] Gitgraph
- [x] Mindmap
- [x] Timeline
- [x] xychart-beta (bar/line charts)
- [x] block-beta (block diagrams)

## 📦 Installation

```bash
# Using npm
npm install @aj-archipelago/merval

# Using yarn  
yarn add @aj-archipelago/merval

# Using pnpm
pnpm add @aj-archipelago/merval
```

## 🚀 Quick Start

```javascript
import { validateMermaid } from '@aj-archipelago/merval';

// Instant validation - no CLI, no dependencies!
const result = validateMermaid(`
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E[End]
`);

console.log(result.isValid); // true/false
console.log(result.diagramType); // 'flowchart'
console.log(result.errors); // [] or array of error objects
```

## Mermaid Version Compatibility

This validator is tested against **Mermaid CLI v11.12.0** to ensure 100% compatibility. The library tracks which version it was validated against and can warn about potential compatibility issues.

### Version Information

```javascript
import { getMermaidVersionInfo, isMermaidVersionSupported } from '@aj-archipelago/merval';

// Get version compatibility info
const versionInfo = getMermaidVersionInfo();
console.log(versionInfo);
// {
//   validatedAgainst: "11.12.0",
//   lastValidated: "2024-10-15", 
//   cliVersion: "@mermaid-js/mermaid-cli@11.12.0"
// }

// Check if a specific version is supported
console.log(isMermaidVersionSupported("11.12.0")); // true
console.log(isMermaidVersionSupported("12.0.0"));   // false
```

### Version-Aware Validation

```javascript
import { validateMermaid } from '@aj-archipelago/merval';

// Basic validation (no version check)
const result = validateMermaid(mermaidCode);

// Validate with version compatibility check
const result = validateMermaid(mermaidCode, "12.0.0");
if (!result.isValid && result.errors.some(e => e.code === 'VERSION_MISMATCH')) {
  console.log('Warning: This validator was not tested against Mermaid 12.0.0');
}
```

### Updating Mermaid Version Compatibility

When updating this validator to work with a new Mermaid version, use the provided script:

```bash
# Update to a new Mermaid version
npm run update-version 12.0.0 2024-11-01

# Or manually run the script
node scripts/update-version.js 12.0.0 2024-11-01
```

This script will:
1. Update `package.json` with the new version info
2. Update `src/version.ts` with the new version constants
3. Build the project
4. Run all tests
5. Provide next steps for full compatibility testing

## API

```javascript
import { validateMermaid, isValidMermaid, getDiagramType } from '@aj-archipelago/merval';

// Basic validation
const result = validateMermaid(`
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E[End]
`);

console.log(result.isValid); // true/false
console.log(result.diagramType); // 'flowchart'
console.log(result.errors); // [] or array of error objects

// Simple boolean validation
const isValid = isValidMermaid(mermaidCode); // true/false

// Get diagram type only
const diagramType = getDiagramType(mermaidCode); // 'flowchart', 'sequence', etc.

// Validation with version compatibility check
const result = validateMermaid(mermaidCode, "12.0.0");
if (!result.isValid && result.errors.some(e => e.code === 'VERSION_MISMATCH')) {
  console.log('Version compatibility warning');
}
```

## Error Format

```javascript
{
  isValid: false,
  diagramType: 'flowchart',
  errors: [
    {
      line: 2,
      column: 15,
      message: "Missing arrow between nodes",
      code: "MISSING_ARROW",
      suggestion: "Add '-->' to connect nodes"
    }
  ]
}
```

## 💡 Why Merval?

### The Problem with Traditional Mermaid Validation

```bash
# Traditional approach - heavy dependencies
npm install @mermaid-js/mermaid-cli
# Installs 400+ packages including:
# - puppeteer (Chromium browser)
# - canvas, cairo, pango, etc.
# - Native dependencies requiring compilation
```

### The Merval Solution

```bash
# Merval - zero dependencies
npm install merval
# Installs only merval - that's it!
```

**Merval** gives you the same validation accuracy as Mermaid CLI but with:
- **Zero dependencies** - no Puppeteer, no Chromium, no native compilation
- **Instant validation** - no CLI process spawning, no file I/O
- **Same accuracy** - 100% compatible with Mermaid CLI v11.12.0
- **TypeScript support** - full type safety out of the box

## Implementation Strategy

1. **Lexical Analysis**: Tokenize input into meaningful components
2. **Syntax Analysis**: Build AST and validate structure
3. **Semantic Validation**: Check relationships and references
4. **Diagram-Specific Rules**: Each type has unique validation

## Architecture

```
src/
├── lexer.js          # Tokenize input
├── parser.js         # Parse tokens into AST
├── validators/
│   ├── flowchart.js  # Flowchart-specific validation
│   ├── sequence.js   # Sequence diagram validation
│   ├── xychart.js    # xychart-beta validation
│   └── ...
├── ast/              # AST node definitions
└── index.js          # Main API
```

## License

MIT - Compatible with Mermaid.js MIT license

---

<div align="center">Built with 💖 by diagram enthusiasts for diagram enthusiasts.</div>
