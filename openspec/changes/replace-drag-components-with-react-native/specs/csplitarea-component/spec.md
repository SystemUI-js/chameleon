## MODIFIED Requirements

### Requirement: `CSplitArea` 根据子内容生成连续分割区域

组件库 SHALL 提供 `CSplitArea` 组件，并将其直接子内容按声明顺序解析为连续区域。该组件的宿主渲染 MUST 改为 React Native 原生组件，但区域顺序、方向切换与分割布局的公开 props 语义 MUST 继续保持稳定。

#### Scenario: 多个子节点生成多个区域

- **WHEN** 使用方在 `CSplitArea` 中传入两个或以上可渲染子节点
- **THEN** 组件 MUST 按子节点顺序渲染对应数量的连续区域

#### Scenario: 横向与纵向方向继续生效

- **WHEN** 使用方通过 `direction` 切换 `horizontal` / `vertical`
- **THEN** 组件 MUST 继续根据方向调整区域布局，而不因宿主切换为 React Native 而失效
