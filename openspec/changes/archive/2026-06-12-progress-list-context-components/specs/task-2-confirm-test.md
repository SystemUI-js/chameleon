# Task 2 — CConfirm visible content (test evidence)

**Timestamp**: 2026-06-06T23:39:00Z
**Worktree**: `feature-add-win-7-theme`
**Plan**: `.omo/plans/style-component-fixes.md` Task 2

## Jest results (47/47 pass)

```
PASS tests/CModal.test.tsx

Test Suites: 2 passed, 2 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        0.974 s
Ran all test suites within paths "tests/CConfirm.test.tsx", "tests/CModal.test.tsx".
Done in 2.50s.
```

Note: Pre-existing `act()` warnings appear at lines 244, 280, 294 from the existing imperative `confirm()` test patterns. These are console.error warnings only (React 18 strict-mode for `createRoot` calls), not test failures.

### New tests added

In `tests/CConfirm.test.tsx` — 6 new tests in `describe('CConfirm visibility (Task 2 regression)')`:

| # | Test | What it guards |
|---|------|----------------|
| 1 | SCSS source neutralizes inline height:0 on .cm-window-frame | Regex-match on SCSS for `.cm-confirm .cm-window-frame { height: auto !important }` |
| 2 | SCSS source keeps body from collapsing in flex column | Regex-match for `.cm-confirm__body { flex: 0 0 auto }` |
| 3 | SCSS source keeps actions from collapsing in flex column | Regex-match for `.cm-confirm__actions { flex: 0 0 auto }` |
| 4 | SCSS source preserves .cm-confirm__body min-height >= 32px | Regex-match for `min-height: 32px` |
| 5 | Declarative mounts styled body wrapper with message text | DOM structural assertions: body wraps text, frame contains body, actions have buttons |
| 6 | Imperative mounts same styled structure as declarative | DOM parity: body.textContent matches, actions have buttons |
| 7 | Theme + custom className still merge onto .cm-confirm root | classList contains `cm-confirm`, `extra-confirm`, `cm-theme--win98`, data-testid |

All 7 pass.

## Playwright results (4/4 for Confirm + Modal)

```
  ✓ imperative confirm() renders body and actions with measurable nonzero height (905ms)
  ✓ declarative <CConfirm> renders body and actions with measurable nonzero height (749ms)
  ✓ Confirm section: imperative confirm() resolves true on OK and false on Cancel/ESC (1.1s)
  ✓ Modal section opens and closes via ESC, mask, and close button (1.2s)

  4 passed (3.6s)
```

Height assertions pass in Chromium 1024×768:
- `.cm-window-frame` bounding height > 60px ✓
- `.cm-confirm__body` bounding height > 20px ✓
- `.cm-confirm__actions` bounding height > 20px ✓

## Lint result

```
$ yarn lint
Done in 13.71s.   (exit 0)
```

## Files changed

| File | Change |
|------|--------|
| `src/components/Confirm/index.scss` | Added `.cm-confirm .cm-window-frame { height: auto !important }` + `flex: 0 0 auto` on body/actions |
| `tests/CConfirm.test.tsx` | 6 new visibility regression tests |
| `tests/ui/confirm.visibility.spec.ts` | NEW — 2 Playwright real-browser height-measurement tests |

## Root cause summary

**CWidget.renderFrame always emits inline `height: <number>px` on .cm-window-frame.** CModal defaults to `cWindowHeight = 0` (intrinsic). Task 1's CSS only neutralized position. The inline `height: 0` survived, collapsing `.cm-window__inner { height: 100% }` to 0 → entire Confirm content invisible. The imperative and declarative paths already shared the same DOM structure via `<ImperativeConfirmHost>` → `<CConfirm>`. Fix: Confirm-scoped CSS override on height only, plus flex-shrink protection on body/actions.