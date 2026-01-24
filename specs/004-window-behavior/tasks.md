---

description: "Task list for feature implementation"
---

# Tasks: Window 交互与菜单优化

**Input**: Design documents from `/specs/004-window-behavior/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED for this feature. Quality Gate QG-002 states: "Behavior or public API changes MUST include tests."

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3). Foundation tasks (Phase 2) may omit [Story].
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

Note: This is an existing React component library. Setup is already complete (Vite 5, TypeScript 5.6, Jest, React Testing Library, SCSS configured). No new setup tasks required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T001 [P] Add activateWholeArea to WindowDefaults interface in src/theme/types.ts
- [ ] T002 [P] Add activateWholeArea: true to win98 theme windowDefaults in src/theme/win98/index.ts
- [ ] T003 [P] Add activateWholeArea: true to winxp theme windowDefaults in src/theme/winxp/index.ts
- [ ] T004 [P] Add WindowInteractionState type to src/types/index.ts
- [ ] T005 [P] Add ResizeDirection type to src/types/index.ts
- [ ] T006 [P] Add MenuItem type to src/types/index.ts
- [ ] T007 [P] Add MenuPath type to src/types/index.ts
- [ ] T008 Export new types in src/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 窗口激活与移动/缩放体验一致 (Priority: P1) 🎯 MVP

**Goal**: 点击窗口任意位置即可激活窗口，移动与缩放时光标反馈与边框悬停一致，Win98 主题下显示虚线预览框

**Independent Test**: 仅实现该故事即可通过点击、拖拽、缩放验证核心交互是否一致

### Tests for User Story 1 (REQUIRED - Tests MUST be written first) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Write test for whole area activation in tests/Window.test.tsx
- [ ] T010 [P] [US1] Write test for cursor behavior during move in tests/Window.test.tsx
- [ ] T011 [P] [US1] Write test for cursor behavior during resize in tests/Window.test.tsx
- [ ] T012 [P] [US1] Write test for Win98 static mode preview box in tests/Window.test.tsx
- [ ] T013 [P] [US1] Write test for interactionState state management in tests/Window.test.tsx

### Implementation for User Story 1

- [ ] T014 [US1] Add activateWholeArea config reading in src/components/Window.tsx
- [ ] T015 [US1] Add onClick handler to root element for whole area activation in src/components/Window.tsx
- [ ] T016 [US1] Implement interactionState management in src/components/Window.tsx
- [ ] T017 [US1] Update handlePointerDown to set interactionState in src/components/Window.tsx
- [ ] T018 [US1] Add previewPos state for Win98 static mode in src/components/Window.tsx
- [ ] T019 [US1] Update handlePointerMove to support static mode preview in src/components/Window.tsx
- [ ] T020 [US1] Update handlePointerUp to apply preview position in src/components/Window.tsx
- [ ] T021 [US1] Add preview box component render in src/components/Window.tsx
- [ ] T022 [US1] Remove cursor: move !important override in src/components/Window.scss
- [ ] T023 [US1] Add preview box styles in src/components/Window.scss

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 主题切换在浮层中一致生效 (Priority: P2)

**Goal**: 主题切换时所有组件（包括浮层/挂载到页面外层的组件）都能正确呈现对应主题样式

**Independent Test**: 仅实现该故事即可通过切换主题并检查浮层组件外观一致性来验证

### Tests for User Story 2 (REQUIRED - Tests MUST be written first) ⚠️

- [ ] T024 [P] [US2] Write test for ThemeContext CSS variable injection in tests/ThemeContext.test.tsx
- [ ] T025 [P] [US2] Write test for Popover theme inheritance in tests/Popover.test.tsx
- [ ] T026 [P] [US2] Write test for Modal theme inheritance in tests/Modal.test.tsx

### Implementation for User Story 2

- [ ] T027 [US2] Modify ThemeContext to set CSS variables on document.documentElement in src/theme/ThemeContext.tsx
- [ ] T028 [P] [US2] Replace hardcoded colors with CSS variables in src/components/Popover.scss
- [ ] T029 [P] [US2] Replace hardcoded colors with CSS variables in src/components/Modal.scss
- [ ] T030 [P] [US2] Add Popover styles to winxp theme in src/theme/winxp/popover.scss
- [ ] T031 [P] [US2] Add Modal styles to winxp theme in src/theme/winxp/modal.scss

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 右键菜单能力与多级菜单收起行为 (Priority: P3)

**Goal**: 提供通用的右键菜单能力（示例应用于窗口标题栏），并且多级菜单在点击外部时全部收起

**Independent Test**: 仅实现该故事即可通过右键触发菜单与外部点击关闭验证交互完整性

### Tests for User Story 3 (REQUIRED - Tests MUST be written first) ⚠️

- [ ] T032 [P] [US3] Write test for ContextMenu trigger and display in tests/ContextMenu.test.tsx
- [ ] T033 [P] [US3] Write test for ContextMenu position boundary detection in tests/ContextMenu.test.tsx
- [ ] T034 [P] [US3] Write test for DropMenu close all on outside click in tests/DropMenu.test.tsx
- [ ] T035 [P] [US3] Write test for multi-level menu close all behavior in tests/DropMenu.test.tsx

### Implementation for User Story 3

- [ ] T036 [US3] Create ContextMenu component in src/components/ContextMenu.tsx
- [ ] T037 [US3] Add ContextMenu styles in src/styles/context-menu.scss
- [ ] T038 [US3] Export ContextMenu component in src/index.ts
- [ ] T039 [US3] Add global click listener to WindowMenu for close all in src/components/WindowMenu.tsx
- [ ] T040 [US3] Implement menu tree detection in outside click handler in src/components/WindowMenu.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T041 [P] Update CHANGELOG.md with feature changes
- [ ] T042 Run quickstart.md validation
- [ ] T043 [P] UX consistency audit against theme tokens and interaction patterns
- [ ] T044 Performance optimization (measure window activation latency < 16ms)
- [ ] T045 Run full test suite (yarn test)
- [ ] T046 Run lint check (yarn lint)
- [ ] T047 Run build (yarn build)
- [ ] T048 [P] Add accessibility attributes to ContextMenu in src/components/ContextMenu.tsx
- [ ] T049 [P] Add keyboard navigation support to ContextMenu in src/components/ContextMenu.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Already complete - no tasks
- **Foundational (Phase 2)**: No dependencies - can start immediately, BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1 and US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- Style tasks marked [P] can run in parallel with component implementation
- Component implementation follows state management → UI rendering → integration

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Style tasks marked [P] can run in parallel with component implementation
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - write first):
Task: "Write test for whole area activation in tests/Window.test.tsx"
Task: "Write test for cursor behavior during move in tests/Window.test.tsx"
Task: "Write test for cursor behavior during resize in tests/Window.test.tsx"
Task: "Write test for Win98 static mode preview box in tests/Window.test.tsx"
Task: "Write test for interactionState state management in tests/Window.test.tsx"

# Launch style task in parallel with implementation:
Task: "Remove cursor: move !important override in src/components/Window.scss"
Task: "Add preview box styles in src/components/Window.scss"

# These run while implementation tasks complete in sequence
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (type definitions and theme configs)
2. Complete Phase 3: User Story 1 (window activation and cursor behavior)
3. **STOP and VALIDATE**: Test User Story 1 independently (click, drag, resize, preview box)
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational (Phase 2) → Foundation ready
2. Add User Story 1 (Phase 3) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Phase 4) → Test independently → Deploy/Demo
4. Add User Story 3 (Phase 5) → Test independently → Deploy/Demo
5. Add Polish (Phase 6) → Final release
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational (Phase 2) together
2. Once Foundational is done:
   - Developer A: User Story 1 (Phase 3)
   - Developer B: User Story 2 (Phase 4)
   - Developer C: User Story 3 (Phase 5)
3. Stories complete and integrate independently
4. Team completes Polish (Phase 6) together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Run `yarn lint`, `yarn test`, `yarn build` after each phase
- Stop at any checkpoint to validate story independently
- Performance goals: window activation < 16ms, theme switch < 100ms, cursor state < 10ms
- All public API changes MUST have tests (Quality Gate QG-002)
- STRICT TypeScript mode: no `any`, no `@ts-ignore`, no `@ts-expect-error` (Constitution Check)

---

## Summary

- **Total Tasks**: 49
- **Tasks per User Story**:
  - User Story 1 (P1): 15 tasks (5 tests + 10 implementation)
  - User Story 2 (P2): 8 tasks (3 tests + 5 implementation)
  - User Story 3 (P3): 9 tasks (4 tests + 5 implementation)
- **Parallel Opportunities**: 21 tasks marked with [P]
- **Independent Test Criteria**:
  - US1: Click, drag, resize, preview box interaction
  - US2: Theme switch with floating layers
  - US3: Right-click menu and multi-level menu close all
- **Suggested MVP Scope**: User Story 1 only (Phase 2 + Phase 3)
- **Format Validation**: All tasks follow the strict checklist format with checkbox, Task ID, [P] marker, [Story] label, and file paths
