## CTree implementation notes

- Added `CTree` under `src/components/Tree` with the project-standard `Tree.tsx`, `index.ts`, and `index.scss` structure.
- Theme integration follows the Checkbox pattern: `normalizeThemeClassName(useTheme(theme))` and `mergeClasses(base, theme, className)` on the component root.
- `checkedKeys !== undefined` is the controlled-mode guard. Uncontrolled checks initialize from `defaultCheckedKeys` and cascade parent changes through all descendants.
- `onCheck` reports tree-order checked keys plus `{ checked, node }`; controlled mode reports the next key set without mutating internal state.
- `CTree` exposes ARIA `tree` / `group` / `treeitem` roles plus `aria-expanded`, `aria-selected`, and `aria-checked` on tree items.

## Dev catalog & Playwright smoke tests (Task 9)

- Added 6 new showcase sections to `src/dev/ComponentCatalog.tsx` following the established `ShowcaseSection` + `*_SNIPPET` + showcase function pattern.
- Each section includes interactive examples with `data-testid` attributes for testability:
  - **CInput**: clearable input with placeholder, disabled state demo, value display.
  - **CTooltip**: hover trigger (`placement="top"`) and focus trigger (`placement="right"`), plus a text hover example (`placement="bottom"`).
  - **CTimePicker**: controlled time selection with disabled state demo.
  - **CTree**: checkable/expandable tree with sample data, checked/selected key display.
  - **CTransfer**: two-panel shuttle with `titles={['Available', 'Chosen']}`, move buttons, target key display.
  - **CTable**: paginated table (`pageSize: 4`) with 6 sample rows over 2 pages.
- Playwright smoke tests in `tests/ui/new-components.smoke.spec.ts` verify:
  - All 6 sections are visible via `getByTestId('catalog-section-{name}')`.
  - One core interaction per component: CInput typing/clear, CTooltip hover reveal, CTimePicker hour change, CTree checkbox check, CTransfer item move, CTable pagination.
- `yarn test:ui` passes all 84 tests (including the 6 new ones).
- Pitfall: `page.getByText(/Checked:/)` matched both the displayed value and the code-snippet text inside `<ShowcaseCodeDisclosure>`. Fixed by scoping to `.cm-catalog__value` with `filter({ hasText: 'Checked:' })`.

## CInput prop surface correction

- The live source file is `src/components/Input/CInput.tsx` and `src/components/Input/index.ts` exports from it; `src/components/Input/Input.tsx` is not present in the worktree.
- Removed `React.InputHTMLAttributes` inheritance from `CInputProps` and made the supported prop surface explicit, including `size`, `status`, `prefix`, `suffix`, `allowClear`, `maxLength`, `name`, `id`, `autoFocus`, `onClear`, and `onPressEnter`.
- `onChange` now reports `(nextValue, event)`. The dev catalog CInput showcase had to switch from `event.target.value` to `nextValue` so declaration generation no longer reports a CInput-related type error.
- `data-testid` remains on the native `.cm-input__field` so existing Playwright fill/disabled checks still target the input, while the `.cm-input` root carries theme, size, status, disabled, readonly, and custom classes.
- Verification: `yarn test tests/CInput.test.tsx --runInBand` passes 32 tests. LSP diagnostics are clean for `CInput.tsx`, `tests/CInput.test.tsx`, and `src/dev/ComponentCatalog.tsx`; SCSS has no configured LSP server. `yarn build` exits 0, with only the pre-existing unrelated `tests/Widget.test.tsx` dts report for `setWidgetActive` remaining.
