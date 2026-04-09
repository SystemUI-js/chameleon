## Why

当前组件库缺少一个可用于工作区、面板布局和 IDE 风格界面的区域分割容器，导致复杂页面只能依赖外部布局方案或在业务侧重复实现。现在补充 `CSplitArea`，可以为后续窗口系统、嵌套面板和可调整布局场景提供统一的基础能力。

## What Changes

- 新增 `CSplitArea` 组件，支持通过多个 `children` 自动划分为多个区域，并允许区域中继续嵌套 `CSplitArea`。
- 新增 `direction` 属性，支持 `horizontal` 和 `vertical` 两种分割方向。
- 新增 `separatorMovable` 属性，在启用时通过 `@system-ui-js/multi-drag` 提供可拖动分割线交互。
- 为 `CSplitArea` 增加开发示例，展示横向/纵向嵌套布局，以及子区域可动态销毁后的布局变化。

## Capabilities

### New Capabilities
- `csplitarea-component`: 定义 `CSplitArea` 的区域划分、嵌套使用、方向切换和可拖动分割线行为。
- `csplitarea-demo`: 定义开发展示中 `CSplitArea` 的嵌套横竖组合示例，以及子区域动态销毁时的演示要求。

### Modified Capabilities
- 无

## Impact

- 受影响代码主要位于 `src/components/`、`src/dev/` 和 `src/index.ts` / `src/components/index.ts` 的导出链路。
- 需要引入并集成 `@system-ui-js/multi-drag` 以支持分割线拖动。
- 可能需要新增对应样式、类型定义、测试用例和 demo 展示代码。
