## Context

当前层级策略分散在多个组件与主题样式中：ContextMenu/Popover/Select 默认 z-index 为 1000，Modal 和窗口拖动时 z-index 为 9999，导致同一交互链路里层级不可预测，窗口标题栏右键菜单被遮挡。挂载点体系（MountProvider/MountConsumer）已存在但只用于布局轨道，Portal 组件多数直接挂载到 document.body，缺少统一的层级容器与可配置的层级 token。

## Goals / Non-Goals

**Goals:**
- 定义系统级层级分组与挂载顺序，确保“菜单/Popover > 挂载点组件 > 置顶窗口 > 其他”稳定成立。
- 引入统一的 z-index token（CSS 变量或主题 token）替代散落数值。
- 同优先级内以“最后 active 在上”作为统一堆叠规则。
- Portal 统一挂载到顶层容器，避免 stacking context 误差。

**Non-Goals:**
- 不引入第三方层级管理依赖。
- 不重写窗口拖拽/缩放交互逻辑。
- 不改变现有主题视觉风格（仅调整层级与变量）。

## Decisions

- **建立层级容器与顺序**：在应用根部定义固定顺序的挂载层（base / always-top / anchors / popups），Portal 与 MountConsumer 按分组入层。
  - 备选方案：仅通过提高菜单 z-index 解决当前遮挡。拒绝原因：无法覆盖“同优先级 last-active”与跨组件的一致性问题。

- **z-index token 化**：在全局样式或主题中定义语义化 token（例如 --cm-z-base, --cm-z-always-top, --cm-z-anchors, --cm-z-popup），组件仅引用 token。
  - 备选方案：保持硬编码数值。拒绝原因：不可维护、难以跨主题一致。

- **同优先级堆叠规则**：对窗口与浮层引入“激活顺序递增”的 z-index 管理（按分组维护局部递增计数）。
  - 备选方案：依赖 DOM 顺序或父组件手动传 zIndex。拒绝原因：跨层级组件无法统一保证 last-active。

- **Portal 统一挂载**：ContextMenu/Popover/Modal 等浮层挂载到 popups 层容器，而非直接挂到 document.body。
  - 备选方案：继续挂到 document.body 并拉高 z-index。拒绝原因：难以控制与挂载点组件、置顶窗口的关系。

## Risks / Trade-offs

- [层级调整影响既有样式预期] → 通过 token 的默认值映射现有数值，并为主题提供覆盖入口。
- [last-active 计数溢出或重复] → 采用局部重置策略（按组、按容器重置）并限制最大值。
- [Portal 容器引入新的布局依赖] → 容器仅负责 stacking，不参与布局，设置 position: relative/absolute 并隔离样式。
- [开发示例与测试需要更新] → 同步补充示例与单测，验证遮挡顺序与激活顺序。
