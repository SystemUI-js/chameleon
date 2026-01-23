# Phase 0 Research

## Decision: Use Pointer Events with capture for drag/resize tracking
- Rationale: Unifies mouse/touch/pen input and pointer capture prevents losing events mid-drag.
- Alternatives considered: Mouse events only; separate touch handlers.
- Sources:
  - https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
  - https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture

## Decision: Throttle continuous updates with requestAnimationFrame
- Rationale: Aligns updates to the frame budget for 60fps and avoids excessive state updates.
- Alternatives considered: Unthrottled move handlers; interval throttling.
- Sources:
  - https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

## Decision: Avoid layout thrashing by batching reads/writes
- Rationale: Drag/resize should not interleave layout reads and writes each frame.
- Alternatives considered: Immediate DOM reads after writes.
- Sources:
  - https://web.dev/articles/animations-guide

## Decision: Clamp position/size to constraints
- Rationale: Required by spec: stay within viewport; enforce minWidth/minHeight.
- Alternatives considered: Clamp only on end; allow overflow.

## Notes
- Use title bar as drag handle; add resize handles on edges/corners with appropriate cursor styles.
- Modal already renders Window; behavior should inherit without extra wiring.
