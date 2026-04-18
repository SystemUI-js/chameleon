## MODIFIED Requirements

### Requirement: `CSplitArea` 可按配置启用分割线拖动调整

`CSplitArea` SHALL 通过 `separatorMovable` 属性控制分割线是否支持拖动调整。`separatorMovable` 为 `true` 时，用户 MUST 能通过拖动分割线调整相邻区域尺寸；为 `false` 时，分割线 MUST 保持非拖动态，且布局不会因为指针拖拽而改变。`CSplitArea` 的分割区域、分割线与分割线把手宿主渲染 MUST 经由平台原语承接，而不是在组件实现中直接绑定 raw DOM 标签。

#### Scenario: 启用拖动后调整相邻区域尺寸

- **WHEN** `separatorMovable` 为 `true` 且用户拖动任意一条分割线
- **THEN** 系统 MUST 实时更新该分割线两侧相邻区域的尺寸分配，并保持容器整体布局连续

#### Scenario: 禁用拖动时布局不响应拖拽

- **WHEN** `separatorMovable` 为 `false` 且用户尝试拖动分割线
- **THEN** 系统 MUST 不改变任何区域尺寸，且分割线不进入可拖动交互状态

#### Scenario: 分割线宿主经由平台原语渲染

- **WHEN** 仓库实现 `CSplitArea` 的 panel 与 separator 宿主结构
- **THEN** 这些宿主节点 MUST 通过平台原语输出，而 MUST NOT 在 `CSplitArea` 组件文件中继续直接声明 raw `div`/`span`
