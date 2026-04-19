## ADDED Requirements

### Requirement: 基础控件链 SHALL 默认使用 React Native 原生宿主

`Button / ButtonGroup / ButtonSeparator / Checkbox / Icon` 的源码实现 MUST 以 `react-native` 原生组件作为默认宿主，而不再直接依赖 `<button>`、`<input>`、`<span>` 或 `<div>` 等 DOM 标签。legacy web 入口可以继续暴露这些控件，但其内部契约 MUST 建立在 React Native 宿主之上；当前测试层允许通过受控的 interop props 验证过渡语义。

#### Scenario: 基础控件不再直接渲染 DOM 标签

- **WHEN** 仓库实现 `Button / ButtonGroup / ButtonSeparator / Checkbox / Icon`
- **THEN** 这些组件 MUST 从 `react-native` 导入原生宿主并完成渲染，而 MUST NOT 在源码中继续直接返回 DOM 标签

### Requirement: 基础控件公开交互 SHALL 保持平台无关状态语义

`Checkbox` 与 `Icon` 的公开交互 MUST 通过抽象状态、角色和回调表达，而不得再依赖浏览器原生 input 或 button 嵌套结构才能成立。

#### Scenario: Checkbox 通过抽象 checked 语义工作

- **WHEN** 消费者使用受控或非受控 `Checkbox`
- **THEN** 系统 MUST 通过统一的 checked 状态与切换回调表达行为，而不是要求浏览器原生 checkbox input 参与

#### Scenario: Icon 与 IconContainer 组合时不再形成嵌套 button

- **WHEN** `Icon` 被渲染在已可点击的 `IconContainer` 内部
- **THEN** 组合结果 MUST 不依赖 button 内再嵌套 button 的 DOM 结构才能工作
