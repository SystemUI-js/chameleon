## ADDED Requirements

### Requirement: Select / Menu / Layout / Tab 链 SHALL 默认使用 React Native 宿主

`CSelect`、`CMenu`、`CGrid`、`CGridItem`、`CScreen`、`CTab` 的源码实现 MUST 以 `react-native` 原生组件作为默认宿主，而不再直接依赖 `<select>`、`<option>`、`<div>`、`<ul>`、`<li>` 或 `<button>` 等 DOM 标签。legacy web 入口可以继续暴露这些组件，但其内部默认实现 MUST 建立在 RN 宿主之上。

#### Scenario: 五个组件不再直接渲染 DOM 标签

- **WHEN** 仓库实现 `CSelect`、`CMenu`、`CGrid`、`CScreen`、`CTab`
- **THEN** 这些组件 MUST 从 `react-native` 导入原生宿主完成渲染，而 MUST NOT 在源码中继续直接返回 DOM 标签

### Requirement: 关键交互与布局语义 SHALL 在过渡期继续可验证

在当前迁移阶段，`CSelect`、`CMenu`、`CTab`、`CGrid`、`CScreen` MUST 继续暴露可测试的 combobox / menu / tab / layout 过渡语义，使 legacy web 过渡面在不依赖 DOM 宿主源码的前提下仍可被验证。

#### Scenario: Menu 与 Tab 在过渡期保持可测试的交互语义

- **WHEN** 消费者使用 `CMenu` 的 click / hover 模式或 `CTab` 的键盘切换
- **THEN** 系统 MUST 继续提供可验证的 menu / tab 角色、状态与焦点切换语义

#### Scenario: Select 与 Grid 在过渡期保持可测试的值和布局语义

- **WHEN** 消费者使用 `CSelect` 配置选项或 `CGrid` / `CScreen` 配置布局
- **THEN** 系统 MUST 继续提供可验证的 value / option / style / class 语义，而不要求组件源码直接依赖 DOM 宿主
