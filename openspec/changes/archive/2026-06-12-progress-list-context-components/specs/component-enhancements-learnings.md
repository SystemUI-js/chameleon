# Component Enhancements - Learnings

## Project Conventions
- React 18 + TypeScript, strict mode
- CSS className strings (NO CSS-in-JS)
- BEM naming: `cm-component`, `cm-component--modifier`
- SCSS modules with type declarations
- `data-testid` for test selectors
- Jest + React Testing Library for unit tests
- Playwright for UI smoke tests

## Plan Tasks
1. OpenSpec Contracts (blocks 2-5)
2. CLoading Demo (blocked by 1)
3. CSplitArea lockCurrent/lock (blocked by 1)
4. CInput suggestions/debounce (blocked by 1)
5. CSlider step verification (blocked by 1)
6. ComponentCatalog integration (blocked by 2-5)
7. Playwright smoke (blocked by 6)
8. Quality gates (blocked by 1-7)

## API Decisions
- CSplitArea: `lockCurrent?: boolean` (current only), `lock?: boolean` (recursive); lock dominates lockCurrent
- CInput: `CInputSuggestionOption = { value: string; label?: React.ReactNode; disabled?: boolean }`
- CInput props: `suggestionOptions`, `suggestionDebounce` (default 0), `onSearch`, `onSelect`

## OpenSpec Artifacts Created (2026-06-09)
- Created `openspec/changes/component-enhancements/` with `.openspec.yaml`, `proposal.md`, `design.md`, `tasks.md`
- Created delta specs: `cinput-suggestions`, `cloading-demo`, `cslider-step-verify`
- Updated main specs: `csplitarea-component` (lockCurrent/lock), `csplitarea-demo` (locked separator demo)
- CSlider spec explicitly states VERIFICATION ONLY scope
- All specs use Chinese with WHEN/THEN scenario format
- Tasks map one-to-one: CLoading Demo, CSplitArea lock, CInput suggestions, CSlider verification
- `npx openspec validate --all` unavailable (no validator exists)

## CSplitArea Lock Implementation (2026-06-09)
- `CSplitArea` lock propagation uses an internal React context in `src/components/CSplitArea/CSplitArea.tsx`.
- Effective current separator lock is `ancestor lock || own lock || own lockCurrent`; propagated descendant lock is `ancestor lock || own lock`, so `lockCurrent` stays current-only.
- Locked separators do not create `@system-ui-js/multi-drag` `Drag` instances and render `cm-split-area__separator--locked` with `cursor: default` from `src/components/CSplitArea/index.scss`.
- Tests added in `tests/CSplitArea.test.tsx` cover current-only lock, recursive lock, and descendant inability to opt out with `lock={false}` / `lockCurrent={false}`.
- Verification: `yarn test CSplitArea.test.tsx` passed 20/20; changed TSX/test files had no LSP diagnostics; targeted ESLint for CSplitArea files exited 0.
- Full `yarn test` currently still has unrelated failures in Widget/Dock tests; `yarn build` exits 0 but dts prints unrelated CInput/CTable/Widget type errors.

## Task 2: CLoading Demo (2026-06-09)
- Added CLoading import, LOADING_SNIPPET, LoadingShowcase function, and registration to ComponentCatalog.tsx
- CLoading props: variant (spinner|dots|bar), size (small|medium|large|number|string), progress (0-100), indeterminate (default true), label
- BEM classes: cm-loading, cm-loading--{variant}, cm-loading--{size}, cm-loading--indeterminate
- Bar variant has .cm-loading__fill child with width style based on progress
- LoadingShowcase includes: spinner, dots, determinate bar (with progress buttons), indeterminate bar
- data-testid IDs: catalog-section-loading, loading-demo-spinner, loading-demo-dots, loading-demo-bar, loading-demo-bar-indeterminate
- CLoading tests: 16/16 pass, no changes to existing tests
- Evidence: .omo/evidence/task-2-cloading-jest.txt, .omo/evidence/task-2-cloading-demo.png

## Task 5: CSlider Step Verification (2026-06-09)
- VERIFICATION ONLY - no changes needed
- All 6 required step behaviors covered by existing tests (10 total, all pass)
- External value alignment: test at line 258 (step=25, value=63→75%)
- Decimal step: test at line 267 (step=0.1, precision handling)
- Track click: test at line 303 (step=10 alignment)
- Drag: tests at lines 303, 332 (drag move and inline controlled)
- Keyboard step: test at line 413 (ArrowRight/Home/End with step=10)
- Catalog demo uses step={5} at ComponentCatalog.tsx lines 680, 847
- normalizeSliderValue uses scaled integer arithmetic to avoid float drift
- Evidence saved to .omo/evidence/task-5-cslider-verify.txt

## Task 4 CInput suggestions implementation (2026-06-09)
- `CInputSuggestionOption` is exported from `src/components/Input` and therefore from the package entry via `src/components/index.ts` / `src/index.ts` re-export chains.
- `CInput` now uses one `scheduleSearch()` debounce pipeline for typing and clear; `suggestionDebounce` defaults to `0`, superseded timers are cleared, and unmount cleanup removes pending timers.
- Suggestion popup is rendered in-place under `.cm-input` with `role=combobox` on the input and `role=listbox` / `role=option` for suggestions; no portal, virtualization, filtering, loading, or not-found UI was added.
- Keyboard navigation stores an option index but derives movement from enabled option indexes, so disabled options remain rendered with `aria-disabled=true` but are skipped and cannot be selected by click or Enter.
- Selection preserves controlled/uncontrolled semantics: uncontrolled updates internal/input value; controlled mode emits `onChange`/`onSelect` and leaves the rendered value to the parent.
- Focused evidence saved in `.omo/evidence/task-4-cinput-debounce.txt` and `.omo/evidence/task-4-cinput-selection.txt` after `yarn test CInput.test.tsx --runInBand` passed 41/41.

## Task 6: ComponentCatalog Integration (2026-06-09)
- Extended `SplitAreaShowcase` with `lockCurrent` and `lock` toggle demos side-by-side.
  - Toggle checkboxes: `split-area-demo-lock-current-toggle`, `split-area-demo-lock-toggle`
  - Demo containers: `split-area-demo-lock-current`, `split-area-demo-lock-recursive`
  - Each demo has nested child `CSplitArea` to visually demonstrate propagation difference.
- Extended `InputShowcase` with suggestion dropdown demo.
  - Added `CInputSuggestionOption` import to `ComponentCatalog.tsx`.
  - Demo input: `input-demo-suggestions` with 5 fruit options (including 1 disabled: Date).
  - Debounce: `suggestionDebounce={300}`; search value display: `input-demo-search-value`.
  - Selected value display: `input-demo-selected-value`.
- Updated `SPLIT_AREA_SNIPPET` and `INPUT_SNIPPET` to include new API examples (`lockCurrent`, `lock`, `suggestionOptions`, `suggestionDebounce`, `onSearch`, `onSelect`).
- Preserved existing `LoadingShowcase` from Task 2 (no duplication).
- Verified `SliderShowcase` still uses `step={5}` at lines 696 and 873.
- `yarn lint` passed with no errors.
- `yarn test ComponentCatalog.test.tsx` passed 38/38.
- Evidence screenshots captured: `.omo/evidence/task-6-catalog-sections.png`, `.omo/evidence/task-6-catalog-input-suggestions.png`.

## Task 7: Playwright UI Smoke Coverage (2026-06-09)
- Added `tests/ui/component-catalog-enhancements.spec.ts` for focused ComponentCatalog smoke coverage without pixel-perfect visual assertions.
- Covered Loading demo visibility via `catalog-section-loading` and `loading-demo-spinner`.
- Covered Input suggestions by typing `ap` into `input-demo-suggestions`, selecting the Apple option scoped to `catalog-section-input`, and asserting `input-demo-selected-value` reports `apple`.
- Covered locked SplitArea behavior by enabling `split-area-demo-lock-current-toggle`, asserting the current-level separator has `cm-split-area__separator--locked`, dragging it, and verifying the first panel width remains unchanged; screenshot saved to `.omo/evidence/task-7-splitarea-locked-browser.png`.
- Covered Slider step behavior through keyboard interaction on the ARIA slider inside `slider-demo`: ArrowRight changes `slider-demo-value` from `Volume: 40` to `Volume: 45`, matching `step={5}`.
- Local proxy environment can break Playwright webServer probing for `127.0.0.1:5673`; running with `NO_PROXY=127.0.0.1,localhost no_proxy=127.0.0.1,localhost` avoids false proxy responses.
- Verification: `yarn test:ui` passed 95/95 with output saved to `.omo/evidence/task-7-playwright-ui.txt`.


## Task 8: Final Quality Gates and Scope Review (2026-06-09)
- Evidence files generated: `.omo/evidence/task-8-quality-gates.txt` and `.omo/evidence/task-8-scope-review.txt`.
- `yarn lint` exited 0; only the existing ESLint `.eslintignore` deprecation warning appeared.
- `yarn test` exited 1 because of inherited unrelated failures in `tests/Widget.test.tsx` (`setWidgetActive` missing) and `tests/Dock.test.tsx` (`cm-dock` class expectations). Task 8 did not fix these because they are outside the component-enhancements plan scope and were already documented as pre-existing.
- `yarn test:ui` exited 0 with `NO_PROXY=127.0.0.1,localhost no_proxy=127.0.0.1,localhost`; 95/95 Playwright tests passed, including `component-catalog-enhancements.spec.ts`.
- `yarn build` exited 0; dts still printed unrelated `CTable`/`Widget` diagnostics, consistent with prior inherited wisdom.
- Scope review classified intended plan files under `openspec/**`, `src/components/Input/**`, `src/components/CSplitArea/**`, `src/dev/**`, `tests/**`, and `.omo/evidence/**`.
- Scope review flagged unrelated workspace noise outside the allowed plan scope: `.omo/run-continuation/**`, `.omo/boulder.json`, `.omo/drafts/`, `.omo/notepads/`, `.omo/plans/`, and `.playwright-mcp/**` generated/modified files. No cleanup was performed because Task 8 requested evidence consolidation and no commits.
