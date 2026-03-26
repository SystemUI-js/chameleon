# Task 6 Issues

## UI test server bootstrap in local run
- 现象：执行 `yarn test:ui tests/ui/default-window-system-switch.spec.ts tests/ui/start-bar.spec.ts` 首次报错 `net::ERR_CONNECTION_REFUSED`（`http://127.0.0.1:5673`）。
- 处理：显式先启动 `yarn dev`，待服务可访问后再执行同一命令，测试通过。
- 影响：不是用例逻辑问题，属于本地 Playwright 运行时服务可用性问题。

## 2026-03-26 F2 Code Quality Review
- 阻塞：`src/system/default/DefaultSystem.tsx:59` 仅传入 `cm-window__title-bar--with-controls`，而 `src/components/Window/WindowTitle.tsx:66` 会替换掉基础类名，导致 `src/theme/default/styles/index.scss:25` 的 title bar 基础样式失效，且会被 `src/theme/default/styles/index.scss:67` 的内容区选择器误命中。
- 阻塞：`src/dev/main.tsx:11` 的 `mountCommonControlsPreview()` 只在启动时运行一次；引入 `src/dev/main.tsx:27` 的运行时 system 切换后，新窗口 body 不会重新挂载 `CommonControlsPreview`，主预览流存在功能回退。
- 观察项：`src/system/default/DefaultSystem.tsx:7` 从 dev 层引入 resolver，和 `src/dev/themeSwitcher.tsx:1`、`src/system/SystemHost.tsx:2` 形成循环依赖；短期未见类型错误，但分层变脆。

## 2026-03-26 F1 audit blockers
- `src/components/Select/Select.tsx` 为了给标题栏下拉绑定 `label htmlFor` 扩展了 `CSelect` 的 `id` 通用 API；这违反了 Task 4 的明确 guardrail（不修改 `CSelect` 组件通用 API）。
- `tests/SystemTypeSwitch.test.tsx` 的主题重置 / remount 断言通过 `rerender()` 直接改 props 完成，没有通过默认窗口里的 `切换系统` 下拉驱动真实选择链路，因此 Task 5 的核心验收仍未被证明。

## 2026-03-26 F3 real UI blocker
- 现象：真实打开 `default/default` 后，可通过标题栏下拉切到 `windows/win98`，但切换完成后页面上不存在可见的 `切换系统` combobox（Playwright 实测 `count = 0`）。
- 影响：无法通过真实 UI 完成 `windows -> default` 回切，因此 F3 必须 `REJECT`，不能判定端到端流程通过。
- 衍生问题：`tests/ui/default-window-system-switch.spec.ts` 仅覆盖正向流，未覆盖回切失败场景，导致自动化基线不能拦截这个产品缺口。
