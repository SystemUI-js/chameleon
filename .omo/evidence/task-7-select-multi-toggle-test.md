# Task 7 — CSelect multi-select array mode evidence

## Red test before implementation
Command:

```bash
yarn test --runTestsByPath tests/Select.test.tsx
```

Result before implementation: failed as expected. The 4 new multi-select tests failed while 14 existing single-select/theme tests passed. Failure symptoms included React warning that array `value` was supplied while native `<select>` was not `multiple`, missing `Apple` / `Apple, Cherry` labels, and `hiddenSelect.multiple` being `false`.

## Final Select Jest result
Command:

```bash
yarn test --runTestsByPath tests/Select.test.tsx
```

Result:

```text
PASS tests/Select.test.tsx
Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
```

Covered multi-select assertions:
- uncontrolled `multiple defaultValue={['apple']}` renders `Apple`
- clicking `Cherry` emits `['apple', 'cherry']` in option order, renders `Apple, Cherry`, and keeps menu open
- clicking selected `Apple` emits `['cherry']`, renders `Cherry`, and keeps menu open
- disabled `Banana` click is a no-op and does not call `onChange`
- controlled `value={[]}` renders placeholder `Choose fruit`
- hidden native `<select multiple>` reflects selected options via jsdom `option.selected`
- form submit uses native `FormData.getAll('fruit')`
- form reset restores `defaultValue={['apple', 'cherry']}`
- outside `document.body` mousedown still closes the multi-select CMenu after multi toggles

## Type/LSP
`lsp_diagnostics` on changed TypeScript files:
- `src/components/Select/Select.tsx` → No diagnostics found
- `tests/Select.test.tsx` → No diagnostics found

## Implementation facts
- `multiple: true` props use `string[]` for `value`, `defaultValue`, and `onChange`
- multi-select state toggles through CMenu leaf selection; no tag/chip UI added
- arrays are rebuilt from `options` order before emitting
- `CMenu` receives `closeOnSelect={!multiple}` so multi mode stays open after each selection
- outside-click close remains active through CMenu's unchanged document mousedown handler
