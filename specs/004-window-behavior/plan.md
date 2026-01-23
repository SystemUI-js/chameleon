# Implementation Plan: Window 交互与菜单优化

**Branch**: `004-window-behavior` | **Date**: 2026-01-23 | **Spec**: spec.md
**Input**: Feature specification from `/specs/004-window-behavior/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

优化 Window 组件的交互体验（全区域激活、光标一致性、Win98 预览框）、改进主题系统以支持浮层组件样式同步，并新增右键菜单能力（继承自 DropMenu）与多级菜单收起行为优化。基于 React 18 + TypeScript + Vite + Jest 技术栈，保持组件库的严格类型安全与可测试性。

## Technical Context

**Language/Version**: TypeScript 5.6, React 18.2
**Primary Dependencies**: React 18.2, Vite 5, Jest, React Testing Library, SCSS
**Storage**: N/A (客户端组件库，无后端存储)
**Testing**: Jest + React Testing Library
**Target Platform**: Web 浏览器 (Chrome, Firefox, Safari, Edge)
**Project Type**: single (React 组件库)
**Performance Goals**:
  - 窗口激活响应延迟 < 16ms (60fps)
  - 光标状态切换无闪烁
  - 主题切换后所有组件样式更新 < 100ms
  - 多级菜单展开/收起操作流畅无卡顿
**Constraints**:
  - 无 `any` 类型，严格 TypeScript 模式
  - 无 `@ts-ignore`/`@ts-expect-error`
  - 所有公共 API 变更必须有测试
  - 包体积需保持 tree-shaking 能力
**Scale/Scope**:
  - 影响组件：Window, DropMenu, ContextMenu, ThemeProvider
  - 预计新增文件：ContextMenu.tsx, ContextMenu 相关样式文件
  - 预计修改文件：Window.tsx, DropMenu.tsx, ThemeContext.tsx

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Code quality gate**: strict TS + lint/format/build must pass
  - 计划：所有变更将通过 `yarn lint`, `yarn format`, `yarn build` 验证，保持 TypeScript 严格模式，禁用 `any` 类型
- ✅ **Testing gate**: behavior/API changes include tests; no test deletion to pass
  - 计划：窗口激活、光标状态、主题切换、右键菜单、多级菜单收起行为均需添加 Jest + React Testing Library 测试用例
- ✅ **UX consistency gate**: theme tokens + component interaction patterns maintained
  - 计划：主题切换通过 ThemeContext 注入 CSS 变量，确保所有组件（含浮层）统一使用 theme tokens；右键菜单继承 DropMenu 交互模式
- ✅ **Performance gate**: measurable goals defined for perf-sensitive changes
  - 已定义：窗口激活 < 16ms、主题切换 < 100ms、光标状态无闪烁、多级菜单操作流畅
- ✅ **Maintainability gate**: clear module boundaries and justified complexity
  - 计划：新增 ContextMenu 组件为独立模块，Window 和 DropMenu 修改保持在各自组件边界内，主题系统增强逻辑集中在 ThemeContext

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

```text
src/
├── components/
│   ├── Window.tsx              # 修改：全区域激活、光标一致性、Win98 预览框、右键菜单支持
│   ├── DropMenu.tsx            # 修改：多级菜单收起行为优化
│   └── ContextMenu.tsx          # 新增：通用右键菜单组件（继承 DropMenu）
├── theme/
│   ├── ThemeContext.tsx        # 修改：支持向组件注入主题名，确保浮层样式一致
│   └── types.ts                # 新增/修改：主题注入相关类型定义
├── styles/
│   ├── window.scss             # 修改：窗口交互相关样式
│   ├── context-menu.scss       # 新增：右键菜单样式
│   └── variables.scss          # 修改：主题相关 CSS 变量
└── index.ts                     # 修改：导出新增组件

tests/
├── Window.test.tsx              # 新增/修改：窗口激活、光标、拖拽测试
├── DropMenu.test.tsx            # 新增/修改：多级菜单收起行为测试
└── ContextMenu.test.tsx         # 新增：右键菜单交互测试
```

**Structure Decision**: 单项目 React 组件库结构（Option 1）。所有组件、样式和测试集中在 `src/` 和 `tests/` 目录，符合现有项目布局。新增 ContextMenu 组件作为独立模块，与 Window 和 DropMenu 解耦。ThemeContext 负责主题注入逻辑，支持浮层组件样式一致性。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
