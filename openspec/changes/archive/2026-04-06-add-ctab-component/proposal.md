## Why

当前组件库缺少标签页容器组件，无法以声明式的父子组件方式组织分组内容，使用方需要自行实现标签头与内容切换逻辑。现在补齐 `CTab` / `CTabItem` 组件能力，可以让库内组件模式更完整，并为后续页面分区展示提供统一的交互基础。

## What Changes

- 新增 `CTab` 容器组件，用于承载多个内嵌 `CTabItem` 子项。
- 新增 `CTabItem` 子组件，由 `CTab` 读取其 `title` 属性并渲染为标签标题。
- 约定 `CTab` 通过组合式 API 管理标签头与对应内容区域，而不是由外部单独传入标题数组。
- 补充组件导出、样式与测试，确保新组件可被组件库消费者直接使用。

## Capabilities

### New Capabilities
- `ctab-component`: 提供基于 `CTab` 与 `CTabItem` 的标签页组合能力，支持从 `CTabItem.title` 自动生成标签标题并展示对应内容。

### Modified Capabilities
- 无

## Impact

- 受影响代码：`src/components/` 下新增 Tab 相关组件与样式，更新 `src/components/index.ts` 和 `src/index.ts` 导出。
- 测试影响：新增 `tests/` 中针对 `CTab` / `CTabItem` 的渲染与交互测试。
- API 影响：组件库新增公开组件 API，无破坏性变更。
- 依赖影响：预期不引入新的运行时依赖。
