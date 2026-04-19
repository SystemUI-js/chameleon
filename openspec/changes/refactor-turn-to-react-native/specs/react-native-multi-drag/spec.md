## ADDED Requirements

### Requirement: `react-native-multi-drag` SHALL 提供基于 core 的 React Native 多拖拽公开能力

组件库 MUST 提供 `react-native-multi-drag` 能力，用于在 React Native 环境中驱动多点或多句柄拖拽交互。该能力 MUST 建立在 `@system-ui-js/multi-drag-core` 之上，并以平台无关的拖拽状态与生命周期为核心，而不是要求消费者依赖 DOM 元素、浏览器事件或现有 web 包装层才能使用。

#### Scenario: 消费者可在 React Native 环境启动拖拽会话

- **WHEN** 消费者通过公开的 React Native 拖拽能力提供起始位置、拖拽目标标识和会话元数据来启动一次拖拽
- **THEN** 系统 MUST 基于 `@system-ui-js/multi-drag-core` 创建对应的拖拽会话，并返回可持续更新的拖拽状态，而不要求任何 DOM 运行时对象参与

#### Scenario: 拖拽会话以抽象生命周期结束

- **WHEN** 一次拖拽因完成、取消或中断而结束
- **THEN** 系统 MUST 以统一的结束状态关闭该会话，并提供最终位移、结束原因与关联元数据，而不是暴露浏览器特定事件对象

### Requirement: `react-native-multi-drag` SHALL 在多拖拽交互期间同步稳定状态

`react-native-multi-drag` MUST 在拖拽进行期间持续维护当前激活项、拖拽位移、会话标识与业务元数据的一致状态，使消费者能够在 React Native 视图层中复用同一套状态驱动渲染、排序或反馈逻辑。

#### Scenario: 连续更新拖拽位移时状态保持一致

- **WHEN** 同一拖拽会话在移动过程中收到连续的位置更新
- **THEN** 系统 MUST 基于同一会话上下文累计并输出一致的当前位移、激活目标和会话状态

#### Scenario: 多个可拖拽目标共享统一状态模型

- **WHEN** 消费者在同一列表或容器中注册多个可拖拽目标或拖拽句柄
- **THEN** 系统 MUST 使用统一的状态模型区分当前激活目标、非激活目标与会话元数据，避免要求消费者为每个目标实现彼此隔离且不兼容的拖拽协议

### Requirement: `react-native-multi-drag` 公开契约 MUST 保持 DOM 无关且可迁移

`react-native-multi-drag` 的公开 API 与类型 MUST 仅暴露 React Native 可消费的抽象拖拽数据、配置项和结果，不得要求 `HTMLElement`、`DOMRect`、`PointerEvent`、`MouseEvent`、`document` 或 `window` 一类 web/DOM 前提。该契约 MUST 允许后续独立拆包时保持稳定，而无需让消费者迁移到底层适配细节。

#### Scenario: 公共类型不包含 DOM 特定依赖

- **WHEN** 消费者查看 `react-native-multi-drag` 的公开类型与回调签名
- **THEN** 这些契约 MUST 只包含抽象拖拽数据、布局信息和会话结果，而 MUST NOT 包含 DOM 元素或浏览器事件类型

#### Scenario: 内部适配实现变化不破坏公共契约

- **WHEN** 仓库内部更换 React Native 手势桥接实现或测量适配细节
- **THEN** 只要抽象拖拽会话契约不变，消费者侧的 `react-native-multi-drag` 调用方式 MUST 保持兼容
