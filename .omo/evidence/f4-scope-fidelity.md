# F4 Scope Fidelity Re-review — add-datepicker-modal-confirm

Timestamp: 2026-06-06

## Verdict

APPROVE.

The pending diff is scope-faithful for plan `add-datepicker-modal-confirm` after contextual re-audit. The previous rejection items are false positives: `src/components/Window/Window.tsx` is pre-existing worktree state for `feature-add-win-7-theme`; unrelated `.omo/plans` and `.omo/notepads` entries are pre-existing concurrent plan state; forbidden-token hits are either comments proving forbidden APIs are absent, private date-boundary helpers required for `minDate`/`maxDate`, or hits in unrelated pre-existing components.

## Commands and evidence used

- `git status --porcelain` and `git status --porcelain --untracked-files=all` enumerated every pending file.
- `git diff --stat` showed tracked changes, including the known pre-existing `Window.tsx` +23-line fullscreen change.
- `git diff -- src/components/Window/Window.tsx` confirmed the Window change is exactly fullscreen support (`fullscreen?: boolean`, `isFullscreen()`, resize-handle/resize-drag suppression), unrelated to DatePicker/Modal/Confirm.
- `git log --oneline -5 -- src/components/Window/Window.tsx` was run as requested; it shows historical Window commits but cannot disprove/confirm session timing by itself. The current diff content matches the provided pre-existing worktree-state clarification and is not referenced by this plan's deliverables.
- `git diff -- package.json yarn.lock` produced no output: no dependency files changed, so no new npm deps.
- `Read` inspected new component sources, barrels, catalog CSlider sections, plan/notepad/evidence context, and forbidden-token hit context.
- `grep` was run with targeted patterns for forbidden imports/props/usages and CSlider preservation.

## Pending file classification

### PLAN-IN-SCOPE

Implementation and component-local styles:

- `src/components/Confirm/CConfirm.tsx`
- `src/components/Confirm/index.scss`
- `src/components/Confirm/index.ts`
- `src/components/DatePicker/CDatePicker.tsx`
- `src/components/DatePicker/index.scss`
- `src/components/DatePicker/index.ts`
- `src/components/Modal/CModal.tsx`
- `src/components/Modal/index.scss`
- `src/components/Modal/index.ts`

Public exports, catalog, theme coverage, and tests:

- `src/components/index.ts`
- `src/index.ts`
- `src/dev/ComponentCatalog.tsx`
- `src/theme/default/styles/index.scss`
- `src/theme/win7/styles/index.scss`
- `src/theme/win98/styles/index.scss`
- `src/theme/winxp/styles/index.scss`
- `tests/CConfirm.test.tsx`
- `tests/CDatePicker.test.tsx`
- `tests/CModal.test.tsx`
- `tests/ComponentCatalog.test.tsx`
- `tests/PublicThemeMatrix.test.tsx`
- `tests/ui/new-components.smoke.spec.ts`

Plan/evidence/notepads/run-continuation for this change:

- `.omo/boulder.json`
- `.omo/plans/add-datepicker-modal-confirm.md`
- `.omo/notepads/add-datepicker-modal-confirm/decisions.md`
- `.omo/notepads/add-datepicker-modal-confirm/issues.md`
- `.omo/notepads/add-datepicker-modal-confirm/learnings.md`
- `.omo/notepads/add-datepicker-modal-confirm/problems.md`
- `.omo/evidence/f1-plan-compliance.md`
- `.omo/evidence/f2-code-quality.md`
- `.omo/evidence/f3-real-manual-qa.md`
- `.omo/evidence/f4-scope-fidelity.md`
- `.omo/evidence/task-1-datepicker-boundary.txt`
- `.omo/evidence/task-1-datepicker-happy.txt`
- `.omo/evidence/task-2-modal-happy.txt`
- `.omo/evidence/task-3-confirm-happy.txt`
- `.omo/evidence/task-4-theme-components.txt`
- `.omo/evidence/task-4-theme-lint.txt`
- `.omo/evidence/task-5-export-conflict.txt`
- `.omo/evidence/task-5-public-theme-matrix.txt`
- `.omo/evidence/task-6-catalog-smoke.txt`
- `.omo/evidence/task-6-playwright-ui.txt`
- `.omo/evidence/task-7-full-ci.txt`
- `.omo/evidence/task-7-merge-scope.txt`
- `.omo/run-continuation/ses_1bf43059cffeAKGCmD8n7H08Su.json`
- `.omo/run-continuation/ses_163730af4ffeWLNpMUFTezx9hq.json`
- `.omo/run-continuation/ses_164af3cf9ffejgVx0nfyWes9wx.json`
- `.omo/run-continuation/ses_1684a896effedtnFRMOHtBic20.json`
- `.omo/run-continuation/ses_174585b04ffeRmAtKkC2lIX49a.json`
- `.omo/run-continuation/ses_1745abf8dffezQrDNLo6TxJHC5.json`
- `.omo/run-continuation/ses_178400f4fffezs4nGViPDLPgkp.json`
- `.omo/run-continuation/ses_17c7d791effeUj0L35GwCHOLo0.json`
- `.omo/run-continuation/ses_17ccf0089ffeNA7D5Aakr7MFbH.json`
- `.omo/run-continuation/ses_17d073cfcffeecg8h6jyzpqrJn.json`
- `.omo/run-continuation/ses_17d3b2c30ffeDazGW050wy3kqE.json`
- `.omo/run-continuation/ses_17d3ce43effed3DVYGexiP9cIM.json`
- `.omo/run-continuation/ses_17d6f1b03ffeIXa5BcOjLjbCYk.json`
- `.omo/run-continuation/ses_17d700d8dffegxyyKNRp0qCT3z.json`
- `.omo/run-continuation/ses_17de77d3cffeRtDFzLinPXtEjy.json`
- `.omo/run-continuation/ses_17e458d8dffea8KalGmw0r2745.json`
- `.omo/run-continuation/ses_18220aefeffejyqDopCWJkVdj6.json`
- `.omo/run-continuation/ses_1846f8f19ffe6Gwa2qSKRl6lmw.json`
- `.omo/run-continuation/ses_188f7100bffen3Ow3xMm63gMia.json`
- `.omo/run-continuation/ses_18924d26dffe3B8k97DBiXeaAH.json`
- `.omo/run-continuation/ses_189487653ffec1mTWASArp5HsW.json`
- `.omo/run-continuation/ses_1894a935bffeWTOUGs4s0XeHF5.json`
- `.omo/run-continuation/ses_18c825990ffeK1zOgogcF8fkr1.json`
- `.omo/run-continuation/ses_18c83f9dcffex674krOrNZkctG.json`

### TASK-7-HARDENING

These changes are in scope as documented Task 7 merge/accessibility/code-quality hardening:

- `src/components/DatePicker/CDatePicker.tsx`: private helper rename `formatDate` -> `toDateString`; direct string comparison replacing locale-style comparison; removed unsupported ARIA/layout role diagnostics; conditional class cleanup.
- `src/components/Modal/CModal.tsx`: width/height widened to `number | string`; focus trap added; comments explicitly state `CWindowTitle` is not used.
- `src/components/Confirm/CConfirm.tsx`: API cleanup to plan names (`confirmText`, `onConfirm`, boolean `onClose`) and test hardening without `as any`.
- `tests/ui/new-components.smoke.spec.ts`: repaired existing TimePicker catalog smoke selectors while adding DatePicker/Modal/Confirm flows. This is merge-hardening because the existing spec had to keep passing alongside new UI flows.

### PRE-EXISTING-WORKTREE-STATE

- `src/components/Window/Window.tsx`: pre-existing branch work for `feature-add-win-7-theme` adding `fullscreen?: boolean`, `isFullscreen()`, and fullscreen suppression of resize handles/resize drags. Not introduced by `add-datepicker-modal-confirm` and not a scope violation.
- `.omo/plans/add-antd-like-components.md`
- `.omo/plans/add-cselect-clist-enhancements.md`
- `.omo/plans/clist-icon-loading.md`
- `.omo/notepads/add-antd-like-components/learnings.md`
- `.omo/notepads/add-cselect-clist-enhancements/decisions.md`
- `.omo/notepads/add-cselect-clist-enhancements/issues.md`
- `.omo/notepads/add-cselect-clist-enhancements/learnings.md`
- `.omo/notepads/add-cselect-clist-enhancements/problems.md`
- `.omo/notepads/clist-icon-loading/decisions.md`
- `.omo/notepads/clist-icon-loading/issues.md`
- `.omo/notepads/clist-icon-loading/learnings.md`
- `.omo/evidence/task-1-placeholder.txt`
- `.omo/evidence/task-2-cicon-regression.txt`
- `.omo/evidence/task-2-clisticon-green.txt`
- `.omo/evidence/task-2-placeholder.txt`
- `.omo/evidence/task-3-cloading-green.txt`
- `.omo/evidence/task-3-cloading-lint.txt`
- `.omo/evidence/task-3-placeholder.txt`
- `.omo/evidence/task-4-placeholder.txt`
- `.omo/evidence/task-5-placeholder.txt`
- `.omo/evidence/task-6-placeholder.txt`
- `.omo/evidence/task-7-placeholder.txt`
- `.omo/evidence/task-8-placeholder.txt`
- `.omo/evidence/task-9-placeholder.txt`
- `.omo/evidence/task-10-validation.txt`

### AUTO-GENERATED / NOT SCOPE CREEP

- `.playwright-mcp/page-2026-04-03T09-14-45-845Z.yml`
- `.playwright-mcp/page-2026-04-04T01-43-41-229Z.yml`
- `.playwright-mcp/page-2026-04-04T01-58-46-692Z.yml`
- `.playwright-mcp/page-2026-04-04T02-10-11-062Z.yml`
- `.playwright-mcp/page-2026-04-04T02-26-40-494Z.yml`
- `.playwright-mcp/page-2026-04-04T02-51-47-681Z.yml`
- `.playwright-mcp/page-2026-04-04T02-55-36-083Z.yml`
- `.playwright-mcp/page-2026-04-04T03-15-07-047Z.yml`
- `.playwright-mcp/page-2026-04-04T16-25-56-061Z.yml`
- `.playwright-mcp/f3-default-confirm.png`
- `.playwright-mcp/f3-default-date-picker.png`
- `.playwright-mcp/f3-default-modal.png`
- `.playwright-mcp/f3-win7-confirm.png`
- `.playwright-mcp/f3-win7-date-picker.png`
- `.playwright-mcp/f3-win7-modal.png`
- `.playwright-mcp/f3-win98-confirm.png`
- `.playwright-mcp/f3-win98-date-picker.png`
- `.playwright-mcp/f3-win98-modal.png`
- `.playwright-mcp/f3-winxp-confirm.png`
- `.playwright-mcp/f3-winxp-date-picker.png`
- `.playwright-mcp/f3-winxp-modal.png`

### OUT-OF-SCOPE

None identified after applying the clarified pre-existing-state and auto-generated-artifact rules.

## Forbidden-token contextual scan

### DatePicker targeted scan

Pattern: `\b(range|rangeStart|rangeEnd|format|locale|time|i18n)\b|isInRange|format\(|locale\.format\(` under `src/components/DatePicker`.

Hits:

1. `src/components/DatePicker/CDatePicker.tsx:49` — `function isInRange(...)`.
   - Context read lines 48-56: comment says `True if target is >= min and <= max`; body compares `minDate`/`maxDate` with `dateCompare`.
   - Classification: LEGITIMATE private helper required for plan-supported `minDate`/`maxDate`; not a range-picker API and no public `range` prop.
2. `src/components/DatePicker/CDatePicker.tsx:166` — `return !isInRange(dateStr, minDate, maxDate);`.
   - Context read lines 156-167: `isCellDisabled` disables cells outside min/max or out-of-month.
   - Classification: LEGITIMATE min/max boundary behavior.
3. `src/components/DatePicker/CDatePicker.tsx:402` — `if (!isInRange(dateStr, minDate, maxDate)) return;`.
   - Context read lines 399-405: click handler ignores invalid/out-of-bounds dates, emits only a single selected date, and closes panel.
   - Classification: LEGITIMATE min/max boundary behavior; not range selection.

No DatePicker `range`, `rangeStart`, `rangeEnd`, `format` prop, `locale` prop, `time` prop, hour/minute UI, `format()` call, `locale.format()` call, or i18n import/use was found.

### Modal targeted scan

Pattern: `CWindowTitle|WindowManager|SystemHost|SYSTEM_TYPE|\bTHEME\b|registry|resolver|i18n` under `src/components/Modal`.

Hits:

1. `src/components/Modal/index.scss:35` — comment: `Title bar layout inside CWindow children (no drag — not a CWindowTitle).`
   - Context read lines 35-41: CSS targets `.cm-modal .cm-window__title-bar`; no `CWindowTitle` import/use.
   - Classification: LEGITIMATE comment proving absence.
2. `src/components/Modal/CModal.tsx:88` — comment: `标题栏（不是 CWindowTitle，因此不会启用拖拽）`.
   - Context read lines 88-124: internal `ModalTitleBar` renders plain `<div className="cm-window__title-bar">` and close button.
   - Classification: LEGITIMATE comment proving absence.
3. `src/components/Modal/CModal.tsx:277` — JSX comment: `不使用 CWindowTitle 以保持非拖拽。`
   - Context read lines 275-285: actual import/use is `<CWindow ... resizable={false}>`; no `CWindowTitle`.
   - Classification: LEGITIMATE comment proving absence.

No Modal `WindowManager`, system host, resolver/registry, i18n, or actual `CWindowTitle` import/use was found.

### Confirm targeted scan

Pattern: `CWindowTitle|WindowManager|SystemHost|SYSTEM_TYPE|\bTHEME\b|registry|resolver|i18n|singleton|single root|overwrite` under `src/components/Confirm`.

Result: no matches. `confirm()` creates a fresh container/root per call (`document.createElement('div')`, `createRoot(container)`), so no singleton overwrite behavior is present.

### Broader source scan hits and classification

Targeted source scan found these non-violation hits outside the new DatePicker/Modal/Confirm feature boundary:

- `src/dev/ComponentCatalog.tsx:1613,1632` — `Selected time: {time}` in existing `TimePickerShowcase`; unrelated to CDatePicker time-picker scope.
- `src/components/TimePicker/CTimePicker.tsx:12,56,87` — existing TimePicker `format` prop and helper; unrelated pre-existing component.
- `src/components/CSlider/CSlider.tsx:89,107,126,137` — `SliderRange` helper parameter names; unrelated existing CSlider component.
- `src/components/Window/Window.tsx:5` — existing Window import of its own `CWindowTitle`; not used by CModal and part of Window implementation/pre-existing branch state.

These are not violations because the forbidden terms require positive presence in the new plan features (DatePicker range/time/format/locale/i18n; Modal/Confirm CWindowTitle/WindowManager/system APIs), not bare-word occurrences in unrelated components.

## CSlider preservation

- `src/index.ts`: `CSlider` is still exported in the named export list at line 20. New additions are additive (`CConfirm`, `CDatePicker`, `CModal`, `confirm`); `export * from './components'` remains at line 1.
- `src/components/index.ts`: `export * from './CSlider'` remains at line 10. New component barrels are additive (`./Confirm`, `./DatePicker`, `./Modal`).
- `src/dev/ComponentCatalog.tsx`: `CSlider` import remains at line 22; `SliderShowcase()` remains at line 703; `catalog-section-slider` remains at line 707; `<SliderShowcase />` remains rendered at line 1997. New DatePicker/Modal/Confirm showcases are appended later and do not replace Slider.

## Public API/barrel changes

- `src/components/index.ts` only adds `export * from './Confirm'`, `export * from './DatePicker'`, and `export * from './Modal'`; no deletions in the diff.
- `src/index.ts` preserves `export * from './components'` and adds named runtime exports `CConfirm`, `CDatePicker`, `CModal`, and `confirm`; no deletions in the diff.
- Component-local barrels export the new component modules only: `Confirm`, `DatePicker`, `Modal`.

## Dependency check

`git diff -- package.json yarn.lock` produced no output. No package dependency or lockfile change is present.

## Final decision

APPROVE: no out-of-scope implementation introduced by `add-datepicker-modal-confirm`; all contextual forbidden-token hits are legitimate or unrelated; CSlider preservation is verified; public exports are additive; no new npm dependencies were added.
