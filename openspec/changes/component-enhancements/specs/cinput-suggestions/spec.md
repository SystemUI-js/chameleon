## Purpose

定义 `CInput` 组件的搜索建议能力，包括建议选项的数据结构、防抖搜索触发、下拉列表渲染、选项禁用与选中回调。

## Requirements

### Requirement: `CInput` 支持通过建议选项提供输入提示

`CInput` SHALL 支持通过 `suggestionOptions` 属性传入建议选项列表。当输入框获得焦点或内容变化时，组件 MUST 根据当前输入值渲染匹配的建议下拉列表。每个建议项 MUST 显示对应的标签或值，且用户点击后 MUST 将输入框内容同步为该选项的 `value`。

#### Scenario: 渲染建议列表

- **WHEN** 使用方为 `CInput` 提供 `suggestionOptions` 且输入框处于聚焦状态
- **THEN** 组件 MUST 渲染下拉列表，展示所有匹配当前输入值的建议选项

#### Scenario: 选中建议项后同步输入值

- **WHEN** 用户点击某个建议选项
- **THEN** 输入框的值 MUST 更新为该选项的 `value`，且下拉列表 MUST 关闭

### Requirement: `CInput` 支持对搜索触发进行防抖控制

`CInput` SHALL 支持通过 `suggestionDebounce` 属性控制搜索回调的触发频率。`suggestionDebounce` 默认值为 `0`，表示不防抖；当设置为大于 `0` 的数值时，组件 MUST 在输入停止变化并经过指定延迟后才触发 `onSearch`。

#### Scenario: 不配置防抖时立即触发搜索

- **WHEN** `suggestionDebounce` 未配置或配置为 `0`，且用户输入内容发生变化
- **THEN** 组件 MUST 立即触发 `onSearch` 回调

#### Scenario: 配置防抖后延迟触发搜索

- **WHEN** `suggestionDebounce` 配置为大于 `0` 的数值，且用户连续输入
- **THEN** 组件 MUST 在用户停止输入并经过 `suggestionDebounce` 毫秒后才触发 `onSearch` 回调

### Requirement: `CInput` 提供搜索与选中回调

`CInput` SHALL 在输入值变化时触发 `onSearch` 回调，在用户选中建议项时触发 `onSelect` 回调。`onSearch` 接收当前输入字符串；`onSelect` 接收选中项的 `value` 与完整选项对象。

#### Scenario: 输入变化触发搜索回调

- **WHEN** 输入框内容发生变化且防抖条件满足
- **THEN** 组件 MUST 调用 `onSearch` 并传入当前输入值

#### Scenario: 选中建议项触发选中回调

- **WHEN** 用户点击某个建议选项
- **THEN** 组件 MUST 调用 `onSelect` 并传入该选项的 `value` 与完整选项对象

### Requirement: `CInput` 支持禁用特定建议选项

`CInput` SHALL 支持通过建议选项对象的 `disabled` 字段禁用特定选项。禁用项 MUST 在列表中可见，但用户点击时 MUST 不触发选中行为，且输入框值 MUST 保持不变。

#### Scenario: 禁用选项不可被选中

- **WHEN** 某个建议选项的 `disabled` 为 `true`
- **THEN** 该选项 MUST 在列表中呈现禁用态，且用户点击时 MUST 不触发 `onSelect`，输入框值 MUST 不变

