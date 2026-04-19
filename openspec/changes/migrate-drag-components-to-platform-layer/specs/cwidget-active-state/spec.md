## MODIFIED Requirements

### Requirement: `CWidget` 激活态变化 MUST 向外通知并输出稳定样式钩子

当 `CWidget` 的当前激活态发生变化时，组件 MUST 通过 `onActive` 回调向外报告变化后的激活结果。处于激活状态时，`CWidget` 根节点 MUST 追加稳定的激活态样式类名；处于未激活状态时，该激活态类名 MUST 被移除，以便基于 `CWidget` 的组件复用一致的激活样式钩子。`CWidget` 的 frame、preview frame 与 resize handles 宿主渲染 MUST 经由平台原语承接，而不是在组件实现中继续直接声明 raw DOM 标签。

#### Scenario: 激活态变化后触发回调

- **WHEN** `CWidget` 的当前激活态从一个值切换到另一个值
- **THEN** 系统 MUST 调用 `onActive` 并传出变化后的激活结果

#### Scenario: 激活时输出统一样式类名

- **WHEN** `CWidget` 当前处于激活状态
- **THEN** 根节点 MUST 输出稳定的激活态样式类名，供基于 `CWidget` 的组件复用

#### Scenario: resize handles 经由平台原语渲染

- **WHEN** 仓库实现 `CWidget` 的 frame、preview frame 与 resize handles
- **THEN** 这些宿主节点 MUST 通过平台原语输出，而 MUST NOT 在 `CWidget` 组件文件中继续直接声明 raw `div`
