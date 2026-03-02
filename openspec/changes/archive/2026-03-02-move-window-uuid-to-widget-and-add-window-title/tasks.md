## 1. Base identity migration

- [x] 1.1 Move `uuid` ownership from `CWindow` to `CWidget` and keep subclass access semantics compatible.
- [x] 1.2 Update `CWindow` implementation to consume inherited `uuid` only, removing duplicated identity initialization.
- [x] 1.3 Adjust or add unit tests to verify `CWidget`-provided `uuid` exists on `CWindow` instances and remains stable during re-render.

## 2. CWindowTitle base component

- [x] 2.1 Add `CWindowTitle` base component with content-agnostic rendering (accept consumer-provided children/title content).
- [x] 2.2 Ensure `CWindow` does not implicitly mount `CWindowTitle`, and update exports so consumers can compose it explicitly.
- [x] 2.3 Add tests for explicit composition behavior (with title / without title) to prevent implicit-title regressions.

## 3. Drag behavior integration

- [x] 3.1 Integrate `@system-ui-js/multi-drag` on `CWindowTitle` as drag-handle and map drag deltas to owning `CWindow` position updates.
- [x] 3.2 Guard interaction boundaries so only title drag starts window movement (content area should not trigger move).
- [x] 3.3 Add interaction tests (or equivalent behavior tests) that verify dragging title moves the window container.

## 4. Win98 theme validation

- [x] 4.1 Implement a basic Win98 title bar class/component inheriting from `CWindowTitle` with minimal visual structure.
- [x] 4.2 Wire Win98 window composition to use explicit title-bar composition and validate draggable behavior end-to-end.
- [x] 4.3 Add/adjust Win98-focused tests to confirm visible title area and draggable movement contract.

## 5. Quality and documentation

- [x] 5.1 Update relevant docs/examples to show explicit `CWindowTitle` composition and parent-window drag behavior.
- [x] 5.2 Run lint, tests, and build; fix issues until all checks pass.
- [x] 5.3 Perform final verification pass against proposal/design/specs acceptance intent before implementation handoff.
