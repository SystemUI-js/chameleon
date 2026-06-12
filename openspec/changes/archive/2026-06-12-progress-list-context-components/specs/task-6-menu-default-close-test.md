# Task 6 Evidence: Menu default close-on-select behavior preserved

## Test: existing leaf selection still closes menu (default `closeOnSelect=true`)

### Covered by existing tests
- `tests/Menu.test.tsx` → "leaf selection emits payload and closes" (line 306)
- `tests/Menu.test.tsx` → "closeOnSelect={true} explicitly closes menu after leaf selection (same as default)" (new)
- `tests/Select.test.tsx` → "opens CMenu items and adapts selection back to onChange(nextValue)" (line 69) — proves Select single-select close still works

### What these tests verify
1. Clicking a leaf item fires `onSelect` with the correct `MenuListItem` payload
2. After leaf click, `data-menu-state` transitions to `closed`
3. The `cm-menu-list` element is removed from the DOM
4. The explicit `closeOnSelect={true}` test confirms the prop is additive — behavior identical to omitting it

### Test run output
```
PASS tests/Menu.test.tsx
PASS tests/Select.test.tsx

Test Suites: 2 passed, 2 total
Tests:       47 passed, 47 total
```

### Files unchanged
- `src/components/Select/Select.tsx` — NOT touched (Task 7 scope)
- `onSelect` payload shape — unchanged (`MenuListItem`)
- Outside-click handler — unchanged
- Trigger modes — unchanged
