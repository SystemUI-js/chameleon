## Why

当前开发入口将 `Win98Theme` 直接绑定在 `main.tsx`，导致主题无法在同一入口下切换；同时 `CScreenManager` 仍是透传容器，未形成与 `CWindowManager` 一致的“管理器职责”，使屏幕管理行为不明确。现在需要统一主题入口与管理器语义，减少后续扩展 WinXp 主题与多屏管理时的重复改造成本。

## What Changes

- 在开发入口移除对 `Win98Theme` 的直接依赖，引入“主题切换组件”作为主题挂载入口。
- 新增 `WinXpTheme` 并在代码层面提供常量式主题选择（非运行时配置中心）。
- 增强 `CScreenManager`，参考 `CWindowManager` 的管理模式来管理 `CScreen`（`CScreen` 仍在 theme 内声明）。
- 评估并在可行时提取 `ScreenManager` 与 `WindowManager` 的共享管理逻辑为基类，避免重复实现。
- 清理与当前主题/上下文实现不一致的残留测试，保证测试集与现状一致。

## Capabilities

### New Capabilities
- `screen-class-registration`: 定义 `CScreenManager` 对合法 `CScreen` 类/元素的注册、去重与渲染行为。
- `dev-theme-selection`: 定义开发入口的主题切换挂载方式，以及 `Win98Theme`/`WinXpTheme` 的常量选择行为。

### Modified Capabilities
- None.

## Impact

- 受影响代码：`src/dev/main.tsx`、`src/components/Screen/ScreenManager.tsx`、`src/theme/win98/*`、新增 `src/theme/winxp/*`（如采用）。
- 受影响测试：主题相关与 manager 相关测试将调整，移除残留且无实现支撑的测试用例。
- 受影响导出：可能新增 `WinXpTheme` 导出并更新 `src/index.ts`/组件导出聚合。
