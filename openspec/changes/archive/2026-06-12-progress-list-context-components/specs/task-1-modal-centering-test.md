# Task 1 — Test Evidence

## TDD order observed

### Step 1 — RED (failing test before fix)

Added two new tests in `tests/CModal.test.tsx`:

1. **SCSS source contract** — asserts via `readFileSync` that `src/components/Modal/index.scss` contains the Modal-scoped override neutralizing `position`/`left`/`top` for `.cm-window-frame`.
2. **Structural contract** — asserts the rendered DOM hierarchy `.cm-modal__content > .cm-modal__window-host > [data-testid="window-frame"]` is intact, so flex centering has a complete parent chain.

#### Why SCSS source contract instead of `getComputedStyle`

`jest.config.ts` maps `*.scss` to `identity-obj-proxy`, so external stylesheets are stubbed in jsdom — `getComputedStyle` cannot prove the cascade. The source-file contract is the most honest signal in this environment; real geometry is validated by existing Playwright window infrastructure (`tests/ui/window.helpers.ts` already exposes `readFrameMetrics` should a future task add a Modal harness fixture).

#### RED run output (before SCSS fix)

```
● CModal › SCSS source contains Modal-scoped override that neutralizes CWindow absolute positioning

  expect(received).toMatch(expected)
  Expected pattern: /\.cm-modal\s+\.cm-window-frame\s*\{[^}]*position\s*:\s*static\s*!important[^}]*\}/
  Received string:  "/* CModal - base layout only ... */
  .cm-modal { position: fixed; inset: 0; z-index: 1000; display: none; }
  ...
  .cm-modal__window-host { position: relative; pointer-events: auto; }
  ..."

    at Object.<anonymous> (tests/CModal.test.tsx:86:17)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 20 passed, 21 total
```

Structural contract test passed in RED because the DOM hierarchy was already correct — only the CSS override was missing.

### Step 2 — GREEN (after SCSS fix applied)

```
PASS tests/CModal.test.tsx
  CModal
    ✓ returns null portal output when open=false (19 ms)
    ✓ portals to document.body when open=true (21 ms)
    ✓ SCSS source contains Modal-scoped override that neutralizes CWindow absolute positioning (1 ms)
    ✓ places the CWindow frame as a direct flex child of cm-modal__content via cm-modal__window-host (7 ms)
    ✓ renders title and children inside the window shell (5 ms)
    ✓ shows close button by default and invokes onClose when clicked (6 ms)
    ✓ hides close button when showCloseButton=false (3 ms)
    ✓ invokes onClose when clicking the mask directly (3 ms)
    ✓ does NOT invoke onClose when clicking inner content (3 ms)
    ✓ does NOT close on mask click when closeOnMaskClick=false (4 ms)
    ✓ invokes onClose on Escape keydown (4 ms)
    ✓ does NOT close on Escape when closeOnEsc=false (3 ms)
    ✓ only closes the topmost modal when two modals are stacked (5 ms)
    ✓ auto-focuses the close button when opened (4 ms)
    ✓ traps Tab focus within modal content (cycles last → first, first ← last) (5 ms)
    ✓ restores focus to the previously focused element on unmount (3 ms)
    ✓ renderToString does not throw and produces empty output (portal returns null) (3 ms)
    ✓ removes its portal container on unmount (3 ms)
    ✓ removes its portal container when open toggles back to false (4 ms)
    ✓ applies string width as inline style on cm-modal__window-host (18 ms)
    ✓ applies className, maskClassName, contentClassName, data-testid and aria-label (4 ms)

Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
Time:        0.737 s
```

All 21 tests pass — 19 pre-existing (no behavioral regressions on portal lifecycle, ESC stack, focus trap, mask click, SSR, classes, width) + 2 new centering tests.

### Step 3 — Lint clean

```
$ yarn lint
yarn run v1.22.22
$ eslint "{src,tests}/**/*.{ts,tsx}"
(node:1015838) ESLintIgnoreWarning: The ".eslintignore" file is no longer supported...
Done in 13.51s.
```

Exit code 0. The `ESLintIgnoreWarning` is pre-existing config noise unrelated to this task.

### Pre-existing failures in full suite (NOT caused by this task)

`yarn test` (full suite) shows 3 failures in `tests/Dock.test.tsx` and `tests/Window/...` related to recent in-flight changes by other dispatches to `src/components/Window/Window.tsx`, `src/theme/*/styles/index.scss`. These files are out of Task 1 scope and were not modified by this fix.
