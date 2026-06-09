# Task 5 Tree half-selected test evidence

Timestamp: 2026-06-06T16:02:49Z

## Red phase

Command:

```bash
yarn test --runTestsByPath tests/CTree.test.tsx tests/Checkbox.test.tsx
```

Result: expected failure before Tree implementation.

```text
PASS tests/Checkbox.test.tsx
FAIL tests/CTree.test.tsx
  ● CTree › renders ARIA tree semantics and required state classes for hierarchical data

    Expected aria-checked="mixed"
    Received aria-checked="false"

  ● CTree › renders a mixed parent state when some checkable children are checked

    Expected aria-checked="mixed"
    Received aria-checked="false"

Test Suites: 1 failed, 1 passed, 2 total
Tests:       2 failed, 29 passed, 31 total
```

## Green phase

Command:

```bash
yarn test --runTestsByPath tests/CTree.test.tsx tests/Checkbox.test.tsx
```

Full output:

```text
yarn run v1.22.22
warning package.json: No license field
$ jest --runTestsByPath tests/CTree.test.tsx tests/Checkbox.test.tsx
PASS tests/Checkbox.test.tsx
PASS tests/CTree.test.tsx

Test Suites: 2 passed, 2 total
Tests:       31 passed, 31 total
Snapshots:   0 total
Time:        1.785 s, estimated 2 s
Ran all test suites within paths "tests/CTree.test.tsx", "tests/Checkbox.test.tsx".
Done in 3.31s.
```

## Covered assertions

- Some children checked: parent treeitem `aria-checked="mixed"`, parent checkbox input `indeterminate === true`, parent node has `cm-tree__node--indeterminate`.
- All children checked: parent treeitem `aria-checked="true"`, parent checkbox input not indeterminate, no `cm-tree__node--indeterminate`.
- No children checked: parent treeitem `aria-checked="false"`, parent checkbox input not indeterminate, no `cm-tree__node--indeterminate`.
- Existing semantic assertion updated from `false` to `mixed` for the deliberate Task 5 correction.
