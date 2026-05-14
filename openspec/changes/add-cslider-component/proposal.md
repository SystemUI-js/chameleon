## Why

当前组件库缺少可复用的滑块输入组件，用户在需要连续或离散数值选择时只能自行组合拖拽逻辑与样式。新增 `CSlider` 可以统一滑块交互、步进约束与可定制样式入口，并复用 `@system-ui-js/multi-drag` 提供稳定的拖动能力。

## What Changes

- 新增 `CSlider` 组件，用于在给定范围内选择数值。
- 使用 `@system-ui-js/multi-drag` 实现拖动能力，避免在组件内部重复实现底层拖拽状态管理。
- 支持设置 `step`，让滑块值按指定步长对齐。
- 支持为组件的关键子元素配置 `className`，便于调用方定制轨道、填充区域、滑块按钮等局部样式。
- 导出组件及其 TypeScript 类型，纳入组件库统一使用方式。

## Capabilities

### New Capabilities

- `cslider-component`: 覆盖 `CSlider` 的数值范围、步进、拖动交互、局部 className 定制与组件导出行为。

### Modified Capabilities

无。

## Impact

- 影响 `src/components/`：新增 `CSlider` 组件源码与样式。
- 影响 `src/index.ts`：新增组件与类型导出。
- 影响 `tests/`：新增 `CSlider` 行为与渲染测试。
- 影响依赖：新增或使用 `@system-ui-js/multi-drag` 作为拖动能力来源。
