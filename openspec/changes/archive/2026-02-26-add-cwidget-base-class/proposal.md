## Why

`CWindow` 目前直接继承 `React.Component`，而 `CWindowManager` 的窗口构造器判断也直接绑定到 `CWindow`。这使得“可被窗口管理器识别的窗口组件”缺少统一抽象层，不利于后续扩展与复用。现在引入 `CWidget` 作为基类，可以把位置与尺寸这类通用能力前置，并让类型判断更清晰。

## What Changes

- 在 `src/components/Widget` 下新增 `CWidget` 组件（文件夹名 `Widget`），作为基础外框组件。
- `CWidget` 提供位置与尺寸相关 Props（例如 `x`、`y`、`width`、`height`）并负责外框渲染。
- `CWindow` 从直接继承 `React.Component` 改为继承 `CWidget`，保持其窗口语义能力。
- `CWindowManager` 中 `windowCtor` 类型判定从 `CWindow` 基准调整为 `CWidget` 基准，使其识别 `CWidget` 体系内组件。
- 更新对应测试，确保：合法子类可注册、非 `CWidget` 类被拒绝、去重行为保持不变。

## Capabilities

### New Capabilities
- `widget-base-class`: 引入 `CWidget` 基类并定义通用位置/尺寸外框能力。
- `widget-constructor-registration`: 让 `CWindowManager` 基于 `CWidget` 体系进行构造器识别与注册。

### Modified Capabilities
- None.

## Impact

- Affected code:
  - `src/components/Widget/Widget.tsx`（新增）
  - `src/components/Window/Window.tsx`
  - `src/components/Window/WindowManager.tsx`
  - `tests/WindowManager.test.tsx`
- API impact:
  - `CWindowManager` 的注册/识别边界从 `CWindow` 体系迁移为 `CWidget` 体系。
  - 新增 `CWidget` 的基础 Props 约定（位置、尺寸）。
- Dependencies: 无新增外部依赖。
- Systems: 影响窗口组件继承关系与窗口管理器的类型守卫路径。
