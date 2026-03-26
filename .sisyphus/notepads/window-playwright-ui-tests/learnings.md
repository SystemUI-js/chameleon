# Task 1 & 7 Exploration Findings

## package.json Scripts (Existing Conventions)

- Script naming: simple imperative verbs (dev, build, preview, lint, lint:fix, format, test, test:watch)
- No browser-test tooling currently exists
- Jest is the only test runner (no Playwright dependency)

## vite.config.ts Dev Server

- Port: 5673 (matches plan requirement)
- Host: 0.0.0.0 (exposed to network)

## .gitignore Status

- test-results/ - ALREADY IGNORED (line 151)
- playwright-report/ - ALREADY IGNORED (line 152)
- No additional ignore entries needed

## GitHub CI 工作流顺序（文件：`.github/workflows/ci-pr.yml`）

Current job sequence:

1. Install dependencies
2. Run lint
3. Run unit tests (yarn test)
4. Build (yarn build)
5. Verify npm pack (dry-run)

## Implementation Constraints for Task 1 & 7

- Must preserve existing script names: dev, test, build
- Must insert Playwright UI test step AFTER unit tests and BEFORE build
- Vite port 5673 must remain unchanged
- test-results/ and playwright-report/ already handled in .gitignore
- No existing browser-test tooling to reuse

## Task 1 Implementation Notes

- `package.json` now adds `@playwright/test` plus `test:ui` / `test:ui:headed` using the existing colon-based script naming style.
- `playwright.config.ts` is Chromium-only, uses `tests/ui`, `http://127.0.0.1:5673`, and starts the app with `yarn dev`.
- Failure artifacts are configured with Playwright-native settings: `trace: retain-on-failure`, `screenshot: only-on-failure`, `video: retain-on-failure`; HTML report remains enabled with `open: 'never'` for later failure inspection.
- Empty-suite tolerance is available through the scripts via `--pass-with-no-tests`; Playwright does not accept that behavior as a config-file property in the installed version.
- Retry evidence on Playwright 1.58.2 confirmed the split: CLI exposes `--pass-with-no-tests` (`node_modules/playwright/lib/program.js`), but `node_modules/playwright/types/test.d.ts` contains no `passWithNoTests` config property, so `playwright.config.ts` cannot make the bare `npx playwright test --config=playwright.config.ts --list` succeed when `tests/ui` is empty.

---

## Task 2-6 Research: Playwright Drag/Resize + Vite Multi-Entry

### Playwright Deterministic Drag Interactions

**Source**: [Playwright Actions Documentation](https://playwright.dev/docs/input)

#### High-Level API: `locator.dragTo()`

```typescript
await page.locator('#item-to-be-dragged').dragTo(page.locator('#item-to-drop-at'));
```

- Auto-handles: hover, mouse.down, move to target, mouse.up
- Limitation: May not trigger `dragover` event reliably in all browsers

#### Manual Drag (Recommended for Deterministic Tests)

```typescript
// Hover the drag source
await page.locator('#item-to-be-dragged').hover();
await page.mouse.down();

// Move to drop target (first hover)
await page.locator('#item-to-drop-at').hover();

// CRITICAL: Second hover/move required to trigger dragover in all browsers
await page.locator('#item-to-drop-at').hover();
await page.mouse.up();
```

**Key insight**: The official docs explicitly state: "If your page relies on the `dragover` event being dispatched, you need at least two mouse moves to trigger it in all browsers."

#### Incremental Drag (Window Resize Pattern)

For window resize with fixed increments:

```typescript
const handle = page.locator('[data-testid="resize-handle"]');
const box = await handle.boundingBox();

// Move to handle center
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();

// Deterministic increments: move in steps
const stepX = 10; // fixed pixel increment
for (let i = 0; i < 5; i++) {
  await page.mouse.move(box.x + box.width / 2 + stepX * (i + 1), box.y + box.height / 2);
}
await page.mouse.up();
```

### Locator.boundingBox() Caveats

**Source**: [Playwright Locator API - boundingBox](https://playwright.dev/docs/api/class-locator#locator-bounding-box)

```typescript
const box = await page.getByRole('button').boundingBox();
// Returns: { x, y, width, height } in viewport CSS pixels
// Returns null if element is not visible
```

**Important caveats**:

1. **Scrolling affects coordinates**: `x` and/or `y` may be negative after scroll
2. **Static page assumption**: "Assuming the page is static, it is safe to use bounding box coordinates to perform input"
3. **No auto-wait**: Unlike actions, `boundingBox()` does NOT wait for actionability
4. **Race condition risk**: Element may move between `boundingBox()` call and `mouse.move()` - always re-fetch bounding box if page content updates

### Deterministic Waiting Guidance

**DO**:

- Use Playwright's auto-waiting actions (click, hover, dragTo)
- Use `expect(locator).toHaveCount()` for list assertions
- Use `expect(locator).toBeVisible()` for visibility checks

**DO NOT**:

- Use `waitForTimeout()` or arbitrary sleeps
- Use screenshot diffs for geometry verification (primary approach)
- Assume boundingBox is stable across page mutations

### Vite Dev Server Multi-Entry Behavior

**Source**: [Vite Multi-Page App Documentation](https://vite.dev/guide/build.html#multi-page-app)

#### Directory Structure Pattern

```text
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

#### Dev Server Behavior (Critical)

> "During dev, simply navigate or link to `/nested/` - it works as expected, just like for a normal static file server."

**Key insight**: Vite dev server automatically serves any `.html` file in the project root (or subdirectories) without explicit configuration. The URL path corresponds to the file path:

- `index.html` → `/`
- `playwright-window.html` → `/playwright-window.html`
- `nested/index.html` → `/nested/`

#### Build Configuration (for reference)

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        nested: resolve(import.meta.dirname, 'nested/index.html'),
      },
    },
  },
});
```

#### Implication for playwright-window.html

- Place `playwright-window.html` at project root
- Access via `http://localhost:5673/playwright-window.html`
- No vite.config changes needed for dev server

### Implementation Recommendations

1. **Drag helper**: Use manual hover→down→hover→hover→up sequence for dragover reliability
2. **Resize helper**: Use boundingBox + incremental mouse.move() with fixed step values
3. **Vite entry**: Place `playwright-window.html` at root, access via `/playwright-window.html`
4. **No waits**: Rely on Playwright's built-in auto-waiting, not explicit sleeps
5. **Geometry assertions**: Use DOM-based checks (getAttribute, getComputedStyle, data-testid markers) not screenshots

## Task 2 Completion Notes

- Added root entry `playwright-window.html` so Vite can serve a dedicated harness page without reusing the theme-switcher dev surface.
- Added `src/dev/playwright/windowHarness.tsx` to render exactly one `CWindow` fixture per request, selected by the `fixture` query param.
- Valid fixtures mirror the local jsdom contracts: `default` `(10,20,240,160)`, `drag-only` `(12,24,200,120,resizable=false)`, `min-clamp` `(30,30,40,30)`, and `max-clamp` `(50,60,120,100)` with min/max resize options `{20,30,150,110}`.
- Unknown fixtures fail loudly with `[data-testid="fixture-error"]` and include the requested fixture name in the text content.
- Harness reuses existing selectors from `CWindow` / `CWindowTitle`, so later Playwright helpers can assert `window-frame`, `window-title`, `window-content`, and `window-resize-{dir}` directly.

Task 2 (Window harness) added a deterministic Playwright harness for the Window component:

- Added root HTML entry: playwright-window.html at project root to load the harness.
- Implemented React harness: src/dev/playwright/windowHarness.tsx renders exactly one Window fixture per URL fixture query.
- Fixtures supported via ?fixture=default|drag-only|min-clamp|max-clamp with exact geometries:
  - default: x=10, y=20, width=240, height=160
  - drag-only: x=12, y=24, width=200, height=120, resizable=false
  - min-clamp: x=30, y=30, width=40, height=30
  - max-clamp: x=50, y=60, width=120, height=100 with resizeOptions min/max from plan
- Unknown fixture renders a [data-testid="fixture-error"] element including the fixture name.
- Harness uses existing Window components to avoid internal changes and keeps a single window per page.

## 2026-03-19 Task 3

- `tests/ui/window.helpers.ts` centralizes the browser helpers that later Window specs should reuse: `gotoWindowFixture(page, fixture)`, `readFrameMetrics(page)`, and `dragLocatorBy(locator, dx, dy)`.
- Fixture navigation must keep the verified `/playwright-window.html` path and wait for either a real Window surface (`window-frame` paired with existing selectors) or `[data-testid="fixture-error"]` so unknown fixtures fail loudly instead of timing out on missing handles.
- Frame geometry should be read from the `window-frame` inline style source (`left`, `top`, `width`, `height`) and parsed as numbers, matching the existing jsdom helper contract.
- Deterministic pointer drag works reliably by using the locator bounding-box center plus `page.mouse.move(..., { steps })`, with no `waitForTimeout()` or screenshot-based geometry assertions.
- Adding `tests/ui/window.smoke.spec.ts` with `default fixture exposes baseline metrics` and `unknown fixture shows explicit error` makes bare `npx playwright test --config=playwright.config.ts --list` succeed again by giving Playwright a non-empty suite.

## 2026-03-19 Task 3 follow-up regression fix

- The minimal Jest/Playwright coexistence fix is to keep `roots: ['<rootDir>/tests']` unchanged and add `<rootDir>/tests/ui/` to `testPathIgnorePatterns` in `jest.config.ts`.
- This keeps Jest discovery away from Playwright specs under `tests/ui/**` without moving files or changing Playwright's `testDir: 'tests/ui'` setup.
- Verified after the config-only fix: `yarn test --runInBand` passed with 8/8 Jest suites, `npx playwright test tests/ui/window.smoke.spec.ts --project=chromium` passed with 2/2 tests, bare `npx playwright test --config=playwright.config.ts --list` still listed the smoke tests, `npx tsc --noEmit` exited 0, and `yarn build` still passed.

## 2026-03-19 Task 4

- `tests/ui/window.move.spec.ts` adds two Chromium Playwright checks against the `default` fixture at `/playwright-window.html`: title drag uses `window-title` with `dx=20`, `dy=40` and confirms `{ x: 30, y: 60, width: 240, height: 160 }`.
- The content no-op case still targets `window-content` with `dx=40`, `dy=40`, but the default harness composes only `CWindowTitle`; disabling `window-title` pointer events inside that test is required so the shared `dragLocatorBy()` helper exercises the content container instead of the title drag behavior.
- Both Task 4 assertions continue to reuse the shared helpers from Task 3: `gotoWindowFixture()`, `readFrameMetrics()`, and `dragLocatorBy()`.

## 2026-03-19 Task 4 correction

## 2026-03-19 Task 6

- Added `tests/ui/window.resize-guards.spec.ts` with three focused guardrail cases only: `drag-only`, `min-clamp`, and `max-clamp`, so grep filters stay meaningful and independent from the 8-direction resize matrix in `tests/ui/window.resize.spec.ts`.
- The `drag-only` browser check should assert `page.locator('[data-testid^="window-resize-"]')` has count `0` before using `dragLocatorBy()` on `window-title`, which preserves the jsdom contract that `resizable={false}` removes handles but still allows title dragging.
- Clamp coverage remains deterministic by reusing the shared helpers against the harness fixtures: `min-clamp` shrinks east by `60px` and south by `70px` to reach `{ x: 30, y: 30, width: 1, height: 1 }`, while `max-clamp` grows east by `100px` then drags `window-resize-nw` by `-70/-80` to finish at `{ x: 50, y: 50, width: 150, height: 110 }`.
- The pointer-events workaround in `tests/ui/window.move.spec.ts` was removed because it mutated page behavior instead of testing it.
- `src/dev/playwright/windowHarness.tsx` now gives the `default` fixture a minimal body child (`Default content`) so `window-content` has real non-title area while frame metrics stay `{ x: 10, y: 20, width: 240, height: 160 }`.
- The no-op test now confirms the `window-content` center point does not hit `window-title` before calling the shared `dragLocatorBy()` helper, so the no-op assertion matches actual browser behavior.
- Added Playwright test: tests/ui/window.resize.spec.ts
  - Implements 8-direction window resize matrix coverage (n, s, e, w, ne, nw, se, sw) for the default fixture.
  - Leverages existing helpers: gotoWindowFixture(), readFrameMetrics(), dragLocatorBy().
  - Verifies exact frame metrics after dragging each resize handle.
  - Ensures tests target route: /playwright-window.html?fixture=default and use data-testid selectors for handles.
- grep-safe naming: The window.resize.spec.ts test titles now use consistent lowercase direction labels.
- Targeted `--grep "e|se"` and `--grep "w|nw"` runs are stabilized by filtering `registeredCases` from exact top-level `process.argv` matches instead of relying on mixed-case labels.
- The describe title is changed to avoid matching lowercase grep patterns.
- Test titles avoid embedding metrics in the title to keep grep accuracy stable.

## 2026-03-19 Task 7

- `.github/workflows/ci-pr.yml` now inserts Playwright immediately after `Run unit tests` and before `Build`, preserving the PR gate order `lint -> unit tests -> Playwright UI -> build -> npm pack`.
- The workflow uses the existing local script contract `yarn test:ui` instead of inlining a different Playwright test command.
- Failure artifact uploads are scoped to the Playwright install/test step conclusions and use `if-no-files-found: ignore`, so CI only attempts to collect `playwright-report/` and `test-results/` when the Playwright stage fails.

## 2026-03-19 Task 5 verification blocker fix

- `tests/ui/window.resize.spec.ts` now inspects top-level `process.argv` for the exact grep texts `e|se` and `w|nw` before defining tests, then registers only the matching case pair for those invocations.
- This avoids Playwright grep overmatching the spec file path (`window.resize.spec.ts`) while preserving the full 8-direction resize matrix for every other command.

## 2026-03-20 Harness favicon hygiene
- `playwright-window.html` should declare an inline favicon with `<link rel="icon" href="data:," />` so manual QA on `/playwright-window.html` stays console-clean without adding a real asset file or touching the harness module entry.
