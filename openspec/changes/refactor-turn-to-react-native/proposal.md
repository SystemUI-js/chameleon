## Why

当前仓库的交互能力与构建假设仍以 React Web/DOM 为中心，`@system-ui-js/multi-drag` 也偏向直接面向现有 web 用法，无法支撑项目向 React Native 的破坏性转向。为了让拖拽能力先完成平台抽象，并为后续独立拆包做准备，需要先在仓库内落地一个基于 `@system-ui-js/multi-drag-core` 的 React Native 版本能力。

## What Changes

- **BREAKING**：将项目的能力方向从原生 web 优先调整为 React Native 优先，后续公开能力不再以 DOM/web 运行时为默认前提。
- 将拖拽底层依赖从 `@system-ui-js/multi-drag` 替换为 `@system-ui-js/multi-drag-core`，统一依赖核心状态与算法能力，而不是沿用现有 web 包装层。
- 新增 `src/react-native-multi-drag/`，参考现有 `multi-drag` 实现方式，提供 React Native 可用的多点/多句柄拖拽能力封装。
- 为未来独立发包预留清晰边界，使 React Native 拖拽能力在当前仓库内先具备独立目录、独立契约与可迁移实现。

## Capabilities

### New Capabilities

- `react-native-multi-drag`: 定义基于 `@system-ui-js/multi-drag-core` 的 React Native 多拖拽能力，包括输入适配、拖拽状态同步与可复用 API 契约。
- `react-native-platform-target`: 定义仓库转向 React Native 优先后的平台契约，明确能力实现不得再默认依赖 web/DOM 运行时前提。

### Modified Capabilities

- `package-entry-without-system`: 调整包入口与公开契约的要求，使其能够承载 React Native 优先的能力组织方式，并不再隐含面向 web 的消费前提。

## Impact

- 影响 `src/`：新增 `src/react-native-multi-drag/`，并可能调整现有拖拽相关实现的复用边界。
- 影响依赖：用 `@system-ui-js/multi-drag-core` 替换 `@system-ui-js/multi-drag`。
- 影响包公开面：需要重新审视包入口、导出结构与平台假设。
- 影响消费者迁移：现有依赖 web 行为或 DOM 前提的使用方式将面临 breaking change。
