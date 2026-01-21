# Tasks: Menu SubMenu

**Input**: Design documents from `/specs/001-menu-dropdown/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED because the spec mandates behavior/API changes include tests and requires a performance timing check.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project-level preparation for menu submenu work

- [x] T001 Confirm current Menu/DropDownMenu/Popover APIs and usage in `src/components/WindowMenu.tsx`, `src/components/DropDownMenu.tsx`, `src/components/Popover.tsx`
- [x] T002 [P] Add submenu test data fixtures in `tests/fixtures/menuItems.ts`
- [x] T003 [P] Add shared submenu types in `src/components/menuTypes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared behavior and utilities required before user story implementation

- [x] T004 Add submenu state helpers (openPath, focusBehavior) in `src/components/menuState.ts`
- [x] T005 [P] Add keyboard navigation helpers (roving tabindex) in `src/components/menuKeyboard.ts`
- [x] T006 [P] Add focus management utilities in `src/components/menuFocus.ts`
- [x] T007 Wire foundational helpers into menu entry points in `src/components/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Open and use a submenu (Priority: P1) 🎯 MVP

**Goal**: Click to open submenu, select item triggers action and closes submenu

**Independent Test**: Open submenu by click, select submenu item, verify action and close

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [P] [US1] Add click-open and select tests in `tests/WindowMenu.submenu.click.test.tsx`
- [x] T009 [P] [US1] Add DropDownMenu nested rendering test in `tests/DropDownMenu.submenu.render.test.tsx`

### Implementation for User Story 1

- [x] T010 [P] [US1] Extend menu item types with children and divider rules in `src/components/WindowMenu.tsx`
- [x] T011 [US1] Render nested submenu structure and submenu indicators in `src/components/WindowMenu.tsx`
- [x] T012 [US1] Integrate Popover-based submenu rendering for items with children in `src/components/DropDownMenu.tsx`
- [x] T013 [US1] Close submenu on item selection in `src/components/DropDownMenu.tsx`

**Checkpoint**: User Story 1 works independently

---

## Phase 4: User Story 2 - Dismiss a submenu (Priority: P2)

**Goal**: Dismiss submenu via outside click, Escape, and opening another submenu

**Independent Test**: Open submenu, dismiss by outside click/Escape/other submenu

### Tests for User Story 2 ⚠️

- [x] T014 [P] [US2] Add outside click close test in `tests/WindowMenu.submenu.dismiss.test.tsx`
- [x] T015 [P] [US2] Add Escape key close test in `tests/WindowMenu.submenu.keyboard.dismiss.test.tsx`

### Implementation for User Story 2

- [x] T016 [US2] Implement outside click handling and openPath reset in `src/components/WindowMenu.tsx`
- [x] T017 [US2] Implement Escape key handling and focus return in `src/components/WindowMenu.tsx`
- [x] T018 [US2] Ensure opening another submenu closes previous in `src/components/WindowMenu.tsx`

**Checkpoint**: User Stories 1 & 2 work independently

---

## Phase 5: User Story 3 - Keyboard-only interaction (Priority: P3)

**Goal**: Keyboard navigation across nested submenus with configurable focus behavior

**Independent Test**: Use ArrowRight/ArrowLeft/Enter to navigate and select; focus behavior toggles

### Tests for User Story 3 ⚠️

- [x] T019 [P] [US3] Add arrow navigation and selection tests in `tests/WindowMenu.submenu.keyboard.test.tsx`
- [x] T020 [P] [US3] Add focus behavior configuration tests in `tests/WindowMenu.submenu.focusBehavior.test.tsx`
- [x] T021 [P] [US3] Add performance timing test (<200ms) in `tests/WindowMenu.submenu.performance.test.tsx`

### Implementation for User Story 3

- [x] T022 [US3] Add keyboard handlers and roving tabindex wiring in `src/components/WindowMenu.tsx`
- [x] T023 [US3] Apply focusBehavior on open/close in `src/components/WindowMenu.tsx`
- [x] T024 [US3] Ensure nested menu levels (3+) via recursion in `src/components/WindowMenu.tsx`

**Checkpoint**: All user stories work independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cross-story improvements and validation

- [x] T025 [P] Update component exports and docs in `src/components/index.ts` and `docs/`
- [x] T026 Run quickstart validation steps in `specs/001-menu-dropdown/quickstart.md`
- [x] T027 Run lint/test/build (`yarn lint`, `yarn test`, `yarn build`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 behaviors
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US1/US2 behaviors

### Parallel Opportunities

- T002 and T003 can run in parallel
- T004, T005, T006 can run in parallel
- Tests within a story (marked [P]) can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Add click-open and select tests in tests/WindowMenu.submenu.click.test.tsx"
Task: "Add DropDownMenu nested rendering test in tests/DropDownMenu.submenu.render.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **Stop and validate**: run User Story 1 tests only

### Incremental Delivery

1. Foundation ready
2. Add US1 → test independently
3. Add US2 → test independently
4. Add US3 → test independently
5. Run full lint/test/build
