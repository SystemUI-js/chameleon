# WindowTitle Action Buttons and Demo Toggle

## TL;DR
> **Summary**: Extend `CWindowTitle` with a generic `actionButton` slot and `actionButtonPosition` union prop, defaulting controls to the right, then demonstrate the API in the catalog Window demo with no-op minimize/maximize/close buttons and a left/right toggle.
> **Deliverables**:
> - `WindowTitle` public prop extension with backward-compatible rendering
> - Theme-safe title-bar control alignment for `default`, `win98`, and `winxp`
> - Catalog Window demo with position toggle and no-op window action buttons
> - Jest + Playwright coverage proving right-default, explicit-left, and no-drag/no-op behavior
> **Effort**: Medium
> **Parallel**: NO
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6

## Context
### Original Request
- WindowTitle 增加 Props `actionButton`，默认插入右侧，右对齐
- 增加 Props `actionButtonPosition`，枚举左或右，默认右
- 在 demo 的 Window 中增加最小化、最大化、关闭按钮，点击不需要效果
- 在 demo 中可切换左右

### Interview Summary
- 本次仅产出执行计划，不直接实现。
- `actionButton` 保持单一插槽式 API，类型定为 `React.ReactNode`，不扩展为 `actionButtons` 或结构化 actions 配置。
- `actionButtonPosition` 采用现有字符串联合类型风格，定为 `'left' | 'right'`，默认 `'right'`。
- demo 左右切换使用现有 catalog 里的受控交互模式；测试策略明确采用 TDD。

### Metis Review (gaps addressed)
- 将所有 Window 主题 (`default` / `win98` / `winxp`) 纳入本次兼容范围，避免新增公共 API 只在单主题生效。
- 明确要求 controls 容器阻断标题栏拖动起始事件，避免点击 demo 按钮触发窗口移动。
- Playwright 采用独立 fixture + 独立 spec，避免把新断言塞进现有 smoke 测试导致语义混乱。
- 明确禁止实现最小化/最大化/关闭真实行为、禁止新增图标系统、禁止扩展更多位置枚举。

## Work Objectives
### Core Objective
为 `CWindowTitle` 增加一个可放置在标题栏左/右的动作区插槽，并在开发目录的 Window showcase 中提供可切换左右位置的三按钮演示，同时以 Jest 与 Playwright 验证 API、DOM 结构、主题兼容性与 no-op 交互行为。

### Deliverables
- `src/components/Window/WindowTitle.tsx`：新增 `actionButton` / `actionButtonPosition` props 与稳定 DOM/test-id/class 契约
- `src/components/Window/index.ts`、`src/components/index.ts`、`src/index.ts`：保证新增的位置类型沿公共导出链可见
- `src/theme/default/styles/index.scss`、`src/theme/win98/styles/index.scss`、`src/theme/winxp/styles/index.scss`：支持左右动作区布局
- `src/dev/ComponentCatalog.tsx`、`src/dev/styles/catalog.scss`：Window demo 按钮与左右切换 UI
- `src/dev/playwright/windowHarness.tsx`、`tests/ui/window.action-buttons.spec.ts`：fixture 与浏览器验证
- `tests/CWindowTitleComposition.test.tsx`：组件级契约测试

### Definition of Done (verifiable conditions with commands)
- `yarn test -- CWindowTitleComposition.test.tsx` 通过，覆盖无按钮、默认右侧、显式左侧、点击控件不拖动等断言。
- `npx playwright test tests/ui/window.action-buttons.spec.ts` 通过，覆盖右侧默认、左侧切换、点击无副作用。
- `yarn test:ui` 通过，确认新增 spec 未破坏现有 UI fixtures。
- `yarn build` 通过，确保组件库构建和 demo 代码均可编译。

### Must Have
- `actionButton?: React.ReactNode`
- `actionButtonPosition?: 'left' | 'right'`，默认 `'right'`
- `actionButton` 缺省时 `CWindowTitle` 渲染结果与现状保持兼容
- controls 容器具备稳定选择器：`data-testid="window-title-controls"`
- demo 提供 `data-testid="window-demo-position"`、`window-demo-minimize`、`window-demo-maximize`、`window-demo-close`
- 所有 theme 下标题文本与 controls 同时可见且位置正确

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不实现最小化/最大化/关闭真实行为
- 不新增 `actionButtons`、`renderActionButton`、`center`/`start`/`end` 等扩展 API
- 不重构 `CWindow`/`CWidget` 的移动或缩放系统
- 不要求人工目测验证；所有验收必须可由 agent 自动执行
- 不修改 `.sisyphus/` 以外的计划外文档或无关组件

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: TDD（RED → GREEN → REFACTOR），框架为 Jest + React Testing Library + Playwright
- QA policy: 每个任务都附带 agent-executed happy path + edge/failure path
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> 由于所有改动都落在同一条标题栏渲染链路上，且本次要求 TDD，执行采用顺序波次，避免多代理同时改写 `WindowTitle` 与 theme 标题栏样式。

Wave 1: Task 1-2（先锁定 API/DOM 契约，再实现组件渲染与事件隔离）
Wave 2: Task 3-4（补齐三套主题样式与 catalog demo 交互）
Wave 3: Task 5-6（补齐 Playwright fixture/spec，并执行回归验证与收尾）

### Dependency Matrix (full, all tasks)
| Task | Depends On | Notes |
|---|---|---|
| 1 | — | 先定义 API/test contract |
| 2 | 1 | 组件实现必须以 Task 1 的契约为准 |
| 3 | 2 | 样式类名与 DOM 结构依赖 Task 2 |
| 4 | 2, 3 | demo 需要稳定 API 与样式类名 |
| 5 | 2, 4 | fixture/spec 依赖最终 API 与 demo/fixture test ids |
| 6 | 1, 2, 3, 4, 5 | 汇总验证与整理 |

### Agent Dispatch Summary (wave → task count → categories)
| Wave | Tasks | Categories |
|---|---:|---|
| 1 | 2 | quick / unspecified-low |
| 2 | 2 | visual-engineering / quick |
| 3 | 2 | unspecified-high / quick |

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. 锁定 `WindowTitle` 新 API 与组件级契约

  **What to do**: 在 `tests/CWindowTitleComposition.test.tsx` 先补红测，再在 `src/components/Window/WindowTitle.tsx` 与导出链 (`src/components/Window/index.ts` → `src/components/index.ts` → `src/index.ts`) 最小化补齐类型导出，使以下契约成立：新增 `actionButton?: React.ReactNode`、新增并导出 `WindowTitleActionButtonPosition = 'left' | 'right'`、`actionButtonPosition` 缺省时按 `'right'` 处理；`actionButton` 缺省时不渲染 controls 容器；原有纯文本标题仍继续包裹为 `WindowTitleBarText`。
  **Must NOT do**: 不实现任何真实窗口控制逻辑；不引入 `actionButtons` 或 render prop；不改动 `CWindow` 的组合协议。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 目标文件集中且 API 变更边界清晰
  - Skills: `[]` — 现有测试与类型模式已足够，无需额外技能
  - Omitted: [`playwright`] — 本任务只锁定组件级 API/DOM 契约，不做浏览器自动化

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [2, 3, 4, 5, 6] | Blocked By: []

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Window/WindowTitle.tsx:8-18` — 现有 `CWindowTitleProps` 定义位置，新 props 必须在这里追加
  - Pattern: `src/components/Window/WindowTitle.tsx:186-210` — 当前标题栏统一渲染入口；新增 DOM 契约必须从 `renderTitle` 落地
  - Pattern: `src/components/Dock/Dock.tsx:6-12` — 字符串联合类型与可选 prop 的本地风格参考
  - Pattern: `src/components/Window/index.ts:8-10` — Window 模块导出入口；新增位置类型需先从这里导出
  - Pattern: `src/components/index.ts:1-12` — 组件总导出入口，确认 `WindowTitle` 类型沿此链路暴露
  - Pattern: `src/index.ts:1-6` — 包根入口从 `./components` 二次导出，必须保持公共可见性
  - Test: `tests/CWindowTitleComposition.test.tsx:83-190` — 现有组合、主题、显式渲染断言风格

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx` 通过，且新增断言覆盖：无 `actionButton` 时 `queryByTestId('window-title-controls')` 返回空。
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx` 通过，且新增断言覆盖：仅传 `actionButton` 时 controls 容器存在、根节点拥有 `cm-window__title-bar--with-controls`、controls 容器拥有右侧位置 class。
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx` 通过，且新增断言覆盖：传 `actionButtonPosition="left"` 时 controls 容器拥有左侧位置 class，且在 DOM 顺序上位于 `window-title-text` 之前。
  - [ ] `yarn build` 通过，说明新增类型导出未破坏组件入口编译。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Default right-side contract
    Tool: Bash
    Steps: 运行 `yarn test -- CWindowTitleComposition.test.tsx`；聚焦新增 actionButton 契约测试
    Expected: Jest 通过，默认场景渲染 `data-testid="window-title-controls"`，且 class 包含右侧位置标识
    Evidence: .sisyphus/evidence/task-1-window-title-contract.txt

  Scenario: No-action backward compatibility
    Tool: Bash
    Steps: 运行 `yarn test -- CWindowTitleComposition.test.tsx`；检查无 `actionButton` 场景
    Expected: 标题文本仍由 `window-title-text` 呈现，controls 容器不存在，旧有断言无回归
    Evidence: .sisyphus/evidence/task-1-window-title-contract-backward.txt
  ```

  **Commit**: YES | Message: `test(window-title): lock action button contract` | Files: `tests/CWindowTitleComposition.test.tsx`, `src/components/Window/WindowTitle.tsx`, `src/components/Window/index.ts`, `src/components/index.ts`, `src/index.ts`

- [ ] 2. 实现标题栏 controls DOM、位置切换与拖动隔离

  **What to do**: 按 Task 1 契约改造 `renderTitle`：仅在 `actionButton` 存在时渲染 `<div data-testid="window-title-controls">`；controls wrapper 固定类名 `cm-window__title-bar__controls`，并追加 `cm-window__title-bar__controls--left` 或 `--right`；标题根节点在有 controls 时追加 `cm-window__title-bar--with-controls`。DOM 顺序固定为：左侧模式先 controls 后标题，右侧模式先标题后 controls。controls wrapper 需要通过 `onPointerDown` / `onPointerCancel` 阻断事件冒泡，避免点击控件触发窗口拖动起始。
  **Must NOT do**: 不把事件隔离写到 `CWindow` / `CWidget`；不在无 controls 时附加多余 class/test-id；不为 `actionButton` 自动包一层语义按钮组件。

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: 需要精确修改类组件渲染与指针事件边界
  - Skills: `[]` — 现有实现已可直接参考
  - Omitted: [`frontend-ui-ux`] — 本任务以 DOM/事件契约为主，不是视觉重设计

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [3, 4, 5, 6] | Blocked By: [1]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Window/WindowTitle.tsx:24-28` — `WindowTitleBarText` 的 test id / class 不能被破坏
  - Pattern: `src/components/Window/WindowTitle.tsx:89-113` — 当前标题栏通过 pointer 事件启动拖动；controls 需局部阻断
  - Pattern: `src/components/Window/WindowTitle.tsx:186-203` — 标题栏根节点 `data-testid="window-title"` 与 `mergeClasses` 用法
  - Pattern: `src/components/Window/Window.tsx:86-94` — `CWindow` 通过 composed child props 注入 move handler；`WindowTitle` 实现必须兼容该协议
  - Test: `tests/CWindowTitleComposition.test.tsx:248-340` — 现有拖动/preview 相关测试风格，适合补 click 不移动断言

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx` 通过，且新增断言证明点击 controls wrapper 内部按钮不会改变 `window-frame` 的 `left/top/width/height`。
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx` 通过，且 `data-testid="window-title"` 仍保留单一根节点。
  - [ ] `yarn build` 通过，说明 `WindowTitle` 改造未引入类型或 JSX 编译错误。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Controls click does not start drag
    Tool: Bash
    Steps: 运行 `yarn test -- CWindowTitleComposition.test.tsx`；执行新增 frame metrics before/after click 断言
    Expected: 点击 controls 内元素后，窗口 frame 几何值保持不变，且未触发 preview frame
    Evidence: .sisyphus/evidence/task-2-window-title-drag-guard.txt

  Scenario: Left ordering remains stable
    Tool: Bash
    Steps: 运行 `yarn test -- CWindowTitleComposition.test.tsx`；执行显式 left 场景 DOM 顺序断言
    Expected: `window-title-controls` 位于 `window-title-text` 之前；根节点仍为 `window-title`
    Evidence: .sisyphus/evidence/task-2-window-title-left-order.txt
  ```

  **Commit**: YES | Message: `feat(window-title): render action controls safely` | Files: `src/components/Window/WindowTitle.tsx`, `tests/CWindowTitleComposition.test.tsx`

- [ ] 3. 为 `default`、`win98`、`winxp` 三套主题补齐左右 controls 布局

  **What to do**: 在三套 theme SCSS 中统一支持以下 class 契约：`.cm-window__title-bar--with-controls` 打开 flex 对齐；`.cm-window__title-bar__controls--right` 使用右侧对齐；`.cm-window__title-bar__controls--left` 使用左侧对齐。`default` 主题沿用现有 controls 样式并拆分左右差异；`win98` 主题需要移除会强制右分布的 `justify-content: space-between` 对 left 模式的干扰，并在有 controls 时使用与默认主题兼容的 gap/margin 规则；`winxp` 主题补齐缺失的 with-controls/controls modifier，避免新 API 只在 default 有效。
  **Must NOT do**: 不重写无 controls 的标题栏视觉；不为 demo 三个按钮引入共享 icon/button 基础设施；不新增与本需求无关的 spacing token。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 主题样式兼容是本任务核心风险点
  - Skills: `[]` — 现有主题 SCSS 足够指导修改
  - Omitted: [`playwright`] — 浏览器验证留到后续任务统一执行

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [4, 5, 6] | Blocked By: [2]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/theme/default/styles/index.scss:35-70` — default 主题已存在 title-bar controls 基础样式，是新增左右 modifier 的主锚点
  - Pattern: `src/theme/win98/styles/index.scss:17-31` — win98 当前 `justify-content: space-between` 会与 left 模式冲突，需最小化修正
  - Pattern: `src/theme/winxp/styles/index.scss:1-10` — winxp 当前只覆盖背景色，需显式补齐 controls modifier
  - Pattern: `src/components/Window/WindowTitle.tsx:192-203` — theme class 通过 `ResolvedThemeClassName` 合并到 title root，SCSS 选择器必须继续兼容这个结构

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn build` 通过，SCSS 编译无错误。
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx` 通过，主题相关断言可继续在 `Theme` provider 下稳定渲染 title 与 body。
  - [ ] 使用内容搜索确认 `src/theme/default/styles/index.scss`、`src/theme/win98/styles/index.scss`、`src/theme/winxp/styles/index.scss` 都包含 `cm-window__title-bar__controls--left` 与 `cm-window__title-bar__controls--right`。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme modifiers exist in all theme files
    Tool: Grep
    Steps: 搜索 `cm-window__title-bar__controls--left|cm-window__title-bar__controls--right`，限定在三个 Window theme SCSS 文件
    Expected: 三个 theme 文件都命中左右两个 modifier，说明新公共 API 没有只落在 default 主题
    Evidence: .sisyphus/evidence/task-3-theme-modifiers.txt

  Scenario: Win98 no longer forces right spacing in left mode
    Tool: Read
    Steps: 读取 `src/theme/win98/styles/index.scss` 中标题栏相关片段，检查 left/right modifier 规则是否替代了通用 `justify-content: space-between` 强制分布
    Expected: left 模式存在独立布局规则；不会只靠 `space-between` 把 controls 永远推到右侧
    Evidence: .sisyphus/evidence/task-3-theme-win98-layout.txt
  ```

  **Commit**: YES | Message: `feat(window-title): add themed control alignment` | Files: `src/theme/default/styles/index.scss`, `src/theme/win98/styles/index.scss`, `src/theme/winxp/styles/index.scss`

- [ ] 4. 更新 catalog Window demo：三按钮 no-op 动作区 + 左右切换

  **What to do**: 在 `src/dev/ComponentCatalog.tsx` 的 `WindowShowcase` 内新增本地受控状态 `actionButtonPosition`，默认 `'right'`；使用现有 `CRadioGroup` + `CRadio` 模式渲染左右切换器，`data-testid="window-demo-position"`。构造单一 `actionButtons` 节点传给 `CWindowTitle actionButton={...}`，其中包含三个 `type="button"` 的 demo-only 原生按钮，test ids 固定为 `window-demo-minimize` / `window-demo-maximize` / `window-demo-close`，文本分别使用 `—`、`□`、`×`，点击 handler 统一为 no-op。同步更新 `WINDOW_SNIPPET`，展示 state、props 与按钮插槽的真实用法。若需要局部样式，统一加在 `src/dev/styles/catalog.scss`，类名前缀使用 `cm-catalog__window-*`，不要污染组件库公共 theme。
  **Must NOT do**: 不把 demo-only 样式写入组件 theme SCSS；不让 demo 点击修改任何文案、尺寸或 window 位置；不把左右切换做成全局主题切换的一部分。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 需要同时处理 demo 结构、交互展示与局部样式
  - Skills: `[]` — catalog 已有受控状态、row/stack/radio 现成模式
  - Omitted: [`frontend-ui-ux`] — 本任务跟随现有 catalog 风格，无需重新设计展示系统

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [5, 6] | Blocked By: [2, 3]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/ComponentCatalog.tsx:98-125` — `ButtonShowcase` 的本地 state、`data-testid` 与 `cm-catalog__row` 用法
  - Pattern: `src/dev/ComponentCatalog.tsx:184-210` — `CRadioGroup` 受控切换模式，适合作为左右 position 控件参考
  - Pattern: `src/dev/ComponentCatalog.tsx:246-273` — 当前 `WindowShowcase` 与 `WINDOW_SNIPPET` 的位置
  - Pattern: `src/dev/styles/catalog.scss:84-123` — stack / row / stage 的 catalog 既有布局类
  - API/Type: `src/components/Window/WindowTitle.tsx:8-18` — 新 props 来源，demo 必须使用最终 public API

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn build` 通过，catalog 中 `WindowShowcase` 可编译。
  - [ ] 使用内容搜索确认 `src/dev/ComponentCatalog.tsx` 包含 `window-demo-position`、`window-demo-minimize`、`window-demo-maximize`、`window-demo-close`。
  - [ ] 读取 `src/dev/ComponentCatalog.tsx`，确认 `WINDOW_SNIPPET` 与实际 showcase 一致，均包含 `actionButton`、`actionButtonPosition` 与左右切换示例。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Catalog demo exposes toggle and three buttons
    Tool: Grep
    Steps: 搜索 `window-demo-position|window-demo-minimize|window-demo-maximize|window-demo-close`，限定 `src/dev/ComponentCatalog.tsx`
    Expected: 四个 test id 都存在于 Window showcase 代码中
    Evidence: .sisyphus/evidence/task-4-catalog-testids.txt

  Scenario: Snippet mirrors controlled demo API
    Tool: Read
    Steps: 读取 `src/dev/ComponentCatalog.tsx` 中 `WINDOW_SNIPPET` 与 `WindowShowcase` 片段
    Expected: snippet 展示 `actionButton`、`actionButtonPosition` 和左右切换状态；不再停留在旧版纯标题示例
    Evidence: .sisyphus/evidence/task-4-catalog-snippet.txt
  ```

  **Commit**: YES | Message: `demo(window): add action button showcase toggle` | Files: `src/dev/ComponentCatalog.tsx`, `src/dev/styles/catalog.scss`

- [ ] 5. 扩展 Playwright harness 与独立 UI spec 覆盖左右位置和 no-op 点击

  **What to do**: 在 `src/dev/playwright/windowHarness.tsx` 新增至少两个 fixture：`action-buttons-right`、`action-buttons-left`；二者共享同一组 demo-only controls 节点与固定 test ids，并分别传入默认/显式左侧位置。新增独立 spec `tests/ui/window.action-buttons.spec.ts`，不要改写 `window.smoke.spec.ts` 的 baseline 语义。spec 必须断言：右侧 fixture 下 controls wrapper 带右侧 class、controls 的 bounding box 在 title text 右侧；左侧 fixture 下相反；点击三个按钮前后 `readFrameMetrics(page)` 返回相同结果；未知 fixture 行为维持在 smoke spec 中，无需迁移。
  **Must NOT do**: 不把新断言塞进 `window.smoke.spec.ts`；不使用人工截图比对作为唯一验收方式；不让 fixture 依赖 catalog 页面状态。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要稳定的浏览器断言、fixture 设计与几何比较
  - Skills: [`playwright`] — 浏览器级选择器、交互与 bounding-box 断言需要该技能
  - Omitted: [`frontend-ui-ux`] — 目标是自动化验证，不是样式设计

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: [6] | Blocked By: [2, 4]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/playwright/windowHarness.tsx:38-133` — fixture switch `case` 结构，新增 action-buttons fixtures 应沿用此模式
  - Pattern: `tests/ui/window.helpers.ts:19-89` — `gotoWindowFixture` / `gotoThemedWindowFixture` 与 harness 等待逻辑
  - Pattern: `tests/ui/window.helpers.ts:91-109` — `readFrameMetrics` 可直接用于点击前后几何比较
  - Pattern: `tests/ui/window.smoke.spec.ts:4-25` — Playwright spec 的基本写法；新场景需独立成新文件
  - Pattern: `src/components/Window/WindowTitle.tsx:24-28` — `window-title-text` test id 可作为横向位置比较锚点

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npx playwright test tests/ui/window.action-buttons.spec.ts` 通过，覆盖 right fixture、left fixture、no-op clicks 三组断言。
  - [ ] `yarn test:ui` 通过，确认新增 spec 与现有 smoke/resize/move 测试可共存。
  - [ ] `npx playwright test tests/ui/window.action-buttons.spec.ts --grep "no-op"` 通过，三按钮点击前后 frame metrics 完全一致。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Right fixture places controls after title text
    Tool: Playwright
    Steps: 打开 `action-buttons-right` fixture；定位 `window-title-text` 与 `window-title-controls`；读取 bounding boxes
    Expected: controls wrapper 可见、含右侧位置 class，且 controls.x > titleText.x
    Evidence: .sisyphus/evidence/task-5-playwright-right.json

  Scenario: Button clicks remain no-op
    Tool: Playwright
    Steps: 打开 `action-buttons-left` fixture；记录 `readFrameMetrics(page)`；依次点击 `window-demo-minimize`、`window-demo-maximize`、`window-demo-close`；再次记录 metrics
    Expected: 前后 metrics 完全一致，页面 URL 不变化，`window-frame` 仍可见
    Evidence: .sisyphus/evidence/task-5-playwright-noop.json
  ```

  **Commit**: YES | Message: `test(window): cover title action buttons in playwright` | Files: `src/dev/playwright/windowHarness.tsx`, `tests/ui/window.action-buttons.spec.ts`, `tests/ui/window.helpers.ts`

- [ ] 6. 执行 TDD 回归、清理重复并固定最终验证命令

  **What to do**: 在所有功能完成后执行 RED → GREEN → REFACTOR 收尾：清理 `WindowShowcase` 中重复的按钮节点构造、统一 `actionButtonPosition` 默认值只在组件层定义、检查新增类名/test ids 在测试与实现中完全一致。然后按顺序运行针对性 Jest、针对性 Playwright、全量 UI、构建命令；若为稳定性需要补充极小修复，只允许修复本需求相关问题。将最终使用的命令与产物路径写入 evidence。
  **Must NOT do**: 不扩大修复范围到无关测试；不在没有失败证据时重构其他展示组件；不跳过任一必需命令。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 以验证、微调和收口为主
  - Skills: `[]` — 命令链已明确，无需额外技能
  - Omitted: [`git-master`] — 本任务是计划内验证，不涉及额外 git 历史操作

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: [] | Blocked By: [1, 2, 3, 4, 5]

  **References** (executor has NO interview context — be exhaustive):
  - Test: `tests/CWindowTitleComposition.test.tsx:83-190` — 组件组合回归基线
  - Test: `tests/ui/window.smoke.spec.ts:4-25` — 保持既有 smoke 基线不变
  - Pattern: `tests/ui/window.helpers.ts:60-109` — UI 验证使用的 fixture 导航与 frame metrics 读取工具
  - CI: `.github/workflows/ci-pr.yml:36-76` — 最终命令链必须覆盖 `yarn test`、`yarn test:ui`、`yarn build`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx` 通过。
  - [ ] `npx playwright test tests/ui/window.action-buttons.spec.ts` 通过。
  - [ ] `yarn test:ui` 通过。
  - [ ] `yarn build` 通过。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Targeted regression passes
    Tool: Bash
    Steps: 顺序运行 `yarn test -- CWindowTitleComposition.test.tsx` 与 `npx playwright test tests/ui/window.action-buttons.spec.ts`
    Expected: 两条命令均退出码 0，无 flaky retry 依赖
    Evidence: .sisyphus/evidence/task-6-targeted-regression.txt

  Scenario: CI-equivalent validation passes
    Tool: Bash
    Steps: 顺序运行 `yarn test:ui` 与 `yarn build`
    Expected: 两条命令均退出码 0；构建产物生成成功；现有 smoke fixture 仍通过
    Evidence: .sisyphus/evidence/task-6-ci-validation.txt
  ```

  **Commit**: YES | Message: `chore(window): finalize action button verification` | Files: `tests/CWindowTitleComposition.test.tsx`, `tests/ui/window.action-buttons.spec.ts`, `src/components/Window/WindowTitle.tsx`, `src/dev/ComponentCatalog.tsx`, `src/theme/default/styles/index.scss`, `src/theme/win98/styles/index.scss`, `src/theme/winxp/styles/index.scss`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle

  **Tool**: `oracle`
  **Steps**: 对照本计划逐项核查 Task 1-6 产物、文件范围、class/test-id 契约、导出链和禁止项；输出逐条符合/不符合结论。
  **Expected**: Oracle 明确确认未偏离 `actionButton` / `actionButtonPosition` 范围、未实现真实窗口控制行为、未扩大 API 面。

- [ ] F2. Code Quality Review — unspecified-high

  **Tool**: `unspecified-high`
  **Steps**: 审查 `WindowTitle`、theme SCSS、catalog demo、Playwright spec 的实现质量；重点检查重复逻辑、命名一致性、类型暴露、测试稳定性与潜在回归。
  **Expected**: Reviewer 对潜在问题给出通过/不通过结论；若不通过，必须列出需修复项并回流实现任务。

- [ ] F3. Agent-executed UI QA — unspecified-high + `playwright`

  **Tool**: `playwright`
  **Steps**: 在 catalog demo 与 harness fixtures 两条路径执行自动化 UI 验证：默认 right、切换 left、三按钮点击 no-op、三套 theme 可见性、frame metrics 不变。
  **Expected**: 所有 UI 场景均由自动化通过；不得要求人工目测截图判定。

- [ ] F4. Scope Fidelity Check — deep

  **Tool**: `deep`
  **Steps**: 对照原始需求与计划 guardrails，确认实现只包含 `WindowTitle` 新 props、demo 按钮/切换、测试覆盖与必要样式支持；检查是否误加真实窗口动作、图标系统、额外位置枚举或无关重构。
  **Expected**: Deep reviewer 明确判定范围完全匹配原始需求；若发现额外工作，列为必须回退项。

## Commit Strategy
- Commit 1: `test(window-title): lock action button contract`
- Commit 2: `feat(window-title): add title action button slot and themed alignment`
- Commit 3: `demo(window): add action button showcase and browser coverage`

## Success Criteria
- `CWindowTitle` 对外 API 新增两项 props，但无 `actionButton` 时仍保持原有标题渲染与拖动行为。
- `actionButtonPosition` 默认右侧，显式左侧时 controls 出现在标题文本之前，且三套主题都保持可用布局。
- catalog Window demo 显示最小化/最大化/关闭三个 no-op 按钮，并可实时切换左右位置。
- Playwright 证明点击三个按钮前后窗口 frame 几何信息不变，且不会导航、关闭、缩放或移动窗口。
