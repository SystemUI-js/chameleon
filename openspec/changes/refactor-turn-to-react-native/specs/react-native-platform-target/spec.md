## ADDED Requirements

### Requirement: 新的公共能力 SHALL 以 React Native 作为默认平台目标

在本次变更范围内新增或重组的公共能力 MUST 以 React Native 运行时为默认平台目标来定义其契约、类型和使用方式，而不得再把浏览器 DOM 运行时视为默认前提。若存在过渡期的 web-only 能力，它们 MUST 被视为遗留兼容能力，而不是新的默认目标。

#### Scenario: 新能力定义时不再默认依赖 web 运行时

- **WHEN** 仓库为本次变更新增一个公共能力或公开入口
- **THEN** 该能力的契约与使用方式 MUST 在没有 DOM 或浏览器事件系统的前提下成立，并将 React Native 作为默认消费场景

#### Scenario: 遗留 web 能力不再代表默认方向

- **WHEN** 仓库同时保留既有 web-only 能力与新的 React Native 优先能力
- **THEN** 系统 MUST 将 web-only 能力标识为过渡或遗留能力，而 MUST NOT 把它们描述为默认公共平台契约

### Requirement: 平台契约 MUST 避免 DOM 与浏览器全局前提泄漏到公开面

React Native 优先的平台契约 MUST 不在公开 API、回调签名、类型定义或必需运行时中泄漏 `HTMLElement`、`HTMLDivElement`、`DOMRect`、`PointerEvent`、`MouseEvent`、`document`、`window` 等 DOM 或浏览器全局前提。任何平台差异 MUST 被封装在内部适配边界之后。

#### Scenario: 公共回调签名不暴露浏览器事件对象

- **WHEN** 消费者订阅新的平台能力回调或读取其公开类型
- **THEN** 这些签名 MUST 使用抽象的平台无关数据，而 MUST NOT 要求传递浏览器事件对象或 DOM 节点

#### Scenario: 运行时不依赖浏览器全局对象

- **WHEN** 消费者在 React Native 环境中加载新的平台优先能力
- **THEN** 系统 MUST 不要求 `document`、`window` 或 `getBoundingClientRect()` 一类浏览器能力存在才能正常初始化

### Requirement: 平台相关输入与测量 SHALL 通过受控适配边界接入

系统 MUST 将手势输入、布局测量与平台相关事件源限制在受控适配边界内，再转换为公共契约可消费的抽象数据。消费者与上层能力 MUST 依赖统一的抽象会话或状态模型，而不是直接耦合某个具体平台事件源。

#### Scenario: 平台输入先经过适配边界再进入业务状态

- **WHEN** React Native 手势系统产生开始、移动或结束事件
- **THEN** 系统 MUST 先通过内部适配边界将其转换为统一输入，再驱动公共状态或能力逻辑

#### Scenario: 更换底层平台输入实现时公共能力保持稳定

- **WHEN** 仓库替换内部手势桥接或布局测量实现
- **THEN** 只要抽象适配边界保持不变，公共能力的消费方式 MUST 保持稳定
