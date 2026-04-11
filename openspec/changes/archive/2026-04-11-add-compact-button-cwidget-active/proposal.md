## Why

当前按钮尺寸能力不够灵活，无法用更贴近具体视觉稿的方式提供紧凑型样式；同时 `CWidget` 缺少统一的 active 状态接口，导致外部难以按需控制激活态或复用一致的激活样式。现在补齐这两项能力，可以为后续 Windows 98 风格组件提供更稳定的交互与样式基础。

## What Changes

- 为按钮增加紧凑型样式能力，使尺寸由具体样式定义，而不是在组件内部固化尺寸逻辑。
- 为 `CWidget` 增加 `active` 状态能力，支持受控与非受控两种使用方式。
- 为 `CWidget` 增加 `onActive` 回调，用于对外响应激活状态变化。
- 约定 `CWidget` 默认处于激活状态，并在激活时追加对应的样式类名。

## Capabilities

### New Capabilities
- `cbutton-compact`: 定义按钮的紧凑型样式能力，以及尺寸由样式层决定的约束。
- `cwidget-active-state`: 定义 `CWidget` 的 active 状态模型，包括默认值、受控/非受控行为、状态回调与激活态样式表现。

### Modified Capabilities
- 无

## Impact

- 受影响代码主要位于 `src/components/` 中的按钮与 `CWidget` 相关组件实现。
- 受影响样式主要位于对应组件的样式文件，需要新增紧凑型与激活态 class 约定。
- 受影响测试主要位于 `tests/`，需要覆盖按钮样式变体与 `CWidget` active 行为。
- 不引入新依赖，不涉及后端或外部系统变更。
