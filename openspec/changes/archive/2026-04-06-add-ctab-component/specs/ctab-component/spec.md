## ADDED Requirements

### Requirement: 提供声明式标签组合 API
组件库 SHALL 提供 `CTab` 与 `CTabItem` 公开组件。`CTab` MUST 将其直接子节点中的合法 `CTabItem` 识别为标签项，并从每个 `CTabItem` 的 `title` 属性生成对应的标签标题；每个标签面板的内容 SHALL 来自该 `CTabItem` 的子内容。

#### Scenario: 根据子项标题生成标签头
- **WHEN** 使用方在 `CTab` 内传入多个带有 `title` 的 `CTabItem`
- **THEN** 组件 MUST 按子项顺序渲染对应数量的标签头，并显示每个 `title` 文本

#### Scenario: 忽略非标签子项
- **WHEN** `CTab` 的直接子节点中混入非 `CTabItem` 元素
- **THEN** 组件 MUST 仅为合法的 `CTabItem` 生成标签头与内容面板

### Requirement: 提供默认激活与点击切换行为
`CTab` SHALL 在初始渲染时激活第一个可渲染的 `CTabItem`，并且 MUST 在用户点击其他标签头时切换激活项，使标签头状态与内容面板保持一致。

#### Scenario: 默认显示首个标签内容
- **WHEN** `CTab` 首次渲染且至少存在一个可渲染的 `CTabItem`
- **THEN** 第一个标签头 MUST 处于激活状态，且对应内容面板可见

#### Scenario: 点击标签后切换内容
- **WHEN** 用户点击一个当前未激活的标签头
- **THEN** 被点击的标签头 MUST 变为激活状态，且内容区域切换为该标签对应的面板内容

### Requirement: 提供基础可访问性语义
`CTab` 渲染的标签结构 SHALL 提供基础标签页语义。标签头容器 MUST 标记为 `tablist`，每个标签头 MUST 标记为 `tab`，每个内容区域 MUST 标记为 `tabpanel`，并通过可访问性属性表达当前激活关系。

#### Scenario: 激活标签暴露可访问性状态
- **WHEN** 组件渲染任意一个激活中的标签项
- **THEN** 激活标签头 MUST 暴露可识别的选中状态，且标签头与对应面板之间 MUST 存在可访问性关联

### Requirement: 组件可从公共入口使用
组件库 SHALL 通过公共导出入口暴露 `CTab` 与 `CTabItem`，使消费者可以直接从包入口导入并使用该能力，而无需访问内部路径。

#### Scenario: 消费者从包入口导入标签组件
- **WHEN** 消费者从组件库公共入口导入 `CTab` 与 `CTabItem`
- **THEN** 导入 MUST 成功，且组件可用于声明式标签页组合
