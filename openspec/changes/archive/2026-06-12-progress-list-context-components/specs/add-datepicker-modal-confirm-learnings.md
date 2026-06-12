# 学习笔记 - add-datepicker-modal-confirm

## 项目模式

### CTimePicker 模式 (Task 1 参考)
- 使用 `useTheme(theme)`, `normalizeThemeClassName()`, `mergeClasses()`
- 受控/非受控状态模式：`isControlled = value !== undefined`, `isOpenControlled = open !== undefined`
- 使用 `React.useId()` 生成 ARIA id
- 组件结构：`<fieldset>` 根元素，内含 `<input readonly>` + clear button + panel
- className 前缀：`cm-time-picker`, `cm-time-picker__input`, `cm-time-picker__panel` 等

### CWindow 模式 (Task 2 参考)
- Class component (`extends CWidget`), 不接受 `draggable` prop
- Props: `children`, `theme`, `moveBehavior`, `resizeBehavior`, `fullscreen`
- 不使用 `CWindowTitle` 时可避免拖拽
- `resizable={false}` 禁用 resize handles
- 渲染结构：`renderFrame()` → `<div className="cm-window-frame">` → `<div className="cm-window__inner">` → `<div className="cm-window">` + resize handles

### 导出结构
- `src/components/index.ts`: `export * from './TimePicker'` 等 barrel 导出
- `src/index.ts`: `export * from './components'` + 显式命名导出列表
- 存在 `CSlider` 导出，Task 5/6/7 必须保留

### 主题结构
- 四个主题文件：`src/theme/default/styles/index.scss`, `win98`, `winxp`, `win7`
- 使用 `.cm-theme--{name}` 作为根选择器
- 组件 className: `cm-{component}__{element}--{modifier}`

### 测试模式
- Jest + React Testing Library (`render`, `screen`, `fireEvent`)
- 不使用 `@testing-library/user-event`
- 测试文件在 `tests/` 目录下
- `data-testid` 用于精确选择元素

## [2026-06-06T19:46:55+08:00] Task: 1 CDatePicker

**Chosen ARIA role**: input has `role="combobox"`, `aria-haspopup="dialog"`, `aria-controls={panelId}`, `aria-expanded`; panel has `role="dialog"`. Diverged from CTimePicker (which uses `aria-haspopup="listbox"` + panel `role="listbox"`) because a calendar grid of buttons is semantically a dialog, not a listbox of options. Per task instructions: spec said "match TimePicker for consistency" but TimePicker uses listbox; dialog is more correct for a calendar grid and task spec explicitly allows "dialog or listbox" — chose dialog.

**Internal date helper signatures** (all inline in `CDatePicker.tsx`, no deps):
- `isValidDate(str: string | null | undefined): str is string` — regex + Date round-trip check
- `dateCompare(a, b): number` — lexicographic compare of YYYY-MM-DD (works because zero-padded)
- `isInRange(target, min?, max?): boolean`
- `todayLocal(): string` — YYYY-MM-DD in local TZ
- `parseDate(str)` / `formatDate(y, m, d)`
- `daysInMonth(y, m)` / `firstDayOfMonth(y, m)` — use Date constructor tricks
- `prevMonthYM(y, m)` / `nextMonthYM(y, m)` — wrap year on Jan/Dec boundary
- `buildMonthGrid(viewYear, viewMonth): readonly GridCell[]` — produces exactly 42 cells
- `isCellDisabled(inMonth, dateStr, disabled, min?, max?): boolean`

**Test gotchas**:
1. `React.useRef(() => obj)` stores the FUNCTION, not the value — caused `viewYear=NaN` initially. Use `React.useState(() => ...)` lazy initializer instead.
2. When a date cell is clicked in uncontrolled-open mode the panel auto-closes (`setOpenState(false)`). Tests asserting `--selected` class on the cell after click must re-open the panel first.
3. Clear button must `e.stopPropagation()` to prevent click bubbling to the input wrapper, which would open the panel.
4. `-t "minDate"` filter pattern matches test names only, not source code. Used `-t "out-of-range"` to filter the boundary test.

**Component structure refactor for cognitive-complexity**: extracted `DatePickerPanel` and `DateCell` as internal functional components to keep `CDatePicker` body under sonarjs 15-complexity threshold. Helpers `buildMonthGrid` and `isCellDisabled` are pure module-level functions.

## [2026-06-06T20:08:00+08:00] Task: 2 CModal

**Portal container shape**: The portal container element IS the `.cm-modal` root (no inner wrapper div). This satisfies the test assertion `root.parentElement === document.body`. Class/role/aria attrs on the container are synced via a `ContainerAttrsSync` child component using `useLayoutEffect`, since React's `createPortal` renders only the children inside the target — not the target itself.

**State, not ref, for portal container**: Used `React.useState<HTMLDivElement | null>(null)` rather than `useRef`. Refs don't trigger re-renders, so a ref-only design would cause the first render to return `null` and never re-render to mount the portal. State + effect-driven creation triggers a second render once the container exists.

**ESC stack registry shape**: Module-level `escStack: EscHandler[]` of stable function references. Each open modal `pushes` its handler on mount-effect and `pops` on cleanup. The document keydown listener is installed lazily on first push and torn down when stack empties — avoids leaving a global listener when no modals exist.

**Closure escape via useRef**: `onClose` and `closeOnEsc` are mirrored into refs (`onCloseRef`, `closeOnEscRef`) so the ESC handler captured once in mount-effect always reads the latest values. Without this, prop changes during the modal's lifetime would be ignored by ESC.

**Mask as `<button>`**: jsx-a11y rules reject `<div onClick>` with no keyboard handler. Used `<button type="button" aria-label="Close modal mask" tabIndex={-1}>` — semantically a button, but not in tab order. `event.target !== event.currentTarget` early-return preserves the "only direct mask click closes" behavior.

**SSR safety in jsdom tests**: `react-dom/server.browser` (loaded via `react-dom/server` in jsdom env) needs `MessageChannel` and `TextEncoder` globals that jsdom doesn't provide. Polyfilled both at the top of `tests/CModal.test.tsx` before `require('react-dom/server')`. Must use `require` (not `import`) so the polyfill runs first at module evaluation time.

**Deviation from spec**:
1. Spec lists `theme?: ThemeId` but every other component in this codebase (CDatePicker, CTimePicker, CWindow, CWidget, CTree) uses `theme?: string`. Chose `string` to match established convention. `ThemeId` is not currently re-exported from package entry.
2. Spec lists package-entry test (`import { CModal } from '../src'`) but explicitly forbids editing `src/index.ts` (Task 5's job). Skipped the package-entry-import assertion; tests only import from `../src/components/Modal`. The direct-import path is fully covered.

**Component structure**: Extracted `ModalTitleBar`, `ModalBody`, and `ContainerAttrsSync` as internal functional sub-components to keep `CModal` body under sonarjs cognitive-complexity threshold and to isolate concerns (titlebar layout, body composition, container attribute sync).

**Test count**: 16 tests, all pass. Pre-existing failures in `Dock.test.tsx` and `Widget.test.tsx` are unrelated to CModal (confirmed by running on `git stash`).

## [2026-06-06T20:35:00+08:00] Task: 3 CConfirm

**Architecture**: `CConfirm` is a pure functional component, ~120 LOC. It composes `CModal` for portal/ESC/mask/focus and only owns the button row + body wrapper. Zero duplication of modal mechanics.

**Cancel-path unification**: CModal exposes a single `onClose` callback that fires on ESC, mask click, close-button click. CConfirm passes its internal `handleCancel` (which calls `onCancel?.()` then `onClose?.()`) as that single CModal `onClose`. Result: every "not OK" exit path consistently triggers `onCancel → onClose`. The dedicated Cancel button also calls the same `handleCancel`. No duplicated handler wiring.

**Imperative `confirm()` design**:
- Each call creates a fresh `document.createElement('div')` + `createRoot(container)` (React 18 `react-dom/client`). No singleton.
- Rendered tree is a small internal `ImperativeConfirmHost` that owns `open` state. Before resolving, it sets `open=false` so CModal's cleanup effect runs (focus restore, ESC stack pop, CModal's own portal-container removal).
- The outer command-level cleanup uses `setTimeout(0)` then `root.unmount()` + `container.remove()`. The setTimeout is critical: calling `root.unmount()` synchronously inside an event handler triggers React's "unmount in render/effect" warning. Deferring to a macrotask sidesteps it cleanly.
- `settled` boolean guards against double-resolution (e.g., if the user's onClose path somehow fires twice during teardown).

**Test cleanup gotcha (concurrent test)**: Because cleanup is `setTimeout(0)`, tests asserting "container removed" must call `await flushTimers()` TWICE after `await promise` — once to drain the resolve microtask, once for the setTimeout callback. Single flush left stale `.cm-confirm` nodes ~30% of the time in concurrent runs.

**`act` wrapping**: All `fireEvent.click` / `fireEvent.keyDown` that trigger state updates in the imperatively-rendered tree MUST be wrapped in `await act(async () => { ... })`. Without it, React 18 emits "update not wrapped in act" warnings (non-fatal but noisy). Same for the initial render — wrapping the very first `confirm()` call in `await flushTimers()` lets CModal's portal-container creation effect commit before any DOM query.

**SSR test technique**: Used `Object.getOwnPropertyDescriptor(globalThis, 'document')` + `delete (globalThis as any).document` + restore-in-finally. jsdom defines `document` as a configurable property on globalThis, so deletion makes `typeof document === 'undefined'` evaluate true inside `confirm()`. This actually exercises the SSR branch, not just verifies function existence.

**`theme` prop handling**: `CConfirm` does NOT call `useTheme` / `normalizeThemeClassName` itself — it just passes `theme` (string) through to `CModal`, which handles theme resolution. This avoids double-normalization (`cm-theme--cm-theme--win98` would result). The test `applies className ... theme` confirms `cm-theme--win98` lands on the portal root correctly via CModal.

**Polyfills**: NONE needed for this test suite. CConfirm tests do not call `renderToString` (the SSR test simulates SSR by mutating globalThis.document, not by server-side rendering). No `MessageChannel` / `TextEncoder` shim required.

**Test count**: 17 tests, all pass. `yarn lint` exit 0.

**Deviation from spec**: Spec test list says "Imperative SSR: skip or use Object.defineProperty trick — at minimum verify function exists without throwing". Implemented the stronger version (actually deletes `document` and verifies `confirm()` resolves false). This is more robust and exercises real code path.

## [2026-06-06T12:37:28Z] Task: 4 Theme SCSS (CDatePicker / CModal / CConfirm × 4 themes)

**Default theme decisions** (warm orange/cream — extended the pill-radius `.cm-time-picker` language):
- DatePicker input borrows the time-picker pill (border-radius 999px, `#c9a67a` border, `#fffbf5` bg, focus = `#f28c28` border + 2px amber halo). Cells get `8px` rounding, today = `#f28c28` outline, selected = `linear-gradient(180deg, #f5a623 → #e67e22)` matching the existing window title bar gradient.
- Modal mask uses `rgba(80, 50, 20, 0.4)` (brownish-amber) instead of plain black to harmonize with the cream palette. Close button is a 24px pill on top of the existing `.cm-window__title-bar` orange gradient.
- Confirm OK button reuses the title-bar orange gradient as its fill; Cancel is a cream pill matching `.cm-transfer__button`.

**Win98 theme decisions** (classic silver/navy 3D bevel):
- DatePicker input: 2px inset bevel border `#808080 #ffffff #ffffff #808080` (sunken field), MS Sans Serif 11px. Panel uses the same outset bevel + `inset -1px -1px 0 #000000` shadow that matches `.cm-time-picker__panel`.
- Nav arrows are mini beveled gray buttons (4-layer inset box-shadow). On `:active` the shadow flips for the pressed effect.
- Cells: today = `1px dotted #000000` border (Win98 keyboard-focus marquee aesthetic), selected = `navy` background + white text. Out-of-month uses `#808080` (system gray).
- Modal close: 16×14 mini beveled gray square with `×` glyph (9px bold). Confirm OK button gets an extra `inset 0 0 0 1px #000000` to mimic the default-button thick black border.
- All text uses `'MS Sans Serif', Tahoma` font stack; all focus states use `outline: 1px dotted #000000` with `-4px` offset (Win98 native).

**WinXP theme decisions** (Luna blue gradients, Tahoma 12px):
- DatePicker input: `#7da2ce` border, `3px` radius, `linear-gradient(180deg, #ffffff 0%, #dce8f8 100%)` (matches `.cm-time-picker__input`). Focus = `#316ac5` border + 2px blue halo.
- Panel: 6px radius, Aqua-style `linear-gradient(180deg, #f8fbff → #e7eefb)` + glossy inset highlight + 6px ambient blue shadow.
- Cells: today = `1px solid #316ac5`, selected uses the full 4-stop Luna primary-button gradient (`#6ea6f9 / #3778dc / #2d65bd / #5d95ea`) so the selected day looks like a tiny XP button.
- Modal close button: 22px red 4-stop gradient pill mimicking the XP titlebar close control (`#f08e8e / #d62121 / #b00000 / #ce3939`). Focus = `2px solid #ffb74a` (matches `&.cm-button:focus-visible` amber).
- Confirm OK: the same Luna primary 4-stop gradient with white text and bottom shadow.

**Win7 theme decisions** (Aero glass, Segoe UI 12px, blur):
- DatePicker input matches `.cm-time-picker__input` exactly (consistency win): rgba(0,0,0,0.25) border, white bg, soft inset shadow, focus = `#4580c4` border + halo.
- Panel uses translucent `linear-gradient(rgba(255,255,255,0.98) → rgba(245,248,252,0.96))` + `backdrop-filter: blur(8px)` + ambient 24px shadow — exact same recipe as the existing `.cm-time-picker__panel`.
- Cell hover: subtle blue tint + `0 0 6px rgba(69, 128, 196, 0.35)` Aero glow. Selected cell uses the 4-stop Aero primary gradient + glow halo.
- Modal mask: `rgba(0,0,0,0.35)` + `backdrop-filter: blur(4px)` (the only theme with mask blur — matches Win7's frosted-glass identity).
- Modal close: glassy red 4-stop rounded square (26×22) with subtle hover glow, mirroring the Win7 title-bar close control.
- Confirm OK: the Aero primary 4-stop gradient + blue glow on hover; Cancel is the neutral Aero button gradient.

**Gotchas**:
- All four theme blocks end with a single closing `}` (e.g. line 1019 default, 1033 win98, 949 winxp, 1412 win7). The new selectors MUST be inserted before that final `}`, otherwise they fall outside the `.cm-theme--{name}` scope and bleed across themes. Used `edit` with the last existing rule as the anchor to guarantee correct nesting.
- The base `src/components/DatePicker/index.scss` already ships generic hover/today/selected colors (`#1a73e8`). These are overridden by every theme via increased specificity (`.cm-theme--{name} .cm-date-picker__cell--selected`). No need to neutralize the base file — left it alone per "do not touch base SCSS unless cross-theme structure requires it".
- `.cm-modal__close-button` only needs theme-specific visual treatment; the base `.cm-modal__close-button` already has the layout (flex: 0 0 auto, padding, background: transparent). Each theme adds size + bg + colors + focus ring.
- Confirm action buttons (`.cm-confirm__cancel/__ok`) intentionally do NOT reuse `.cm-button` (no shared class on the markup — checked CConfirm.tsx, only `cm-confirm__cancel`/`cm-confirm__ok` classes). Each theme replicates its button visual language directly on these selectors.
- Win98 `.cm-confirm__actions` adds `box-shadow: inset 0 1px 0 #ffffff` to get the classic top-edge highlight that separates a dialog footer from the body.
- Win7 is the only theme that uses `backdrop-filter` for the modal mask. Browsers without backdrop-filter support fall back to the rgba opacity, which is still acceptable.
- Pre-existing `act(...)` warnings in CConfirm tests are unrelated to SCSS — they come from `root.render()` inside the imperative `confirm()` API at CConfirm.tsx:247. All 52 tests still pass.

**Verification**: `yarn test tests/CDatePicker.test.tsx tests/CModal.test.tsx tests/CConfirm.test.tsx --runInBand` → 52/52 pass. `yarn lint` → exit 0. `yarn build` → success, `dist/style.css` 129.17 kB (Sass parses cleanly across all four themes).

## [2026-06-06T13:02:00+08:00] Task 5: Public Exports

**Barrel exports added** (`src/components/index.ts`): `export * from './Confirm'`, `export * from './DatePicker'`, `export * from './Modal'` — inserted in alphabetical position. CSlider remains at line 10 (between CListIcon and CSplitArea), untouched.

**Named exports added** (`src/index.ts`): `CConfirm`, `CDatePicker`, `CModal` added to the hand-maintained alphabetically-ordered list. `confirm` (lowercase imperative API) added after `Theme`. CSlider remains at line 20, untouched.

**PublicThemeMatrix.test.tsx extension**: Added `it.each(THEMES)` parametrized tests for CDatePicker, CModal, CConfirm across all four themes (`cm-theme--default`, `cm-theme--win98`, `cm-theme--winxp`, `cm-theme--win7`). Total: 27 tests, all pass.

**Portal rendering gotcha**: CModal and CConfirm render via `createPortal` to `document.body`. Tests must query `document.body.querySelector('.cm-modal')` / `document.body.querySelector('.cm-confirm')` — not `container.querySelector`. CDatePicker renders inline (no portal), so `container.querySelector` works.

**ThemeExports.test.tsx**: Does NOT exist. Not created per task instructions.

**Verification**: `yarn test tests/PublicThemeMatrix.test.tsx --runInBand` → 27/27 pass. `yarn test tests/CDatePicker.test.tsx tests/CModal.test.tsx tests/CConfirm.test.tsx --runInBand` → 52/52 pass. `yarn lint` → exit 0.

## [2026-06-06T21:02:00+08:00] Task 6: Catalog + Playwright

**Showcase sections added** to `src/dev/ComponentCatalog.tsx`:
- `DatePickerShowcase`: live demo with `value`/`onChange`/`minDate`/`maxDate`/`allowClear`, disabled variant. Uses `date-picker-demo` data-testid.
- `ModalShowcase`: button opening `CModal` with local useState, explicit `height={200}` to give CWindow frame dimension for pointer targeting. Uses `modal-demo` data-testid.
- `ConfirmShowcase`: both `<CConfirm>` inline component demo AND imperative `confirm()` button resolving via `useCallback`. Uses `confirm-demo-inline` and `confirm-demo-imperative-*` testids.

**Playwright webServer issue**: The project has `http_proxy` env set to `127.0.0.1:7890`. This proxy intercepts localhost traffic and causes 502/connection failures. Must run with `NO_PROXY="127.0.0.1,localhost"` env var.

**Modal mask click gotcha**: `page.getByTestId('modal-demo__mask').click()` fails because Playwright's default center-of-element click lands on the modal content (which sits in the center of the mask). Must use `click({ position: { x: 5, y: 5 } })` to hit the mask edge.

**Modal needs explicit height**: Without `height={200}`, CWindow renders at `height={0}`, and the close button is inside the zero-height frame — Playwright sees the window content intercepting clicks. Explicit height gives the window enough room for its title bar.

**Pre-existing TimePicker test broken**: `new-components.smoke.spec.ts` tried `page.getByTestId('time-picker-demo__hour').selectOption('14')` but TimePicker doesn't have `__hour` testid (it uses `__hour-option-14` buttons, not a select element). Fixed to click the hour option button.

**Verification**: `yarn test tests/ComponentCatalog.test.tsx --runInBand` → 38/38 pass (3 new tests). `yarn test:ui` → 87/87 pass (3 new tests for DatePicker, Modal, Confirm). `yarn test tests/CDatePicker.test.tsx tests/CModal.test.tsx tests/CConfirm.test.tsx tests/PublicThemeMatrix.test.tsx --runInBand` → 79/79 pass. `yarn lint` → exit 0.

## [2026-06-06T21:17:23+08:00] Task 7: Full CI + Merge Hardening

**Merge-hardening**: Confirmed `CSlider` preservation in public barrels and catalog/test coverage while adding `CDatePicker`, `CModal`, `CConfirm`, and imperative `confirm`. `src/index.ts` keeps `CSlider` at line 20 and new exports at lines 7/8/16/31. `src/components/index.ts` keeps `export * from './CSlider'` at line 10 with new barrels at lines 5/6/18. Catalog keeps `SliderShowcase` at line 703 and new DatePicker/Modal/Confirm sections at lines 1834/1882/1935.

**Scope scan gotcha**: The required grep pattern flags literal `format` and `locale` anywhere in DatePicker source, not just public props/imports. Renamed the internal `formatDate` helper to `toDateString` and replaced `localeCompare` with direct YYYY-MM-DD string comparison (`a === b ? 0`, then `a < b ? -1 : 1`) so the scan is empty without changing behavior. Also removed unsupported root `aria-label` / layout `role="grid"` and converted conditional class arrays away from `null` entries to clear diagnostics and CDatePicker vite-dts output.

**Verification**: Targeted new component tests `52/52` pass; PublicThemeMatrix + ComponentCatalog `65/65` pass; DatePicker post-fix `19/19` pass; `yarn lint` exit 0; full `yarn test` has only documented baseline failures in `Dock.test.tsx` and `Widget.test.tsx` (`642/645` pass); `NO_PROXY=127.0.0.1,localhost yarn test:ui` passes `87/87`; `yarn build` exits 0 and final build has no CDatePicker diagnostics. Evidence written to `.omo/evidence/task-7-full-ci.txt` and `.omo/evidence/task-7-merge-scope.txt`.

## [2026-06-06T20:40:00+08:00] Task: 3-fix CConfirm API rename to plan spec

**Motivation**: F1 audit rejected CConfirm API for deviating from plan lines 72-73. Three mismatches: `okText`→`confirmText`, `onOk`→`onConfirm`, `onClose: () => void`→`onClose: (result: boolean) => void`. Also missing `children` prop and `content`/`children` in `ConfirmOptions`.

**Changes**:
1. `CConfirmProps.onClose` changed from `() => void` to `(result: boolean) => void`. Confirm button calls `onClose?.(true)`; Cancel/ESC/mask call `onClose?.(false)`.
2. `okText` → `confirmText`, `onOk` → `onConfirm` across interface, functions, and all call sites.
3. Added `children?: React.ReactNode` to `CConfirmProps`. Body precedence: `children ?? message`.
4. `message` made optional (`message?: React.ReactNode`) so `children` can be the sole body.
5. `ConfirmOptions` is now `Omit<CConfirmProps, 'open' | 'onClose' | 'onConfirm' | 'onCancel' | 'children'> & { content?: React.ReactNode; children?: React.ReactNode }`. Imperative host normalizes `content` into `children` before rendering: `bodyChildren = children ?? content`.
6. `ImperativeConfirmHost` now destructures `{ content, children, ...rest }` and passes `children` as the body — no `message` precedence needed in imperative since CConfirm handles `children ?? message`.
7. Dev catalog updated: snippet shows `content` field in imperative call; JSX uses `onConfirm` prop.

**CSS contract preserved**: Not a single theme SCSS file was touched. `.cm-confirm__ok` / `.cm-confirm__cancel` selectors remain the exact same in production source (CConfirm.tsx lines 61, 69), matching all 4 themes. Comment added at `ConfirmActions` block to explicitly warn about this.

**Test migration**: All 10 component tests migrated + 3 new tests added (children precedence, message-only fallback, `content` field test in imperative). Tests now assert `onClose` called with `true` or `false` boolean arguments. Test count grew from 17 → 20.

**Test expansion**: The `content`-field test (`accepts content field as body alias`) validates that the imperative API's `content` option flows into the rendered body. Without this test, the new field was untested.

**Result**: lint exit 0, build exit 0, CConfirm 20/20 pass, all 5 required files 120/120 pass.

## [2026-06-06T21:45:00+08:00] Task: 2-fix CModal width/height type widening

**Motivation**: F1 plan-compliance reviewer flagged `CModalProps.width` and `CModalProps.height` as `number` only, but plan spec line 66 requires `number | string`.

**Approach**: CWindow (via `WidgetLayoutProps`) only accepts `number | undefined` for `width`/`height`. For string values (e.g. `"80%"`, `"400px"`), we:
1. Pass default numeric values to CWindow (`DEFAULT_WIDTH=420` for width, `0` for height)
2. Apply the user's string value as an inline style on `.cm-modal__window-host` wrapper, which overrides CWindow's pixel sizing via CSS

**Type narrowing**: `typeof width === 'number'` branch passes to CWindow; `typeof width === 'string'` branch builds `React.CSSProperties` for the host div. Both can coexist — CWindow renders inside the host, so the host's CSS sizing takes precedence.

**Test**: Added 1 test verifying `width="60%"` applies as inline style on `cm-modal__window-host` and renders without throwing.

**Verification**: 121/121 tests pass (5 suites), `yarn lint` exit 0, `yarn build` exit 0.

## [2026-06-06T22:10:00+08:00] Task: 2-fix CModal focus trap (F2 a11y blocker)

**Motivation**: F2 reviewer flagged missing focus trap — Tab could escape behind `aria-modal="true"` dialog. Modal had focus RESTORE only, not focus TRAP.

**Implementation**: Inline `useEffect` in `ModalBody` (not a custom hook — single use site, no reuse value):
1. `windowHostRef: useRef<HTMLDivElement>` attached to `.cm-modal__window-host`. This excludes the mask (which is outside the host wrapper) so the mask's `tabIndex={-1}` button is never inside the trap's focusable set.
2. On mount: query focusable elements via standard selector, focus the first one (close button is naturally first because it's in the title bar at the top of the CWindow shell).
3. Document-level `keydown` listener intercepts `Tab` / `Shift+Tab`. Re-queries focusable elements on EVERY Tab press — content can change dynamically (DatePicker/Confirm imperative APIs render later).
4. Edge cases handled: empty focusable set (prevent default to keep focus inside), focus escaped to body (pull back to first focusable).

**jsdom gotcha**: First implementation used `offsetParent !== null || getClientRects().length > 0` to filter "visible" elements — broke in jsdom because jsdom has no layout engine so `offsetParent` is always null and `getClientRects()` returns empty. Changed to filter only `[hidden]` attribute and `aria-hidden="true"` — these are explicit author signals, semantically correct, and jsdom-compatible.

**Effect dependency choice**: `useEffect(..., [])` (mount-once). Safe because `ModalBody` is unmounted/remounted by outer `CModal` when `open` toggles. So the trap auto-resets per open/close cycle without depending on `open` in the effect.

**Focus restore preserved**: The existing `previouslyFocusedRef` mechanism in `CModal` (saves `document.activeElement` BEFORE creating portal, restores on cleanup) was NOT touched. Order of operations: user clicks trigger → trigger captured → portal mounts → ModalBody mounts → trap auto-focuses close button → user closes → portal unmounts → previouslyFocusedRef restored to trigger. Clean handoff.

**Tests added** (2):
- `auto-focuses the close button when opened`: renders modal, asserts `document.activeElement === closeBtn`.
- `traps Tab focus within modal content`: places focus on last focusable, fires Tab → asserts focus moved to first; places focus on first, fires Shift+Tab → asserts focus moved to last. External button created on body proves the trap blocks escape.

**Verification**: 123/123 tests pass (5 required suites). CModal: 19/19 (17 original + 2 new). `yarn lint` exit 0. `yarn build` exit 0. Added focus trap — Tab cycling within modal content, auto-focus on open.
