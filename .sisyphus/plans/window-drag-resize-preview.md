# Window Drag/Resize Outline Preview

## TL;DR
> **Summary**: 为 `CWindow` 增加独立的 move / resize 交互模式配置；默认保持实时更新，开启 outline 模式时仅渲染虚线预览框，并在拖拽释放时一次性提交最终位置或尺寸。
> **Deliverables**:
> - `CWindow` 对外暴露独立的 move / resize 行为 props
> - `CWidget`/`CWindowTitle` 支持 outline 预览态与 release-on-commit 语义
> - Demo / Playwright harness 显式启用 outline 模式
> - Jest + Playwright 回归覆盖默认 live、outline、混合模式与 guard 场景
> **Effort**: Medium
> **Parallel**: YES - 3 waves
> **Critical Path**: 1 API/preview contract → 2 preview frame contract → 3/4 outline interactions → 5 demo fixtures → 6 regression coverage

## Context
### Original Request
- Window 组件新增一个 props 能力：在拖动边框 resize 和移动时，可选择直接改变内容，或只拖出虚线框并在松手后真实 resize / move。
- 可利用 `@system-ui-js/multi-drag` 的 hook 实现松手后的提交。
- 第一期先在 Demo 上直接为 Window 开启虚线模式。
- 默认行为仍然是不使用虚线。

### Interview Summary
- 代码现状已确认：`src/components/Widget/Widget.tsx` 是几何状态与 resize 交互主入口，`src/components/Window/Window.tsx` 是 Window 公共 API 入口，`src/components/Window/WindowTitle.tsx` 持有 move drag。
- 用户确认：move 与 resize **分别控制**，不是单一总开关。
- 用户确认：测试策略采用 **tests-after**。
- 第一期 Demo 接入点确定为 `src/dev/playwright/windowHarness.tsx`，默认库行为不改。

### Metis Review (gaps addressed)
- 已锁定 preview 渲染模型：**真实 window frame 在 outline 模式拖拽中保持 committed geometry 不变，单独渲染一个不接管指针事件的虚线 preview frame。**
- 已锁定 release 语义：**仅在 drag end / release 时提交 preview geometry；cancel / unmount 时丢弃 preview。**
- 已锁定约束语义：resize 的 min/max 约束在 preview 计算阶段就应用，保证 preview rect 与最终 commit rect 一致。
- 已锁定 Phase 1 guardrail：不抽象通用拖拽框架，不改焦点/键盘/z-index，不扩展到 Window 以外组件。

## Work Objectives
### Core Objective
为 `CWindow` 增加独立的 `moveBehavior` / `resizeBehavior` 公共配置，支持 `live` 与 `outline` 两种模式；在 `outline` 下，move 和 resize 都通过虚线 preview frame 显示中间态，并在拖拽释放后一次性提交真实 geometry。

### Deliverables
- `CWindowProps` / `CWidgetProps` 支持：
  - `moveBehavior?: 'live' | 'outline'`
  - `resizeBehavior?: 'live' | 'outline'`
- 统一 preview 状态契约：
  - committed geometry：`x/y/width/height`
  - preview geometry：仅在 outline 拖拽中存在，释放后 commit 并清空
- 新增 preview DOM 约定：`data-testid="window-preview-frame"`
- 默认主题支持 preview 虚线样式
- Demo / Playwright harness 提供 outline fixture 与 mixed-mode fixture
- Jest + Playwright 覆盖默认 live、outline move、outline resize、mixed modes、guard、cleanup

### Definition of Done (verifiable conditions with commands)
- `yarn lint`
- `yarn test -- CWindowTitleComposition.test.tsx`
- `yarn test:ui tests/ui/window.move.spec.ts`
- `yarn test:ui tests/ui/window.resize.spec.ts`
- `yarn test:ui tests/ui/window.resize-guards.spec.ts`
- `yarn build`

### Must Have
- 默认不传 props 时，现有 move / resize 行为与当前版本一致。
- `moveBehavior` 与 `resizeBehavior` 独立生效，可混用。
- outline 模式下，拖拽过程中真实 frame geometry 不变，仅 preview frame 变化。
- release 后，真实 frame geometry 一次性同步到 preview rect。
- preview frame 不接收 pointer events，不影响现有 drag handle 行为。
- resize outline 模式继续遵守 `resizable={false}`、min/max clamp、edgeWidth 等既有规则。

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不新增第三种交互模式。
- 不把 move / resize 合并回单一 props。
- 不修改 Window 以外组件的交互系统。
- 不把 preview 变成新的长期 source of truth。
- 不依赖人工目测作为唯一验收方式。
- 不引入与本需求无关的拖拽重构、动画、吸附、窗口管理能力。

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after + Jest / Playwright
- QA policy: Every task includes agent-executed happy + edge scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: foundation / contract
- Task 1 API and preview-state contract
- Task 2 preview-frame rendering and theme hooks

Wave 2: interaction paths
- Task 3 move outline interaction
- Task 4 resize outline interaction

Wave 3: demo wiring and regression completion
- Task 5 harness and helper expansion
- Task 6 full automated coverage and regression gate

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
|---|---|---|
| 1 | none | 2, 3, 4, 5, 6 |
| 2 | 1 | 3, 4, 5, 6 |
| 3 | 1, 2 | 5, 6 |
| 4 | 1, 2 | 5, 6 |
| 5 | 3, 4 | 6 |
| 6 | 3, 4, 5 | F1-F4 |

### Agent Dispatch Summary (wave → task count → categories)
| Wave | Tasks | Recommended categories |
|---|---:|---|
| 1 | 2 | unspecified-high, visual-engineering |
| 2 | 2 | unspecified-high |
| 3 | 2 | quick, unspecified-high |

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Freeze public API and preview-state contract

  **What to do**: 在 `src/components/Window/Window.tsx` 与 `src/components/Widget/Widget.tsx` 锁定公共 API 与内部状态契约。新增 `moveBehavior?: 'live' | 'outline'`、`resizeBehavior?: 'live' | 'outline'`，默认值都为 `live`；将 props 从 `CWindow` 透传到 `CWidget` / `CWindowTitle` 所需位置。明确 preview state 只存在于 `Widget` 所拥有的几何层，不让 `WindowTitle` 成为 geometry source。预定义 preview DOM 契约：仅在 outline 拖拽中渲染 `data-testid="window-preview-frame"`，并为后续 mixed-mode 场景保留 move / resize 共用的 preview rect 读取接口。
  **Must NOT do**: 不引入布尔 props；不把 preview state 下沉到多个组件各自维护；不在此任务里实现真实 outline 行为。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要同时收束公共 API、类型契约与状态归属，避免后续实现分叉。
  - Skills: `[]` — 公共组件代码与类型设计已足够明确，无需额外技能注入。
  - Omitted: `["frontend-ui-ux"]` — 该任务不涉及视觉细节设计。

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 5, 6 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Window/Window.tsx` — `CWindowProps` 的公共入口，负责将 Window 级 props 暴露给消费者。
  - Pattern: `src/components/Widget/Widget.tsx` — 持有 committed geometry、resize 生命周期与 frame 渲染，是 preview state 的唯一权威位置。
  - Pattern: `src/components/Window/WindowTitle.tsx` — move drag 句柄，只应消费来自上层的行为模式与 release/preview 回调，不应拥有长期 geometry 状态。
  - Test: `tests/CWindowTitleComposition.test.tsx` — 现有 Window props / 组合行为的 Jest 基线，可扩展公共 API 与 child injection 验证。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `moveBehavior` / `resizeBehavior` 在 `CWindow` 层可用，类型为 `'live' | 'outline'`，默认不传时行为等价于 `live`。
  - [ ] `Widget` 层存在统一的 preview state / preview rect 契约，后续 move 与 resize 都能复用同一提交 / 清理流程。
  - [ ] 预览框 selector 已冻结为 `data-testid="window-preview-frame"`，并在计划后续任务中复用。
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Public API defaults remain live
    Tool: Bash
    Steps: 运行 `yarn test -- CWindowTitleComposition.test.tsx`，确保现有不传 props 的 move / resize 用例仍通过
    Expected: Jest 通过，未出现因 props 默认值变化导致的断言失败
    Evidence: .sisyphus/evidence/task-1-window-api-contract.txt

  Scenario: API contract rejects boolean regression
    Tool: Bash
    Steps: 运行 `yarn build`，确认导出的 `moveBehavior` / `resizeBehavior` 类型定义与调用点都被 TypeScript 接受
    Expected: 构建通过，未出现布尔语义或未透传 props 导致的类型错误
    Evidence: .sisyphus/evidence/task-1-window-api-contract-build.txt
  ```

  **Commit**: YES | Message: `feat(window): add move and resize behavior api` | Files: `src/components/Window/Window.tsx`, `src/components/Widget/Widget.tsx`, `src/components/Window/WindowTitle.tsx`, `tests/CWindowTitleComposition.test.tsx`

- [x] 2. Render a non-interactive outline preview frame and theme hooks

  **What to do**: 在 `src/components/Widget/Widget.tsx` 的 frame 渲染链路中加入 preview frame 渲染能力：当 preview rect 存在且当前交互模式为 outline 时，额外渲染一个独立 preview frame，而不是让真实 frame 跟随移动。为 preview frame 添加稳定 className 与 `data-testid="window-preview-frame"`；在 `src/theme/default/styles/index.scss` 中补充虚线边框、透明背景、`pointer-events: none` 等最小样式，保证 preview 仅作为视觉反馈。若 Window 需要主题类合并，则在 `src/components/Window/Window.tsx` 的 className 组装路径中补入 preview 对应的窗口类名。
  **Must NOT do**: 不改变真实 frame 的默认边框样式；不让 preview frame 接管 resize handle 或标题栏事件；不在此任务提交 move / resize 逻辑。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 需要精确处理 preview DOM、theme class 与视觉反馈，但改动仍受当前组件结构约束。
  - Skills: `[]` — 现有 theme / className 模式足够直接，执行不依赖额外 UI 生成技能。
  - Omitted: `["frontend-ui-ux"]` — 不做重新设计，只做最小样式落地。

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3, 4, 5, 6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Widget/Widget.tsx` — `renderFrame` 是真实 frame 与 resize handles 的统一渲染点，preview frame 也应从这里输出。
  - Pattern: `src/components/Window/Window.tsx` — Window 主题 class 合并入口，必要时在这里挂接 preview 对应类名。
  - Style: `src/theme/default/styles/index.scss` — 默认主题的 `.cm-window-frame` / `.cm-window` 样式基线，preview 样式需在这里新增。
  - Test: `tests/ui/window.helpers.ts` — 现有 helper 基于 test id 读取 frame metrics，preview frame 需要复用同一测试模式。

  **Acceptance Criteria** (agent-executable only):
  - [ ] outline 交互激活时会渲染 `data-testid="window-preview-frame"`，未激活时不渲染该元素。
  - [ ] preview frame 的样式包含虚线边框、透明背景与 `pointer-events: none`。
  - [ ] 默认 live 模式下 DOM 与视觉结果不变，不会出现 preview frame。
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx`
  - [ ] `yarn build`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Preview frame render branch is style-safe
    Tool: Bash
    Steps: 扩展 `tests/CWindowTitleComposition.test.tsx` 的测试 harness，让组件进入 preview-active 分支；运行 `yarn test -- CWindowTitleComposition.test.tsx`
    Expected: 测试断言 preview frame 带有 `data-testid="window-preview-frame"`、虚线样式 class 与 `pointer-events: none`，且真实 frame 结构仍存在
    Evidence: .sisyphus/evidence/task-2-preview-frame.txt

  Scenario: Live mode does not leak preview DOM
    Tool: Bash
    Steps: 在同一 Jest 测试文件中渲染默认 live 模式窗口；查询 `window-preview-frame` 并运行 `yarn test -- CWindowTitleComposition.test.tsx`
    Expected: 查询结果为空，现有 live 模式断言继续通过
    Evidence: .sisyphus/evidence/task-2-preview-frame-error.txt
  ```

  **Commit**: YES | Message: `feat(window): add outline preview frame rendering` | Files: `src/components/Widget/Widget.tsx`, `src/components/Window/Window.tsx`, `src/theme/default/styles/index.scss`, `tests/CWindowTitleComposition.test.tsx`

- [x] 3. Implement outline move behavior with release-only commit

  **What to do**: 在 `src/components/Window/WindowTitle.tsx` 的 `Drag` 生命周期中补齐 move outline 分支：`moveBehavior='live'` 时维持当前实时 `onWindowMove` 更新；`moveBehavior='outline'` 时，拖拽过程中只更新 preview rect，不更新 committed `x/y`。利用 `@system-ui-js/multi-drag` 的 drag end / release hook 在松手后一次性提交 preview position；drag cancel、组件卸载或未实际发生位移时必须清空 preview，不产生脏 commit。将 move 的 preview / commit 回调统一回收到 `Widget` 所拥有的几何状态层，不在 `WindowTitle` 保留长期位置信息。
  **Must NOT do**: 不改变 content drag no-op 语义；不让 outline move 绕过现有 `getWindowPose` 读值路径；不在拖动中提前修改 committed `x/y`。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 涉及拖拽生命周期、release 语义与状态提交时机，逻辑风险高于样式工作。
  - Skills: `[]` — 现有 `multi-drag` 已在代码中使用，可直接沿现有模式扩展。
  - Omitted: `["frontend-ui-ux"]` — 重点是拖拽状态机，不是视觉设计。

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 6 | Blocked By: 1, 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Window/WindowTitle.tsx` — 现有标题栏 `Drag` 初始化与 `onWindowMove?.({ x, y })` 调用点，是 move outline 分支的主入口。
  - Pattern: `src/components/Window/Window.tsx` — 通过 `mapComposedChildren()` 注入 `onWindowMove/getWindowPose` 的既有组合模式，应继续复用。
  - Pattern: `src/components/Widget/Widget.tsx` — committed geometry 状态与 frame 渲染权威位置，move preview/commit 应回写到这里。
  - Test: `tests/CWindowTitleComposition.test.tsx` — 已覆盖标题栏拖动移动窗口与 content no-op，可扩展 outline mid-drag / release 行为。
  - Test: `tests/ui/window.move.spec.ts` — 现有 Playwright move 行为基线，适合加入 live / outline 双模式断言。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `moveBehavior='live'` 时，标题栏拖动中的真实 frame rect 持续变化，且不渲染 preview frame。
  - [ ] `moveBehavior='outline'` 时，标题栏拖动中的真实 frame rect 保持不变，只更新 `window-preview-frame`；松手后真实 frame 一次性跳到 preview 位置。
  - [ ] 内容区拖动仍然不移动窗口，无论 `moveBehavior` 取值为何。
  - [ ] 零位移 release、cancel、unmount 时不会留下 preview frame，也不会错误提交位置。
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Outline move commits on release only
    Tool: Bash
    Steps: 扩展 `tests/CWindowTitleComposition.test.tsx`，在标题栏 drag callback 驱动下模拟 pointer down → move → release 三阶段；运行 `yarn test -- CWindowTitleComposition.test.tsx`
    Expected: 测试断言拖动中真实 frame rect 不变、preview rect 更新；release 后 committed rect 与 preview rect 一致且 preview 被清空
    Evidence: .sisyphus/evidence/task-3-outline-move.txt

  Scenario: Content drag remains no-op
    Tool: Bash
    Steps: 在同一 Jest 测试文件中模拟内容区拖动与零位移 release / unmount；运行 `yarn test -- CWindowTitleComposition.test.tsx`
    Expected: 真实 frame rect 不变，preview frame 不出现，unmount/cancel 不抛错且不产生 commit
    Evidence: .sisyphus/evidence/task-3-outline-move-error.txt
  ```

  **Commit**: YES | Message: `feat(window): add outline preview for move` | Files: `src/components/Window/WindowTitle.tsx`, `src/components/Window/Window.tsx`, `src/components/Widget/Widget.tsx`, `tests/CWindowTitleComposition.test.tsx`

- [x] 4. Implement outline resize behavior with constrained preview rect

  **What to do**: 在 `src/components/Widget/Widget.tsx` 的 resize drag 链路中补齐 `resizeBehavior='outline'` 分支。保持当前 `live` 模式实时更新 committed `width/height/x/y`；outline 模式下拖拽边框时只计算 preview rect，并立即应用现有 min/max clamp、edgeWidth、方向句柄逻辑，确保 preview rect 与最终提交结果一致。利用 resize `Drag` 的 release/end hook 在松手时把 constrained preview rect 一次性提交为真实 geometry；`resizable={false}`、无效拖动、cancel、unmount 时都必须清空 preview，不产生额外 commit。
  **Must NOT do**: 不复制一套新的 resize 几何算法；不让 outline resize 绕过 `getResizedRect` 或现有 clamp 规则；不在 preview 模式中提前更新 committed 尺寸。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要在现有 resize 数学与多方向 handle 行为上加入 release-only commit，风险最高。
  - Skills: `[]` — 复用 `Widget` 现有 resize 逻辑即可，无需额外技能。
  - Omitted: `["frontend-ui-ux"]` — 任务核心是几何与约束正确性。

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 6 | Blocked By: 1, 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Widget/Widget.tsx` — `setupResizeDrags`、`cleanupResizeDrags`、`getResizedRect` 与 frame state 是 resize outline 的唯一落点。
  - Test: `tests/CWindowTitleComposition.test.tsx` — 已有 8 方向 resize、`resizable={false}`、min/max clamp 与 unmount 安全测试，可扩展 outline 断言。
  - Test: `tests/ui/window.resize.spec.ts` — Playwright 8 方向 resize matrix 基线。
  - Test: `tests/ui/window.resize-guards.spec.ts` — resize guard 场景与 clamp 断言基线。
  - Helper: `tests/ui/window.helpers.ts` — 现有 rect 读取与拖拽 helper，可扩展 preview frame 读取。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `resizeBehavior='live'` 时，任一 resize handle 拖动中真实 frame rect 持续变化，且不渲染 preview frame。
  - [ ] `resizeBehavior='outline'` 时，拖动中的真实 frame rect 保持不变，仅 preview frame 变化；松手后真实 frame rect 一次性提交为 preview rect。
  - [ ] outline resize 继续遵守 8 方向 handle、min/max clamp、`resizable={false}` 与 cleanup/unmount 规则。
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Outline resize keeps committed frame stable until release
    Tool: Bash
    Steps: 扩展 `tests/CWindowTitleComposition.test.tsx`，模拟 `window-resize-se` handle 的 pointer down → move → release；运行 `yarn test -- CWindowTitleComposition.test.tsx`
    Expected: 测试断言拖动中真实 frame rect 不变、preview rect 变化；release 后 committed rect 与 preview rect 完全一致且 preview 被清空
    Evidence: .sisyphus/evidence/task-4-outline-resize.txt

  Scenario: Clamp applies during preview, not only after commit
    Tool: Bash
    Steps: 在同一 Jest 测试文件中为 `resizeBehavior='outline'` 配置最小尺寸约束；模拟向内拖动超过下限并运行 `yarn test -- CWindowTitleComposition.test.tsx`
    Expected: preview rect 在拖动中已被 clamp；release 后真实 frame rect 与该 constrained preview rect 一致，`resizable={false}` 与 unmount cleanup 断言继续通过
    Evidence: .sisyphus/evidence/task-4-outline-resize-error.txt
  ```

  **Commit**: YES | Message: `feat(window): add outline preview for resize` | Files: `src/components/Widget/Widget.tsx`, `tests/CWindowTitleComposition.test.tsx`

- [x] 5. Wire demo fixtures and preview-aware test helpers

  **What to do**: 在 `src/dev/playwright/windowHarness.tsx` 增加明确的 Window fixtures，至少包含：`default`（双 live）、`outline-move`、`outline-resize`、`outline-both`。这些 fixture 只在 demo / Playwright harness 中显式传入 `moveBehavior` / `resizeBehavior`，不能改库默认值。同步扩展 `tests/ui/window.helpers.ts`，新增 preview-aware 工具，例如 `readPreviewMetrics()`、`expectNoPreviewFrame()`，并统一 fixture 导航方式，避免各 spec 自己拼 selector / URL 逻辑。
  **Must NOT do**: 不把 outline 模式设成全局默认；不引入与本功能无关的新 demo 参数；不让测试 helper 直接依赖脆弱的 className 文本。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 任务边界清晰，主要是 fixture 编排与测试 helper 抽象。
  - Skills: `[]` — 已有 harness 与 helper 模式足够复用。
  - Omitted: `["frontend-ui-ux"]` — 这是测试承载层，不是设计任务。

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 6 | Blocked By: 3, 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/playwright/windowHarness.tsx` — 当前 Window demo / fixture 入口，用户要求第一期直接在 Demo 上开启 props。
  - Helper: `tests/ui/window.helpers.ts` — 已有 `gotoWindowFixture`、`readFrameMetrics`、`dragLocatorBy`，应在这里集中补 preview-aware helper。
  - Test: `tests/ui/window.move.spec.ts` — move fixture 使用方。
  - Test: `tests/ui/window.resize.spec.ts` — resize fixture 使用方。
  - Test: `tests/ui/window.resize-guards.spec.ts` — guard fixture 使用方。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `windowHarness` 暴露 `default`、`outline-move`、`outline-resize`、`outline-both` 四个可导航 fixture。
  - [ ] `default` fixture 不传 outline props；其他 fixture 仅按名称启用需要的模式组合。
  - [ ] `tests/ui/window.helpers.ts` 可分别读取真实 frame 与 preview frame rect，并可显式断言 preview frame 不存在。
  - [ ] `yarn test:ui tests/ui/window.move.spec.ts`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Demo fixtures map to intended behavior modes
    Tool: Playwright
    Steps: 依次打开 `?fixture=default`、`?fixture=outline-move`、`?fixture=outline-resize`、`?fixture=outline-both`；通过一次 title drag 与一次 resize handle drag 观察是否出现 preview frame
    Expected: default 无 preview；outline-move 仅 move 出现 preview；outline-resize 仅 resize 出现 preview；outline-both 两者都出现 preview
    Evidence: .sisyphus/evidence/task-5-window-fixtures.txt

  Scenario: Helper accurately distinguishes frame vs preview
    Tool: Bash
    Steps: 运行引用 `readFrameMetrics()`、`readPreviewMetrics()`、`expectNoPreviewFrame()` 的 Playwright 用例
    Expected: helper 能稳定读取两个 rect，且在 live 模式下明确断言 preview 不存在
    Evidence: .sisyphus/evidence/task-5-window-helpers.txt
  ```

  **Commit**: YES | Message: `feat(window): wire outline preview demo fixtures` | Files: `src/dev/playwright/windowHarness.tsx`, `tests/ui/window.helpers.ts`, `tests/ui/window.move.spec.ts`, `tests/ui/window.resize.spec.ts`, `tests/ui/window.resize-guards.spec.ts`

- [x] 6. Complete automated regression coverage and ship gate

  **What to do**: 基于现有 Jest + Playwright 测试面补齐完整回归集。Jest 侧在 `tests/CWindowTitleComposition.test.tsx` 中覆盖 props 默认值、outline mid-drag / release 语义、content no-op、unmount cleanup。Playwright 侧在 `tests/ui/window.move.spec.ts`、`tests/ui/window.resize.spec.ts`、`tests/ui/window.resize-guards.spec.ts` 中覆盖默认 live、outline move、outline resize、mixed modes、min/max clamp、`resizable={false}`、preview 清理。最后执行 lint / Jest / Playwright / build 全套命令，所有失败只能做回归修复，不得顺手扩 scope。
  **Must NOT do**: 不依赖人工截图判定成功；不把 mixed-mode 验证留给手工测试；不在质量门阶段继续改 API。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要整合 Jest、Playwright、构建与回归修复，且要对 flaky 风险负责。
  - Skills: `["playwright"]` — 最终 UI 回归必须通过浏览器自动化验证 mid-drag 与 post-release 几何。
  - Omitted: `["frontend-ui-ux"]` — 关注点是行为回归，不是视觉重设计。

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: F1, F2, F3, F4 | Blocked By: 3, 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Test: `tests/CWindowTitleComposition.test.tsx` — 单元/组合层回归总入口。
  - Test: `tests/ui/window.move.spec.ts` — move live / outline / content no-op / mixed-mode 入口。
  - Test: `tests/ui/window.resize.spec.ts` — 8 方向 resize live / outline 与 mixed-mode 入口。
  - Test: `tests/ui/window.resize-guards.spec.ts` — `resizable={false}` 与 clamp 回归入口。
  - Helper: `tests/ui/window.helpers.ts` — preview-aware rect 读取与拖拽辅助。
  - CI: `.github/workflows/ci-pr.yml` — 最终必须满足 lint → test → test:ui → build 的现有门禁顺序。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `tests/CWindowTitleComposition.test.tsx` 覆盖默认 live、outline move、outline resize、content no-op、unmount cleanup。
  - [ ] `tests/ui/window.move.spec.ts` 覆盖 default、outline-move、outline-both 下的 move 行为。
  - [ ] `tests/ui/window.resize.spec.ts` 覆盖 default、outline-resize、outline-both 下的 resize 行为与 8 方向 matrix。
  - [ ] `tests/ui/window.resize-guards.spec.ts` 覆盖 outline resize 下的 min/max clamp 与 `resizable={false}`。
  - [ ] `yarn lint`
  - [ ] `yarn test -- CWindowTitleComposition.test.tsx`
  - [ ] `yarn test:ui tests/ui/window.move.spec.ts`
  - [ ] `yarn test:ui tests/ui/window.resize.spec.ts`
  - [ ] `yarn test:ui tests/ui/window.resize-guards.spec.ts`
  - [ ] `yarn build`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Mixed-mode combinations stay independent
    Tool: Playwright
    Steps: 打开 `outline-move` fixture，验证 move 出现 preview 且 resize 直接实时变化；再打开 `outline-resize` fixture，验证 move 实时变化且 resize 出现 preview
    Expected: 两种 mixed-mode 都只影响各自控制的交互，不串扰另一条路径
    Evidence: .sisyphus/evidence/task-6-mixed-modes.txt

  Scenario: Final ship gate matches CI
    Tool: Bash
    Steps: 顺序执行 `yarn lint && yarn test -- CWindowTitleComposition.test.tsx && yarn test:ui tests/ui/window.move.spec.ts && yarn test:ui tests/ui/window.resize.spec.ts && yarn test:ui tests/ui/window.resize-guards.spec.ts && yarn build`
    Expected: 所有命令通过；没有为过关而引入额外范围修改
    Evidence: .sisyphus/evidence/task-6-ship-gate.txt
  ```

  **Commit**: YES | Message: `test(window): cover outline preview regressions` | Files: `tests/CWindowTitleComposition.test.tsx`, `tests/ui/window.move.spec.ts`, `tests/ui/window.resize.spec.ts`, `tests/ui/window.resize-guards.spec.ts`, `tests/ui/window.helpers.ts`, `src/dev/playwright/windowHarness.tsx`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle

  **What to do**: 让 oracle 对照本计划逐项审计最终实现，确认公共 API、preview 渲染模型、release-only commit、mixed-mode、demo fixture 与测试矩阵均已按计划完成。审计必须逐条引用实现文件与测试文件，不允许只给概括性结论。
  **Tooling / Execution**:
  - 使用 oracle 审阅：`src/components/Window/Window.tsx`、`src/components/Widget/Widget.tsx`、`src/components/Window/WindowTitle.tsx`、`src/dev/playwright/windowHarness.tsx`
  - 对照测试：`tests/CWindowTitleComposition.test.tsx`、`tests/ui/window.move.spec.ts`、`tests/ui/window.resize.spec.ts`、`tests/ui/window.resize-guards.spec.ts`
  - 对照计划：`.sisyphus/plans/window-drag-resize-preview.md`
  **Expected**:
  - oracle 明确确认：`moveBehavior` / `resizeBehavior` 为 `'live' | 'outline'`
  - oracle 明确确认：outline 模式拖拽中真实 frame rect 不变，release 后才 commit
  - oracle 明确确认：demo fixture 仅在 harness 中开启 outline，默认库行为未变
  - oracle 未提出阻塞级偏差
  **Evidence**: `.sisyphus/evidence/f1-plan-compliance.txt`

- [x] F2. Code Quality Review — unspecified-high

  **What to do**: 进行代码质量审查，重点检查 preview state 生命周期、drag listener cleanup、重复逻辑、类型安全、测试可维护性，以及是否引入与需求无关的重构。
  **Tooling / Execution**:
  - 静态审查目标：`src/components/Widget/Widget.tsx`、`src/components/Window/Window.tsx`、`src/components/Window/WindowTitle.tsx`、`tests/ui/window.helpers.ts`
  - 命令：`yarn lint`、`yarn build`
  **Expected**:
  - lint / build 全通过
  - 无 `any`、无未清理 drag listener、无 preview state 泄漏
  - 无与本需求无关的大范围重构或 API 漂移
  **Evidence**: `.sisyphus/evidence/f2-code-quality-review.txt`

- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)

  **What to do**: 使用 Playwright 进行真实交互 QA，覆盖默认 live、outline-move、outline-resize、outline-both 四类 fixture，并记录 mid-drag 与 post-release 的几何结果。
  **Tooling / Execution**:
  - 命令：`yarn test:ui tests/ui/window.move.spec.ts && yarn test:ui tests/ui/window.resize.spec.ts && yarn test:ui tests/ui/window.resize-guards.spec.ts`
  - 如需浏览器证据，使用 Playwright 截图/日志保存至 evidence
  **Expected**:
  - default：move / resize 无 preview，真实 frame 实时变化
  - outline-move：仅 move 出现 preview，release 后真实 frame 跳转到 preview
  - outline-resize：仅 resize 出现 preview，release 后真实 frame 变为 preview rect
  - outline-both：move / resize 都遵守 outline 模式
  - guard 用例通过：`resizable={false}`、min/max clamp、cleanup 无回归
  **Evidence**: `.sisyphus/evidence/f3-manual-qa.md`

- [x] F4. Scope Fidelity Check — deep

  **What to do**: 用 deep 复核最终改动是否严格局限于 Window outline preview 范围，确保没有偷偷扩大到其他组件、主题系统泛化、拖拽框架重写或默认行为变更。
  **Tooling / Execution**:
  - 审查目标：所有本次改动文件与最终 diff
  - 对照范围：本计划的 `Must Have` / `Must NOT Have` / `Scope`
  **Expected**:
  - 仅修改 Window / Widget / WindowTitle / default theme / harness / 对应测试相关文件
  - 默认 live 行为保持不变
  - 未扩展到 Window 以外组件，未引入第三种模式，未做通用拖拽框架重构
  - deep 未提出阻塞级 scope 偏离
  **Evidence**: `.sisyphus/evidence/f4-scope-fidelity.txt`

## Commit Strategy
- Commit 1: `feat(window): add move and resize behavior api`
- Commit 2: `feat(window): add outline preview for move`
- Commit 3: `feat(window): add outline preview for resize`
- Commit 4: `test(window): cover outline preview fixtures and regressions`

## Success Criteria
- `moveBehavior` / `resizeBehavior` 的默认值均为 `live`，不破坏现有消费者。
- outline 模式下，拖拽中真实 frame rect 不变，`window-preview-frame` 反映 preview rect；释放后真实 frame rect 与 preview rect 一致。
- mixed-mode（move outline + resize live；move live + resize outline）均通过自动化验证。
- `resizable={false}`、min/max clamp、cleanup/unmount 在 outline 模式下无回归。
- Demo harness 明确展示 outline 模式，但全库默认行为仍为 live。
