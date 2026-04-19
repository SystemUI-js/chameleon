## MODIFIED Requirements

### Requirement: 包入口 SHALL 收敛为组件库与纯主题定义公开面

在移除 legacy system layer 后，组件库根入口 MUST 继续提供平台无关的公共契约与纯主题定义导出，使使用方能够通过根入口消费不依赖特定平台运行时前提的能力。若过渡期仍保留既有 web-only 组件导出，这些导出 MUST 被视为受限的过渡能力，而 MUST NOT 继续把根入口语义定义为“默认面向 DOM/web 的组件库入口”。

#### Scenario: 使用方可从根入口导入平台无关能力与纯主题定义

- **WHEN** 使用方从组件库根入口导入纯主题定义以及仍被声明为平台无关的公共契约
- **THEN** 这些导出 MUST 作为受支持的公共契约可用，且不要求同时导入任何 legacy system 符号或依赖 DOM 专属前提

#### Scenario: 根入口不再隐含默认 web 语义

- **WHEN** 使用方检查组件库根入口在本次 breaking change 后的公开导出说明
- **THEN** 根入口 MUST 被表述为平台无关或受控过渡能力的集合，而 MUST NOT 被表述为默认面向 web/DOM 的公共入口

## ADDED Requirements

### Requirement: React Native 优先能力 SHALL 通过显式平台入口暴露

组件库 MUST 为 React Native 优先能力提供稳定、显式的平台入口或等价导出边界，使消费者能够直接导入 `react-native-multi-drag` 及其相关类型，而不需要先经过根入口或现有 web 组件集合。该入口 MUST 与根入口语义分离，以明确区分“平台优先能力”和“平台无关/过渡能力”。

#### Scenario: 消费者可通过显式入口导入 React Native 拖拽能力

- **WHEN** 消费者需要使用 React Native 多拖拽能力
- **THEN** 其 MUST 能通过稳定的显式平台入口导入对应能力与类型，而不要求从根入口间接获取或依赖 web 组件导出

#### Scenario: 平台入口与根入口职责清晰分离

- **WHEN** 消费者同时查看根入口与 React Native 平台入口的公开导出
- **THEN** 根入口与显式平台入口 MUST 在职责上保持清晰区分，使消费者能够判断哪些能力属于 React Native 优先能力，哪些能力属于平台无关或过渡契约
