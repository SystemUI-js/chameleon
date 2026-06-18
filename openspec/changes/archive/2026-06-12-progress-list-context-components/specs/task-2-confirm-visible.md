# Task 2 — CConfirm visible content (real-browser evidence)

**Timestamp**: 2026-06-06T23:39:00Z
**Worktree**: `feature-add-win-7-theme`
**Plan**: `.omo/plans/style-component-fixes.md` Task 2

## Symptom (user report)

> Confirm 打开之后高度为 0，看不到内容；调用 `confirm` 的模态框只有白色一片+文字，缺少要求的样式。

## Root cause

1. `CWidget.renderFrame` (`src/components/Widget/Widget.tsx:836-844`) **always** emits inline `style="height: <number>px"` on `.cm-window-frame`.
2. `CModal` passes `cWindowHeight = 0` whenever the consumer omits an explicit numeric `height` prop (`src/components/Modal/CModal.tsx:192`). Confirm uses intrinsic height, so this is the default path.
3. Task 1's Modal-scoped CSS only neutralized `position` / `left` / `top` on the frame — **not `height`**. After Task 1 the frame sat in normal flow but with inline `height: 0px`.
4. `.cm-window__inner { height: 100% }` (`src/components/Window/index.scss`) resolves to `0` of `0` → the entire Confirm body+actions area collapsed to invisibility. `.cm-confirm__body { min-height: 32px }` could not save it because a min-height inside a 0-height ancestor is still effectively 0 (the visible viewport is 0).

The user's *secondary* complaint — "missing styles" — was the same root cause: with height 0 the styled `.cm-confirm__body` / `.cm-confirm__actions` divs were present in the DOM but invisible, so they appeared "missing".

## Investigation note on the imperative path

The plan's hypothesis (a) — imperative `confirm()` rendering raw text — was **not** the cause. Verified by reading `src/components/Confirm/CConfirm.tsx:181-222`: `ImperativeConfirmHost` renders `<CConfirm>{bodyChildren}</CConfirm>`, so both paths produce identical `.cm-confirm > .cm-confirm__body / .cm-confirm__actions` markup. The pre-existing tests at `tests/CConfirm.test.tsx:170+` also rely on this parity. The bug was purely CSS collapse.

## Fix

Confirm-scoped SCSS only (`src/components/Confirm/index.scss`). Modal SCSS intentionally untouched per Task 2 must-not-do.

```scss
.cm-confirm .cm-window-frame {
    height: auto !important;       /* neutralize CWidget's inline height: 0 */
}

.cm-confirm__body { flex: 0 0 auto; /* + existing rules */ }
.cm-confirm__actions { flex: 0 0 auto; /* + existing rules */ }
```

- `!important` justified: the height comes from an inline style emitted by `CWidget.renderFrame`, which the plan and Task 1's learnings explicitly forbid editing. Same justification chain as Task 1's `position: static !important` override.
- Scoped under `.cm-confirm` so other Modal consumers (including future ones with fixed heights) are not affected.
- `flex: 0 0 auto` on body+actions is belt-and-suspenders: `.cm-window` is a flex column (`src/components/Window/index.scss`), and locking children to `flex-shrink: 0` prevents future regressions where any sibling claims remaining space.

## Real-browser verification (Playwright)

Spec: `tests/ui/confirm.visibility.spec.ts`

```
✓  1 [chromium] › imperative confirm() renders body and actions with measurable nonzero height (894ms)
✓  2 [chromium] › declarative <CConfirm> renders body and actions with measurable nonzero height (745ms)

2 passed (2.8s)
```

Both tests assert `frame.boundingBox().height > 60`, `body > 20`, `actions > 20` via Chromium at 1024×768. Screenshot of imperative `confirm()` open state captured to `.omo/evidence/task-2-confirm-visible.png` (11 KB) — shows centered window with visible title bar, body text "Are you sure you want to delete this item?", and OK/Cancel button row.

## Existing UI smoke unaffected

```
✓ Modal section opens and closes via ESC, mask, and close button (1.2s)
✓ Confirm section: imperative confirm() resolves true on OK and false on Cancel/ESC (1.1s)
```

Combined: 4/4 Playwright tests pass for Confirm + Modal.

## Behavioral invariants preserved (Task 2 must-not-do)

- `confirm()` Promise resolution: OK → `resolve(true)`, Cancel/ESC/mask/× → `resolve(false)` — unchanged (tests `tests/CConfirm.test.tsx:170-289` all pass).
- OK/Cancel button order: Cancel | OK left-to-right — unchanged (`ConfirmActions` JSX order in `CConfirm.tsx:57-75` not modified).
- Default button text: `OK`, `Cancel` — unchanged (`DEFAULT_CONFIRM_TEXT`, `DEFAULT_CANCEL_TEXT` constants untouched).
- ESC cancel: `tests/CConfirm.test.tsx:78` and `tests/CConfirm.test.tsx:199` still pass.
- Mask click cancel: `tests/CConfirm.test.tsx:92` and `tests/CConfirm.test.tsx:211` still pass.
- CModal source/styles: not touched (Task 1 fix preserved).
- CWindow/CWidget: not touched.

## Evidence artifacts

- `.omo/evidence/task-2-confirm-visible.md` — this file
- `.omo/evidence/task-2-confirm-visible.png` — Chromium screenshot of imperative confirm in open state
- `.omo/evidence/task-2-confirm-test.md` — full Jest + Playwright output, lint result
