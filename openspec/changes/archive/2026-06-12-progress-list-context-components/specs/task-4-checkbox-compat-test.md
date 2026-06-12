# Task 4: Checkbox Indeterminate — Compatibility Evidence

## Existing Behavior Preserved

All 7 pre-existing tests continue to pass unchanged:

| # | Test | Status |
|---|------|--------|
| 1 | `exports CCheckbox from package entry` | ✓ pass |
| 2 | `initializes uncontrolled state from defaultChecked and toggles on click` | ✓ pass |
| 3 | `uses controlled checked state and reports the latest boolean onChange value` | ✓ pass |
| 4 | `keeps disabled checkboxes inert` | ✓ pass |
| 5 | `prefers children for the accessible name and falls back to label` | ✓ pass |
| 6 | `keeps base, theme, custom, input and label classes together` | ✓ pass |
| 7 | `inherits theme class from Theme provider` | ✓ pass |

## What Did NOT Change

- `handleChange` signature: still `(event: React.ChangeEvent<HTMLInputElement>) => void`, emits `boolean` via `onChange`
- Controlled/uncontrolled `checked` semantics: untouched
- `defaultChecked` behavior: untouched
- `disabled` behavior: untouched
- Class composition: `cm-checkbox`, `cm-checkbox--disabled`, theme, custom classes — all preserved
- No `defaultIndeterminate` added (controlled-only prop)
- No group behavior, variants, colors, or size props added
- No custom tri-state click cycle introduced

## Lint

```
yarn lint → 0 errors (1 pre-existing warning in CTimePicker.tsx, unrelated)
```

## Indeterminate API Contract

- **Type**: `indeterminate?: boolean` (default `false`)
- **Behavior**: Controlled-only — no internal state, no `defaultIndeterminate`
- **DOM**: Sets `HTMLInputElement.indeterminate` via `useRef` + `useEffect`
- **ARIA**: `aria-checked="mixed"` when truthy; attribute omitted when falsy
- **CSS**: `cm-checkbox--indeterminate` class on root `<label>`; `.cm-checkbox--indeterminate .cm-checkbox__input { accent-color: gray }` in SCSS
- **Coexistence**: `checked={true} indeterminate={true}` → `input.checked=true`, `input.indeterminate=true`, `aria-checked="mixed"`
- **onChange**: Remains `(checked: boolean) => void` — indeterminate does not affect the callback signature

## Downstream Contract (Task 5 — Tree half-selected)

Tree's `CTreeNode` can rely on:
- `input.indeterminate` being `true` when `<CCheckbox indeterminate>` is rendered
- `aria-checked="mixed"` for accessibility tree queries
- `cm-checkbox--indeterminate` for CSS-based visual styling
- Click still emits boolean `onChange(false)` or `onChange(true)` — Tree controls the `checked` prop
