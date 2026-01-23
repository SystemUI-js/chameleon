---

description: "Task list for Window Drag and Resize"
---

# Tasks: Window Drag and Resize

**Input**: Design documents from `/specs/002-window-drag-resize/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: 本功能涉及行为与公共 API 变更，必须包含测试任务。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目准备与基线校验

- [X] T001 确认现有 Window/Modal/Splitter 结构与可用扩展点在 `src/components/Window.tsx`
- [X] T002 [P] 确认主题窗口样式文件位置在 `src/theme/win98/window.scss`
- [X] T003 [P] 确认主题窗口样式文件位置在 `src/theme/winxp/window.scss`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 所有用户故事的共享基础

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 建立 Window 交互类型定义与公共类型在 `src/components/Window.tsx`
- [X] T005 建立交互状态管理与事件管线骨架在 `src/components/Window.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Reposition a Window (Priority: P1) 🎯 MVP

**Goal**: 支持拖拽移动窗口并回调位置信息

**Independent Test**: 拖拽标题栏后位置更新并触发 onMoveStart/onMoving/onMoveEnd

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [P] [US1] 添加拖拽移动测试用例在 `tests/Window.test.tsx`

### Implementation for User Story 1

- [X] T007 [US1] 增加 position/movable/onMoveStart/onMoving/onMoveEnd props 支持在 `src/components/Window.tsx`
- [X] T008 [US1] 实现标题栏拖拽行为（含 pointer capture 与 rAF 节流）在 `src/components/Window.tsx`
- [X] T009 [US1] 实现视区边界约束（至少保留可抓取边缘）在 `src/components/Window.tsx`

**Checkpoint**: User Story 1 可独立验证

---

## Phase 4: User Story 2 - Resize a Window (Priority: P1)

**Goal**: 支持八方向拖拽调整窗口尺寸并回调尺寸信息

**Independent Test**: 拖拽 8 个方向手柄后尺寸更新并触发 onResizeStart/onResizing/onResizeEnd

### Tests for User Story 2 ⚠️

- [X] T010 [P] [US2] 添加八方向 resize 测试用例在 `tests/Window.test.tsx`

### Implementation for User Story 2

- [X] T011 [US2] 增加 size/minWidth/minHeight/resizable/onResizeStart/onResizing/onResizeEnd props 支持在 `src/components/Window.tsx`
- [X] T012 [US2] 添加 8 个 resize handle 结构与事件绑定在 `src/components/Window.tsx`
- [X] T013 [US2] 实现 resize 计算逻辑与最小尺寸约束在 `src/components/Window.tsx`
- [X] T014 [US2] 为 resize handles 增加样式与光标在 `src/components/Window.scss`
- [X] T015 [US2] 为主题窗口补充 resize handle 样式在 `src/theme/win98/window.scss`
- [X] T016 [US2] 为主题窗口补充 resize handle 样式在 `src/theme/winxp/window.scss`

**Checkpoint**: User Story 2 可独立验证

---

## Phase 5: User Story 3 - Modal Content Inherits Window Behavior (Priority: P2)

**Goal**: Modal 继承 Window 的 move/resize 行为

**Independent Test**: 在 Modal 中启用 move/resize 时，行为与 Window 一致

### Tests for User Story 3 ⚠️

- [X] T017 [P] [US3] 添加 Modal 继承行为测试在 `tests/Modal.test.tsx`

### Implementation for User Story 3

- [X] T018 [US3] 校验 Modal props 透传与行为继承在 `src/components/Modal.tsx`

**Checkpoint**: User Story 3 可独立验证

---

## Phase 6: User Story 4 - Choose Interaction Mode During Move/Resize (Priority: P2)

**Goal**: 支持 interactionMode=static/follow 与 isDragging 状态 className

**Independent Test**: 切换 interactionMode 后内容行为符合预期，交互中追加 isDragging className

### Tests for User Story 4 ⚠️

- [X] T019 [P] [US4] 添加 interactionMode 与 isDragging 行为测试在 `tests/Window.test.tsx`

### Implementation for User Story 4

- [X] T020 [US4] 增加 interactionMode 与 isDragging className 处理在 `src/components/Window.tsx`
- [X] T021 [US4] 为 isDragging 增加样式钩子在 `src/components/Window.scss`

**Checkpoint**: User Story 4 可独立验证

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事的收尾与一致性检查

- [ ] T022 [P] 更新组件导出与类型注释在 `src/components/index.ts`
- [ ] T023 [P] 更新开发预览示例在 `src/dev/main.tsx`
- [ ] T024 完成 UX 一致性审查与主题适配核对在 `src/theme/win98/window.scss`
- [ ] T025 完成 UX 一致性审查与主题适配核对在 `src/theme/winxp/window.scss`
- [ ] T026 运行质量门禁 `yarn lint`、`yarn test`、`yarn build`
- [ ] T027 记录性能验证方法：在 dev 预览中执行 10 秒拖拽/Resize，并记录 `requestAnimationFrame` 间隔；≥95% 帧间隔 ≤16.7ms（记录方式写入执行说明）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - P1 (US1/US2) 优先，其后 P2 (US3/US4)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - independent
- **User Story 2 (P1)**: Can start after Foundational - independent of US1, but shares Window core
- **User Story 3 (P2)**: Depends on Window behavior完成（US1/US2）
- **User Story 4 (P2)**: Depends on Window core完成（US1/US2）

### Parallel Opportunities

- Setup 内的 T002/T003 可并行
- 测试任务 T006/T010/T017/T019 可并行
- 主题样式任务 T015/T016/T024/T025 可并行

---

## Parallel Example: User Story 1

```bash
# Tests for US1 (if staffing allows)
Task: "Add drag move tests in tests/Window.test.tsx"

# Implementation split
Task: "Add move props in src/components/Window.tsx"
Task: "Implement drag handler in src/components/Window.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 测试 US1 独立通过

### Incremental Delivery

1. US1 完成并验证
2. US2 完成并验证
3. US3 完成并验证
4. US4 完成并验证
