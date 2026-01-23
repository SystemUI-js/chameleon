# Feature Specification: Window Drag and Resize

**Feature Branch**: `002-window-drag-resize`  
**Created**: 2026-01-21  
**Status**: Draft  
**Input**: User description: "新增功能：
1. Window 组件新增拖拽能力，组件新增 Props：position, onMove, canMove
2. Modal 的 content 应继承自 Window
3. Window 组件新增 Resize 能力，可以拖动边缘进行 Resize，8 个方向都可以支持拖拽 Resize，支持 Props: size, onResize, canResize
4. Window 正在移动或 Resize 的时候，支持两种模式（Props 名你来起），内容不变，和内容跟随改变，名字也是你来起，在动态（移动或 Resize） 时会有一个 className（Props 名也是你来起），在结束时去掉这个 className"

## Clarifications

### Session 2026-01-21

- Q: `position`/`size` props 的数据类型与单位是什么？ → A: 使用 `{ x: number, y: number }` 与 `{ width: number, height: number }`，单位默认 px
- Q: Resize 的最小尺寸约束是什么？ → A: 必须提供最小尺寸约束（如 `minWidth`/`minHeight`）
- Q: 交互进行中切换开关时如何处理？ → A: 交互进行中忽略开关变化，结束后生效
- Q: move/resize 的事件回调应如何命名与触发？ → A: `onMoveStart`/`onMoving`/`onMoveEnd`；Resize 对应 `onResizeStart`/`onResizing`/`onResizeEnd`
- Q: 动态交互时应用的 className 名称是什么？ → A: `isDragging`
- Q: move/resize 的交互模式 Props 如何命名？ → A: `interactionMode`（`static` / `follow`）
- Q: move/resize 的可用开关 Props 如何命名？ → A: `movable` / `resizable`
- Q: 最小尺寸约束 Props 如何命名？ → A: `minWidth` / `minHeight`
- Q: Window 拖拽时是否允许拖出视区？ → A: 限制在视区内（至少保留可抓取边缘）
- Q: move/resize 交互的性能目标是什么？ → A: max 60fps

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reposition a Window (Priority: P1)

As a product integrator, I can move a window by dragging so that UI layouts can be customized by users.

**Why this priority**: Repositioning is the core interaction expected from a window component.

**Independent Test**: Can be fully tested by dragging a window to a new position and confirming the new position is applied and reported.

**Acceptance Scenarios**:

1. **Given** a window with move enabled, **When** the user drags the window, **Then** the window updates its position in real time and ends at the released location.
2. **Given** a window with move disabled, **When** the user attempts to drag it, **Then** the window position does not change and no movement updates are emitted.

---

### User Story 2 - Resize a Window (Priority: P1)

As a product integrator, I can resize a window by dragging any edge or corner so that window dimensions can be adjusted to content and layout needs.

**Why this priority**: Resizing is a fundamental window interaction and required for flexible layouts.

**Independent Test**: Can be fully tested by dragging each of the 8 resize directions and verifying size updates and completion.

**Acceptance Scenarios**:

1. **Given** a window with resize enabled, **When** the user drags any edge or corner, **Then** the window size updates in real time according to the drag direction.
2. **Given** a window with resize disabled, **When** the user attempts to drag any resize handle, **Then** the window size does not change and no resize updates are emitted.

---

### User Story 3 - Modal Content Inherits Window Behavior (Priority: P2)

As a product integrator, I can use modal content that inherits window behaviors so that modals have consistent interactions with windows.

**Why this priority**: Ensures a consistent experience across related components without duplicating behavior.

**Independent Test**: Can be fully tested by rendering modal content and confirming it supports the same move/resize capabilities as a window.

**Acceptance Scenarios**:

1. **Given** a modal that uses window content, **When** move or resize is enabled, **Then** the modal content behaves the same as the window content for those interactions.

---

### User Story 4 - Choose Interaction Mode During Move/Resize (Priority: P2)

As a product integrator, I can choose whether the window content stays static or follows changes during move/resize so that performance and UX can be balanced for different use cases.

**Why this priority**: Different applications need different behaviors during dynamic interactions.

**Independent Test**: Can be fully tested by toggling the interaction mode and observing content behavior during move/resize.

**Acceptance Scenarios**:

1. **Given** the static-content mode, **When** the window is moved or resized, **Then** the window content appearance remains unchanged until the interaction ends.
2. **Given** the follow-content mode, **When** the window is moved or resized, **Then** the content updates continuously with the interaction.

---

### Edge Cases

- If move/resize is toggled during an ongoing interaction, ignore the toggle until the interaction ends.
- How does the system behave when rapid successive drags occur without pauses?
- What happens when a resize would result in an invalid or zero-size window?

## Requirements *(mandatory)*

### Quality Gates *(mandatory)*

- **QG-001**: Changes MUST pass lint/format/build in CI.
- **QG-002**: Behavior or public API changes MUST include tests.
- **QG-003**: UX MUST follow theme tokens and existing interaction patterns; new features MUST update styles.
- **QG-004**: Performance-sensitive changes MUST define measurable targets (move/resize: max 60fps).
- **QG-005**: Performance-sensitive changes MUST define a validation method (e.g., record `requestAnimationFrame` intervals during a 10s drag/resize run; ≥95% frames ≤16.7ms).

### Functional Requirements

- **FR-001**: The system MUST support user-initiated window movement via drag interactions and keep the window within the viewport (at least a grab-handle edge remains visible).
- **FR-002**: The system MUST allow consumers to set an initial or controlled window position and receive movement updates.
- **FR-003**: `position` MUST use `{ x: number, y: number }` (default unit: px).
- **FR-004**: The system MUST allow consumers to enable or disable movement behavior (`movable`).
- **FR-005**: The system MUST expose `onMoveStart` (once at start), `onMoving` (continuous), and `onMoveEnd` (once at end).
- **FR-006**: The system MUST support window resizing via drag interactions in all 8 directions (edges and corners).
- **FR-007**: `size` MUST use `{ width: number, height: number }` (default unit: px).
- **FR-008**: The system MUST allow consumers to set an initial or controlled window size and receive resize updates.
- **FR-009**: The system MUST allow consumers to enable or disable resize behavior (`resizable`).
- **FR-010**: The system MUST expose `onResizeStart` (once at start), `onResizing` (continuous), and `onResizeEnd` (once at end).
- **FR-011**: The system MUST provide two interaction modes during move/resize (`interactionMode`: `static` / `follow`): content remains static, or content follows the interaction.
- **FR-012**: The system MUST expose a distinct active-state styling hook while move or resize is in progress, and remove it when the interaction ends.
- **FR-013**: The active-state styling hook MUST use the className `isDragging`.
- **FR-014**: The system MUST enforce minimum size constraints during resize (`minWidth` / `minHeight`).
- **FR-015**: Modal content MUST inherit window behaviors for move/resize when enabled.

## Assumptions

- If both move and resize are enabled, they can be used independently without interfering with each other.
- Existing size and position constraints (if any) continue to apply; minimum size constraints are required during resize.
- The default interaction mode is `follow` unless explicitly configured otherwise.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of attempted window move interactions complete successfully without errors in usability testing.
- **SC-002**: 95% of attempted window resize interactions complete successfully without errors in usability testing across all 8 directions.
- **SC-003**: Interaction mode toggling results in the expected content behavior in 100% of verification runs.
- **SC-004**: Modal content demonstrates the same move/resize behaviors as windows in all acceptance scenarios.
