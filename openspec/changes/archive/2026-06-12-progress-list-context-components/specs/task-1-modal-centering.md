# Task 1 — Modal Centering — Evidence

## Approach taken: Modal-scoped CSS override (Option 1 from plan)

### Root cause

`CWidget.renderFrame` (src/components/Widget/Widget.tsx:836-844) unconditionally emits inline styles `position: absolute; left: x; top: y; width; height`. `CModal` passed `x={0}` `y={0}` to `CWindow`, so the window's top-left corner landed at the flex-centered host origin instead of being centered itself.

### Fix

Added a Modal-scoped SCSS override that neutralizes the three positioning properties using `!important` (the only way to outrank inline styles without rewriting `CWidget`/`CWindow`):

```scss
.cm-modal .cm-window-frame {
    position: static !important;
    left: auto !important;
    top: auto !important;
}
```

Once the frame returns to normal flow, the existing `display: flex; align-items: center; justify-content: center` on `.cm-modal__content` correctly centers the frame's geometric box both axes.

### Why this approach (vs the alternatives)

| Option | Trade-off |
|---|---|
| **Chosen — SCSS `!important` neutralize in Modal scope** | Surgical, zero TSX changes, no public API change, no CWindow ripple. Justified `!important` use: must beat inline style emitted by `CWidget.renderFrame` which we are forbidden from modifying. |
| Transform-based centering on `.cm-modal__window-host > .cm-window` | Doesn't actually fix the frame position — the frame would still pin to host origin; transform would only affect children. Doesn't solve root cause. |
| Compute x/y dynamically in CModal | Requires reading viewport + window dimensions on every resize; reintroduces React state; touches modal lifecycle (forbidden). |
| Rewrite CWindow to support non-absolute mode | Forbidden by task: "do not rewrite CWindow or CWidget". |

### Constraints honored

- ✅ Modal portal lifecycle untouched
- ✅ ESC stack untouched
- ✅ Focus trap untouched
- ✅ Mask click behavior untouched
- ✅ CWindow global positioning behavior untouched (override only scoped under `.cm-modal`)
- ✅ Public CModal API unchanged
- ✅ No new dependencies
