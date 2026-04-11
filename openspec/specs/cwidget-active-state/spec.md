## Purpose

定义 `CWidget` 的 widget-level 激活态模型，包括默认激活、受控与非受控模式，以及对外回调与稳定样式钩子要求。

## Requirements

### Requirement: `CWidget` SHALL 提供默认激活的 widget-level active 状态

组件库 MUST 为 `CWidget` 提供独立于预览态的 widget-level active 状态模型。未显式传入受控激活值时，`CWidget` MUST 以激活状态作为初始渲染结果，并将该状态用于表达组件本体是否处于激活态，而不是复用仅服务交互预览的临时状态。

#### Scenario: 未传入受控值时默认激活

- **WHEN** 使用方渲染 `CWidget` 且未传入受控激活值
- **THEN** 组件 MUST 以激活状态完成初始渲染，并将该状态视为 widget 本体的当前激活态

#### Scenario: widget 激活态不复用预览状态

- **WHEN** `CWidget` 同时存在 widget-level 激活态与拖拽或缩放预览态
- **THEN** 系统 MUST 将二者作为独立状态处理，且 widget 是否激活 MUST NOT 依赖预览态字段推导

### Requirement: `CWidget` SHALL 支持受控与非受控两种激活模式

`CWidget` MUST 支持由外部传入的受控激活值覆盖渲染结果；当存在受控激活值时，组件显示的激活状态 MUST 与该值保持一致。未传入受控激活值时，组件 SHALL 使用内部状态维护当前激活态，并在内部激活态变化后更新渲染结果。

#### Scenario: 受控值可覆盖默认激活结果

- **WHEN** 使用方为 `CWidget` 显式传入未激活的受控激活值
- **THEN** 组件 MUST 按未激活状态渲染，而不是继续使用默认激活的内部初始值

#### Scenario: 受控值变更时同步更新渲染

- **WHEN** 使用方更新 `CWidget` 的受控激活值
- **THEN** 组件 MUST 在后续渲染中同步反映新的激活状态

#### Scenario: 非受控模式下状态变化更新渲染

- **WHEN** `CWidget` 处于非受控模式且内部激活态发生变化
- **THEN** 组件 MUST 使用新的内部激活态更新其渲染结果

### Requirement: `CWidget` 激活态变化 MUST 向外通知并输出稳定样式钩子

当 `CWidget` 的当前激活态发生变化时，组件 MUST 通过 `onActive` 回调向外报告变化后的激活结果。处于激活状态时，`CWidget` 根节点 MUST 追加稳定的激活态样式类名；处于未激活状态时，该激活态类名 MUST 被移除，以便基于 `CWidget` 的组件复用一致的激活样式钩子。

#### Scenario: 激活态变化后触发回调

- **WHEN** `CWidget` 的当前激活态从一个值切换到另一个值
- **THEN** 系统 MUST 调用 `onActive` 并传出变化后的激活结果

#### Scenario: 激活时输出统一样式类名

- **WHEN** `CWidget` 当前处于激活状态
- **THEN** 根节点 MUST 输出稳定的激活态样式类名，供基于 `CWidget` 的组件复用

#### Scenario: 未激活时移除统一样式类名

- **WHEN** `CWidget` 当前处于未激活状态
- **THEN** 根节点 MUST NOT 保留该激活态样式类名
