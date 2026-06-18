## [2026-06-06T15:16:02Z] Task 1: Modal centering

### Root cause of off-center modal
`CWidget.renderFrame` (src/components/Widget/Widget.tsx:836-844) **always** emits inline styles `position: absolute; left: x; top: y; width; height` on the frame wrapper. When `CModal` passed `x={0} y={0}` to `CWindow`, the window's top-left corner was pinned to the `.cm-modal__content` flex-centered origin instead of being itself centered.

### Fix (Modal-scoped SCSS override)
Added to `src/components/Modal/index.scss`:
```scss
.cm-modal .cm-window-frame {
    position: static !important;
    left: auto !important;
    top: auto !important;
}
```
This is the only clean way to outrank inline styles emitted by code we are forbidden from modifying. The `!important` is justified by a specific cross-file invariant: the inline style comes from `Widget.tsx:836-844`. Documented in the SCSS comment so future maintainers do not rip it out.

### Lessons for downstream tasks (especially Task 2 — CConfirm "height 0")
- **CConfirm inherits this exact bug** if it wraps CModal or composes CWidget similarly. After Task 1's fix, the flex centering chain `.cm-modal__content` → `.cm-modal__window-host` → `.cm-window-frame` (now `position: static`) means the host's height is now driven by the frame's intrinsic content height. If CConfirm sets `height: 0` somewhere (likely in CWidget initial state or in a height-prop default), the frame collapses. Look at how `CWindow` derives `frame.height` in `Widget.getFrameState()` — if `props.height` is 0 or unset, the frame may render as `height: 0`. Modal sidesteps this because `cWindowHeight = 0` combined with `display: flex` on `.cm-window` (src/components/Window/index.scss:3-7) and `height: 100%` resolves to auto when parent is `static`; the window renders at content height. But this only works because there is no explicit `height: 0` inline on the frame in normal flow — confirm whether Confirm follows the same pattern.
- **Test strategy under jsdom + identity-obj-proxy**: SCSS is stubbed, so `getComputedStyle` is useless for verifying centering. Best practice: assert against the SCSS source file via `readFileSync` for the contract, and reserve geometry validation for Playwright (`tests/ui/window.helpers.ts` already has `readFrameMetrics`).
- **Inline-style vs CSS specificity**: any future Modal-scoped layout overrides on CWindow-emitted elements **must** use `!important` because `CWidget.renderFrame` overwrites the style object every render. Style merging via `style` prop will not help since CWidget filters layout props out (Widget.tsx:798-810).

### Files touched (Task 1)
- `src/components/Modal/index.scss` — added 13 lines (comment + 4-line override rule)
- `tests/CModal.test.tsx` — added 2 new tests (~50 lines incl. comments), added imports `readFileSync`, `resolve` from node stdlib

### Verification
- `yarn test --runTestsByPath tests/CModal.test.tsx` → 21/21 ✓
- `yarn lint` → exit 0 ✓
- Pre-existing failures in `tests/Dock.test.tsx` are unrelated (other dispatches' theme/Window edits).

## [2026-06-06T17:30:00Z] Task 4: Checkbox indeterminate

### Implementation approach
Added `indeterminate?: boolean` as a controlled-only prop to `CCheckbox`. No `defaultIndeterminate`, no internal tri-state logic.

### DOM mechanism
- `useRef<HTMLInputElement>` attached to the native `<input>` element
- `useEffect` syncs `inputRef.current.indeterminate = indeterminate` whenever the prop changes
- This mirrors the existing pattern in `CTransfer.tsx:327-331` (callback ref for `element.indeterminate`), but uses `useRef` + `useEffect` since indeterminate is a controlled prop that needs reactive updates

### ARIA
- When `indeterminate` is truthy, `aria-checked="mixed"` is set on the input via conditional spread
- When falsy, the attribute is omitted entirely (browser computes aria-checked from `checked`)

### CSS hook
- `cm-checkbox--indeterminate` class added to root `<label>` when indeterminate is true
- SCSS rule: `.cm-checkbox--indeterminate .cm-checkbox__input { accent-color: gray }` — minimal visual hook, no layout change

### Coexistence
- `checked={true} indeterminate={true}` → `input.checked=true`, `input.indeterminate=true`, `aria-checked="mixed"`
- This is valid per HTML spec — indeterminate is a visual-only flag that doesn't affect the checked state

### onChange preserved
- `handleChange` unchanged — still emits `boolean` via `onChange`
- Indeterminate does not introduce a tri-state cycle on click

### Files touched
- `src/components/Checkbox/Checkbox.tsx` — added `indeterminate` prop, `useRef`, `useEffect`, `aria-checked`, class hook (70→85 lines)
- `src/components/Checkbox/index.scss` — added `.cm-checkbox--indeterminate .cm-checkbox__input { accent-color: gray }` (18→22 lines)
- `tests/Checkbox.test.tsx` — added 7 new tests (124→219 lines)

### Verification
- `yarn test --runTestsByPath tests/Checkbox.test.tsx` → 14/14 ✓
- `yarn lint` → 0 errors (1 pre-existing warning in CTimePicker.tsx)

### Downstream contract for Task 5 (Tree half-selected)
Tree can rely on: `input.indeterminate` DOM property, `aria-checked="mixed"`, `cm-checkbox--indeterminate` class, and boolean `onChange` callback.

## [2026-06-06T19:00:00Z] Task 3: Picker outside-click

### Implementation pattern
Copied CMenu's document mousedown pattern (Menu.tsx L104-124) into both `CDatePicker` and `CTimePicker`:
- `rootRef` (useRef) attached to the outermost wrapper (`<div>` for DatePicker, `<fieldset>` for TimePicker) that contains both the input and the inline panel
- `useEffect` registers `document.addEventListener('mousedown', ...)` only when `isOpen` is true
- Handler: `if (!(event.target instanceof Node)) return;` then `if (!rootRef.current.contains(event.target)) setOpenState(false);`
- Cleanup removes listener on unmount and when `isOpen` flips false
- `setOpenState` wrapped in `useCallback` in TimePicker to satisfy exhaustive-deps (DatePicker already had it)

### Why `mousedown` not `click`
Matches CMenu. `mousedown` fires before `blur`/`focus` events, avoiding race conditions where the input loses focus before the handler runs. Also prevents the "click inside input re-opens panel" edge case.

### Root ref naming
- DatePicker: `rootRef: React.RefObject<HTMLDivElement>` on the `<div className="cm-date-picker">` wrapper (L412)
- TimePicker: `rootRef: React.RefObject<HTMLFieldSetElement>` on the `<fieldset>` wrapper (L224)
- Both wrappers already contained input + panel, so no new DOM element was needed

### Test strategy (jsdom)
- `fireEvent.mouseDown(document.body)` for outside click — fires the document listener fine in jsdom
- `fireEvent.mouseDown(input)` / `fireEvent.mouseDown(panel)` for inside click — `contains()` returns true, no close
- Controlled mode: handler calls `onOpenChange(false)` but panel stays mounted until parent rerenders with `open={false}`
- Closed-state guard: listener not attached when `isOpen` is false, so no spurious calls

### Files touched
- `src/components/DatePicker/CDatePicker.tsx` — added rootRef, useEffect (~15 lines)
- `src/components/TimePicker/CTimePicker.tsx` — added rootRef, useEffect, useCallback wrapper (~20 lines)
- `tests/CDatePicker.test.tsx` — added 5 new tests (outside click, inside input, inside panel, controlled mode, closed guard)
- `tests/CTimePicker.test.tsx` — added 5 new tests (same pattern)

### Verification
- `yarn test --runTestsByPath tests/CDatePicker.test.tsx tests/CTimePicker.test.tsx` → 45/45 ✓
- `yarn lint` → exit 0 ✓

## [2026-06-06T21:00:00Z] Task 6: Menu closeOnSelect

### Implementation approach
Added `closeOnSelect?: boolean` as an additive prop to `CMenuProps` with default `true`. Gated `closeAllMenus()` in `handleLeafClick` behind `if (closeOnSelect)`. `onSelect?.(item)` fires unconditionally.

### Key decision: submenus stay open too
When `closeOnSelect={false}`, `closeAllMenus()` is not called, so both root menu AND any open submenus remain visible. This is correct for the multi-select use case — the user may want to select from a submenu multiple times. Outside-click still closes everything (its handler calls `closeAllMenus()` directly, not gated by `closeOnSelect`).

### TDD approach
Wrote two failing tests first:
1. `closeOnSelect={false}` — proved menu stayed open (failed as expected, then passed after implementation)
2. `closeOnSelect={true}` — proved explicit prop matches default behavior (passed immediately, confirming additive design)

### Gotcha: multiple `cm-menu-list` elements
When `closeOnSelect={false}` and a submenu leaf is clicked, both root and submenu lists stay in the DOM. Initial test used `screen.getByTestId('cm-menu-list')` which threw due to multiple matches. Fixed by using `screen.getAllByTestId('cm-menu-list').length > 0`.

### Files touched
- `src/components/Menu/Menu.tsx` — added `closeOnSelect` to interface (L21), destructure default (L61), gated `closeAllMenus()` in `handleLeafClick` (L217)
- `tests/Menu.test.tsx` — added 2 new tests (~60 lines)

### Verification
- `yarn test --runTestsByPath tests/Menu.test.tsx tests/Select.test.tsx` → 47/47 ✓
- `yarn lint` → exit 0 ✓

### Downstream contract for Task 7 (CSelect multi-select)
CSelect can pass `closeOnSelect={!multiple}` to CMenu. Single-select → `true` (default, menu closes). Multi-select → `false` (menu stays open for additional picks). No changes to CMenu needed.

## [2026-06-06T23:39:00Z] Task 2: CConfirm visible content

### Root cause of "Confirm has height 0 — only white area visible"
Task 1's prediction (in this notepad lines 17-18) was correct: CWidget's frame collapsed because Task 1 only neutralized `position/left/top`, not `height`. Full chain:
1. `CWidget.renderFrame` (`src/components/Widget/Widget.tsx:836-844`) **always** emits inline `height: <number>px` on `.cm-window-frame`.
2. `CModal` passes `cWindowHeight = 0` whenever `height` prop is unset (`src/components/Modal/CModal.tsx:192`). Confirm uses intrinsic height, so this is the default path.
3. Task 1's `.cm-modal .cm-window-frame` override neutralized only position. Inline `height: 0px` survived.
4. `.cm-window__inner { height: 100% }` (`src/components/Window/index.scss`) resolves 100% of 0 = 0 → entire body+actions invisible. `.cm-confirm__body { min-height: 32px }` cannot save it because min-height inside a 0-height ancestor is still effectively 0.

The user's "missing styles" complaint was the same symptom — styled divs were present but had height 0.

### Plan hypothesis (a) was wrong — imperative path already correct
The plan suspected `confirm()` rendered raw text outside `.cm-confirm__body`. Reading `CConfirm.tsx:181-222` showed `ImperativeConfirmHost` already wraps via `<CConfirm>`, producing identical DOM to declarative. Pre-existing tests at `tests/CConfirm.test.tsx:170+` rely on this parity. No DRY refactor was needed.

### Fix (Confirm-scoped SCSS only)
Added to `src/components/Confirm/index.scss`:
```scss
.cm-confirm .cm-window-frame {
    height: auto !important;
}
.cm-confirm__body    { flex: 0 0 auto; /* + existing rules */ }
.cm-confirm__actions { flex: 0 0 auto; /* + existing rules */ }
```
- Modal SCSS intentionally NOT touched (Task 2 must-not-do).
- `!important` justified by the same cross-file invariant as Task 1: the height comes from an inline style in `Widget.tsx:836-844` we cannot modify. Documented in the SCSS comment.
- `flex: 0 0 auto` on body/actions is belt-and-suspenders for the `.cm-window` flex column — prevents future regressions where any sibling claims remaining space.

### Test strategy (TDD)
- 4 SCSS contract tests via `readFileSync` regex match — same pattern Task 1 established for CModal (jsdom + identity-obj-proxy stubs SCSS, no layout computation).
- 2 DOM structural tests verifying declarative AND imperative paths both produce `.cm-confirm > .cm-confirm__body / .cm-confirm__actions`.
- 1 theme/className preservation test mirroring the Wave 0 contract at `tests/CConfirm.test.tsx:119`.
- 2 Playwright real-browser tests in `tests/ui/confirm.visibility.spec.ts` measuring `boundingBox().height` for frame/body/actions. Required because jsdom never computes layout — only Chromium can prove the user-visible bug is gone.

### Lessons for downstream tasks
- **CWidget inline-style trap is wider than Task 1 addressed.** Any future Modal-based component (Drawer, Dialog, Popover-as-Modal, etc.) with intrinsic content height will hit the same `height: 0` collapse unless either (a) the caller passes a numeric `height` to CModal, or (b) the component adds a scoped `.cm-X .cm-window-frame { height: auto !important }` override. The Modal SCSS could host a global override but the plan kept it Confirm-scoped to avoid affecting fixed-height Modal consumers.
- **Imperative-vs-declarative DOM parity** is already preserved by routing imperative `confirm()` through `<CConfirm>`. Do not split into duplicate JSX paths; future variants should follow the `ImperativeXxxHost` → `<Xxx>` pattern.
- **jsdom + identity-obj-proxy verification ceiling**: SCSS source-text contract assertions are the highest-fidelity unit test available. Geometry/visibility must go to Playwright. This is now codified in two test files (`CModal.test.tsx` for centering, `CConfirm.test.tsx` for height).

### Files touched (Task 2)
- `src/components/Confirm/index.scss` — added 19 lines (comment + height override) + `flex: 0 0 auto` on body and actions rules
- `tests/CConfirm.test.tsx` — added 7 new tests (~125 lines incl. comments), added imports `readFileSync`, `resolve` from node stdlib
- `tests/ui/confirm.visibility.spec.ts` — NEW file, 2 Playwright tests with height measurement + screenshot

### Verification
- `yarn test --runTestsByPath tests/CConfirm.test.tsx tests/CModal.test.tsx` → 47/47 ✓
- `yarn playwright test tests/ui/confirm.visibility.spec.ts` → 2/2 ✓ (frame > 60px, body > 20px, actions > 20px in Chromium 1024×768)
- `yarn playwright test --grep "Confirm|Modal"` → 4/4 ✓
- `yarn lint` → exit 0 ✓
- Screenshot at `.omo/evidence/task-2-confirm-visible.png` (11KB) confirms centered, fully visible Confirm dialog.

### Behavioral invariants preserved
OK/Cancel order unchanged, button text defaults unchanged, ESC/mask cancellation unchanged, `confirm()` Promise resolution semantics unchanged, CModal source/styles unchanged, CWindow/CWidget unchanged.

## [2026-06-06T16:02:49Z] Task 5: Tree half-selected via CCheckbox

### Implementation approach
Tree now consumes Task 4's `CCheckbox` instead of rendering a native checkbox directly. The Tree-specific `cm-tree__checkbox` class is passed as `className` to the CCheckbox root label, while the actual input keeps CCheckbox's `cm-checkbox__input` class and receives the controlled `indeterminate` prop.

### Mixed-state calculation
- Added `areSomeCheckableDescendantsChecked(node, checkedKeySet)` next to the existing `areAllCheckableDescendantsChecked` helper.
- The helper reuses `collectCheckableDescendantKeys(childNode)`, so disabled and `disableCheckbox` descendants remain excluded by the existing filter.
- Leaf nodes cannot become indeterminate because render-time `isIndeterminate` is guarded by `hasCheckableDescendants`.

### Rendering semantics
- Parent with some but not all checkable descendants checked: treeitem `aria-checked="mixed"`, parent node class `cm-tree__node--indeterminate`, checkbox input `indeterminate === true`.
- Parent with all checkable descendants checked: treeitem `aria-checked="true"`, no indeterminate class, checkbox input `indeterminate === false`.
- Parent with no checkable descendants checked: treeitem `aria-checked="false"`, no indeterminate class, checkbox input `indeterminate === false`.

### Behavioral invariants preserved
- `handleCheck(node, nextChecked)` signature unchanged.
- Space key still calls `handleCheck(node, !checkedKeySet.has(node.key))`; no tri-state cycling was added.
- Ancestor recalculation still uses `areAllCheckableDescendantsChecked`, so checkedKeys semantics and cascade rules remain boolean.
- Controlled `checkedKeys` remains stable while `onCheck` reports the cascaded next keys.

### Test updates
- Added TDD coverage for none/some/all child selection states in `tests/CTree.test.tsx`.
- Updated the existing ARIA semantics test from parent `aria-checked="false"` to `"mixed"` for the deliberate Task 5 correction.
- Updated the ancestor-recalculation test to assert partial state as `"mixed"` while preserving `not.toHaveClass('cm-tree__node--checked')`.

### Verification
- Red test before implementation: `yarn test --runTestsByPath tests/CTree.test.tsx tests/Checkbox.test.tsx` failed in CTree on mixed-state assertions, while Checkbox passed.
- Green test after implementation: `yarn test --runTestsByPath tests/CTree.test.tsx tests/Checkbox.test.tsx` → 31/31 ✓.
- LSP diagnostics on `src/components/Tree/CTree.tsx` and `tests/CTree.test.tsx` → no diagnostics.
- `yarn lint` → exit 0 ✓ (repo still emits the existing ESLintIgnoreWarning about `.eslintignore`).


## [2026-06-06T16:12:06Z] Task 7: CSelect multi-select

### Implementation approach
Added a discriminated-union props model to `CSelect`:
- Single mode: `multiple?: false`, `value/defaultValue?: string`, `onChange?: (string) => void`
- Multi mode: `multiple: true`, `value/defaultValue?: string[]`, `onChange?: (string[]) => void`

The component keeps separate uncontrolled state buckets (`uncontrolledValue: string` and `uncontrolledValues: string[]`) so default single-select behavior remains string-only and the package/UI smoke fixture continues to see the same `data-select-value` and hidden native value in single mode.

### Multi-select ordering invariant
Multi-select toggles rebuild the next array from `options.filter(...)` after applying the Set toggle. This guarantees callbacks and labels are sorted in option order (`['apple', 'cherry']`), not click order, and keeps `FormData.getAll(name)` aligned with the hidden native `<select multiple>` option order.

### Controlled/uncontrolled gotchas
- `isControlled` still means `props.value !== undefined`; in the discriminated branch TypeScript narrows `props.value` to `string[]` for multi mode and `string` for single mode.
- Form reset must branch by `multiple`: uncontrolled multi resets with `setUncontrolledValues(initialMultiValuesRef.current)`, while single resets with `setUncontrolledValue(initialSingleValueRef.current)`.
- Keep the hidden native select React-controlled with the existing no-op `onChange`; its `value` is `string` in single mode and `string[]` in multi mode.

### CMenu contract consumed
`CSelect` now passes `closeOnSelect={!multiple}`. Single-select keeps Task 6/default behavior (leaf click closes). Multi-select keeps the menu open after each toggle, while outside-click still closes through CMenu's document mousedown handler because that path bypasses `closeOnSelect`.

### Test coverage added
`tests/Select.test.tsx` now covers uncontrolled default array rendering, controlled empty-array placeholder, hidden native multiple selected options, FormData submit/reset, disabled option no-op, comma-joined labels, option-order callbacks, and menu staying open after multi toggles. Existing single-select tests are unchanged.

## [2026-06-06T16:59:06Z] Task 1 follow-up: Modal default-height collapse (F3 Issue 1 BLOCKER)

### What happened
F3 real-browser QA found that a default-height `<CModal>` (no `height` prop) rendered with `.cm-window { height: 0 }` and was invisible. Task 1's SCSS override only neutralized `position/left/top`. The inline `height: 0px` emitted by `CWidget.renderFrame` (from `cWindowHeight = 0`, the documented default at CModal.tsx:192) survived and collapsed the modal.

### Fix
Extended `.cm-modal .cm-window-frame` block in `src/components/Modal/index.scss` with `height: auto !important;`. Same mechanism, same justification as Task 2's `.cm-confirm .cm-window-frame` rule. Confirm rule remains intact and is more specific (both yield `height: auto` so no cascade conflict either way).

### Why this was missed in Task 1 (root-cause-of-the-miss analysis)
- **jsdom blind spot.** `getComputedStyle` returns nothing meaningful for external SCSS under `identity-obj-proxy`. Task 1's SCSS contract test asserted only the *centering* override clauses (`position/left/top`). It never asked "is anything else inline-styled by CWidget that would also need neutralization?".
- **Demo-fixture sampling bias.** `ComponentCatalog.tsx`'s modal demo passes `height={200}` explicitly. With an explicit numeric height, `cWindowHeight === 200` and the inline `height: 200px` is benign — the modal looks fine. The default-height case (no `height` prop) was never exercised by a fixture before this task added `modal-demo-default-open`.
- **Lessons doc warned, but not loud enough.** The Task 1 learnings note flagged "Confirm may break if it assumes a fixed height" but framed it as a downstream concern. The correct framing was: **any CWidget-emitted inline layout property that gets a 0 default must be neutralized at the Modal scope**, not waited for downstream consumers to discover.
- **TDD blind spot — contract scope.** The Task 1 SCSS contract test asserted only the three properties Task 1 changed. A more defensive contract test would have enumerated all four inline-style properties CWidget emits (`position/left/top/height/width`) and asserted Modal's expected handling of each.

### Pattern for future Modal/CWidget interactions
Whenever wrapping CWindow in a layout container that doesn't supply real layout dimensions:
1. Neutralize ALL inline layout styles from `CWidget.renderFrame:836-844` (`position`, `left`, `top`, `width`, `height`) at the wrapper scope.
2. Pair every SCSS source-contract test with a Playwright geometry assertion (`boundingBox().height > X`) — jsdom-only verification will lie.
3. Add a default-prop demo fixture for every component that has an "intrinsic dimension" path through the props.

### Files touched (Task 1 follow-up)
- `src/components/Modal/index.scss` — added `height: auto !important` (+ 8-line explanatory comment) inside existing `.cm-modal .cm-window-frame` block
- `tests/CModal.test.tsx` — added 1 new SCSS contract test for the height override (22 total now)
- `src/dev/ComponentCatalog.tsx` — added second demo button `modal-demo-default-open` and bare `modal-demo-default` modal (no `height` prop) to expose the default-height path
- `tests/ui/modal.visibility.spec.ts` — NEW Playwright smoke (2 tests): default-height modal geometry > 60px, explicit-height modal not regressed

### Verification (Task 1 follow-up)
- `yarn lint` → exit 0
- `yarn test --runTestsByPath tests/CModal.test.tsx tests/CConfirm.test.tsx` → 48/48 (22 CModal + 26 CConfirm)
- `yarn build` → clean, no Modal errors
- `yarn playwright test tests/ui/modal.visibility.spec.ts` → 2/2
- `yarn test:ui` → 91/91 (was 89; +2 from new modal.visibility specs)
