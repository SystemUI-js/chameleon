## ADDED Requirements

### Requirement: Radio / StatusBar / ScrollArea 链 SHALL 默认使用 React Native 宿主

`CRadio`、`CRadioGroup`、`CStatusBar`、`CStatusBarItem`、`CScrollArea` 的源码实现 MUST 以 `react-native` 原生组件作为默认宿主，而不再直接依赖 `<input>` 或 `<div>` 等 DOM 标签。legacy web 入口可以继续暴露这些组件，但其内部默认实现 MUST 建立在 RN 宿主之上。

#### Scenario: 五个组件不再直接渲染 DOM 标签

- **WHEN** 仓库实现 `CRadio`、`CRadioGroup`、`CStatusBar`、`CStatusBarItem`、`CScrollArea`
- **THEN** 它们 MUST 从 `react-native` 导入原生宿主并完成渲染，而 MUST NOT 在源码中继续直接返回 DOM 标签

### Requirement: Radio 与 ScrollArea 公共语义 SHALL 在过渡期继续可验证

在当前迁移阶段，`CRadio` 与 `CScrollArea` MUST 继续暴露可测试的 checked / scroll / focusable 过渡语义，使 legacy web 过渡面在不依赖 DOM 宿主源码的前提下仍可被验证。

#### Scenario: Radio 通过抽象 checked 语义驱动选择状态

- **WHEN** 消费者使用受控或非受控 `CRadioGroup`
- **THEN** `CRadio` MUST 通过统一的 checked 状态与选择回调表达行为，而不要求浏览器原生 radio input 参与

#### Scenario: ScrollArea 仍可暴露受控滚动与内容区域语义

- **WHEN** 消费者使用 `CScrollArea` 配置 overflow、tabIndex 或读取内容区域
- **THEN** 系统 MUST 继续提供可验证的滚动根节点与内容容器语义，而不要求组件源码直接依赖 DOM 容器实现
