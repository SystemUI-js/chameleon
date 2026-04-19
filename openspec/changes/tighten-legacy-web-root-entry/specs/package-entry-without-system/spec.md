## MODIFIED Requirements

### Requirement: React Native 优先能力 SHALL 通过显式平台入口暴露

组件库 MUST 为 React Native 优先能力提供稳定、显式的平台入口或等价导出边界，使消费者能够直接导入 `react-native-multi-drag` 及其相关类型，而不需要先经过根入口或现有 web 组件集合。该入口 MUST 与根入口语义分离，以明确区分“平台优先能力”和“平台无关/过渡能力”。对于 legacy web 组件，系统 MUST 通过 `legacyWeb` 命名空间或 `legacy-web` 子路径显式暴露，而 MUST NOT 再由根入口直接平铺导出这些 web-only 组件名。

#### Scenario: 根入口不再直接平铺 legacy web 组件

- **WHEN** 消费者从组件库根入口读取公开导出集合
- **THEN** 根入口 MUST 提供 `legacyWeb` 显式命名空间与 pure theme definitions，但 MUST NOT 直接导出 `CButton`、`Theme`、`CWindow` 等 legacy web 组件名

#### Scenario: 消费者仍可通过显式边界导入 legacy web 组件

- **WHEN** 消费者需要继续使用 legacy web 组件
- **THEN** 其 MUST 能通过 `legacyWeb.*` 或 `legacy-web` 子路径导入这些能力，而不需要依赖根入口的直接组件导出
