## ADDED Requirements

### Requirement: Static 模式拖拽外框与最终尺寸一致
在 interactionMode 为 static 时，拖拽或缩放过程中显示的虚线外框尺寸 MUST 与交互结束后窗口最终尺寸一致。

#### Scenario: 拖拽移动不改变尺寸
- **WHEN** 用户在 static 模式下拖动窗口位置
- **THEN** 拖拽外框的宽高保持与当前窗口宽高一致

#### Scenario: 缩放拖拽实时反映最终尺寸
- **WHEN** 用户在 static 模式下拖拽缩放句柄调整尺寸
- **THEN** 拖拽外框的宽高与该次交互结束时的窗口最终宽高一致

### Requirement: Static 模式外框尺寸受约束逻辑影响
在 interactionMode 为 static 时，拖拽外框尺寸 MUST 与实际窗口尺寸使用同一套约束逻辑（如最小/最大尺寸、边界限制）。

#### Scenario: 约束导致尺寸被限制
- **WHEN** 用户拖拽至超过允许的最小/最大尺寸范围
- **THEN** 拖拽外框尺寸与受约束后的最终尺寸一致
