## Purpose

对 `CSlider` 组件已实现的 `step` 支持进行规格验证与测试确认。本次规格为验证性质，不定义新的实现需求；若验证过程中发现现有实现不符合以下要求，应记录缺陷并评估修复。

## Requirements

### Requirement: `CSlider` 的 `step` 约束已正确实现

`CSlider` 已支持 `step` 属性。当配置 `step` 时，系统 MUST 将拖拽结果对齐到合法步进点；未配置 `step` 时，系统 MUST 允许在范围内连续取值。以下场景用于验证现有实现是否符合该要求。

#### Scenario: 拖拽结果按步进对齐

- **WHEN** 使用方为 `CSlider` 配置 `step` 且用户将滑块拖拽到非步进点位置
- **THEN** 组件 MUST 将结果舍入到最近的合法步进值，并保持显示位置与回调值一致

#### Scenario: 轨道点击与拖拽使用一致的约束规则

- **WHEN** 用户点击轨道任意位置以更新值
- **THEN** 组件 MUST 使用与拖拽相同的边界裁剪和步进对齐规则计算结果

#### Scenario: 边界值附近的步进对齐正确

- **WHEN** 当前值接近 `min` 或 `max`，且用户通过拖拽或点击将值推向边界
- **THEN** 组件 MUST 将结果正确对齐到最近的合法步进值，且不得超出 `[min, max]` 范围

### Requirement: `CSlider` 的步进约束可通过测试验证

`CSlider` 的 `step` 行为 MUST 能够被现有测试基础设施覆盖。测试 SHOULD 在无需真实浏览器拖拽的前提下，验证步进对齐、边界裁剪与回调一致性。

#### Scenario: 通过单元测试验证步进对齐

- **WHEN** 运行针对 `CSlider` `step` 行为的单元测试
- **THEN** 测试 MUST 覆盖步进舍入、边界值、拖拽与点击一致性，且所有测试 MUST 通过

