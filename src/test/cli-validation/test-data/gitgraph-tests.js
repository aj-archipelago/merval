/**
 * Comprehensive Gitgraph Test Cases
 * 
 * Tests all gitgraph syntax variations, edge cases, and error conditions
 * to ensure 100% compatibility with Mermaid CLI.
 */

export const gitgraphTests = [
  // VALID CASES - Note: Mermaid CLI requires "gitGraph" (capital G), not "gitgraph"
  {
    name: 'Empty gitgraph',
    code: `gitGraph`,
    expectedValid: true,
    category: 'gitgraph-basic'
  },
  {
    name: 'Gitgraph with single commit',
    code: `gitGraph
  commit`,
    expectedValid: true,
    category: 'gitgraph-basic'
  },
  {
    name: 'Gitgraph with commit and branch',
    code: `gitGraph
  commit
  branch develop
  commit`,
    expectedValid: true,
    category: 'gitgraph-basic'
  },
  {
    name: 'Gitgraph with checkout',
    code: `gitGraph
  commit
  branch feature
  commit
  checkout main
  commit`,
    expectedValid: true,
    category: 'gitgraph-basic'
  },
  {
    name: 'Gitgraph with merge',
    code: `gitGraph
  commit
  branch feature
  commit
  checkout main
  merge feature`,
    expectedValid: true,
    category: 'gitgraph-basic'
  },
  {
    name: 'Gitgraph with commit id',
    code: `gitGraph
  commit id: "Initial commit"
  branch feature
  commit id: "Feature commit"`,
    expectedValid: true,
    category: 'gitgraph-commit-params'
  },
  {
    name: 'Gitgraph with commit tag',
    code: `gitGraph
  commit tag: "v1.0.0"
  branch release
  commit tag: "v1.1.0"`,
    expectedValid: true,
    category: 'gitgraph-commit-params'
  },
  {
    name: 'Gitgraph with commit id and tag',
    code: `gitGraph
  commit id: "M0" tag: "main start"
  branch feature
  commit id: "F1" tag: "feature start"`,
    expectedValid: true,
    category: 'gitgraph-commit-params'
  },
  {
    name: 'Gitgraph with commit type',
    code: `gitGraph
  commit type: HIGHLIGHT
  branch feature
  commit type: REVERSE`,
    expectedValid: true,
    category: 'gitgraph-commit-params'
  },
  {
    name: 'Gitgraph with merge tag',
    code: `gitGraph
  commit
  branch feature
  commit
  checkout main
  merge feature tag: "Merge feature"`,
    expectedValid: true,
    category: 'gitgraph-merge-params'
  },
  {
    name: 'Gitgraph with merge id',
    code: `gitGraph
  commit
  branch feature
  commit
  checkout main
  merge feature id: "merge-1"`,
    expectedValid: true,
    category: 'gitgraph-merge-params'
  },
  {
    name: 'Gitgraph with merge id and tag',
    code: `gitGraph
  commit
  branch feature
  commit
  checkout main
  merge feature id: "merge-1" tag: "Feature merged"`,
    expectedValid: true,
    category: 'gitgraph-merge-params'
  },
  {
    name: 'Gitgraph complex flow',
    code: `gitGraph
  commit id: "M0" tag: "main start"
  branch develop
  commit id: "D1"
  branch feature
  commit id: "F1"
  commit id: "F2"
  checkout develop
  commit id: "D2"
  checkout main
  merge develop tag: "Release"
  checkout feature
  merge develop tag: "Update feature"`,
    expectedValid: true,
    category: 'gitgraph-complex'
  },
  {
    name: 'Gitgraph with checkout creating branch',
    code: `gitGraph
  commit
  checkout feature
  commit
  checkout main
  commit`,
    expectedValid: false, // Mermaid CLI rejects - checkout cannot create branch, must use "branch" first
    category: 'gitgraph-checkout'
  },
  {
    name: 'Gitgraph with multiple branches',
    code: `gitGraph
  commit
  branch feature1
  commit
  checkout main
  branch feature2
  commit
  checkout feature1
  commit`,
    expectedValid: true,
    category: 'gitgraph-multiple-branches'
  },
  {
    name: 'Gitgraph with merge after multiple commits',
    code: `gitGraph
  commit
  branch feature
  commit
  commit
  commit
  checkout main
  commit
  merge feature`,
    expectedValid: true,
    category: 'gitgraph-merge'
  },
  {
    name: 'Gitgraph with comments',
    code: `gitGraph
  commit
  %% This is a comment
  branch feature
  commit
  %% Another comment`,
    expectedValid: true,
    category: 'gitgraph-comments'
  },

  // INVALID CASES - These should fail
  {
    name: 'Gitgraph duplicate branch creation after commits',
    code: `gitGraph
  commit id: "M0" tag: "main start"
  branch main
  commit id: "M1"`,
    expectedValid: false,
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph duplicate branch creation',
    code: `gitGraph
  branch main
  commit
  branch main
  commit`,
    expectedValid: false,
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph merge nonexistent branch',
    code: `gitGraph
  commit
  merge feature`,
    expectedValid: false,
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph merge before branch exists',
    code: `gitGraph
  commit
  branch main
  merge feature`,
    expectedValid: false,
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph checkout before any commits',
    code: `gitGraph
  checkout main`,
    expectedValid: true, // Mermaid CLI accepts this - checkout can create branch
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph branch without name',
    code: `gitGraph
  commit
  branch`,
    expectedValid: true, // Mermaid CLI accepts this - lenient
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph checkout without name',
    code: `gitGraph
  commit
  checkout`,
    expectedValid: true, // Mermaid CLI accepts this - lenient
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph merge without name',
    code: `gitGraph
  commit
  branch feature
  commit
  checkout main
  merge`,
    expectedValid: true, // Mermaid CLI accepts this - lenient
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph commit with invalid parameter',
    code: `gitGraph
  commit invalid: "value"`,
    expectedValid: true, // Mermaid CLI is lenient - accepts unknown parameters
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph with malformed commit id',
    code: `gitGraph
  commit id:`,
    expectedValid: true, // Mermaid CLI is lenient - accepts empty values
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph with malformed merge',
    code: `gitGraph
  commit
  branch feature
  commit
  checkout main
  merge feature tag:`,
    expectedValid: true, // Mermaid CLI is lenient - accepts empty tag values
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph branch name with spaces',
    code: `gitGraph
  commit
  branch feature branch`,
    expectedValid: true, // Mermaid CLI accepts branch names with spaces
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph with invalid command',
    code: `gitGraph
  commit
  invalidcommand`,
    expectedValid: true, // Mermaid CLI is lenient - ignores unknown commands
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph lowercase (invalid)',
    code: `gitgraph
  commit
  branch main`,
    expectedValid: false,
    category: 'gitgraph-errors'
  },
  {
    name: 'Gitgraph case sensitivity - GITGRAPH (invalid)',
    code: `GITGRAPH
  commit
  branch main`,
    expectedValid: false,
    category: 'gitgraph-case'
  }
];

