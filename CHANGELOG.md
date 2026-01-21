### [UnReleased]

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
