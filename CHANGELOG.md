### [UnReleased]

- **Feature:** 新增 `CSplitArea` 连续分割布局组件
  - 支持按子节点顺序生成连续区域，并提供 `horizontal` / `vertical` 两种分割方向
  - 支持通过 `separatorMovable` 启用分割线拖动，实时调整相邻区域尺寸
  - 支持嵌套布局、子区域动态移除后的连续重排，并补充公共导出、开发示例与测试覆盖

- **Breaking:** 移除 `CMenu` 根触发器 `.cm-menu__trigger` 包裹节点
  - 根触发元素现在直接作为 `.cm-menu` 的一级子节点渲染，组件不再额外插入中间 wrapper DOM
  - 保持 click / hover 打开语义、ARIA 注入与外部点击关闭逻辑不变，但依赖 `.cm-menu__trigger` class 或 DOM 层级的样式/选择器需要迁移

- **Feature:** 优化 `CMenu` 混合触发模式默认行为
  - 根触发器保持 `click` / `hover` 配置语义，根菜单通过 `click` 打开时，未显式声明的父级子菜单现在默认改为 `hover` 展开
  - 保留 `item.trigger` 的最高优先级，可通过 `item.trigger='click'` 为特定分支维持旧的点击展开行为，作为兼容迁移方式
  - 补充 mixed trigger 单测与开发示例，覆盖 hover 默认展开、显式 click 覆盖、叶子点击关闭与外部点击关闭场景

- **Feature:** 新增 `CMenu` 组件并完成发布级集成
  - 支持根触发模式 `click` / `hover`，并在子菜单层级中继承或按项覆盖触发方式
  - 支持基于递归 `menuList` 数据的多级菜单渲染，保持叶子节点选择回调与整树关闭行为
  - 补充并对齐 Jest + Playwright 覆盖，验证导出面、交互行为与 UI 夹具选择器契约

- **Breaking:** 重构为纯组件库，移除系统导向 API
  - 移除 ThemeContext、systemType、SystemHost、WindowManager、ScreenManager
  - 主题现在通过 CSS 变量直接应用，不依赖系统注册
  - Window 组件现在是独立可拖拽/缩放组件，不作为 shell 窗口管理器
  - 迁移：现有代码需要移除 SystemHost 相关调用，改用纯组件组合

- **Fix:** 优化 Window 边框缩放手柄的定位与交互反馈
  - 修正 8 个方向 resize handle 的边缘与角落热区定位，保证拖拽命中范围与视觉边界一致
  - 为不同方向的 resize handle 补充对应 cursor，提升桌面窗口缩放时的交互可预期性
  - 恢复 `cm-window__inner` 包装层，稳定内容区与缩放热区的分层关系

- **Feature:** 在默认窗口标题栏添加系统切换下拉控件
  - 在 `DefaultSystem` 组件标题栏添加 `切换系统` 下拉选择器
  - 复用现有 `CSelect` 组件和系统注册表
  - 切换系统时自动联动目标系统默认主题
  - 添加完整的 Jest 和 Playwright 测试覆盖
- **Test:** 升级 `@playwright/test` 到 `^1.58.2`，补充 Playwright 在 CI 环境下的 `forbidOnly`、重试和并发配置，提升 Window UI 测试在持续集成中的稳定性
- Fix Window 的 Playwright resize 用例方向标签与筛选逻辑，统一为小写方向标识，降低 `--grep` 定向执行时的误匹配风险

- **Feature:** Add default window theme with extensible styling system
  - Add protected methods `getWindowContentClassName()` and `getWindowFrameClassName()` to CWindow for theme-specific class customization
  - Add DefaultWindow component that extends CWindow with gradient backgrounds and border effects
  - Add DefaultWindowTheme composition with DefaultWindow, DefaultWindowTitle, and DefaultTheme components
  - Add comprehensive unit tests for theme class preservation and drag interaction
- Fix PR CI merge-context failures by removing invalid merge-only tests for unimplemented mount registry and window title context menu APIs
- Fix PR CI test execution by removing duplicate `jest.config.js` and keeping `jest.config.ts` as the single Jest config
- Fix review nits in default theme imports and testing-library import consistency
- Fix PR merge-context lint failure by adding a `GlobalRenderer.test.tsx` compatibility test aligned with the explicit `CWindowTitle` composition model
- **Feature:** Add global renderer registry with `GlobalRender` and theme-aware resolution for component rendering
- Add Window title renderers (default/Win98/WinXP) and route Window title bar through `GlobalRender`
- Add tests for global renderer registration, theme-specific resolution, and Window title rendering

- Fix Window component: props should take precedence over theme defaults for minWidth/minHeight to enable per-component override
- Fix specification documents: update data-model.md to reflect current implementation (remove planned, add windowDefaults examples)
- Fix specification documents: convert absolute paths to relative paths in requirements.md and research.md
- Fix specification documents: fix markdown list indentation in spec.md
- Fix AGENTS.md: clean up Active Technologies section, remove duplicate entries
- Fix Modal.test.tsx: replace redundant class check with existence assertion
- Fix Window component: optimize pointer event handling with RAF, cache coordinates before frame, improve capture/release flow, and fix static mode callback behavior
- **Breaking:** Fix Window component: update onResizing/onResizeEnd signatures to accept `{ size: Size; position: Position }` instead of `size: Size`. Migration: update usages to handle position data; west/north resizes also change position
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
