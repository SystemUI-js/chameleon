## Context

当前库已有全局注册表模式（`mountRegistry`）与基于主题的样式覆盖机制（`ThemeContext` + 主题 SCSS），但组件渲染层缺少可插拔的 renderer 注册/查找能力。Window 标题栏目前在 `Window.tsx` 中内联渲染，无法按主题替换为自定义实现。

## Goals / Non-Goals

**Goals:**
- 提供全局 renderer 注册/查找机制，基于 name 定位组件实现。
- 通过 TS 类型约束保证 renderer 组件 Props 与 name 绑定，避免错误组件注入。
- 新增 `GlobalRender` 组件用于渲染注册的 renderer，并支持主题化选择。
- 将 Window 标题栏渲染切换为 `GlobalRender`，并提供 Win98/WinXP 的 Title renderer 实现。

**Non-Goals:**
- 不引入第三方依赖或复杂插件系统。
- 不覆盖所有组件的渲染器，仅从 Window Title 开始。
- 不处理 SSR 或跨文档/iframe 渲染。

## Decisions

- **注册表形态**：复用 `mountRegistry` 的 Map 注册表思路，使用模块级 `Map<string, RendererRecord>` 存储 renderer，并提供注册/注销与订阅接口，保持 API 简洁且易于测试。
  - 备选：使用 React Context 传递 registry；但会增加 Provider 依赖与调用成本，不符合“全局注册”的预期。
- **类型约束**：通过函数重载或映射类型将 `name` 与 Props 绑定；每个 renderer 定义并导出独立 Props 类型（如 `WindowTitleRendererProps`）。
  - 备选：统一 `RendererProps` 但会丧失类型安全，不满足“避免奇怪组件”的目标。
- **主题化选择**：`GlobalRender` 内部通过 `useOptionalTheme()` 获取 `theme.id`，优先查找 `themeId:name`（或 `{themeId, name}` 结构），再回退到通用 `name` renderer。
  - 备选：在 `registerGlobalRenderer` 直接绑定主题；但调用方易错且重复，放在 `GlobalRender` 更集中。
- **渲染入口**：`Window` 的标题栏由 `GlobalRender name="window-title"` 渲染，传入标题栏所需 props（title/icon/isActive/onClose/onMinimize/onMaximize 等）。

## Risks / Trade-offs

- [全局注册表与 React 生命周期错配] → 提供注销函数并在组件卸载时清理，必要时配合订阅/快照避免 stale 状态。
- [类型约束复杂度] → 使用少量、清晰的重载与 Props 导出，避免过度泛型设计。
- [主题 renderer 缺失] → `GlobalRender` 对未注册场景返回 null，保证无注册时不破坏现有行为。
- [样式兼容] → 主题 Title renderer 需复用现有 className 或提供兼容样式，确保 Win98/WinXP 风格一致。
