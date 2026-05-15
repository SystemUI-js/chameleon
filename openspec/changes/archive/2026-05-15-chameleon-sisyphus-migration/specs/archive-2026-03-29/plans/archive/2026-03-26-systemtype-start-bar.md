# Windows SystemType Start Bar Plan

## TL;DR

> **Summary**: 为 `windows` SystemType 增加一个公开导出的 `CStartBar` 组件，复用 `CDock` 的布局能力但不做类继承；默认集成进 `WindowsSystem`，并补齐 `win98` / `winxp` 主题样式与 Jest / Playwright 验证。
> **Deliverables**:
>
> - 新的 `CStartBar` 公共组件与基础样式
> - `CDock` 非破坏性共享布局能力抽取
> - `WindowsSystem` 默认开始栏集成
> - `win98` / `winxp` 开始栏主题样式
> - Jest 集成测试与 Playwright UI 验证
>   **Effort**: Medium
>   **Parallel**: NO
>   **Critical Path**: 1 → 2 → 3 → 4 → 5

## Context

### Original Request

给 Windows 的 SystemType 增加开始栏组件，继承自 Dock 组件，参考 Windows 经典主题的开始栏设计。

### Interview Summary

- 用户确认视觉覆盖范围为 `win98 + winxp`。
- 用户确认不做严格 `class extends CDock`，而是复用 Dock 行为。
- 用户确认 `CStartBar` 需要对外公开导出，同时在 `WindowsSystem` 默认组合。
- 用户确认测试策略采用“实现后补”，但仍要求完整验证。

### Metis Review (gaps addressed)

- 将“复用 Dock 行为”锁定为共享底部锚定、厚度、左右 gap、样式清洗逻辑，而不是抽象成通用任务栏体系。
- 明确不改 `SystemHost` / `registry` 架构，不把需求膨胀为完整任务栏（无开始菜单、托盘、时钟、窗口按钮管理）。
- 明确 `StartBar` 与 `CDock` 保持兄弟组件关系，通过共享 helper 复用布局计算，避免破坏 `CDock` API。
- 明确 dev 预览沿用 `SystemHost` 现有接线，仅在现有 Windows 预览中显现开始栏，不新增独立 demo 入口。

## Work Objectives

### Core Objective

在不破坏现有 `CDock`、`SystemHost` 与 Windows shell 结构的前提下，新增一个固定底部、公开可复用、视觉符合经典 Windows 风格的 `CStartBar` 组件，并让 `WindowsSystem` 在 `win98` / `winxp` 下默认渲染该组件。

### Deliverables

- `src/components/StartBar/StartBar.tsx`
- `src/components/StartBar/index.scss`
- `src/components/Dock/dockLayout.ts`（共享布局 helper）
- `WindowsSystem` 中的开始栏接线
- `win98` / `winxp` 开始栏主题样式
- `tests/StartBar.test.tsx`
- 更新后的系统集成测试与新增/更新的 Playwright spec

### Definition of Done (verifiable conditions with commands)

- `yarn test --runInBand tests/Dock.test.tsx tests/StartBar.test.tsx`
- `yarn test --runInBand tests/SystemHost.test.tsx tests/SystemShellCharacterization.test.tsx tests/ThemeScopeClassNames.test.tsx`
- `yarn test:ui --grep "start bar|system/theme switch"`
- `yarn lint`
- `yarn build`

### Must Have

- `CStartBar` 公开导出并遵循现有组件命名约定（`C` 前缀，SCSS 类名前缀 `cm-`）。
- `CStartBar` 仅支持底部开始栏语义，不暴露 `position` / `defaultPosition` 之类泛 Dock API。
- `CStartBar` 默认渲染开始按钮与内容区，默认开始按钮文案固定为 `Start`。
- `CStartBar` 通过共享 helper 复用 Dock 的边缘定位、厚度、gap 与 style 清洗逻辑。
- `WindowsSystem` 在 `win98` / `winxp` 下默认渲染开始栏，`default` system 不渲染。
- 保持 `themeSwitcher` / `DevSystemRoot` 现有入口不变，开始栏通过现有 Windows 预览自然出现。

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)

- 不新增开始菜单弹层、托盘、时钟、任务按钮、窗口列表或 pin/unpin 行为。
- 不把 `StartBar` 设计成跨系统通用 shell 框架。
- 不修改 `SystemTypeId`、`ThemeId`、`SYSTEM_THEME_MATRIX` 的既有契约。
- 不破坏 `CDock` 公开类型和现有测试语义。
- 不为 dev 预览新增第二套页面或额外入口。
- 不做 README / docs 范围扩张，除非实现过程中现有测试或导出要求强制依赖。

## Verification Strategy

> ZERO HUMAN INTERVENTION — all verification is agent-executed.

- Test decision: tests-after；单元/集成走 Jest（`jest.config.ts:3`），UI 走 Playwright（`playwright.config.ts:3`）
- QA policy: 每个任务都必须附带 agent 可执行的 happy path + failure/edge case
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy

### Parallel Execution Waves

> 该任务核心 seam 高度耦合：`Dock helper` → `StartBar API` → `WindowsSystem` → `theme` → `UI QA`，因此按单线推进最稳妥。

Wave 1: 任务 1（共享 Dock helper）
Wave 2: 任务 2（StartBar 组件）
Wave 3: 任务 3（Windows shell 集成）
Wave 4: 任务 4（主题样式）
Wave 5: 任务 5（Playwright UI 覆盖）

### Dependency Matrix (full, all tasks)

- 任务 1 → 阻塞任务 2、3、4
- 任务 2 → 阻塞任务 3、4、5
- 任务 3 → 阻塞任务 4、5
- 任务 4 → 阻塞任务 5
- 任务 5 → 无下游实现依赖，直接进入最终验证

### Agent Dispatch Summary (wave → task count → categories)

- Wave 1 → 1 task → `quick`
- Wave 2 → 1 task → `visual-engineering`
- Wave 3 → 1 task → `quick`
- Wave 4 → 1 task → `visual-engineering`
- Wave 5 → 1 task → `unspecified-high`

## TODOs

> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. 抽取 Dock 共享布局 helper，保持 `CDock` API 不变

  **What to do**: 在 `src/components/Dock/` 下新增 `dockLayout.ts`，抽取 `CDock` 当前内部的边缘定位、frame class 拼接、style 清洗逻辑；`CDock` 改为调用 helper，但 `CDockProps`、默认 `resolvedPosition`、受控/非受控同步行为、`data-testid` 约定全部保持不变。helper 必须精确承接 `Dock.tsx:58`、`Dock.tsx:96`、`Dock.tsx:106` 的现有语义，且保留 `top/right/bottom/left` 全部映射。
  **Must NOT do**: 不改 `CDockProps` 必填 `height/defaultHeight` 契约；不改 `cm-dock` / `cm-dock--{position}` 类名；不把 helper 泛化为跨组件 UI 框架。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 单目录内的非破坏性重构，核心是提取纯函数并保持回归稳定
  - Skills: `[]` — 无额外技能依赖
  - Omitted: `openspec-apply-change` — 本任务不是 OpenSpec 执行流

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 5 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Dock/Dock.tsx:5` — `DockPosition` 类型定义，helper 必须继续支持四边映射
  - Pattern: `src/components/Dock/Dock.tsx:37` — `CDock` 当前继承 `CWidget`，重构后基类关系不能变化
  - Pattern: `src/components/Dock/Dock.tsx:58` — 现有边缘样式计算逻辑，需 1:1 抽取
  - Pattern: `src/components/Dock/Dock.tsx:96` — 现有 className 拼接逻辑，需 1:1 抽取
  - Pattern: `src/components/Dock/Dock.tsx:106` — 现有 style 清洗逻辑，需 1:1 抽取
  - Test: `tests/Dock.test.tsx:28` — props 渲染与 class/style 断言模式
  - Test: `tests/Dock.test.tsx:91` — top/bottom 锚定断言模式
  - Test: `tests/Dock.test.tsx:127` — left/right 锚定断言模式
  - Test: `tests/Dock.test.tsx:188` — 受控 props 同步回归模式

  **Acceptance Criteria** (agent-executable only):
  - [ ] `CDock` 仍通过 `tests/Dock.test.tsx` 的现有 top/right/bottom/left、className、style、受控同步断言
  - [ ] 新 helper 不改变 `CDock` 对外导出的类型与默认 testid 行为
  - [ ] `CDock` 源码中不再保留重复的私有布局计算函数实现

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```
  Scenario: Dock regression suite stays green after helper extraction
    Tool: Bash
    Steps: 运行 `yarn test --runInBand tests/Dock.test.tsx`
    Expected: `CDock` 全部现有用例通过；没有因 helper 抽取导致的 class/style/position 回归
    Evidence: .sisyphus/evidence/task-1-dock-layout.txt

  Scenario: Controlled/edge dock behavior still matches historical contract
    Tool: Bash
    Steps: 运行 `yarn test --runInBand tests/Dock.test.tsx -t "syncs controlled position and height updates|uses default values on initial render"`
    Expected: 受控同步与默认值相关用例通过，证明 helper 未破坏 state-driven seam
    Evidence: .sisyphus/evidence/task-1-dock-layout-edge.txt
  ```

  **Commit**: YES | Message: `refactor(dock): extract shared dock layout helpers` | Files: `src/components/Dock/Dock.tsx`, `src/components/Dock/dockLayout.ts`, `tests/Dock.test.tsx`

- [x] 2. 新增公开 `CStartBar` 组件，固定经典开始栏结构

  **What to do**: 新增 `src/components/StartBar/StartBar.tsx` 与 `src/components/StartBar/index.scss`，组件命名锁定为 `CStartBar`。实现方式：`CStartBar` 继承 `CWidget`，调用任务 1 的共享 dock helper 计算底部 frame；仅支持底部开始栏语义，不暴露 `position` / `defaultPosition`；公开 props 锁定为 `children`、`className`、`style`、`height`、`defaultHeight`、`gapStart`、`gapEnd`、`startLabel`、`data-testid`。若 `height` 与 `defaultHeight` 都未传，则内部默认厚度为 `30`。渲染结构固定为根节点 `.cm-start-bar` + 按钮 `.cm-start-bar__button` + 内容槽 `.cm-start-bar__content`；默认 testid 分别为 `start-bar`、`start-bar-button`、`start-bar-content`，默认按钮文本为 `Start`。同时更新 `src/components/index.ts`，让库入口经由 `src/index.ts:3` 自动公开导出。
  **Must NOT do**: 不增加开始菜单开关状态；不增加任务按钮、托盘、时钟；不要求调用方传 `height` 才能渲染；不把开始按钮文案做成本次任务的国际化系统。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 新组件结构、公共 API 与基础样式需要一起落地
  - Skills: `[]` — 无额外技能依赖
  - Omitted: `openspec-apply-change` — 非 OpenSpec 执行链

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 3, 4, 5 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Widget/Widget.tsx:21` — `CWidget` 的 `renderFrame` 是 StartBar 复用 frame 渲染的基础能力
  - Pattern: `src/components/Dock/Dock.tsx:124` — `CDock` 当前通过 `renderFrame` 输出绝对定位外框，StartBar 需复用同一 frame 模式
  - Pattern: `src/components/Dock/index.scss:1` — 组件基础样式文件位置与命名模式
  - Pattern: `src/components/index.ts:1` — 组件集中导出方式
  - Pattern: `src/index.ts:3` — 库主入口通过 `./components` 暴露组件
  - Test: `tests/Dock.test.tsx:7` — 包入口导出测试模式
  - Test: `tests/Dock.test.tsx:64` — children 渲染断言模式
  - Test: `tests/Dock.test.tsx:78` — className 合并断言模式
  - Test: `tests/Dock.test.tsx:163` — 默认值行为测试模式

  **Acceptance Criteria** (agent-executable only):
  - [ ] `CStartBar` 可从包入口导入并渲染，默认输出 `start-bar` / `start-bar-button` / `start-bar-content` 三个 testid
  - [ ] 不传 `height` / `defaultHeight` 时也能以 `30px` 默认厚度底部渲染
  - [ ] `children` 渲染到 `.cm-start-bar__content`，`className` / `style` 能合并到根节点且不覆盖底部锚定
  - [ ] `position` 不是 `CStartBar` 的有效 props；类型层面阻止把 StartBar 当通用 Dock 使用

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```
  Scenario: StartBar public API and default shell render correctly
    Tool: Bash
    Steps: 运行 `yarn test --runInBand tests/StartBar.test.tsx`
    Expected: 包入口导出、默认 30px 高度、按钮/内容槽、children 渲染、className/style 合并全部通过
    Evidence: .sisyphus/evidence/task-2-start-bar.txt

  Scenario: StartBar rejects generic Dock-only props at type level
    Tool: Bash
    Steps: 在 `tests/StartBar.test.tsx` 中保留 `@ts-expect-error` 用例后运行 `yarn test --runInBand tests/StartBar.test.tsx -t "typing|rejects"`
    Expected: 测试仅在 `position` 等 Dock-only props 仍被类型拒绝时通过
    Evidence: .sisyphus/evidence/task-2-start-bar-edge.txt
  ```

  **Commit**: YES | Message: `feat(startbar): add public start bar component` | Files: `src/components/StartBar/StartBar.tsx`, `src/components/StartBar/index.scss`, `src/components/index.ts`, `tests/StartBar.test.tsx`

- [x] 3. 在 `WindowsSystem` 中默认组合 `CStartBar`，且仅限 Windows shell

  **What to do**: 更新 `src/system/windows/WindowsSystem.tsx`，在 `WindowsScreen` 内将 `CStartBar` 作为与 `CWindowManager` 同级的 shell 组件渲染，且固定放在 `CWindowManager` 后面。显式传入 `data-testid="windows-start-bar"`，`startLabel="Start"`，并保持 `CWindowManager` 结构、`WINDOWS_BOOT_LAYOUT` 数据、窗口默认位置与尺寸不变。不要改 `SystemHost.tsx`、`src/system/types.ts`、`src/system/registry.ts`、`src/dev/themeSwitcher.tsx`，因为现有 `SystemHost -> WindowsSystem -> WindowsScreen` 接线已足够让 dev 预览显示开始栏。同步更新系统级 Jest 测试，断言 `windows/win98` 与 `windows/winxp` 下都会渲染同一开始栏结构，而 `default/default` 不会渲染任何开始栏节点。
  **Must NOT do**: 不把 `CStartBar` 放进 `CWindowManager`；不修改 `screen-root` 的系统/主题 class 约定；不改默认窗口 boot layout 坐标；不为 default system 新增空壳开始栏。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 现有 shell 组合点明确，主要是小范围接线与集成测试
  - Skills: `[]` — 无额外技能依赖
  - Omitted: `openspec-apply-change` — 非 OpenSpec 任务

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 4, 5 | Blocked By: 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/system/windows/WindowsSystem.tsx:40` — Windows shell 当前只组合 `WindowsScreen` 与 `CWindowManager`
  - Pattern: `src/system/windows/WindowsScreen.tsx:10` — Windows screen 已负责 `cm-system--windows` + theme class 注入
  - Pattern: `src/system/SystemHost.tsx:16` — `windows` shell 由 `WindowsSystem` 负责，无需修改 host 路由
  - Pattern: `src/system/registry.ts:23` — `windows` 仅配 `win98` / `winxp`，开始栏集成仅应影响此矩阵路径
  - Test: `tests/SystemHost.test.tsx:34` — 同系统主题切换保持 runtime window 的现有断言模式
  - Test: `tests/SystemHost.test.tsx:86` — 跨 system 切换重启 runtime 的断言模式
  - Test: `tests/SystemShellCharacterization.test.tsx:154` — 系统 shell 组合形态断言模式
  - Test: `tests/ThemeScopeClassNames.test.tsx:18` — 同 system theme 切换不 remount runtime DOM 的断言模式

  **Acceptance Criteria** (agent-executable only):
  - [ ] `SystemHost systemType="windows"` 在 `win98` 与 `winxp` 下都会渲染 `windows-start-bar`
  - [ ] `SystemHost systemType="default"` 时不存在 `start-bar` / `windows-start-bar`
  - [ ] 同 system theme 切换后开始栏仍存在，且不破坏现有 window runtime 保持逻辑
  - [ ] `SystemHost`、`registry`、`types`、`themeSwitcher` 无不必要改动

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```
  Scenario: Windows shells render StartBar while default shell stays clean
    Tool: Bash
    Steps: 运行 `yarn test --runInBand tests/SystemHost.test.tsx tests/SystemShellCharacterization.test.tsx tests/ThemeScopeClassNames.test.tsx`
    Expected: Windows 两个主题都能找到 `windows-start-bar` / `start-bar-button`；default system 不出现开始栏；现有窗口 runtime 断言继续通过
    Evidence: .sisyphus/evidence/task-3-windows-shell.txt

  Scenario: Cross-system switch still removes Windows-only shell chrome
    Tool: Bash
    Steps: 运行 `yarn test --runInBand tests/SystemHost.test.tsx -t "reboots runtime session across system switches"`
    Expected: 从 `windows/winxp` 切到 `default/default` 后，Windows-only 开始栏与窗口 body 都被正确移除或替换
    Evidence: .sisyphus/evidence/task-3-windows-shell-edge.txt
  ```

  **Commit**: YES | Message: `feat(windows): mount start bar in windows shell` | Files: `src/system/windows/WindowsSystem.tsx`, `tests/SystemHost.test.tsx`, `tests/SystemShellCharacterization.test.tsx`, `tests/ThemeScopeClassNames.test.tsx`

- [x] 4. 为 `win98` 与 `winxp` 添加开始栏主题样式，锁定经典视觉差异

  **What to do**: 在 `src/theme/win98/styles/index.scss` 与 `src/theme/winxp/styles/index.scss` 中新增 `.cm-start-bar`、`.cm-start-bar__button`、`.cm-start-bar__content` 规则。`win98` 视觉锁定为经典灰色 shell：浅灰主面、亮边 + 暗边 bevel、按钮粗体、无圆角；`winxp` 视觉锁定为 XP 风格：蓝色 bar、绿色强调 Start 按钮、白字、轻微圆角。组件公共布局（flex、对齐、gap、box-sizing）只放在 `src/components/StartBar/index.scss`，主题文件只承接颜色、边框、阴影、圆角等皮肤差异。若需要断言同系统切换时 DOM 不 remount，则沿用现有 theme-switch 测试并补充开始栏节点断言；若需要验证实际视觉差异，则在后续 Playwright 任务中用 computed style 检查，不在 Jest 中做 SCSS 快照。
  **Must NOT do**: 不重构 theme token 系统；不把颜色抽到全局 token overhaul；不修改 `win98ThemeDefinition` / `winXpThemeDefinition` 的导出契约；不在 Jest 中引入 snapshot 测试。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 主题皮肤差异与组件 base layout 需要精确协同
  - Skills: `[]` — 无额外技能依赖
  - Omitted: `openspec-apply-change` — 非 OpenSpec 任务

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: 5 | Blocked By: 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/theme/win98/styles/index.scss:1` — `win98` 主题样式作用域写法
  - Pattern: `src/theme/winxp/styles/index.scss:1` — `winxp` 主题样式作用域写法
  - Pattern: `src/theme/win98/index.tsx:4` — `win98` 主题 className 为 `cm-theme--win98`
  - Pattern: `src/theme/winxp/index.tsx:4` — `winxp` 主题 className 为 `cm-theme--winxp`
  - Pattern: `src/system/windows/WindowsScreen.tsx:17` — 主题 class 最终挂到 `screen-root` 上，样式选择器应作用于该作用域
  - Test: `tests/ThemeScopeClassNames.test.tsx:6` — theme class 断言模式
  - Test: `tests/SystemShellCharacterization.test.tsx:165` — `win98` / `winxp` 共用结构 seam 断言模式
  - UI Pattern: `tests/ui/system-theme-switch.spec.ts:10` — 同 system theme switch 的现有 Playwright 验证模式

  **Acceptance Criteria** (agent-executable only):
  - [ ] `win98` 与 `winxp` 共用相同 `CStartBar` DOM 结构，但 computed style 明显不同
  - [ ] `win98` 的开始栏呈现经典灰色 bevel 风格，`winxp` 呈现蓝/绿色 XP 风格
  - [ ] 组件基础布局仅在 `src/components/StartBar/index.scss` 定义，主题文件只负责皮肤差异
  - [ ] 同 system theme 切换后开始栏节点继续存在，并跟随 `screen-root` 主题 class 切换皮肤

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```
  Scenario: Theme-scoped StartBar classes stay attached through windows theme switches
    Tool: Bash
    Steps: 运行 `yarn test --runInBand tests/ThemeScopeClassNames.test.tsx tests/SystemShellCharacterization.test.tsx`
    Expected: `win98` / `winxp` 下开始栏 DOM 结构一致，theme class 切换成功且未破坏同 system runtime 保持
    Evidence: .sisyphus/evidence/task-4-theme-shell.txt

  Scenario: Default theme path never receives Windows StartBar skin
    Tool: Bash
    Steps: 运行 `yarn test --runInBand tests/SystemShellCharacterization.test.tsx -t "default/default"`
    Expected: default shell 仍只渲染 default window 结构，不出现 `.cm-start-bar` 的 Windows 主题依赖断言
    Evidence: .sisyphus/evidence/task-4-theme-shell-edge.txt
  ```

  **Commit**: YES | Message: `feat(theme): style start bar for windows themes` | Files: `src/components/StartBar/index.scss`, `src/theme/win98/styles/index.scss`, `src/theme/winxp/styles/index.scss`, `tests/ThemeScopeClassNames.test.tsx`, `tests/SystemShellCharacterization.test.tsx`

- [x] 5. 增加 Playwright 开始栏 UI 覆盖，验证可见性、主题切换和非 Windows 缺失路径

  **What to do**: 在 `tests/ui/` 下新增或扩展一个开始栏 spec（推荐新文件 `tests/ui/start-bar.spec.ts`），复用 `tests/ui/window.helpers.ts` 的 `gotoWindowSelection` / `switchWindowSelection`。Happy path：访问 `windows/win98`，断言 `screen-root` 可见、`windows-start-bar` 与 `start-bar-button` 可见、按钮文本为 `Start`、开始栏位于底部（检查根元素 style 中 `bottom: 0px` 且存在高度）、然后切到 `windows/winxp`，断言开始栏 DOM 仍存在且 computed style（例如背景色或按钮圆角）与 `win98` 不同。Failure/edge path：切到 `default/default`，断言开始栏节点不存在，证明 Windows-only shell chrome 没有泄漏。必要时在 helper 中只增加对开始栏 testid 的只读选择支持，不改变现有窗口 harness 路由协议。
  **Must NOT do**: 不新增第二套 Playwright harness 页面；不把测试扩展到时钟/托盘/菜单；不写脆弱 screenshot snapshot；不修改 `playwright.config.ts` 的 baseURL / webServer 契约。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要结合现有 harness、页面切换与 computed style 断言做端到端验证
  - Skills: `[]` — 无额外技能依赖
  - Omitted: `openspec-apply-change` — 非 OpenSpec 任务

  **Parallelization**: Can Parallel: NO | Wave 5 | Blocks: none | Blocked By: 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `playwright.config.ts:3` — Playwright 使用 `tests/ui` 与 `yarn dev` webServer
  - Pattern: `tests/ui/window.helpers.ts:91` — `gotoWindowSelection` 可直接进入 `systemType/theme` harness
  - Pattern: `tests/ui/window.helpers.ts:104` — `switchWindowSelection` 可模拟同页系统/主题切换
  - Pattern: `tests/ui/system-theme-switch.spec.ts:10` — 同 system theme 切换现有断言模式
  - Pattern: `tests/ui/system-theme-switch.spec.ts:51` — 跨 system 切换断言模式
  - Pattern: `src/components/Screen/Screen.tsx:20` — `screen-root` 带 `data-system-type` / `data-theme`，适合作为 UI 验证锚点
  - CI: `.github/workflows/ci-pr.yml:49` — PR CI 会运行 `yarn test:ui`，spec 必须稳定
  - Script: `package.json:30` — UI 测试入口是 `yarn test:ui`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Playwright 能在 `windows/win98` 与 `windows/winxp` 下都找到开始栏与开始按钮
  - [ ] 切换 `win98 -> winxp` 后开始栏仍存在，且至少一个 computed style 发生变化
  - [ ] 切换到 `default/default` 后开始栏节点不存在
  - [ ] 新 spec 在本地与 CI 命令 `yarn test:ui` 下都可稳定运行

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```
  Scenario: StartBar appears in both Windows themes and changes skin on theme switch
    Tool: Bash
    Steps: 运行 `yarn test:ui --grep "start bar"`
    Expected: Playwright 用例通过；`win98` 与 `winxp` 都能看到开始栏，且主题切换后 computed style 有明确差异
    Evidence: .sisyphus/evidence/task-5-start-bar-ui.txt

  Scenario: StartBar never leaks into default system
    Tool: Bash
    Steps: 运行 `yarn test:ui --grep "default system.*start bar|start bar.*default"`
    Expected: 针对 `default/default` 的负路径断言通过，开始栏节点不存在
    Evidence: .sisyphus/evidence/task-5-start-bar-ui-edge.txt
  ```

  **Commit**: YES | Message: `test(startbar): cover shell and ui flows` | Files: `tests/ui/start-bar.spec.ts`, `tests/ui/window.helpers.ts`, `playwright.config.ts` (only if absolutely required)

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [x] F1. Plan Compliance Audit — oracle
  - Reviewer: `oracle` 子代理审查
  - Steps: 将 `.sisyphus/plans/systemtype-start-bar.md`、最终变更 diff、测试结果、证据文件路径提交给 `oracle` 审查；要求其逐条比对 1-5 号任务的 Acceptance Criteria 与实际产物。
  - Expected: `oracle` 明确给出 `APPROVED`，或列出必须修复的偏差清单；没有“部分通过”状态。
  - Evidence: `.sisyphus/evidence/f1-plan-compliance.md`
  - QA Scenarios:
    ```
    Scenario: Oracle validates implementation against all planned acceptance criteria
      Tool: oracle subagent review
      Steps: 提交计划文件、最终 diff、测试输出、任务 1-5 的 evidence 文件路径给 oracle，要求按任务顺序逐项核对
      Expected: oracle 返回 `APPROVED`；若存在遗漏则返回明确 task 编号和偏差项
      Evidence: .sisyphus/evidence/f1-plan-compliance.md
    ```
- [x] F2. Code Quality Review — unspecified-high
  - Tooling: `Bash` + `rg`
  - Steps: 运行 `yarn lint`，再运行 `! rg -n "\bany\b|as any" src/components/StartBar src/components/Dock src/system/windows tests`、`! rg -n "TODO|FIXME" src/components/StartBar src/system/windows tests`，并检查 `src/components/StartBar/StartBar.tsx` / `src/components/Dock/dockLayout.ts` / `src/system/windows/WindowsSystem.tsx` 的最终 diff 是否仅包含计划内 seam。
  - Expected: `yarn lint` 退出码为 0；新改动文件中无 `any`、`as any`、遗留 `TODO` / `FIXME`；没有破坏 `CDock` 契约或扩大 StartBar API。
  - Evidence: `.sisyphus/evidence/f2-code-quality.md`
  - QA Scenarios:

    ```
    Scenario: Lint and static grep catch type-safety or placeholder issues
      Tool: Bash
      Steps: 运行 `yarn lint && ! rg -n "\bany\b|as any" src/components/StartBar src/components/Dock src/system/windows tests && ! rg -n "TODO|FIXME" src/components/StartBar src/system/windows tests`
      Expected: `yarn lint` 成功；命令在无违规匹配时退出码为 0；若 repo 其他旧文件有历史命中，也不能来自本次变更文件
      Evidence: .sisyphus/evidence/f2-code-quality.txt

    Scenario: StartBar and Dock seam remain within planned API surface
      Tool: Bash
      Steps: 检查最终 diff，只允许 `StartBar` 暴露 `children`、`className`、`style`、`height`、`defaultHeight`、`gapStart`、`gapEnd`、`startLabel`、`data-testid`；同时确认 `CDockProps` 未被放宽或破坏
      Expected: diff 与计划 API 完全一致；未出现 `position` 暴露给 `CStartBar`、未出现任务栏扩展功能
      Evidence: .sisyphus/evidence/f2-code-quality.md
    ```

- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)
  - Tooling: `Bash`
  - Steps: 先运行 `yarn test --runInBand tests/Dock.test.tsx tests/StartBar.test.tsx tests/SystemHost.test.tsx tests/SystemShellCharacterization.test.tsx tests/ThemeScopeClassNames.test.tsx`、`yarn test:ui --grep "start bar|system/theme switch"`、`yarn lint`、`yarn build`，再把控制台输出与关键证据交给审查 agent 做结果复核。
  - Expected: 所有命令退出码为 0；任一命令失败、UI 断言不稳定、或构建缺失导出即判定失败。
  - Evidence: `.sisyphus/evidence/f3-manual-qa.md`
  - QA Scenarios:

    ```
    Scenario: Validation command suite passes cleanly
      Tool: Bash
      Steps: 依次运行 `yarn test --runInBand tests/Dock.test.tsx tests/StartBar.test.tsx tests/SystemHost.test.tsx tests/SystemShellCharacterization.test.tsx tests/ThemeScopeClassNames.test.tsx`、`yarn test:ui --grep "start bar|system/theme switch"`、`yarn lint`、`yarn build`
      Expected: 全部命令退出码为 0，且无 flaky failure
      Evidence: .sisyphus/evidence/f3-manual-qa-commands.txt

    Scenario: Build output includes public StartBar export path
      Tool: Bash
      Steps: 在 `yarn build` 成功后运行 `rg -n "CStartBar" dist/index.d.ts dist/chameleon.es.js`
      Expected: 构建产物中存在 `CStartBar` 的公共导出痕迹；若缺失则判定失败
      Evidence: .sisyphus/evidence/f3-manual-qa.md
    ```

- [x] F4. Scope Fidelity Check — deep
  - Tooling: `Bash` + `rg`
  - Steps: 检查最终 diff 与命名搜索，确认未引入开始菜单、托盘、时钟、窗口列表、跨系统抽象，也未修改 `SystemHost.tsx`、`src/system/types.ts`、`src/system/registry.ts` 的既有契约；仅允许计划中列出的文件范围发生变化。
  - Expected: 变更范围仅包含 Dock helper、StartBar 组件、WindowsSystem、`win98` / `winxp` 样式、测试与必要导出；任何额外 shell feature 或架构漂移都视为失败。
  - Evidence: `.sisyphus/evidence/f4-scope-fidelity.md`
  - QA Scenarios:

    ```
    Scenario: Scope grep confirms no extra Windows shell features slipped in
      Tool: Bash
      Steps: 运行 `! rg -n "StartMenu|Tray|Clock|TaskList|pin|pinned|menu popover|system tray" src/components/StartBar src/system/windows tests`
      Expected: 新增/修改文件中不存在上述扩 scope 关键词，命令退出码为 0
      Evidence: .sisyphus/evidence/f4-scope-fidelity-grep.txt

    Scenario: File-level diff stays inside planned surface area
      Tool: Bash
      Steps: 检查最终变更文件列表，仅允许 `src/components/Dock/*`、`src/components/StartBar/*`、`src/components/index.ts`、`src/system/windows/WindowsSystem.tsx`、`src/theme/win98/styles/index.scss`、`src/theme/winxp/styles/index.scss`、`tests/*StartBar*`、既有系统测试、`tests/ui/*start-bar*` 与必要 helper 发生变化
      Expected: 文件变更范围与计划一致；若出现 `SystemHost.tsx`、`src/system/registry.ts`、`src/system/types.ts` 的非必要改动则失败
      Evidence: .sisyphus/evidence/f4-scope-fidelity.md
    ```

## Commit Strategy

- Commit 1: `refactor(dock): extract shared dock layout helpers`
- Commit 2: `feat(startbar): add public start bar component`
- Commit 3: `feat(windows): mount start bar in windows shell`
- Commit 4: `feat(theme): style start bar for windows themes`
- Commit 5: `test(startbar): cover shell and ui flows`

## Success Criteria

- Windows 系统在 `win98` / `winxp` 下都能渲染同一结构的 `CStartBar`。
- `CStartBar` 作为库入口可直接导入，并且默认提供 `Start` 按钮与内容槽位。
- 复用的是 Dock 布局能力而不是 Dock 类继承，`CDock` 全量现有测试继续通过。
- `default` system 与非 Windows 路径不出现 `CStartBar`。
- Jest、Playwright、lint、build 全部可自动验证通过。
