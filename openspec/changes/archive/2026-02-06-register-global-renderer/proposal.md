## Why

需要一个可扩展且类型安全的全局渲染器注册机制，让组件内部可以按名称渲染主题专属实现（从 Window Title 开始），同时避免使用方传入不匹配的组件导致运行期问题。

## What Changes

- 新增全局渲染器注册 API（`registerGlobalRenderer`），按 name 注册组件类，并通过 TS 类型约束组件 Props。
- 新增 `GlobalRender` 高阶组件/包装组件，基于 name 从注册表查找 renderer 并渲染到内部。
- 导出各 renderer 的 Props 类型供使用方引用，防止错误组件接入。
- 将 Window 标题栏渲染切到 `GlobalRender`，并为 Win98/WinXP 主题提供各自的 Title renderer 实现。

## Capabilities

### New Capabilities
- `global-renderer`: 提供按 name 注册/查找的全局 renderer 机制，包含类型安全的 Props 约束与主题化选择能力。

### Modified Capabilities
- （无）

## Impact

- 代码：新增/调整 `src/components` 中的注册表与 `GlobalRender`，修改 `src/components/Window.tsx` 的标题栏渲染入口。
- 主题：新增 Win98/WinXP 的 Window Title renderer 实现与相关样式对接（如需要）。
- API：在 `src/components/index.ts` 与 `src/index.ts` 导出新的 API 与 Props 类型。
