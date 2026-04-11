## Context

当前 `CButton` 仅支持 `variant` 变体，根类名为 `cm-button`，尺寸并未通过独立能力建模；如果继续把尺寸逻辑固化在组件分支中，会让后续 Windows 98 风格细化样式变更变得更难维护。本次变更需要补齐一个紧凑型样式入口，让按钮尺寸由样式层决定，而组件层只负责暴露稳定的语义开关。

当前 `CWidget` 已具备布局、拖拽、缩放与 preview 状态，但缺少面向消费方的激活态能力。现有 `preview.active` 仅用于拖拽/缩放预览，不等同于组件是否处于激活态；外部也无法通过受控属性统一驱动窗口、停靠条等 `CWidget` 子类的激活样式。项目还要求保持 React 18 + TypeScript 严格类型约束，不引入新依赖，并延续 className + SCSS 的现有样式组织方式。

## Goals / Non-Goals

**Goals:**
- 为 `CButton` 增加紧凑型能力，并将尺寸表达下沉为样式类名，而不是新增一套组件内尺寸分支。
- 为 `CWidget` 增加统一的 widget-level active 状态模型，支持受控与非受控两种使用方式。
- 为 `CWidget` 增加 `onActive` 回调，确保外部可以感知并联动激活态变化。
- 在 `CWidget` 根节点上输出稳定的激活态样式标记，方便 `Window`、`Dock` 等子类复用。

**Non-Goals:**
- 不重构 `CWidget` 的拖拽、缩放、preview 流程，也不改变其现有布局状态结构。
- 不引入新的主题系统、样式依赖或复杂的尺寸枚举体系。
- 不在本设计中扩展多态激活来源（如 hover/selection/focus 多通道状态），仅覆盖 proposal 中要求的 active 能力。

## Decisions

### 1. `CButton` 使用布尔型 `compact` 能力，并映射到独立样式类

`CButton` 新增一个布尔型 `compact?: boolean` 属性。当该值为 `true` 时，组件在现有 `cm-button` / `cm-button--{variant}` 基础上追加 `cm-button--compact`。组件本身不直接写入尺寸样式，也不引入新的 `size` 枚举；具体紧凑外观完全由 `src/components/Button/index.scss` 中的紧凑类定义。

这样可以把尺寸差异稳定收敛到样式层，避免组件逻辑持续膨胀，也与 proposal 中“尺寸由具体样式定义”的目标一致。

备选方案：新增 `size="compact" | "default"` 枚举。该方案会把尺寸能力扩展成一套新的组件 API，当前需求只有单个紧凑变体，复杂度偏高，因此不采用。

### 2. `CWidget` 采用“受控优先、默认激活”的 active 状态模型

`CWidgetProps` 新增 `active?: boolean` 与 `onActive?: (active: boolean) => void`。当 `active` 明确传入时，组件视为受控模式，渲染结果直接以该属性为准；当 `active` 未传入时，组件使用内部 state 保存 widget-level active，并以 `true` 作为默认初始值。

该设计满足 proposal 中“默认处于激活状态”“支持受控与非受控两种使用方式”的要求，同时避免再额外增加 `defaultActive` 这类只服务默认值覆盖的 API。非受控模式下，内部只维护最小必要状态；状态变更时统一通过内部 setter 触发 `onActive`，保证受控与非受控对外事件语义一致。

备选方案：仅支持内部 active 状态。该方案无法满足外部按需控制激活态的需求，因此不采用。

### 3. 将 widget-level active 与 preview.active 明确分层

现有 `WidgetState.preview.active` 专用于轮廓预览显示，不适合作为对外暴露的激活态。实现时将新增独立的 widget-level active 字段或等价的解析 helper，用于表达组件本体是否激活；preview 仍维持当前职责，仅表示交互预览是否存在。

这样可以避免“预览中”和“窗口已激活”语义混杂，也能降低后续 `Window`、`Dock` 等子类在维护交互状态时的歧义。

备选方案：复用 `preview.active`。该字段与拖拽/缩放过程耦合，语义错误，因此不采用。

### 4. 在 `renderFrame` 层统一追加激活态类名

`CWidget` 的根节点由 `renderFrame` 生成，且 `Window`、`Dock` 等子类都通过 `renderFrame(..., options.className)` 传入各自根类名。为避免每个子类重复拼接 active 类名，active 样式标记将在 `renderFrame` 内统一合并到最终根节点 className，例如在已有类名之外追加 `cm-widget--active`。

这种做法能让所有基于 `CWidget` 的组件天然获得一致的激活态钩子，同时不要求基类拥有单独的 SCSS 文件；各子类可按需要在自身样式中组合使用 `.cm-widget--active`。

备选方案：由每个子类自行追加激活态类名。该方案容易遗漏，也会导致状态规则分散，不采用。

## Risks / Trade-offs

- **[风险] `CButton` 的紧凑型样式可能与现有 `variant` 组合后出现视觉冲突** → **缓解：** 保持组件层只负责追加 `cm-button--compact`，把冲突处理集中在按钮样式文件中，并通过测试覆盖默认态、主按钮态与 ghost 态的组合表现。
- **[风险] `CWidget` 新增 widget-level active 后，容易与 `preview.active` 混淆** → **缓解：** 在实现中明确命名与 helper 职责，把 preview 与 widget active 的读取入口拆开，避免直接复用同一字段。
- **[风险] 受控与非受控混用时可能导致状态来源不清晰** → **缓解：** 约定 `active !== undefined` 时始终以 props 为准，所有状态写入都先经过统一 setter，避免多处直接 `setState` 修改激活态。
- **[风险] 统一追加 `cm-widget--active` 后，现有子类样式可能尚未消费该类名** → **缓解：** 将 active 类名作为稳定钩子先落地，再在本次变更涉及的 `CWidget` 相关样式中按需接入，不强制一次性改造所有子类视觉。

## Migration Plan

1. 扩展 `CButtonProps`，在按钮根节点 className 合并链路中加入 `compact` 对应的 `cm-button--compact`。
2. 在按钮样式文件中新增紧凑型类定义，并补充按钮样式组合测试。
3. 扩展 `CWidgetProps` 与内部状态解析逻辑，建立受控/非受控统一的 active 读写入口和 `onActive` 回调机制。
4. 在 `renderFrame` 输出的根节点 className 中统一追加 `cm-widget--active`，让 `Window`、`Dock` 等子类自动获得激活态样式钩子。
5. 补充 `CWidget` 相关测试，覆盖默认激活、受控覆盖、非受控状态更新与回调行为。

## Open Questions

- 当前 proposal 已明确默认激活、受控/非受控与回调需求；本设计阶段没有额外阻塞问题。实现阶段只需确认哪些交互会触发非受控 active 变化，并在测试中固定其行为。
