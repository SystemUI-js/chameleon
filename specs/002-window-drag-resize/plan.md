# Implementation Plan: Window Drag and Resize

**Branch**: `002-window-drag-resize` | **Date**: 2026-01-22 | **Spec**: `/specs/002-window-drag-resize/spec.md`
**Input**: Feature specification from `/specs/002-window-drag-resize/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

为 Window 组件增加拖拽与八方向 Resize 能力，支持受控 position/size、可用开关、最小尺寸约束与交互模式（static/follow），并将该能力复用到 Modal 内容。具体交互实现将基于现有组件结构与样式约束，并以 60fps 为性能目标。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.6 + React 18.2  
**Primary Dependencies**: React, Vite, Sass (SCSS), Jest + React Testing Library  
**Storage**: N/A  
**Testing**: Jest + React Testing Library  
**Target Platform**: Browser (React 18+) 
**Project Type**: Single project component library  
**Performance Goals**: 60fps during move/resize interactions  
**Constraints**: Strict TS, no `any`, no suppression; must stay within viewport; minWidth/minHeight enforced  
**Scale/Scope**: Component-level change (Window/Modal + tests + styles)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Code quality gate: strict TS + lint/format/build must pass
- Testing gate: behavior/API changes include tests; no test deletion to pass
- UX consistency gate: theme tokens + component interaction patterns maintained; new features must update styles
- Performance gate: measurable goals defined for perf-sensitive changes
- Maintainability gate: clear module boundaries and justified complexity

**Status (post Phase 1)**: PASS (performance validation method defined in spec/tasks)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── components/          # Window, Modal 组件实现
├── dev/                 # Vite 预览入口
├── index.ts             # 组件导出
└── types/               # SCSS modules 类型声明

tests/
└── [component].test.tsx # 组件测试
```

**Structure Decision**: 单仓组件库结构，主要改动位于 `src/components` 与 `tests`，样式通过现有 Sass/CSS 方案接入。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
