### [UnReleased]

- Fix Window component: props should take precedence over theme defaults for minWidth/minHeight to enable per-component override
- Fix specification documents: update data-model.md to reflect current implementation (remove planned, add windowDefaults examples)
- Fix specification documents: convert absolute paths to relative paths in requirements.md and research.md
- Fix specification documents: fix markdown list indentation in spec.md
- Fix specification documents: wrap bare URLs with Markdown link text in research.md to resolve MD034 lint errors
- Fix AGENTS.md: clean up Active Technologies section, remove duplicate entries
- Fix Modal.test.tsx: replace redundant class check with existence assertion
- Fix Window component: optimize pointer event handling with RAF, cache coordinates before frame, improve capture/release flow, and fix static mode callback behavior
- **Breaking:** Fix Window component: update onResizing and onResizeEnd callbacks to include position data (west/north resize changes position). Old: onResizing(size: Size), onResizeEnd(size: Size); New: onResizing({ size: Size; position: Position }), onResizeEnd({ size: Size; position: Position }). Migration: Update usages to handle position data, as west/north resize also changes position
- **Feature:** Add ThemeBehavior system to allow configuring window default behaviors at theme level (drag mode, movable, resizable, min dimensions)
- Add useThemeBehavior hook to access theme behavior configuration
- Window component now respects theme-level default behavior settings with per-component override support
- Add Window component onActive callback for activation state change notifications
- Add ThemeContext.test.tsx for theme behavior testing
- Add 003-theme-window-behavior specification documentation
- Update Win98 and WinXP themes with behavior configurations
- 对齐 ESLint 配置，引入 @system-ui-js/development-base React 规范
- 更新 Prettier 忽略规则
- Fix jsx-a11y lint errors in Breadcrumb, Collapse, Modal, Select, Shortcut, Splitter, Tabs, Transfer, Tree components
- Implement US2/US3 behaviors in WindowMenu/DropDownMenu (submenu dismissal, keyboard navigation, focus behavior, nested levels)
- Update Win98/WinXP theme styles
- Add menu dropdown specification docs
- Update AGENTS guidance
- Fix Select component hardcoded ID to use useId() for unique listbox IDs
- Fix Splitter component keyboard handler to call onResizeEnd after arrow key resize
- Fix CI lint error: upgrade eslint-plugin-react-hooks to v5 for ESLint v9 compatibility
- Fix Select component: resolve conditional useId() hook call violation
- Fix DropDownMenu component: reduce cognitive complexity by extracting helper function
- Fix submenu focus management: always focus first item when submenu opens

### 0.1.0 (2025-11-16)

初始发布：

- 基于 TypeScript + Vite + React 的组件库脚手架
- 集成 ESLint + Prettier 代码规范
- 集成 Jest + @testing-library/react 单元测试
- 提供示例组件 `Button` 与测试
- 使用 yarn 管理依赖
