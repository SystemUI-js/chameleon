## Goals / Non-Goals

**Goals:**

- 把五个拖拽相关 legacy web 组件中的原生 DOM 标签与布局测量逻辑收敛到独立平台层。
- 让 `src/components/` 中这五个组件改为消费平台原语，而不是直接声明 `div`/`span`。
- 保持组件现有 className、交互行为、测试契约与 legacy web 定位不变。
- 为后续继续把 web-only 实现从组件逻辑中剥离、或引入其他宿主实现保留边界。

**Non-Goals:**

- 不在本次变更中把这五个组件完整改写为 React Native 组件。
- 不在本次变更中修改公开 API、样式命名或交互语义。
- 不尝试一次性改造 `src/components/` 其余全部组件。
- 不移除 `legacy/webMultiDrag`，它仍作为 legacy web 拖拽适配层保留。

## Decisions

### 1. 建立“组件逻辑层 + web 宿主层”最小抽象

新增 `src/platform/web/` 目录，至少包含两类能力：

1. **render primitives**：如 `View`、`Text`，负责承接 web 宿主标签与 `forwardRef`。
2. **layout helpers**：负责把 `getBoundingClientRect()` 等布局读取转换为组件逻辑可消费的统一测量结果。

- 选择该方案的原因：当前用户质疑的是 `components` 中仍直接存在 `div`，因此优先把“宿主节点细节”从组件文件移走，比继续只在文档上标记 legacy 更符合迁移方向。
- 备选方案：仅在现有文件中继续保留 `div`，等待未来一次性改写为 React Native。
- 不采用备选方案的原因：会继续让 `src/components/` 绑定在 web-only 宿主语义上，难以逐步演进。

### 2. 先迁移五个拖拽相关组件，不扩大到全库

本次仅处理 `WindowTitle`、`Widget`、`IconContainer`、`CSplitArea`、`CSlider`。这些组件都有明显的拖拽或布局测量逻辑，且是当前最集中暴露 raw DOM tag 的一组文件。

- 选择该方案的原因：范围足够集中，能够形成真实的平台层切口，又不会把任务膨胀成全库替换。
- 备选方案：一次性处理所有组件。
- 不采用备选方案的原因：范围过大，难以在保持行为稳定的前提下快速落地。

### 3. 组件行为不变，平台依赖位置改变

组件对外仍输出现有 className、测试标识、ARIA 属性与交互行为，但这些行为所依赖的宿主节点、布局测量与基础容器渲染必须经由平台层实现。也就是说，本次改变的是“依赖注入位置”，不是“对外语义”。

- 选择该方案的原因：可以显著降低测试回归成本，让变更集中在边界治理，而不是 UI 语义重写。
- 备选方案：在平台层改造的同时顺带调整交互模型。
- 不采用备选方案的原因：会把实现风险与验证成本放大。

### 4. 保留 legacy web drag adapter，但禁止 raw DOM 继续扩散

`legacy/webMultiDrag` 仍然是 web-only 适配层；本次不替换其行为。但组件文件本身不再新增 raw DOM 宿主细节，布局与渲染都应通过 `src/platform/web/` 的原语或 helper 进入。

- 选择该方案的原因：能在不推翻现有 drag 行为的前提下，先完成“组件 -> 平台层”的依赖倒置。
- 备选方案：连同 `legacy/webMultiDrag` 一起彻底重写。
- 不采用备选方案的原因：会与上一轮刚完成的 change 强耦合，增加回归风险。

## Risks / Trade-offs

- [平台原语只是薄封装，短期仍是 web 实现] → 接受这一点，目标是先收敛宿主依赖位置，而不是立刻拥有跨平台运行时。
- [组件仍会保留 `HTMLDivElement` ref 类型等 web 痕迹] → 本次优先去掉 raw tag 与直接测量调用；更深层的类型抽象留到后续阶段。
- [抽象层过薄可能被质疑价值不够] → 通过五个组件统一接入同一平台层，确保它不是一次性包装，而是稳定的迁移边界。

## Migration Plan

1. 新增 `src/platform/web/` 的基础渲染原语与布局 helper。
2. 先在五个目标组件中用平台原语替换 raw DOM 标签。
3. 将这五个组件中的 `getBoundingClientRect()` 读取收敛到平台 helper。
4. 运行现有测试，确保 legacy web 行为与 className 契约不变。

## Open Questions

- 后续是否需要继续把 pointer/keyboard 事件类型也抽到平台层，而不是仅收敛渲染与布局测量？
- `src/platform/web/` 是否在下一阶段继续拆成 `primitives/`、`layout/`、`events/` 三层？
