# Task 5 Tree compatibility evidence

Timestamp: 2026-06-06T16:02:49Z

## Files changed

- `src/components/Tree/CTree.tsx`
- `src/components/Tree/index.scss`
- `tests/CTree.test.tsx`
- `.omo/notepads/style-component-fixes/learnings.md`
- `.omo/evidence/task-5-tree-half-selected-test.md`
- `.omo/evidence/task-5-tree-compat-test.md`

## Compatibility checks

- Cascade rules unchanged: `handleCheck` still collects affected descendants with `collectCheckableDescendantKeys`, mutates only boolean checked keys, then calls `recalculateAncestorChecks` exactly as before.
- Controlled `checkedKeys` unchanged: the existing controlled test still expects the rendered parent to remain unchecked while `onCheck` reports cascaded next keys.
- Keyboard Space unchanged: `handleKeyDown` still calls `handleCheck(node, !checkedKeySet.has(node.key))`; no tri-state cycle was introduced.
- Disabled and `disableCheckbox` exclusion unchanged: mixed-state helper reuses `collectCheckableDescendantKeys`, which already returns `[]` for disabled or checkbox-disabled nodes.
- Tree flattening, expansion, selection, and focus/navigation code were not rewritten.

## Targeted test result

```text
yarn test --runTestsByPath tests/CTree.test.tsx tests/Checkbox.test.tsx
PASS tests/Checkbox.test.tsx
PASS tests/CTree.test.tsx
Test Suites: 2 passed, 2 total
Tests:       31 passed, 31 total
```

## Final verification

- `lsp_diagnostics` on `src/components/Tree/CTree.tsx` → no diagnostics.
- `lsp_diagnostics` on `tests/CTree.test.tsx` → no diagnostics.
- `lsp_diagnostics` on `src/components/Tree/index.scss` → no SCSS LSP configured; lint covered source/test quality.

Lint command:

```bash
yarn lint
```

Full output:

```text
yarn run v1.22.22
warning package.json: No license field
$ eslint "{src,tests}/**/*.{ts,tsx}"
(node:1051323) ESLintIgnoreWarning: The ".eslintignore" file is no longer supported. Switch to using the "ignores" property in "eslint.config.js": https://eslint.org/docs/latest/use/configure/migration-guide#ignoring-files
(Use `node --trace-warnings ...` to show where the warning was created)
Done in 14.16s.
```
