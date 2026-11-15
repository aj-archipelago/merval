// Run after installing mermaid@11.12.0 and jsdom@26.1.0 locally.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { validateMermaid } from '../../../dist/index.js';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false });

const cases = [
  [true, 'flowchart TB\n A --> B'],
  [true, 'graph TD\n A --- B'],
  [true, 'graph TD\n A --o B'],
  [true, 'graph TD\n A -- text --> B'],
  [true, 'flowchart LR\n A & B --> C'],
  [true, 'graph TD\n A[(DB)]'],
  [true, 'graph TD\n A([Start])'],
  [true, 'graph TD\n A[[Sub]]'],
  [true, 'graph TD\n A{{Hex}}'],
  [true, 'graph TD\n A>Flag]'],
  [true, 'flowchart LR\n A@{ shape: rect }'],
  [false, 'graph TD\n A --> B]'],
  [false, 'graph TD\n A --> ]'],
  [false, 'sequenceDiagram\n A->>B Hello'],
  [true, 'flowchart TB\n A & B --> C & D'],
  [true, 'graph LR\n A --x B'],
  [true, 'sequenceDiagram\n A->>B: Hello'],
  [false, 'graph TD\n A[(DB]'],
  [false, 'graph TD\n A[[Sub]'],
  [false, 'graph TD\n A & --> B'],
  [false, 'sequenceDiagram\n A->>B Hello\n B->>A: Hi'],
];
for (const [expected, source] of cases) {
  let reference;
  try { await mermaid.parse(source); reference = true; } catch { reference = false; }
  assert.equal(reference, expected, `Unexpected Mermaid result for ${JSON.stringify(source)}`);
  assert.equal(validateMermaid(source).isValid, reference, `Mismatch for ${JSON.stringify(source)}`);
}
console.log(`${cases.length} differential cases passed against Mermaid 11.12.0`);
