# Feature Specification: Menu SubMenu

**Feature Branch**: `001-menu-dropdown`  
**Created**: 2026-01-19  
**Status**: Draft  
**Input**: User description: "实现 Menu 的下拉菜单功能"

## User Scenarios & Testing *(mandatory)*

## Clarifications

### Session 2026-01-19

- Q: 下拉菜单的触发方式是什么？ → A: 仅 Click 打开下拉
- Q: 支持的下拉层级深度？ → A: 支持多级级联（3+ 层）
- Q: 多级下拉的键盘层级操作规则？ → A: 右箭头展开下一层，左箭头返回上一层
- Q: 关闭子层级时的行为？ → A: 关闭当前层并将焦点返回父层
- Q: 键盘打开子菜单的触发键？ → A: 右箭头打开子菜单
- Q: 子菜单打开后的焦点落点？ → A: 焦点保持不变
- Q: 焦点规则是否可配置？ → A: 可配置 open/close 的焦点行为（parent/firstChild），默认 open/close 都为 parent

### User Story 1 - Open and use a submenu (Priority: P1)

As a user, I can open a submenu from a menu item by clicking and choose a submenu item.

**Why this priority**: This is the core behavior needed to make a menu submenu useful.

**Independent Test**: Can be fully tested by opening a submenu from a menu item and selecting one submenu item to trigger its action.

**Acceptance Scenarios**:

1. **Given** a menu item that has a submenu, **When** the user activates it, **Then** the submenu becomes visible and readable.
2. **Given** an open submenu, **When** the user selects a submenu item, **Then** the selection is applied and the submenu closes.

---

### User Story 2 - Dismiss a submenu (Priority: P2)

As a user, I can close an open submenu without making a selection.

**Why this priority**: Users need a predictable way to exit the submenu without taking action.

**Independent Test**: Can be fully tested by opening a submenu and dismissing it via common dismissal actions.

**Acceptance Scenarios**:

1. **Given** an open submenu, **When** the user clicks outside the menu area, **Then** the submenu closes.
2. **Given** an open submenu, **When** the user opens a different menu item with a submenu, **Then** the previous submenu closes.

---

### User Story 3 - Keyboard-only interaction (Priority: P3)

As a keyboard user, I can open a submenu, move through items, and activate a selection with configurable focus behavior on open/close.

**Why this priority**: Keyboard access is essential for accessibility and power users.

**Independent Test**: Can be fully tested using only keyboard inputs to open, navigate, and select submenu items.

**Acceptance Scenarios**:

1. **Given** focus on a menu item with a submenu, **When** the user activates it via keyboard, **Then** the submenu opens while focus remains unchanged by default (configurable to firstChild).
2. **Given** an open submenu, **When** the user navigates with arrow keys and presses Enter, **Then** the focused submenu item is selected and the submenu closes.

---

### Edge Cases

- Menu items with empty submenus do not open a submenu and show no submenu indicator.
- Very long submenu lists remain usable by allowing scrolling within the submenu.
- Rapid open/close interactions do not leave orphaned submenus visible.

## Requirements *(mandatory)*

### Quality Gates *(mandatory)*

- **QG-001**: Changes MUST pass lint/format/build in CI.
- **QG-002**: Behavior or public API changes MUST include tests.
- **QG-003**: UX MUST follow theme tokens and existing interaction patterns.
- **QG-004**: Performance-sensitive changes MUST define measurable targets.

### Functional Requirements

- **FR-001**: The system MUST allow users to open a submenu from a menu item that has a submenu via click only.
- **FR-002**: The system MUST allow configurable focus behavior on submenu close (parent or first child).
- **FR-003**: The system MUST close an open submenu when the user clicks outside or presses Escape.
- **FR-004**: Users MUST be able to select a submenu item and trigger its configured action.
- **FR-005**: The system MUST clearly indicate which menu items have an associated submenu.
- **FR-006**: Users MUST be able to open, navigate, and select submenu items using only the keyboard; right arrow opens the next level and left arrow returns to the previous level, with configurable focus behavior on open/close (parent or first child).
- **FR-007**: The system MUST support multi-level cascading submenus (3+ levels).
- **FR-008**: The system MUST not display a submenu for menu items that have no submenu.

### Key Entities *(include if feature involves data)*

- **Menu**: A collection of menu items displayed to the user.
- **Menu Item**: A selectable item with a label, an action, and an optional submenu.
- **Submenu**: A list of menu items nested under a parent menu item.

### Assumptions

- The submenu supports multiple cascading levels (3+).
- Activation is supported for both pointer and keyboard interactions.
- Menu item definitions and actions are provided by the consumer of the component.
- DropDown is the base implementation for SubMenu in Menu scenarios.

### Non-Functional Requirements

- **NFR-001**: The submenu open interaction MUST remain responsive with submenus visible within 200 ms under normal usage.
- **NFR-002**: The component bundle MUST preserve tree-shaking; no new hard dependencies that prevent unused code elimination.
- **NFR-003**: Performance verification MUST use an automated timing check in tests.

### Out of Scope

- Context menus that appear on right-click.
- Advanced animation or motion requirements.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of users can open a submenu and select a submenu item within 10 seconds on the first try.
- **SC-002**: Submenus become visible within 200 ms of user activation, validated by a documented timing check.
- **SC-003**: 100% of submenu items are reachable and selectable using keyboard-only navigation.
- **SC-004**: Fewer than 1 support report per 1,000 active users mentions submenu open/close failures.
