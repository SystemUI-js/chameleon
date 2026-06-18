# CListIcon Component Learnings

## 2026-06-05

### Component Pattern
- CListIcon follows the same pattern as CButton for theme normalization (`normalizeThemeClassName(useTheme(theme))`) and class merging (`mergeClasses`).
- Root element is `<button type="button">` with `disabled`, `draggable`, and event handlers forwarded directly.
- DOM structure: `<button>` containing `<span class="cm-list-icon__visual">` and `<span class="cm-list-icon__label">`.

### SCSS Structure
- Base class: `.cm-list-icon`
- Modifiers: `--active`, `--disabled`, `--draggable`
- Elements: `__visual`, `__label`
- Base styles: `inline-flex`, `flex-direction: column`, centered alignment, safe label wrapping with `text-overflow: ellipsis`, focus-visible outline, disabled opacity, drag cursor.

### Testing Considerations
- React Testing Library fires `SyntheticBaseEvent`, not native `MouseEvent` directly. Use `event.nativeEvent instanceof MouseEvent` to verify native event.
- jsdom does not define `DragEvent`, so drag event assertions must use `event.nativeEvent instanceof Event` instead.
- `fireEvent.doubleClick` triggers `dblclick`, not two separate clicks.

### Export Pattern
- Named export from `src/components/CListIcon/index.ts` re-exporting from `./CListIcon`.
- Added to `src/components/index.ts` and `src/index.ts` explicit named exports.

## CLoading Component Learnings

### TDD Approach
- Wrote 16 tests first covering all specified behaviors
- Tests initially failed (module not found) as expected in TDD red phase
- Implementation made all 16 tests pass on first run

### Key Implementation Details
- Named sizes (`small`, `medium`, `large`) get modifier classes; numeric/string sizes set `--cm-loading-size` CSS variable
- Progress clamped with `Math.max(0, Math.min(100, value))`
- Bar variant determinate: sets `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, fill width in percent
- Bar variant indeterminate: omits `aria-valuenow`, adds `cm-loading--indeterminate` class
- String labels set `aria-label` on root; non-string labels render visibly without `aria-label`
- Root element exposes `role="status"` and `aria-live="polite"`

### Files Created
- `src/components/CLoading/CLoading.tsx`
- `src/components/CLoading/index.scss`
- `src/components/CLoading/index.ts`
- `tests/CLoading.test.tsx`

### Files Updated
- `src/components/index.ts` (added CLoading export)
- `src/index.ts` (added CLoading to package entry exports)
