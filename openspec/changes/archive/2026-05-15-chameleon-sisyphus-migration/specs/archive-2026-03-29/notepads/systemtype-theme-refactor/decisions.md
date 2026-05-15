## 2026-03-23 Wave 1 test seam decisions

- Current dev entry `src/dev/themeSwitcher.tsx` performs full-root swapping via `DevThemeRoot` resolving a complete theme root component from `activeTheme`.
- Cross-theme characterization assertions should anchor on stable base test IDs, not theme-specific body IDs.
- Stable seam confirmed for later Windows unification: `window-frame` in `src/components/Window/Window.tsx`, `window-content` in `src/components/Window/Window.tsx`, and `window-title` in `src/components/Window/WindowTitle.tsx`.
- Existing Jest style to mimic for characterization: `tests/DevThemeSelection.test.tsx` for selection switching, `tests/DefaultTheme.test.tsx` for drag and class assertions, and `tests/GlobalRenderer.test.tsx` for cross-theme title rendering.

## 2026-03-23 Wave 1 implementation decisions

- `CScreen` 新增 `className` 只作用于 `screen-root`，`screenClassName` 单独作用于内部 `CGrid`，避免作用域样式和布局样式耦合。
- 测试会话契约放在 `tests/helpers/systemSession.fixture.tsx`，只定义 `persistentStoreState` 与 `runtimeWindowSessionState` 的边界，不在这里提前实现 `SystemHost`。
- `ScreenScope.test.tsx` 直接复用现有 `window-frame` / `window-title` / `window-content` 测试锚点来证明新增 wrapper 不改变拖拽与缩放语义。

## 2026-03-23 Wave 1 registry decisions

- `SystemTypeDefinition` 仅保留 `id`、`label`、`className`，把默认主题映射留在 `DEFAULT_THEME_BY_SYSTEM`，避免系统定义和主题选择规则耦合成隐式逻辑。
- `DEFAULT_THEME_BY_SYSTEM.windows` 固定为 `win98`，采用合法矩阵中的首个稳定主题作为 deterministic default，便于测试和后续宿主层默认选择复用。

## 2026-03-23 Task 4 SystemHost implementation decisions

- `SystemHost` 验证 pair 通过 `assertValidSystemThemeSelection`，解析系统定义，并挂载由 `systemType` 仅键控的重挂载边界
- `WindowsScreen` 扩展 `CScreen`，应用 `cm-system--windows` class，托管共享 Windows boot layout 和通用 `CWindowManager` + `CWindow`/`CWindowTitle` 组合
- `DefaultScreen` 扩展 `CScreen`，应用 `cm-system--default` class，挂载默认 boot layout
- 两个系统 shell 都接受活跃的 `ThemeDefinition` 并将 theme class 附加到 screen-root wrapper
- 持久化共享存储保持在 `SystemHost` 之上；运行时打开的窗口、z-order 和瞬态桌面 UI 保持在 `systemType` 键控子树内部
- 不在 `WindowsSystem` 内部引入主题特定行为分支；所有样式通过 CSS 选择器应用
- 任务 4 先于任务 5 落地：先锁定 keyed remount 生命周期边界，再把 theme 迁移成纯 CSS 作用域，这样同系统切主题才能只换 class 而不换运行时子树

## 2026-03-23 Task 4 final implementation decisions

- `SystemHost` 解析 system/theme metadata 后，通过闭合映射选择 `WindowsSystem` 或 `DefaultSystem`，避免把系统分发逻辑散落到其他入口。
- `WindowsSystem` 采用 `theme.id -> boot layout` 常量表初始化运行时窗口会话，不使用 `if (theme === ...)` 分支，并让首次挂载 theme 决定 boot 内容与坐标。
- `DefaultSystem` 固定默认 boot layout，但同样把 boot 数据锁在 keyed 子树内部，确保跨系统切换回 `default` 时重新引导，而不是复用先前 Windows 运行时。

## 2026-03-23 Task 5 implementation decisions

- `src/theme/default/index.tsx`、`src/theme/win98/index.tsx`、`src/theme/winxp/index.tsx` 统一只导出 `ThemeDefinition` metadata，并在模块内引入各自 SCSS 作为主题样式入口。
- `src/system/registry.ts` 改为复用主题模块导出的 metadata，避免 className 与 system/theme 归属在注册表和主题目录之间双写。
- Default 主题不再通过 `DefaultWindow` / `DefaultWindowTitle` 子类注入 modifier class，而是直接用 `.cm-system--default.cm-theme--default` 作用域下的 `.cm-window-frame`、`.cm-window`、`.cm-window__title-bar` 选择器承接视觉差异。
- Windows 98 与 Windows XP 删除专用 `WindowTitle` 子类，统一保留共享 `CWindowTitle`，仅通过 `.cm-system--windows.cm-theme--win98` / `.cm-system--windows.cm-theme--winxp` 选择器区分标题栏观感。

## 2026-03-23 Task 5 compatibility bridge decision

- 主题导出暂时采用“可渲染函数 + metadata 属性”的桥接形态：旧调用方继续把 `DefaultTheme` / `Win98Theme` / `WinXpTheme` 当组件渲染，而实际渲染路径统一委托给 `SystemHost`。
- 旧测试仍依赖的 modifier class 只作为临时 DOM 兼容层在主题桥接组件挂载后补上，不再承担样式来源；真实视觉差异仍只由 `screen-root` 上的 system/theme 作用域选择器驱动。

## 2026-03-23 Task 5 compatibility bridge finalization

- 为避免 `theme -> SystemHost -> registry -> theme` 循环依赖，最终桥接改为直接委托到共享系统壳：`DefaultTheme` 渲染 `DefaultSystem`，`Win98Theme` / `WinXpTheme` 渲染 `WindowsSystem`，但仍复用同一套 system/theme metadata。
- 历史 className 兼容不再靠挂载后 DOM 修补，而是通过共享系统壳接收通用 legacy class props 并下发给 `CWindow` / `CWindowTitle`，这样旧测试可继续通过，同时不把样式 ownership 带回主题 JSX。

## 2026-03-23 Task 5 registry/plain-object decision

- `src/system/registry.ts` 保留对主题模块的 import 以触发 SCSS side effect，但对外返回的 `ThemeDefinition` 必须始终是新建 plain object，而不是 renderable bridge 本身。
