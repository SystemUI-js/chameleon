## Purpose

定义 `CSplitArea` 组件的连续分割布局能力，包括方向切换、嵌套布局、分割线拖动调整、子区域动态变化后的有效布局，以及公共入口导出要求。

## Requirements

### Requirement: `CSplitArea` 根据子内容生成连续分割区域

组件库 SHALL 提供 `CSplitArea` 组件，并将其直接子内容按声明顺序解析为连续区域。每个可渲染子节点 MUST 对应一个可见分割区域；当某个区域内部继续使用 `CSplitArea` 时，系统 MUST 支持递归嵌套布局而不破坏父级区域结构。

#### Scenario: 多个子节点生成多个区域

- **WHEN** 使用方在 `CSplitArea` 中传入两个或以上可渲染子节点
- **THEN** 组件 MUST 按子节点顺序渲染对应数量的连续区域，并在相邻区域之间渲染分割线

#### Scenario: 区域内可嵌套新的分割容器

- **WHEN** 某个区域的子内容本身包含一个嵌套的 `CSplitArea`
- **THEN** 父级 `CSplitArea` MUST 保持原有区域划分，且嵌套容器 MUST 在该区域内部继续独立完成分割布局

### Requirement: `CSplitArea` 支持横向与纵向分割方向

`CSplitArea` SHALL 支持通过 `direction` 属性切换分割主轴。`horizontal` MUST 表示区域沿水平方向并排排列，`vertical` MUST 表示区域沿垂直方向堆叠排列；分割线视觉方向与交互方向 MUST 与当前分割主轴保持一致。

#### Scenario: 横向分割排列区域

- **WHEN** 使用方将 `direction` 设置为 `horizontal`
- **THEN** 所有区域 MUST 在水平方向依次排列，且相邻区域之间的分割线 MUST 呈现为纵向分割线

#### Scenario: 纵向分割排列区域

- **WHEN** 使用方将 `direction` 设置为 `vertical`
- **THEN** 所有区域 MUST 在垂直方向依次排列，且相邻区域之间的分割线 MUST 呈现为横向分割线

### Requirement: `CSplitArea` 可按配置启用分割线拖动调整

`CSplitArea` SHALL 通过 `separatorMovable` 属性控制分割线是否支持拖动调整。`separatorMovable` 为 `true` 时，用户 MUST 能通过拖动分割线调整相邻区域尺寸；为 `false` 时，分割线 MUST 保持非拖动态，且布局不会因为指针拖拽而改变。

#### Scenario: 启用拖动后调整相邻区域尺寸

- **WHEN** `separatorMovable` 为 `true` 且用户拖动任意一条分割线
- **THEN** 系统 MUST 实时更新该分割线两侧相邻区域的尺寸分配，并保持容器整体布局连续

#### Scenario: 禁用拖动时布局不响应拖拽

- **WHEN** `separatorMovable` 为 `false` 且用户尝试拖动分割线
- **THEN** 系统 MUST 不改变任何区域尺寸，且分割线不进入可拖动交互状态

### Requirement: `CSplitArea` 在子区域数量变化后保持有效布局

当 `CSplitArea` 的可渲染子节点数量发生变化时，组件 MUST 重新计算区域与分割线结构，使剩余区域继续形成有效布局。被移除区域对应的分割线 SHALL 同步移除，不得保留失效占位或断裂结构。

#### Scenario: 删除中间区域后重新整理布局

- **WHEN** 一个已渲染的中间区域从 `CSplitArea` 的子节点列表中被移除
- **THEN** 系统 MUST 立即移除该区域及其失效分割线，并让剩余区域重新组成连续布局

### Requirement: `CSplitArea` 可从组件库公共入口导出

组件库 SHALL 通过公共导出入口暴露 `CSplitArea`，使消费者可以直接从包入口导入并使用该组件，而无需依赖内部路径。

#### Scenario: 消费者从包入口导入 `CSplitArea`

- **WHEN** 消费者从组件库公共入口导入 `CSplitArea`
- **THEN** 导入 MUST 成功，且组件可用于构建分割区域布局
