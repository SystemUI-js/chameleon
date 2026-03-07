## ADDED Requirements

### Requirement: Default Window SHALL be visually identifiable without shadow
在 Default 主题下，Window 组件 MUST 通过边框与结构分区被识别为独立窗口，且 MUST NOT 使用任何阴影效果（包括 box-shadow 与 filter shadow）。

#### Scenario: Window rendered in default theme
- **WHEN** Window 组件在 Default 主题中渲染
- **THEN** 窗口存在清晰边框并可与页面背景区分
- **THEN** 组件样式不包含阴影效果

### Requirement: Default Window SHALL expose clear title-bar and body hierarchy
在 Default 主题下，Window 组件 MUST 具备可感知的标题栏与内容区层次，标题栏与内容区 MUST 通过背景或边框形成视觉区分。

#### Scenario: Title and body are displayed
- **WHEN** 用户查看已渲染的 Window
- **THEN** 用户可区分标题栏区域与内容区域
- **THEN** 标题栏可被识别为窗口头部而非普通内容块

### Requirement: Active and inactive Window SHALL remain distinguishable with minimal styling
在 Default 主题下，Window 的活跃态与非活跃态 MUST 存在轻量但可感知的视觉差异；该差异 MUST 不依赖阴影，且 MUST 不降低内容可读性。

#### Scenario: Window active state changes
- **WHEN** Window 从活跃态切换为非活跃态
- **THEN** 用户可以感知到状态变化
- **THEN** 内容文本仍保持可读

### Requirement: Visual updates SHALL NOT alter existing Window behavior API
本次视觉样式更新 MUST NOT 改变 Window 组件现有交互行为与公开 API（含拖拽、缩放、激活与控制按钮回调语义）。

#### Scenario: Existing Window interactions are used after style update
- **WHEN** 调用方按原有方式使用 Window API 与交互能力
- **THEN** 行为结果与更新前保持一致
- **THEN** 不需要额外迁移代码即可升级
