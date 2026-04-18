## ADDED Requirements

### Requirement: 拖拽相关 legacy web 组件 SHALL 通过平台原语承接宿主渲染

`WindowTitle`、`Widget`、`IconContainer`、`CSplitArea`、`CSlider` 这五个拖拽相关 legacy web 组件 MUST 通过受控的平台原语承接宿主节点渲染，而 MUST NOT 在组件实现文件内继续直接声明原生 `div`、`span` 或等价 web 宿主标签。平台原语 MAY 仍基于 web 宿主实现，但宿主细节 MUST 被收敛到独立平台层。

#### Scenario: 组件逻辑文件不再直接声明 raw DOM 标签

- **WHEN** 仓库实现上述五个组件的逻辑与渲染
- **THEN** 组件文件 MUST 通过平台原语输出宿主节点，而 MUST NOT 在组件实现中直接书写 raw `div`/`span`

### Requirement: 布局测量 SHALL 通过平台 helper 接入组件逻辑

上述五个组件如需读取宿主布局信息，MUST 通过平台 helper 获取统一测量结果，而 MUST NOT 在组件逻辑中继续散落 `getBoundingClientRect()`、`DOMRect` 解构等 web 测量细节。

#### Scenario: 组件读取布局时先经过平台 helper

- **WHEN** 任一目标组件需要计算拖拽 pose、分割线位置或滑块轨道尺寸
- **THEN** 该组件 MUST 通过平台 helper 获取测量结果，再将其转换为业务状态

### Requirement: 平台层迁移 MUST 保持 legacy web 行为兼容

在切换到平台原语后，五个目标组件 MUST 继续保持当前公共行为、测试标识、样式类名与交互语义兼容，不得因平台层引入而改变现有 legacy web 消费方式。

#### Scenario: 平台层迁移后消费者行为保持不变

- **WHEN** 现有消费者继续使用这五个 legacy web 组件
- **THEN** 组件的可见行为、测试契约与样式钩子 MUST 与迁移前保持兼容
