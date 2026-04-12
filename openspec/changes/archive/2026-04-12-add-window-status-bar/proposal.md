## Why

当前组件库提供了 `CWindow` 与相关窗口结构组件，但缺少可复用的状态栏能力，使用方无法以统一的方式在窗口底部或其他布局中展示状态信息。现在补充独立的 `CStatusBar` 与 `CStatusBarItem`，可以完善窗口类界面的表达能力，同时保持组合方式灵活、避免把状态栏强耦合进 `CWindow`。

## What Changes

- 新增独立的 `CStatusBar` 组件，默认使用横向 `flex` 布局，表现为空壳块级容器，提供自身 `className` 以便样式扩展。
- 新增独立的 `CStatusBarItem` 组件，用于承载状态栏中的单元内容，不强制绑定到 `CStatusBar` 内部，允许使用方按需组合到任意位置。
- 保持 `CWindow` 不内置、不预置状态栏，由使用方自行决定是否在窗口内部挂载 `CStatusBar`。
- 更新公开导出与配套示例/测试，确保新组件可被消费方直接使用，并与现有窗口组件组合工作。

## Capabilities

### New Capabilities
- `cstatusbar-component`: 提供独立的 `CStatusBar` 与 `CStatusBarItem` 组件，支持灵活组合、默认横向布局与基础样式钩子。

### Modified Capabilities
- 无

## Impact

- 受影响代码：`src/components/` 下新增状态栏组件及样式，`src/index.ts` 公开导出可能需要更新。
- 受影响测试：`tests/` 中需要补充公开导出、渲染结构与组合使用相关测试。
- 受影响文档/示例：组件目录页、开发预览或示例代码可能需要展示 `CStatusBar` 与 `CWindow` 的组合用法。
