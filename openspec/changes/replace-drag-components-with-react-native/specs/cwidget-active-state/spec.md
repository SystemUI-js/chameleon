## MODIFIED Requirements

### Requirement: `CWidget` 激活态变化 MUST 向外通知并输出稳定状态语义

当 `CWidget` 的当前激活态发生变化时，组件 MUST 通过 `onActive` 回调向外报告变化后的激活结果。`CWidget` 的宿主渲染基础 MUST 改为 React Native 原生组件；即使其宿主实现变化，公开的激活态 props 与回调语义 MUST 继续保持稳定。

#### Scenario: 激活态变化后触发回调

- **WHEN** `CWidget` 的当前激活态从一个值切换到另一个值
- **THEN** 系统 MUST 调用 `onActive` 并传出变化后的激活结果

#### Scenario: 宿主改为 React Native 后激活态契约仍稳定

- **WHEN** 使用方在迁移后继续以 `active` / `onActive` 消费 `CWidget`
- **THEN** 这些 props 的语义 MUST 不因宿主从 DOM 切换为 React Native 而变化
