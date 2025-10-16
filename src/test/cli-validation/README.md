# CLI Validation Tests

This directory contains tests that validate **Merval** against the real Mermaid CLI to ensure 100% compatibility.

## Purpose

The goal is to guarantee that:
- ✅ No chart will pass our validator and then fail to render in Mermaid
- ✅ No valid Mermaid chart will be incorrectly rejected by our validator
- ✅ Our validator behaves identically to Mermaid's official tools

## Prerequisites

To run these tests, you need the Mermaid CLI installed:

```bash
npm install -g @mermaid-js/mermaid-cli
```

## Running CLI Validation Tests

```bash
# Run the comprehensive CLI validation test suite
node src/test/cli-validation/validate-against-cli.js
```

## Test Categories

The CLI validation tests cover:

- **Basic**: Simple diagram types (flowchart, sequence)
- **Unicode**: Emojis and special characters
- **Special-chars**: Quoted participant names with special characters
- **Complex**: Complex diagrams with multiple elements
- **Mixed**: Mixed diagram types (where supported by Mermaid)
- **Class**: Class diagrams
- **State**: State diagrams
- **Pie**: Pie charts
- **XY-chart**: XY charts
- **Block**: Block diagrams
- **Styling**: Styling directives (classDef, linkStyle, style, click, direction, note) across diagram types
- **Node-shapes**: Node shape syntax ([rect], (round), {diamond}, ((double-circle))) and validation
- **Syntax-error**: Invalid syntax that should be rejected
- **Edge-case**: Edge cases like empty input

## Expected Results

For production readiness, you should see:
- **100% match rate** with Mermaid CLI
- **0 discrepancies** found
- **Perfect compatibility** message

## Integration with CI/CD

These tests should be run:
- Before any production deployment
- In CI/CD pipelines to ensure compatibility
- When making changes to the validator logic

## Troubleshooting

If discrepancies are found:
1. Check the specific test case that failed
2. Compare our validator's behavior with Mermaid CLI
3. Update our validator logic to match Mermaid's behavior
4. Re-run the tests until 100% compatibility is achieved
