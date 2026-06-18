# Task 6 Evidence: `closeOnSelect={false}` keeps menu open after leaf selection

## Test: `closeOnSelect={false}` regression

### Test location
`tests/Menu.test.tsx` → "closeOnSelect={false} keeps root menu open after leaf selection"

### What the test verifies
1. Mounts `<CMenu closeOnSelect={false}>` with `INTERACTION_MENU_LIST`
2. Opens menu via trigger click
3. Navigates to submenu (clicks parent item)
4. Clicks a leaf item ("Leaf 1")
5. Asserts `onSelect` was called once with the correct payload `{ id: 'leaf-1', key: 'leaf-1', title: 'Leaf 1' }`
6. Asserts `data-menu-state` is still `open` (menu NOT closed)
7. Asserts `cm-menu-list` elements are still in the DOM

### Implementation detail
- `CMenuProps` extended with `closeOnSelect?: boolean` (default `true`)
- `handleLeafClick` gates `closeAllMenus()` behind `if (closeOnSelect)`
- `onSelect?.(item)` fires unconditionally regardless of `closeOnSelect`
- Outside-click handler (`document mousedown`) is NOT gated — always closes
- Submenu hover/click behavior unchanged
- ARIA roles, item ids, trigger modes unchanged

### Design decision: submenus with `closeOnSelect={false}`
When `closeOnSelect={false}`, the leaf click does NOT call `closeAllMenus()`, which means:
- Root menu stays open
- Any open submenus also stay open (since `openBranchByDepth` is not reset)
- This is intentional — the plan says "root menu open" and submenus are part of the menu tree
- Outside click still closes everything (uses `closeAllMenus()` directly, not gated)

### Test run output
```
PASS tests/Menu.test.tsx
PASS tests/Select.test.tsx

Test Suites: 2 passed, 2 total
Tests:       47 passed, 47 total
```

### Lint
```
yarn lint → exit 0 (clean)
```

### Downstream contract for Task 7 (CSelect multi-select)
CSelect will pass `closeOnSelect={!multiple}` to CMenu:
- Single-select mode: `closeOnSelect={true}` (default, menu closes after selection)
- Multi-select mode: `closeOnSelect={false}` (menu stays open for additional selections)
