## ADDED Requirements

### Requirement: 窗口/拖拽组件链 SHALL 直接使用 React Native 原生组件作为宿主

`Widget`、`Window`、`WindowTitle`、`Dock`、`StartBar`、`CSlider`、`CSplitArea`、`IconContainer` MUST 直接使用 `react-native` 提供的原生组件作为宿主渲染基础，而 MUST NOT 在这些组件源码中继续声明 DOM 标签或依赖 DOM 宿主包装层。

#### Scenario: 组件源码直接导入 React Native 原生组件

- **WHEN** 仓库实现上述组件链
- **THEN** 这些组件 MUST 从 `react-native` 导入 `View`、`Text`、`Pressable` 或等价原生组件来完成宿主渲染

### Requirement: 工具链 MUST 支持 RN 组件源码的构建与测试

当组件源码直接依赖 `react-native` 时，仓库的打包与测试配置 MUST 提供对应支持：构建时应把 `react-native` 视为外部依赖，测试时应能解析并渲染这些组件的宿主替身。

#### Scenario: 构建阶段不内联 react-native

- **WHEN** 仓库执行 library build
- **THEN** `react-native` MUST 作为外部依赖处理，而不得被打包进产物

#### Scenario: 测试阶段可解析 react-native 导入

- **WHEN** 仓库执行 Jest 测试
- **THEN** 测试环境 MUST 能成功解析组件源码中的 `react-native` 导入，并验证其公开行为
