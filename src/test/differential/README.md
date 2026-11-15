# Mermaid differential regression tests

These cases compare validation results against `mermaid.parse` in Mermaid 11.12.0 under JSDOM. They cover issue #6 and nearby malformed syntax; they do not establish complete grammar compatibility.

```sh
npm ci --prefix src/test/differential
npm run build
npm test --prefix src/test/differential
```
