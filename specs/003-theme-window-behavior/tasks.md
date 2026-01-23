---

description: "Task list for theme & window behavior refinements"
---

# Tasks: Theme & Window Behavior Refinements

**Input**: Design documents from `/specs/003-theme-window-behavior/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by spec (QG-002). Tests included per user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align baseline configuration and ensure theme assets are wired for the feature work.

- [X] T001 Confirm theme SCSS entrypoints are included in src/index.ts
- [X] T002 [P] Review existing Window/Modal/Menu tests in tests/ for reuse and gaps
- [X] T003 [P] Confirm demo entrypoint uses ThemeProvider in src/dev/main.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared foundations for all user stories (theme behavior config + default prop plumbing).

- [X] T004 Extend theme types with behavior defaults in src/theme/types.ts
- [X] T005 Implement theme behavior defaults in src/theme/default/index.ts, src/theme/win98/index.ts, src/theme/winxp/index.ts
- [X] T006 Implement theme behavior accessor helper in src/theme/ThemeContext.tsx (or new helper in src/theme/)

**Checkpoint**: Theme behavior defaults can be read by components.

---

## Phase 3: User Story 1 - 使用默认主题并展示一致风格 (Priority: P1) 🎯 MVP

**Goal**: Default theme is `default` and SubMenu/Modal visuals follow active theme.

**Independent Test**: 未设置主题的 demo 加载后默认主题为 default；切换 Win98/WinXP 时 SubMenu 与 Modal 样式随主题变化并与 Window 一致。

### Tests for User Story 1 (TDD)

- [X] T007 [P] [US1] Add default theme selection test in tests/ThemeContext.test.tsx
- [X] T008 [P] [US1] Add SubMenu theme switching visual class coverage in tests/DropDownMenu.submenu.render.test.tsx
- [X] T009 [P] [US1] Add Modal theme override expectation in tests/Modal.test.tsx

### Implementation for User Story 1

- [X] T010 [US1] Update ThemeProvider default theme fallback in src/theme/ThemeContext.tsx
- [X] T011 [US1] Align SubMenu styles with theme variables in src/theme/win98/drop-down-menu.scss and src/theme/winxp/drop-down-menu.scss
- [X] T012 [US1] Align Modal styles with Window theme in src/theme/win98/modal.scss and src/theme/winxp/modal.scss
- [X] T013 [US1] Ensure theme-specific menu/modal overrides are imported via src/theme/*/index.scss

**Checkpoint**: US1 passes independently and demo shows default theme + consistent styling.

---

## Phase 4: User Story 2 - 直观的窗口交互与激活反馈 (Priority: P1)

**Goal**: Window resize/drag works in demo, cursor feedback is correct, and onActive fires once on activation.

**Independent Test**: Demo 中窗口可 resize/拖动，拖动时 cursor 正确，点击标题栏激活触发 onActive 一次且不重复。

### Tests for User Story 2 (TDD)

- [X] T014 [P] [US2] Add onActive firing behavior tests in tests/Window.test.tsx
- [X] T015 [P] [US2] Add title-bar activation click tests in tests/Window.test.tsx
- [X] T016 [P] [US2] Add resize interaction regression test in tests/Window.test.tsx

### Implementation for User Story 2

- [X] T017 [US2] Add onActive prop and activation handling in src/components/Window.tsx
- [X] T018 [US2] Ensure title-bar pointer down activates window in src/components/Window.tsx
- [X] T019 [US2] Fix drag cursor feedback in src/components/Window.scss
- [X] T020 [US2] Verify demo window resize wiring in src/dev/main.tsx

**Checkpoint**: US2 passes independently and window interactions are correct.

---

## Phase 5: User Story 3 - 主题差异化行为 (Priority: P2)

**Goal**: Theme-specific behavior differences for drag mode (Win98 static vs WinXP follow).

**Independent Test**: 切换 Win98/WinXP 主题后拖动窗口，分别验证静止与跟随模式。

### Tests for User Story 3 (TDD)

- [X] T021 [P] [US3] Add theme-driven interactionMode tests in tests/Window.test.tsx
- [X] T022 [P] [US3] Add demo theme switch behavior test in tests/ThemeContext.test.tsx

### Implementation for User Story 3

- [X] T023 [US3] Apply theme behavior defaults to Window props in src/components/Window.tsx
- [X] T024 [US3] Set Win98 windowDragMode to static in src/theme/win98/index.ts
- [X] T025 [US3] Set WinXP windowDragMode to follow in src/theme/winxp/index.ts
- [X] T026 [US3] Ensure default theme behavior uses follow (or defined default) in src/theme/default/index.ts

**Checkpoint**: US3 passes independently and theme-driven behavior is visible.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality, consistency, and verification across all stories.

- [ ] T027 [P] Run lint/test/build per quickstart.md
- [X] T028 UX consistency audit against theme tokens in src/theme/*/*.scss
- [ ] T029 Update demo notes or comments in src/dev/main.tsx if behavior changed
- [X] T030 Validate contracts alignment with Window events in specs/003-theme-window-behavior/contracts/window-behavior.openapi.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3-5)**: Depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational
- **US2 (P1)**: Can start after Foundational
- **US3 (P2)**: Can start after Foundational

### Parallel Opportunities

- Phase 1 tasks marked [P]
- Story tests in each phase are parallelizable
- Theme SCSS updates for menu/modal can run in parallel with Window TS updates

---

## Parallel Example: User Story 1

```bash
Task: "Add default theme selection test in tests/ThemeContext.test.tsx"
Task: "Add SubMenu theme switching visual class coverage in tests/DropDownMenu.submenu.render.test.tsx"
Task: "Add Modal theme override expectation in tests/Modal.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate US1 independently

### Incremental Delivery

1. US1 → validate
2. US2 → validate
3. US3 → validate

### Parallel Team Strategy

- After Foundational, run US1/US2 in parallel if staffed
