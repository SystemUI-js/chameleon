## ADDED Requirements

### Requirement: `CSlider` 提供单值范围选择能力

组件库 SHALL 提供 `CSlider` 组件用于在给定的最小值与最大值之间选择单一数值。组件 MUST 根据当前值渲染滑块按钮与填充区域位置，并且在传入值超出范围时将其裁剪到 `[min, max]` 有效区间内。

#### Scenario: 根据当前值渲染滑块位置

- **WHEN** 使用方传入 `min`、`max` 与位于区间内的当前值
- **THEN** 组件 MUST 在轨道上按对应比例渲染滑块按钮位置，并让填充区域与当前值保持一致

#### Scenario: 超出范围的值被裁剪

- **WHEN** 使用方传入小于 `min` 或大于 `max` 的当前值
- **THEN** 组件 MUST 将实际显示与对外响应的值裁剪到最近的边界值

### Requirement: `CSlider` 对交互结果应用统一的步进与边界约束

`CSlider` SHALL 对拖拽滑块按钮、点击轨道以及外部值同步后的结果使用同一套值换算规则。配置 `step` 时，系统 MUST 将结果对齐到合法步进点；未配置 `step` 时，系统 MUST 允许在范围内连续取值。

#### Scenario: 拖拽结果按步进对齐

- **WHEN** 使用方为 `CSlider` 配置 `step` 且用户将滑块拖拽到非步进点位置
- **THEN** 组件 MUST 将结果舍入到最近的合法步进值，并保持显示位置与回调值一致

#### Scenario: 轨道点击与拖拽使用一致的约束规则

- **WHEN** 用户点击轨道任意位置以更新值
- **THEN** 组件 MUST 使用与拖拽相同的边界裁剪和步进对齐规则计算结果

### Requirement: `CSlider` 提供稳定的局部样式定制入口

`CSlider` SHALL 在保留内部稳定结构类名的同时，支持为根节点、轨道、填充区域和滑块按钮分别附加外部 `className`。这些附加类名 MUST 不替换组件原有语义类名。

#### Scenario: 为关键子元素附加自定义类名

- **WHEN** 使用方为根节点、轨道、填充区域或滑块按钮提供局部 `className`
- **THEN** 对应元素 MUST 同时保留组件默认类名并附加使用方提供的类名

### Requirement: `CSlider` 可从组件库公共入口使用

组件库 SHALL 通过公共导出入口暴露 `CSlider` 组件及其相关 TypeScript 类型，使消费者无需依赖内部路径即可导入并使用该能力。

#### Scenario: 从包入口导入组件与类型

- **WHEN** 消费者从组件库公共入口导入 `CSlider` 及其相关类型
- **THEN** 导入 MUST 成功，且组件与类型可直接用于应用代码中
