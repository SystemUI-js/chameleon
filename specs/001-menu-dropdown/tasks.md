# Tasks: Menu Dropdown

**Input**: Design documents from `/specs/001-menu-dropdown/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED (spec QG-002).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared scaffolding used across user stories

- [ ] T001 Create shared menu fixtures in `tests/fixtures/menuItems.ts`
- [ ] T002 [P] Add demo usage for nested menus in `src/dev/main.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core building blocks needed for all stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Define shared menu types with children in `src/components/menuTypes.ts`
- [ ] T004 [P] Add keyboard navigation helpers in `src/components/menuNavigation.ts`
- [ ] T005 Update exports for new helpers in `src/components/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Open and use a submenu (Priority: P1) 🎯 MVP

**Goal**: Click-only open for nested submenus and select an item to trigger its action

**Independent Test**: Open a submenu by clicking and select an item; submenu closes and action fires

### Tests for User Story 1

- [ ] T006 [P] [US1] Add click open/select tests in `tests/DropDownMenu.click.test.tsx`
- [ ] T007 [P] [US1] Add selection close behavior tests in `tests/WindowMenu.click.test.tsx`

### Implementation for User Story 1

- [ ] T008 [P] [US1] Extend item types with `children` in `src/components/DropDownMenu.tsx`
- [ ] T009 [US1] Implement recursive submenu rendering in `src/components/DropDownMenu.tsx`
- [ ] T010 [US1] Wire WindowMenu to render dropdowns for items with children in `src/components/WindowMenu.tsx`
- [ ] T011 [US1] Add submenu indicator styles in `src/components/DropDownMenu.scss`
- [ ] T012 [US1] Align theme overrides in `src/theme/win98/drop-down-menu.scss`
- [ ] T013 [US1] Align theme overrides in `src/theme/winxp/drop-down-menu.scss`

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Dismiss a submenu (Priority: P2)

**Goal**: Close submenus on outside click, Escape, or when switching to another submenu

**Independent Test**: Open a submenu, dismiss via outside click or Escape, and verify close behavior

### Tests for User Story 2

- [ ] T014 [P] [US2] Add dismiss tests (outside click, Escape) in `tests/DropDownMenu.dismiss.test.tsx`
- [ ] T015 [P] [US2] Add submenu switch-close tests in `tests/WindowMenu.dismiss.test.tsx`

### Implementation for User Story 2

- [ ] T016 [US2] Ensure Escape closes current submenu and returns focus to parent in `src/components/DropDownMenu.tsx`
- [ ] T017 [US2] Close previous submenu when opening another in `src/components/WindowMenu.tsx`
- [ ] T018 [US2] Update Popover close behavior for nested menus in `src/components/Popover.tsx`

**Checkpoint**: User Story 2 functional and testable independently

---

## Phase 5: User Story 3 - Keyboard-only interaction (Priority: P3)

**Goal**: Navigate multi-level menus with Right/Left arrows and select via Enter

**Independent Test**: Use only keyboard to open a child menu, return to parent, and select an item

### Tests for User Story 3

- [ ] T019 [P] [US3] Add keyboard navigation tests in `tests/DropDownMenu.keyboard.test.tsx`
- [ ] T020 [P] [US3] Add focus retention tests in `tests/WindowMenu.keyboard.test.tsx`

### Implementation for User Story 3

- [ ] T021 [US3] Add arrow key handling in `src/components/DropDownMenu.tsx`
- [ ] T022 [US3] Integrate navigation helpers in `src/components/menuNavigation.ts`
- [ ] T023 [US3] Keep focus unchanged when child opens in `src/components/DropDownMenu.tsx`

**Checkpoint**: User Story 3 functional and testable independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cross-story alignment and documentation

- [ ] T024 [P] Add automated performance test in `tests/DropDownMenu.perf.test.tsx` (p95 ≤ 200ms over 20 samples)
- [ ] T025 [P] Add tree-shaking validation checklist in `specs/001-menu-dropdown/quickstart.md` (import only WindowMenu, verify unused components excluded)
- [ ] T026 Run quickstart validation checklist in `specs/001-menu-dropdown/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all targeted user stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- T001 and T002 can run in parallel
- T003 and T004 can run in parallel
- T006 and T007 can run in parallel
- T014 and T015 can run in parallel
- T019 and T020 can run in parallel
- T024 and T025 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "T006 [US1] Add click open/select tests in tests/DropDownMenu.click.test.tsx"
Task: "T007 [US1] Add selection close behavior tests in tests/WindowMenu.click.test.tsx"
```

---

## Parallel Example: User Story 2

```bash
Task: "T014 [US2] Add dismiss tests (outside click, Escape) in tests/DropDownMenu.dismiss.test.tsx"
Task: "T015 [US2] Add submenu switch-close tests in tests/WindowMenu.dismiss.test.tsx"
```

---

## Parallel Example: User Story 3

```bash
Task: "T019 [US3] Add keyboard navigation tests in tests/DropDownMenu.keyboard.test.tsx"
Task: "T020 [US3] Add focus retention tests in tests/WindowMenu.keyboard.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → test independently
3. Add User Story 2 → test independently
4. Add User Story 3 → test independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Tests must fail before implementation per constitution
