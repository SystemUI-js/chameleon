# Task 7 — CSelect single-select compatibility evidence

## Existing single-select Jest coverage
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

The original single-select tests in `tests/Select.test.tsx` were left unchanged and still pass:
- package entry export
- CMenu-backed trigger and hidden native options
- single `onChange(nextValue: string)` selection and close behavior
- uncontrolled `defaultValue` and reset
- controlled value stability until rerender
- hidden native value for form submission
- disabled trigger/native control
- placeholder + required behavior
- theme class behavior

## Playwright UI compatibility
Command:

```bash
yarn test:ui
```

Result:

```text
89 passed
```

Relevant single-select fixture remained intact:
- `tests/ui/common-controls.smoke.spec.ts:17` default fixture still exposes `Medium` and native value `medium`
- `tests/ui/common-controls.smoke.spec.ts:26` selecting through visible CMenu still changes trigger to `Large`, `data-select-value` to `large`, and native value to `large`

## Lint
Command:

```bash
yarn lint
```

Result: exit 0. The run prints the repository's existing `ESLintIgnoreWarning` about `.eslintignore`, but no lint errors remain.

## Compatibility facts
- `multiple` defaults to `false`
- single mode still uses `string` value/defaultValue/onChange model
- native single select still receives scalar `value`
- single mode still passes `closeOnSelect={true}` via `!multiple`
- option shape remains `{ label, value, disabled? }`
