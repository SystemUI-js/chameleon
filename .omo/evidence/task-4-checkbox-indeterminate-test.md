# Task 4: Checkbox Indeterminate — Test Evidence

## Test Run

```
PASS tests/Checkbox.test.tsx
  CCheckbox
    ✓ exports CCheckbox from package entry (24 ms)
    ✓ initializes uncontrolled state from defaultChecked and toggles on click (39 ms)
    ✓ uses controlled checked state and reports the latest boolean onChange value (10 ms)
    ✓ keeps disabled checkboxes inert (9 ms)
    ✓ prefers children for the accessible name and falls back to label (24 ms)
    ✓ keeps base, theme, custom, input and label classes together (4 ms)
    ✓ inherits theme class from Theme provider (2 ms)
    ✓ sets native input.indeterminate when indeterminate prop is true (1 ms)
    ✓ sets aria-checked="mixed" when indeterminate is true (1 ms)
    ✓ does not set aria-checked when indeterminate is false or unset (1 ms)
    ✓ allows checked and indeterminate to coexist (1 ms)
    ✓ adds cm-checkbox--indeterminate class hook when indeterminate is true (1 ms)
    ✓ removes indeterminate class and aria-checked when indeterminate becomes false (2 ms)
    ✓ preserves existing boolean onChange when indeterminate is set (2 ms)

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
```

## New Tests (7 added)

| # | Test | What it verifies |
|---|------|------------------|
| 1 | `sets native input.indeterminate when indeterminate prop is true` | `input.indeterminate` DOM property is `true` via ref |
| 2 | `sets aria-checked="mixed" when indeterminate is true` | `aria-checked="mixed"` attribute on input |
| 3 | `does not set aria-checked when indeterminate is false or unset` | No `aria-checked` when prop is absent |
| 4 | `allows checked and indeterminate to coexist` | `input.checked=true` AND `input.indeterminate=true` AND `aria-checked="mixed"` simultaneously |
| 5 | `adds cm-checkbox--indeterminate class hook when indeterminate is true` | `cm-checkbox--indeterminate` class on root label |
| 6 | `removes indeterminate class and aria-checked when indeterminate becomes false` | Rerender with `indeterminate` removed cleans up DOM state |
| 7 | `preserves existing boolean onChange when indeterminate is set` | Click emits `boolean` onChange, not tri-state |

## TDD Cycle

- **Red**: 5 of 7 new tests failed before implementation (indeterminate, aria-checked, class hook, coexistence, toggle)
- **Green**: All 14 tests pass after implementation
- **Refactor**: No refactoring needed — clean implementation on first pass
