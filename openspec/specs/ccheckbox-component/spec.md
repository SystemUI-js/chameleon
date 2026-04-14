## Purpose

定义 `CCheckbox` 的独立复选框能力，包括原生 checkbox 语义、受控与非受控状态模型、标签可访问名称、稳定类名与禁用态约束，以及公共导出要求。

## Requirements

### Requirement: `CCheckbox` SHALL 提供独立复选框组件能力

组件库 SHALL 提供公开的 `CCheckbox` 组件，用于表达单个布尔选择项。`CCheckbox` MUST 基于原生复选框语义工作，并且在渲染后能够被识别为可交互的 checkbox 控件，而不依赖额外的 group 容器、上下文注册或专用父组件。

#### Scenario: 独立渲染复选框

- **WHEN** 使用方单独渲染一个 `CCheckbox`
- **THEN** 组件 MUST 渲染出一个具备原生 checkbox 语义的可见控件，且不要求存在额外父级组件

### Requirement: `CCheckbox` MUST 支持受控与非受控选中状态

`CCheckbox` MUST 同时支持受控与非受控两种选中状态模型。使用方提供受控选中值时，组件 SHALL 以外部传入值作为当前显示状态；使用方仅提供非受控初始值时，组件 SHALL 以该初始值建立内部状态，并在后续用户交互中更新显示状态。用户触发状态切换时，组件 MUST 向外通知最新布尔结果。

#### Scenario: 受控模式由外部值驱动

- **WHEN** 使用方以受控方式渲染 `CCheckbox` 并更新其选中值
- **THEN** 组件 MUST 以最新外部值反映当前选中状态，并在用户交互时通知状态变更意图

#### Scenario: 非受控模式响应用户切换

- **WHEN** 使用方仅为 `CCheckbox` 提供非受控初始选中值并触发点击或等效交互
- **THEN** 组件 MUST 从初始值开始渲染，并在交互后切换为新的选中状态

### Requirement: `CCheckbox` SHALL 提供标签内容与可访问名称

`CCheckbox` SHALL 支持为复选框渲染可见标签内容，使使用方能够通过标签文本描述当前选择项。组件 MUST 让标签内容成为该复选框的可访问名称来源；当同时提供多种标签内容来源时，组件 MUST 按约定选择唯一展示内容，避免重复或冲突的可访问名称。

#### Scenario: 标签内容形成可访问名称

- **WHEN** 使用方为 `CCheckbox` 提供可见标签内容
- **THEN** 复选框 MUST 以该标签内容作为用户可感知名称，并可通过名称被查询或识别

### Requirement: `CCheckbox` MUST 提供稳定类名并支持禁用态

`CCheckbox` MUST 为根节点、输入节点和标签节点输出稳定的 `cm-checkbox` 系列类名，以支持统一样式与主题扩展。组件处于禁用态时，MUST 反映禁用语义并阻止用户交互导致的状态变更；在启用主题能力时，组件 SHALL 保留基础类名并合并主题相关类名，而不得破坏稳定类名输出。

#### Scenario: 默认渲染输出稳定类名

- **WHEN** 使用方渲染一个启用状态的 `CCheckbox`
- **THEN** 组件 MUST 输出稳定的 `cm-checkbox` 系列基础类名，以标识根节点、输入节点和标签节点

#### Scenario: 禁用态不响应状态切换

- **WHEN** 使用方将 `CCheckbox` 渲染为禁用态并尝试触发点击或等效交互
- **THEN** 组件 MUST 保持禁用语义且不得发生选中状态变更

#### Scenario: 主题类名与基础类名共存

- **WHEN** 使用方在主题上下文中渲染 `CCheckbox` 或显式指定主题
- **THEN** 组件 MUST 同时保留稳定基础类名与对应主题类名

### Requirement: `CCheckbox` SHALL 通过公共入口导出组件与类型

组件库 SHALL 通过公共导出入口暴露 `CCheckbox` 及其 props 类型，使消费者可以直接从包入口导入组件与类型定义，而无需依赖内部实现路径。

#### Scenario: 从包入口导入组件与类型

- **WHEN** 消费者从组件库公共入口导入 `CCheckbox` 及其 props 类型
- **THEN** 导入 MUST 成功，且组件与类型定义可直接用于应用代码
