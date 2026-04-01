# Theme Prop Injection Refactor

## TL;DR
> **Summary**: 将现有基于祖先 wrapper class 的主题机制改造成组件级 `theme` prop + `Theme` provider 注入机制，覆盖全部公开导出 UI 组件，并把现有 `default/win98/winxp` 主题定义迁移到这条新链路。
> **Deliverables**:
> - 新的 `Theme` 组件与 theme 解析/传播基础设施
> - 全部公开导出组件的 `theme?: string` 支持
> - 现有主题 SCSS 选择器兼容“同元素挂载 theme class + 祖先传播”两种形态
> - Jest + Playwright 回归验证矩阵
> **Effort**: Large
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 → 2/3/4 → 5 → 6

## Context
### Original Request
- 对现有 UI 组件进行改造，全部增加 `theme` props
- `theme` 实际上是一个 className
- 增加一个 `Theme` 组件，使用 `name` 属性向内部子组件注入 `theme`
- 把原有 theme 接入这套

### Interview Summary
- `theme` prop 直接接受完整 className，而不是 `ThemeId`
- 覆盖范围是全部公开导出组件：`src/components/index.ts:1-11` 与 `src/index.ts:1-6` 暴露的 UI 组件都在本次范围内
- 旧的外层 wrapper 方案不保留为正式 API；本次按新机制替代规划
- `Theme` 嵌套采用最近一层覆盖
- 测试策略采用“测试后补”，但每个任务必须自带可执行 QA 场景

### Metis Review (gaps addressed)
- 最高风险是现有主题 SCSS 全都以祖先选择器开头，例如 `src/theme/default/styles/index.scss:1-25`、`src/theme/win98/styles/index.scss:1-20`、`src/theme/winxp/styles/index.scss:1-10`；若仅把 theme class 加到组件根节点，现有样式会失配
- 必须明确 `theme` prop 优先于 `Theme` provider，且要去重重复 class，避免 `className` 与 `theme` 双传造成脏 class 串
- 类组件不能假设一个基类方案覆盖全部：`CWidget` 可做基类 plumbing，但 `CGrid` / `CGridItem` / `CWindowTitle` / `CWindowBody` 仍需单独接入
- Dev preview 当前依赖 `DevThemeRoot` wrapper：`src/dev/themeSwitcher.tsx:31-47`，必须在同一计划内迁移

## Work Objectives
### Core Objective
建立一套以 `theme?: string` 和 `<Theme name="...">` 为核心的主题传播机制，使所有公开导出 UI 组件都能通过显式 prop 或最近的 `Theme` provider 获得主题 class，并确保现有 `default`、`win98`、`winxp` 主题样式在新挂载方式下继续正确生效。

### Deliverables
- `Theme` 组件、theme context、解析/合并辅助逻辑
- 公共组件 theme 接入：`CButton`、`CSelect`、`CRadio`、`CRadioGroup`、`CGrid`、`CGridItem`、`CWidget`、`CWindow`、`CWindowTitle`、`CWindowBody`、`CDock`、`CStartBar`
- 主题样式选择器迁移，兼容 “`.cm-theme--x .cm-button`” 与 “`.cm-theme--x.cm-button` / `.cm-button.cm-theme--x`” 形态
- dev 预览与包导出更新
- 单测、组合测试、Playwright 主题回归测试

### Definition of Done (verifiable conditions with commands)
- `yarn lint` 通过
- `yarn test` 通过，且新增断言覆盖 provider 继承、prop 覆盖 provider、嵌套 provider 最近一层覆盖、类组件继承 theme
- `yarn test:ui` 通过，且 dev 预览中主题切换仍可驱动窗口/基础控件视觉主题变化
- `yarn build` 通过
- `npm pack --dry-run` 通过
- `src/index.ts` 与 `src/components/index.ts` 导出 `Theme`，且未移除既有导出

### Must Have
- `theme` prop 类型统一为 `theme?: string`
- `Theme` 组件 API 固定为 `name: string`，`children?: ReactNode`
- 解析优先级固定：显式 `theme` prop > 最近 `Theme` provider > 无主题（不隐式补默认主题 class）
- 合并顺序固定：组件基础 class → 变体/状态 class → 解析出的 theme class → 用户 `className`
- 对重复 class 做去重，保持最终 className 稳定
- dev 预览改为通过 `Theme` 组件而不是裸 `<div className>` wrapper 驱动

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不把 `theme` 改成 `ThemeId` / `ThemeDefinition` / 主题对象
- 不重做整套 token/CSS variable 架构
- 不引入 Storybook、视觉回归平台、额外 demo 系统
- 不顺手大规模重命名所有历史 class；仅修复本次接入必须修改的类名问题（例如 Grid 的 `c-*` 前缀）
- 不保留旧 wrapper 作为正式 public API

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after + Jest (`jest.config.ts:3-24`) + Playwright (`playwright.config.ts:3-28`)
- QA policy: 每个任务同时包含实现与验证；所有主题行为必须有 happy path + failure/edge case 场景
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: 1) 主题基础设施；2) 函数组件接入；3) 非 CWidget 类组件接入；4) CWidget 基类与派生组件接入

Wave 2: 5) 主题样式与旧 theme 接入迁移；6) 测试矩阵、dev 预览回归与导出清理

### Dependency Matrix (full, all tasks)
| Task | Depends On | Notes |
|---|---|---|
| 1 | - | 定义 provider / context / helper / export 基础 |
| 2 | 1 | 函数组件依赖统一 helper 与 provider 语义 |
| 3 | 1 | 非 CWidget 类组件单独接入 |
| 4 | 1 | CWidget plumbing 先落地，再处理 Window/Dock/StartBar |
| 5 | 2,3,4 | 样式选择器必须基于最终 DOM class 形态调整 |
| 6 | 2,3,4,5 | 最终统一补测试、迁移 dev preview、做导出/清理 |

### Agent Dispatch Summary (wave → task count → categories)
| Wave | Task Count | Categories |
|---|---:|---|
| 1 | 4 | unspecified-high ×2, quick ×1, deep ×1 |
| 2 | 2 | visual-engineering ×1, unspecified-high ×1 |

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. 建立 Theme provider / context / helper 基础设施

  **What to do**: 新增 `Theme` 组件与内部 context，固定 API 为 `name: string`；新增 theme 解析 helper，统一执行“显式 prop > 最近 provider > 无主题”的解析规则；新增 class 合并 helper，按“基础 class → 状态/变体 → theme → className”顺序输出，并去重重复 class。将 `Theme` 导出接入 `src/components/index.ts` 与 `src/index.ts`，保留现有 `ThemeDefinition` / `ThemeId` 导出不变。
  **Must NOT do**: 不要把 `name` 改成 `ThemeId`；不要把 helper 设计成依赖 `ThemeDefinition` 对象输入；不要引入旧 wrapper 兼容层。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要同时处理公共 API、上下文传播与全组件共享辅助逻辑
  - Skills: `[]` — 该任务以仓库内现有 React/TypeScript 模式为主
  - Omitted: `openspec-*` — 当前任务不是 OpenSpec artifact 流程

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Button/Button.tsx:17-42` — 函数组件当前使用数组拼接 className，可抽象为共享 helper 的目标模式
  - Pattern: `src/components/Radio/RadioGroup.tsx:24-85` — 已有 context/provider 写法，可复用 React context 编排风格
  - Pattern: `src/dev/themeSwitcher.tsx:19-47` — 当前 dev 主题解析与 wrapper 应迁移到新 `Theme` 组件
  - API/Type: `src/theme/types.ts:1-7` — 现有 `ThemeId` / `ThemeDefinition` 类型必须继续存在并作为主题定义来源
  - Export: `src/components/index.ts:1-11` — 组件 barrel export 接入点
  - Export: `src/index.ts:1-6` — 包入口导出接入点
  - External: `https://react.dev/reference/react/useContext` — provider / consumer 语义基线

  **Acceptance Criteria** (agent-executable only):
  - [ ] 新增 `Theme` 组件后，`src/index.ts` 与 `src/components/index.ts` 都导出该组件，且现有导出未丢失
  - [ ] helper 输出的 className 顺序固定，重复 class 只保留一次
  - [ ] 当显式 `theme` 缺失且无 provider 时，helper 返回 `undefined` / 空 theme，不自动补 `cm-theme--default`
  - [ ] 新增 Jest 测试覆盖：provider 继承、显式 prop 覆盖 provider、嵌套 provider 最近一层覆盖、空 provider 值不注入主题

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme provider 基础传播
    Tool: Bash
    Steps: yarn test -- Theme
    Expected: 新增 Theme 相关测试全部通过，覆盖 provider 继承与嵌套覆盖
    Evidence: .sisyphus/evidence/task-1-theme-provider.txt

  Scenario: 显式 theme 覆盖 provider
    Tool: Bash
    Steps: yarn test -- theme prop override
    Expected: 测试断言组件根节点只保留显式 theme class，不回退到 provider class
    Evidence: .sisyphus/evidence/task-1-theme-override.txt
  ```

  **Commit**: YES | Message: `feat(theme): add provider and resolution helpers` | Files: `src/components/Theme/**`, `src/components/index.ts`, `src/index.ts`, `tests/**`

- [x] 2. 为函数组件接入 theme prop 与优先级规则

  **What to do**: 给 `CButton`、`CSelect`、`CRadioGroup`、`CRadio` 增加 `theme?: string`。其中 `CButton`/`CSelect`/`CRadioGroup` 在根节点应用解析后的 theme class；`CRadio` 也必须支持显式 prop 与 provider 继承，并保持 `RadioGroupContext` 逻辑不变。若组件同时有 `className` 与 `theme`，最终 class 顺序必须遵循统一 helper。补齐对应 Jest 单测。
  **Must NOT do**: 不要让 `CRadio` 依赖 `CRadioGroup` 传 `theme` prop 才能生效；不要改变 `RadioGroupContext` 的值结构；不要引入 `any`。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 该批组件结构简单，已有明显 className 拼接模式
  - Skills: `[]` — 直接遵循当前函数组件实现模式
  - Omitted: `visual-engineering` — 该任务以 API 与 DOM class 接入为主，不是样式设计本身

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Button/Button.tsx:17-42` — 基础按钮 class 数组拼接模式
  - Pattern: `src/components/Select/Select.tsx:24-79` — select 根节点 className 接入点
  - Pattern: `src/components/Radio/Radio.tsx:13-56` — `CRadio` 当前只有 `cm-radio` / disabled class，需要接入 theme
  - Pattern: `src/components/Radio/RadioGroup.tsx:26-86` — RadioGroup provider + 根 div 结构
  - Test: `tests/Button.test.tsx:6-67` — 基础控件测试风格与 export 验证模式
  - API/Type: `src/theme/default/index.tsx:4-8` — 主题 className 示例 `cm-theme--default`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `CButton`、`CSelect`、`CRadioGroup`、`CRadio` 的 props 类型都暴露 `theme?: string`
  - [ ] provider 下未显式传 `theme` 时，四个组件都能拿到最近 provider 的 theme class
  - [ ] 显式传 `theme` 时覆盖 provider；同时存在 `className` 时用户自定义 class 仍在最终输出中
  - [ ] 原有按钮 variant、select 受控/非受控、radio group 选择行为测试全部继续通过

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: 基础控件 theme 继承与覆盖
    Tool: Bash
    Steps: yarn test -- Button|Select|Radio
    Expected: Button/Select/Radio 相关测试通过，且新增断言验证 provider 继承与 theme 覆盖优先级
    Evidence: .sisyphus/evidence/task-2-function-components.txt

  Scenario: Radio 组行为不被 theme 接入破坏
    Tool: Bash
    Steps: yarn test -- Radio.test.tsx
    Expected: RadioGroup 受控/非受控、disabled、name 校验仍通过，无新增运行时报错
    Evidence: .sisyphus/evidence/task-2-radio-regression.txt
  ```

  **Commit**: YES | Message: `refactor(controls): add theme prop to function components` | Files: `src/components/Button/Button.tsx`, `src/components/Select/Select.tsx`, `src/components/Radio/*.tsx`, `tests/Button.test.tsx`, `tests/Select.test.tsx`, `tests/Radio.test.tsx`

- [x] 3. 为非 CWidget 类组件接入 theme，并修正 Grid 根类名

  **What to do**: 给 `CGrid`、`CGridItem`、`CWindowTitle`、`CWindowBody` 增加 `theme?: string`，通过新 helper 解析 provider 值并挂到各自根节点。同步把 `CGrid`/`CGridItem` 的默认类名从 `c-grid` / `c-grid-item` 修正为 `cm-grid` / `cm-grid-item`，并更新相应样式/测试引用，确保 theme class 与组件基类名并存。`CWindowTitle` 仍保留拖拽逻辑，`CWindowBody` 仍保留样式透传。
  **Must NOT do**: 不要把 `CWindowTitle` 改成函数组件；不要动 `Drag` 行为；不要让 Grid 丢失已有 inline style/grid 布局逻辑。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 涉及多个独立类组件与一个历史类名前缀修正，存在回归面
  - Skills: `[]` — 直接沿用类组件实现风格
  - Omitted: `deep` — 不需要额外系统设计，只需严格落实现有计划

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Grid/Grid.tsx:21-60` — `CGrid` 根 div 类名与 style 合成位置
  - Pattern: `src/components/Grid/Grid.tsx:71-88` — `CGridItem` 根 div 类名位置
  - Pattern: `src/components/Window/WindowTitle.tsx:25-101` — 标题栏根节点、拖拽初始化与 `className ?? 'cm-window__title-bar'`
  - Pattern: `src/components/Window/WindowBody.tsx:9-20` — body 根节点类名解析位置
  - Test: `tests/CWindowTitleComposition.test.tsx:89-145` — 标题栏组合与拖动回归基线

  **Acceptance Criteria** (agent-executable only):
  - [ ] `CGrid`、`CGridItem`、`CWindowTitle`、`CWindowBody` 都接受 `theme?: string`
  - [ ] Grid 默认类名统一改为 `cm-grid` / `cm-grid-item`，且样式/测试同步更新
  - [ ] `CWindowTitle` 挂载 theme 后仍可拖动窗口，不影响 `window-title` / `window-title-text` 测试点
  - [ ] `CWindowBody` 同时支持 provider 继承和显式 theme 覆盖

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Window 子组件 theme 接入不破坏拖动
    Tool: Bash
    Steps: yarn test -- CWindowTitleComposition
    Expected: 窗口标题组合、拖动、resize 相关测试全部通过，并新增 title/body theme 断言
    Evidence: .sisyphus/evidence/task-3-window-subcomponents.txt

  Scenario: Grid 默认类名迁移
    Tool: Bash
    Steps: yarn test -- Grid
    Expected: Grid 测试通过，根节点默认类名为 cm-grid / cm-grid-item，theme class 可叠加
    Evidence: .sisyphus/evidence/task-3-grid-theme.txt
  ```

  **Commit**: YES | Message: `refactor(layout): add theme support to grid and window parts` | Files: `src/components/Grid/Grid.tsx`, `src/components/Window/WindowTitle.tsx`, `src/components/Window/WindowBody.tsx`, `tests/Grid.test.tsx`, `tests/CWindowTitleComposition.test.tsx`

- [x] 4. 为 CWidget 体系与派生组件打通 theme plumbing

  **What to do**: 在 `CWidget` 中新增共享 theme 解析入口，使 `renderFrame` 能接收合并后的 theme class；给 `CWindow`、`CDock`、`CStartBar` 增加 `theme?: string` 并在各自根节点使用统一 helper。对 `CWindow` 至少要区分 frame 与 content：theme class 应落在可触发现有主题 SCSS 的稳定根节点（优先 `window-frame` 与其它根元素的最小必要集合），避免 title/body 子选择器失效。类组件方案优先采用最小入侵方式（`static contextType` 或共享 base helper）。
  **Must NOT do**: 不要重构 `CWidget` 的 resize/move 状态机；不要改变 `window-frame`、`dock-frame`、`start-bar` 的 `data-testid`；不要让 `CDock`/`CStartBar` 的布局计算逻辑漂移。

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: 涉及基类 plumbing、派生组件 DOM 根节点选择与样式兼容风险最高
  - Skills: `[]` — 以仓库内类继承模式为主
  - Omitted: `artistry` — 不需要实验性方案，重在稳妥落地

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Widget/Widget.tsx:476-505` — `renderFrame` 是 CWidget 派生根节点注入 class 的中心位置
  - Pattern: `src/components/Window/Window.tsx:49-82` — Window 由 frame / inner / content 三层组成，需选对 theme 落点
  - Pattern: `src/components/Dock/Dock.tsx:58-73` — Dock 通过 `getDockFrameClassName` 生成 frame class
  - Pattern: `src/components/StartBar/StartBar.tsx:41-67` — StartBar 根 div 未走 `renderFrame`，需单独接入 theme helper
  - Test: `tests/CWindowTitleComposition.test.tsx:103-399` — Window frame/inner/content/resize/drag 回归面
  - Test: `tests/ui/window.helpers.ts:66-122` — Playwright 主题窗口 fixture 与 frame metrics 辅助方法

  **Acceptance Criteria** (agent-executable only):
  - [ ] `CWidget` 派生组件能从 provider 继承 theme，且显式 prop 继续优先
  - [ ] `CWindow`、`CDock`、`CStartBar` 根节点 theme 接入后，现有 `data-testid` 与布局/拖拽/resize 行为不变
  - [ ] `CStartBar` 按钮与内容容器在主题切换下仍可由 theme 选择器正确命中
  - [ ] `CWindow` 在 theme 接入后仍通过现有组合测试与 UI 测试基线

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: CWidget 派生组件 theme 继承回归
    Tool: Bash
    Steps: yarn test -- Window|Dock|StartBar
    Expected: Window/Dock/StartBar 相关测试通过，新增断言验证 provider 继承与显式 theme 覆盖
    Evidence: .sisyphus/evidence/task-4-widget-theme.txt

  Scenario: Window 交互能力未因 theme plumbing 退化
    Tool: Bash
    Steps: yarn test -- CWindowTitleComposition.test.tsx
    Expected: drag/resize/inner wrapper 相关断言仍全部通过
    Evidence: .sisyphus/evidence/task-4-window-regression.txt
  ```

  **Commit**: YES | Message: `refactor(layout): add theme propagation to widget components` | Files: `src/components/Widget/Widget.tsx`, `src/components/Window/Window.tsx`, `src/components/Dock/Dock.tsx`, `src/components/StartBar/StartBar.tsx`, `tests/**`

- [x] 5. 迁移主题样式选择器并把旧 theme 接入新机制

  **What to do**: 修改 `src/theme/default/styles/index.scss`、`src/theme/win98/styles/index.scss`、`src/theme/winxp/styles/index.scss`，让现有主题既能匹配祖先作用域，也能匹配“组件根节点自带 theme class”的新形态。推荐统一写法：对每个公开组件根类补充同元素选择器（例如 `.cm-theme--win98 .cm-button, .cm-button.cm-theme--win98`），对子元素继续保留后代选择器。同步把 dev 预览从 `DevThemeRoot` 裸 wrapper 迁移成 `Theme` 组件调用，并让现有 `defaultThemeDefinition` / `win98ThemeDefinition` / `winXpThemeDefinition` 的 `className` 成为 `Theme name` 的来源。
  **Must NOT do**: 不要改造主题定义结构；不要删除现有 `ThemeDefinition` 导出；不要把全部样式重写成 CSS variable/token 体系；不要让同元素选择器覆盖掉必须依赖祖先关系的后代样式。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 这是样式选择器兼容迁移，决定最终视觉是否正确
  - Skills: `[]` — 使用现有 SCSS 组织方式即可
  - Omitted: `quick` — 样式回归风险较高，不适合低配处理

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 6 | Blocked By: 2, 3, 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/theme/default/styles/index.scss:1-71` — default 主题完全依赖祖先 wrapper 选择器
  - Pattern: `src/theme/win98/styles/index.scss:1-120` — win98 对 window/button 等控件样式以祖先 `.cm-theme--win98` 开头
  - Pattern: `src/theme/winxp/styles/index.scss:1-120` — winxp 同样依赖祖先选择器
  - API/Type: `src/theme/default/index.tsx:4-8` — default 主题 className 来源
  - API/Type: `src/theme/win98/index.tsx:4-8` — win98 主题 className 来源
  - API/Type: `src/theme/winxp/index.tsx:4-8` — winxp 主题 className 来源
  - Pattern: `src/dev/themeSwitcher.tsx:25-47` — dev preview 当前 wrapper 入口，需迁移为 `Theme`

  **Acceptance Criteria** (agent-executable only):
  - [ ] 三套主题样式都同时支持 ancestor 选择器与 same-element 选择器命中
  - [ ] dev preview 不再依赖裸 `<div className={themeDefinition.className}>` 作为正式主题机制，而改为使用 `Theme` 组件
  - [ ] `defaultThemeDefinition.className`、`win98ThemeDefinition.className`、`winXpThemeDefinition.className` 仍是主题 class 的唯一来源
  - [ ] 主题切换后，window frame、window title、button、select、radio 至少一项在 Playwright/RTL 中有样式命中验证

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: 主题样式选择器兼容回归
    Tool: Bash
    Steps: yarn test -- theme styles
    Expected: 新增样式命中测试通过，证明 same-element theme class 仍能驱动 window/button/select/radio 样式分支
    Evidence: .sisyphus/evidence/task-5-theme-selectors.txt

  Scenario: dev preview 使用 Theme 组件切换主题
    Tool: Bash
    Steps: yarn test:ui
    Expected: Playwright 通过，theme fixture 在 default/win98/winxp 间切换时无加载错误，窗口 fixture 正常渲染
    Evidence: .sisyphus/evidence/task-5-dev-theme-ui.txt
  ```

  **Commit**: YES | Message: `refactor(theme): migrate legacy selectors to provider flow` | Files: `src/theme/**/styles/index.scss`, `src/dev/themeSwitcher.tsx`, `src/dev/**`, `tests/**`, `tests/ui/**`

- [x] 6. 补齐全量测试矩阵、导出验证与最终清理

  **What to do**: 以“全部公开导出组件”建立主题能力测试矩阵：每个组件至少有一条 theme 继承或显式覆盖断言；补齐 package entry 导出验证，确认 `Theme` 新增后旧导出仍稳定。清理任何残留的旧 wrapper 用法、旧测试夹具或 README/dev 示例中的裸 wrapper 路径。执行最终 lint/test/ui/build/pack 全链路，收集证据文件。
  **Must NOT do**: 不要删除仍被测试/构建使用的主题定义；不要留下同仓不同步的旧示例；不要跳过 `npm pack --dry-run`。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 涉及全仓回归、导出验证和残留清理，容易漏项
  - Skills: `[]` — 主要依赖现有 Jest/Playwright/CI 命令
  - Omitted: `oracle` — oracle 留到最终验证波使用

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Final Verification Wave | Blocked By: 2, 3, 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Export: `src/components/index.ts:1-11` — 组件导出矩阵基线
  - Export: `src/index.ts:1-6` — 包导出矩阵基线
  - Test: `tests/Button.test.tsx:7-17` — package entry export 验证模板
  - Test: `tests/CWindowTitleComposition.test.tsx:66-400` — 类组件综合交互回归模板
  - Test infra: `jest.config.ts:3-24` — 单测入口与忽略规则
  - Test infra: `playwright.config.ts:3-28` — UI 测试入口
  - CI: `.github/workflows/ci-pr.yml:16-76` — 最终命令链与发布前校验基线

  **Acceptance Criteria** (agent-executable only):
  - [ ] 每个公开导出组件都有至少一条 theme 相关自动化断言
  - [ ] `Theme` 从包入口可导入，且既有 `CButton`、`CRadio`、`CRadioGroup`、`CSelect` 入口导出不断裂
  - [ ] 仓库内不再保留作为正式机制的旧 wrapper 示例；dev/theme/test 样例全部切到新机制
  - [ ] `yarn lint && yarn test && yarn test:ui && yarn build && npm pack --dry-run` 全部通过

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: 全量回归命令链
    Tool: Bash
    Steps: yarn lint && yarn test && yarn test:ui && yarn build && npm pack --dry-run
    Expected: 所有命令退出码为 0，无 lint、测试、构建、打包 dry-run 失败
    Evidence: .sisyphus/evidence/task-6-full-regression.txt

  Scenario: 导出矩阵与旧 wrapper 清理
    Tool: Bash
    Steps: yarn test -- package entry && yarn test -- Theme
    Expected: Theme 包导出可用，既有包入口导出测试仍通过，且不再存在依赖旧 wrapper 的测试路径
    Evidence: .sisyphus/evidence/task-6-exports-cleanup.txt
  ```

  **Commit**: YES | Message: `test(theme): add full coverage and cleanup legacy wrapper usage` | Files: `tests/**`, `tests/ui/**`, `src/index.ts`, `src/components/index.ts`, `src/dev/**`, `README.md`（若示例存在旧 wrapper）

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [x] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit 1: `feat(theme): add provider and resolution helpers`
- Commit 2: `refactor(controls): add theme prop to function components`
- Commit 3: `refactor(layout): add theme propagation to class components`
- Commit 4: `refactor(theme): migrate legacy theme wrappers and selectors`
- Commit 5: `test(theme): add provider and visual regression coverage`

## Success Criteria
- 所有公开导出组件都能显式接受 `theme?: string`
- `<Theme name="cm-theme--win98">` 能让后代组件在未显式传 `theme` 时继承 `cm-theme--win98`
- 显式 `theme="cm-theme--winxp"` 覆盖 provider 值
- 嵌套 `Theme` 中内层覆盖外层
- `default` / `win98` / `winxp` 三套主题在 dev preview 中可切换并正确影响窗口与基础控件
