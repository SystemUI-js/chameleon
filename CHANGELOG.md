### [UnReleased]

- Fix Window component: props should take precedence over theme defaults for minWidth/minHeight to enable per-component override
- Fix specification documents: update data-model.md to reflect current implementation (remove planned, add windowDefaults examples)
- Fix specification documents: convert absolute paths to relative paths in requirements.md and research.md
- Fix specification documents: fix markdown list indentation in spec.md
- Fix AGENTS.md: clean up Active Technologies section, remove duplicate entries
- Fix Modal.test.tsx: replace redundant class check with existence assertion
- Fix Window component: optimize pointer event handling with RAF, cache coordinates before frame, improve capture/release flow, and fix static mode callback behavior
- Fix Window component: update onResizing and onResizeEnd callbacks to include position data (west/north resize changes position). Old: onResizing(size: Size), onResizeEnd(size: Size); New: onResizing({ size: Size; position: Position }), onResizeEnd({ size: Size; position: Position }). Migration: Update usages to handle position data, as west/north resize also changes position
- **Breaking:** Fix Window component: update onResizing and onResizeEnd callbacks to include position data (west/north resize changes position). Old: onResizing(size: Size), onResizeEnd(size: Size); New: onResizing({ size: Size; position: Position }), onResizeEnd({ size: Size; position: Position }). Migration: Update usages to handle position data, as west/north resize also changes position
- **Feature:** Add ThemeBehavior system to allow configuring window default behaviors at theme level (drag mode, movable, resizable, min dimensions)
- Add useThemeBehavior hook to access theme behavior configuration
- Window component now respects theme-level default behavior settings with per-component override support
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
- Fix submenu focus management: always focus first item when submenu opens
- Fix DropDownMenu component: reduce cognitive complexity by extracting helper function
- **Feature:** Add activateWholeArea config for window behavior control
- Add activateWholeArea to WindowDefaults interface in theme types
- Configure activateWholeArea: true for both win98 and winxp themes
- Add Window component whole area click handler when activateWholeArea is enabled
- Add WindowInteractionState type for state management
- Add ResizeDirection, MenuItem, MenuPath types to src/types/index.ts
- Export new types through src/index.ts
- Add preview box for Win98 static mode drag operation
- Remove cursor: move !important override to allow proper cursor feedback
- Add preview box styles for static mode feedback
- Update Window component to support static mode with preview position tracking
- **Feature:** Add theme switching with CSS variables
- Modify ThemeContext to set CSS variables on document.documentElement
- Remove internal root element wrapper from ThemeProvider
- Replace hardcoded colors in Popover with CSS variables
- Replace hardcoded colors in Modal with CSS variables
- Add Popover theme overrides for winxp theme
- Add Modal theme overrides for winxp theme
- **Feature:** Add ContextMenu component for right-click menus
- Create ContextMenu component with position-aware positioning
- Add context-menu.scss styles for proper z-index and shadows
- Export ContextMenu component through src/index.ts
- Add global click listener to WindowMenu for closing all menu levels
- Implement menu tree detection in outside click handler
- Close entire menu tree when clicking outside menu hierarchy
- Fix submenu focus management: always focus first item when submenu opens

### 0.1.0 (2025-11-16)

初始发布：

- 基于 TypeScript + Vite + React 的组件库脚手架
- 集成 ESLint + Prettier 代码规范
- 集成 Jest + @testing-library/react 单元测试
- 提供示例组件 `Button` 与测试
- 使用 yarn 管理依赖
