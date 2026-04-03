# Theme 禁止嵌套与 Demo 隔离

## TL;DR
> **Summary**: 将 `Theme` 从“最近 provider 生效”的公开行为改为“禁止嵌套并快速失败”，同时把 Demo 里的 Theme 展示区从全局 `DevThemeRoot` 中隔离出来，避免外层主题污染。
> **Deliverables**:
> - `Theme` 嵌套拒绝契约与回归测试
> - Theme Demo 区域隔离与示例文案更新
> - README 对外说明同步
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 → 3 → 5 → 6

## Context
### Original Request
- Theme 组件改为不支持嵌套，嵌套问题太多了。
- 在 Demo 中把 Theme 这一栏单独提出来，不要套在另一个 Theme 组件下了。
- 这样好让里面的样式不被外层 Theme 污染。

### Interview Summary
- 禁止嵌套的对外策略采用“开发时抛错”方向；为避免 dev/prod 语义分叉，本计划默认统一为所有环境都抛出稳定错误短语：`Nested Theme is not supported`。
- 范围包含三块：库行为修正、Demo 隔离、README / 示例说明同步。
- 测试策略采用 TDD。
- 保留现有显式 `theme` prop 优先级，不扩展成更广义的主题系统重构。

### Metis Review (gaps addressed)
- 将工作拆成三个显式范围：库行为、Demo、文档，避免演变为 theming 重构。
- 嵌套校验不能只依赖 `theme !== undefined`，否则外层 `Theme name="   "` 会漏检；需要单独记录“当前已处于 Theme provider 内”的上下文布尔值。
- 回归测试必须保住单层 `Theme` 和显式 `theme` prop 覆盖行为。
- Demo 只隔离 Theme 展示区，不重写整个 catalog 结构。

## Work Objectives
### Core Objective
把 `Theme` 的公开契约从“支持嵌套、内层覆盖外层”切换为“任何层级嵌套都不被支持并立即失败”，并让开发 Demo 的 Theme 展示区脱离外层 `Theme` 包装。

### Deliverables
- 更新后的 `Theme` provider 契约与稳定错误短语
- 覆盖嵌套拒绝、单层 provider、显式 prop 覆盖、空白 theme 名称的测试
- 不受 `DevThemeRoot` 污染的 Theme showcase
- 不再暗示支持嵌套的 README 与 Demo snippet

### Definition of Done (verifiable conditions with commands)
- `yarn test -- Theme.test.tsx` 通过，且包含“嵌套 Theme 抛错”断言
- `yarn test -- PublicThemeMatrix.test.tsx` 通过，显式 `theme` prop 覆盖未回归
- `yarn test -- ComponentCatalog.test.tsx` 通过，证明 Theme showcase 不在 `theme-root` 下
- `yarn test:ui` 通过，Theme 区块代码面板仍可正常展示
- `yarn lint` 通过
- `yarn build` 通过

### Must Have
- 任意嵌套深度的 `Theme` 都抛出包含 `Nested Theme is not supported` 的稳定错误短语
- `Theme` 单层使用仍然为子树提供 className + context
- 组件显式 `theme` prop 仍优先于 provider
- Theme showcase 从 `DevThemeRoot` 包裹树中移出
- README 与 Demo 文案明确“Theme 不支持嵌套”

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不得把范围扩展为 Theme API 重设计或 context 全量重构
- 不得修改非 Theme 相关组件的主题实现，仅允许做回归保护
- 不得保留任何“nearest provider wins”文案、snippet 或测试断言
- 不得引入仅在开发环境生效、生产环境静默吞掉嵌套的隐式行为分叉

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: TDD + Jest / React Testing Library + Playwright
- QA policy: Every task includes executable happy-path + edge/failure-path scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. This scope is smaller, so use the minimum clean split that still preserves TDD and parallel red/green work.

Wave 1: red tests / contract locking
- 1. Theme 嵌套拒绝测试
- 2. Theme 支持路径回归测试
- 4. Demo 隔离测试

Wave 2: green implementation / docs alignment
- 3. Theme provider 守卫实现
- 5. Demo 结构隔离与 snippet 文案修正
- 6. README 对外说明同步

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
|---|---|---|
| 1 | - | 3 |
| 2 | - | 3 |
| 3 | 1, 2 | 5, 6, F1-F4 |
| 4 | - | 5 |
| 5 | 3, 4 | 6, F1-F4 |
| 6 | 3, 5 | F1-F4 |

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 3 tasks → `quick`, `visual-engineering`
- Wave 2 → 3 tasks → `quick`, `visual-engineering`, `writing`
- Final Verification → 4 tasks → `oracle`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. 以 TDD 重写 Theme 嵌套契约测试

  **What to do**: 在 `tests/Theme.test.tsx` 中移除“最近 nested provider 生效”的旧契约，改为失败优先的嵌套拒绝测试。至少覆盖：直接嵌套、不同 theme 名称嵌套、同名嵌套、三层深度嵌套；统一断言抛错信息包含稳定短语 `Nested Theme is not supported`。保留单层 provider、无 provider、空白 theme 的现有语义测试，不要把这些支持路径删除掉。
  **Must NOT do**: 不要在此任务实现 `Theme.tsx`；不要修改 `Button`、`ThemeMatrix` 等非 Theme 单测文件；不要保留任何 `data-theme="winxp"` 风格的嵌套成功断言。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 单文件测试契约重写，范围集中
  - Skills: `[]` — 现有 Jest/RTL 模式已足够，无需额外技能
  - Omitted: `['frontend-ui-ux']` — 不涉及视觉或布局设计

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [3] | Blocked By: [-]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/Theme.test.tsx:15-57` — 当前 Theme provider 测试组织方式；用这里的 `describe('Theme')` 结构替换旧嵌套断言
  - Pattern: `tests/Theme.test.tsx:59-73` — 空白 provider 值与无 provider 的边界断言，需原样保住
  - API/Type: `src/components/Theme/Theme.tsx:3-35` — 当前 ThemeContext 与 provider 实现，嵌套拒绝会直接约束这里
  - API/Type: `src/components/Theme/useTheme.ts:14-23` — 显式 prop 优先于 context 的顺序必须保持不变

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- Theme.test.tsx` 通过，且测试名清晰表达“nested Theme is unsupported”语义
  - [ ] 仓库检索 `tests/Theme.test.tsx` 时，不再存在 `uses the nearest nested provider theme` 或等价的“内层 Theme 成功生效”断言描述

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: 单层 Theme 与无 provider 语义仍被测试覆盖
    Tool: Bash
    Steps: 运行 `yarn test -- Theme.test.tsx`
    Expected: `PASS tests/Theme.test.tsx`，且单层 provider / 无 provider / 空白 theme 用例均通过
    Evidence: .sisyphus/evidence/task-1-theme-contract-red.log

  Scenario: 直接嵌套与深层嵌套都被定义为错误路径
    Tool: Bash
    Steps: 运行 `yarn test -- Theme.test.tsx`
    Expected: 嵌套相关用例断言抛出并匹配稳定短语 `Nested Theme is not supported`
    Evidence: .sisyphus/evidence/task-1-theme-contract-red-error.log
  ```

  **Commit**: NO | Message: `test(theme): lock nested Theme rejection contract` | Files: `tests/Theme.test.tsx`

- [x] 2. 补强 Theme 支持路径与空白 provider 回归保护

  **What to do**: 继续在 `tests/Theme.test.tsx` 中增加“外层 `Theme name="   "` 也算 provider、因此不能绕过嵌套限制”的边界用例；同时复核并在必要时微调 `tests/Button.test.tsx` 与 `tests/PublicThemeMatrix.test.tsx` 的断言文案，确保显式 `theme` prop 覆盖 provider 的支持路径仍然被独立锁定。只有在现有断言不足以证明回归保护时，才修改这两个文件。
  **Must NOT do**: 不要把 provider 嵌套限制错误地扩展到显式 `theme` prop；不要大面积重写 Theme Matrix；不要改组件实现代码。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 以回归保护为主的测试补强
  - Skills: `[]` — 现有测试模式足够复用
  - Omitted: `['frontend-ui-ux']` — 不涉及样式或布局变更

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [3] | Blocked By: [-]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/Theme.test.tsx:37-45` — `useTheme` 显式 prop 优先级的最小回归断言
  - Pattern: `tests/Theme.test.tsx:59-73` — 现有边界值测试位置，新增“空白外层 provider 仍禁止内层 Theme”应放在同一文件同一语义块中
  - Test: `tests/Button.test.tsx:68-119` — 组件级 `theme` prop 覆盖 provider 的现成断言风格
  - Test: `tests/PublicThemeMatrix.test.tsx:84-100` — provider + explicit override 共存时的公开 API 回归样式

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- Theme.test.tsx` 通过，且包含“空白外层 provider 也拒绝内层 Theme”的断言
  - [ ] `yarn test -- PublicThemeMatrix.test.tsx` 通过，现有公开组件主题矩阵无回归
  - [ ] `yarn test -- Button.test.tsx` 通过，显式 `theme` prop 覆盖 provider 断言不变

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: 显式 theme prop 仍覆盖 provider
    Tool: Bash
    Steps: 运行 `yarn test -- Button.test.tsx` 与 `yarn test -- PublicThemeMatrix.test.tsx`
    Expected: 相关 override 用例通过，日志均显示 PASS
    Evidence: .sisyphus/evidence/task-2-theme-regression.log

  Scenario: 空白外层 provider 不能绕过嵌套禁令
    Tool: Bash
    Steps: 运行 `yarn test -- Theme.test.tsx`
    Expected: 新增边界用例通过，并断言稳定错误短语 `Nested Theme is not supported`
    Evidence: .sisyphus/evidence/task-2-theme-regression-error.log
  ```

  **Commit**: YES | Message: `test(theme): lock nested Theme rejection contract` | Files: `tests/Theme.test.tsx`, `tests/Button.test.tsx`, `tests/PublicThemeMatrix.test.tsx`

- [x] 3. 在 Theme provider 中实现统一的嵌套守卫

  **What to do**: 在 `src/components/Theme/Theme.tsx` 中把 `ThemeContextValue` 扩展为同时携带 `theme` 与 `hasThemeProvider` 布尔标记，默认值为 `{ theme: undefined, hasThemeProvider: false }`。`Theme` 渲染时先读取父 context；一旦发现 `hasThemeProvider` 为 `true`，立即抛出 `new Error('Nested Theme is not supported')`。新的 provider value 应始终写入 `hasThemeProvider: true`，并继续通过 `normalizeTheme(name)` 提供已归一化的 context 值；保留 wrapper DOM 使用原始 `name` 作为 `className` 的现有行为，不要顺手改成 normalized class。
  **Must NOT do**: 不要把嵌套判定写成 `context.theme !== undefined`；不要改 `useTheme` 的显式 prop 优先级；不要把错误改为 warning、console 输出或静默跳过。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 单组件最小实现修正
  - Skills: `[]` — 仓库已有模式足够
  - Omitted: `['frontend-ui-ux']` — 非视觉任务

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [5, 6] | Blocked By: [1, 2]

  **References** (executor has NO interview context — be exhaustive):
  - API/Type: `src/components/Theme/Theme.tsx:3-35` — 当前 context 结构与 provider 位置；这里做最小 guard 改动
  - API/Type: `src/components/Theme/useTheme.ts:14-23` — `useTheme` 依旧只消费 `theme`，不应改变返回优先级
  - Test: `tests/Theme.test.tsx:15-73` — 任务 1/2 生成的新契约将直接驱动这里的 green 实现
  - Test: `tests/Button.test.tsx:91-105` — 显式 prop 覆盖 provider 的公开行为必须保留

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- Theme.test.tsx` 通过，嵌套 Theme 用例统一抛出 `Nested Theme is not supported`
  - [ ] `yarn test -- Button.test.tsx` 与 `yarn test -- PublicThemeMatrix.test.tsx` 通过，显示支持路径未回归
  - [ ] `yarn lint` 通过，未引入未使用字段或类型问题

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: 单层 Theme 仍正常提供 className 与 context
    Tool: Bash
    Steps: 运行 `yarn test -- Theme.test.tsx`
    Expected: provider happy-path 用例通过，日志显示 PASS
    Evidence: .sisyphus/evidence/task-3-theme-guard.log

  Scenario: 任意嵌套深度都立即失败
    Tool: Bash
    Steps: 运行 `yarn test -- Theme.test.tsx`
    Expected: 直接嵌套、同名嵌套、深层嵌套、空白外层 provider 嵌套均断言抛出 `Nested Theme is not supported`
    Evidence: .sisyphus/evidence/task-3-theme-guard-error.log
  ```

  **Commit**: YES | Message: `fix(theme): reject nested Theme providers` | Files: `src/components/Theme/Theme.tsx`

- [x] 4. 为 Theme showcase 隔离补齐红灯测试

  **What to do**: 新增 `tests/ComponentCatalog.test.tsx`，用 React Testing Library 渲染 `ComponentCatalog` 并锁定两个结构事实：`catalog-section-theme` 不在 `theme-root` 的 DOM 子树内，而 `catalog-section-button` 仍在 `theme-root` 内。同步扩展 `tests/ui/component-catalog-code.spec.ts` 的 Theme 场景，确保 Theme 区块仍可展示代码面板，并且展示文案不再包含“nearest nested provider wins / Inner wins”这类嵌套支持提示。
  **Must NOT do**: 不要在此任务修改 `src/dev` 实现；不要把 UI 测试扩大成视觉截图回归；不要删除现有 Button/Window 的 code toggle 断言。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 增加结构与交互红灯测试，改动集中
  - Skills: `[]` — 现有 RTL/Playwright 模式足够
  - Omitted: `['frontend-ui-ux']` — 先锁定结构，不做界面设计

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [5] | Blocked By: [-]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/ComponentCatalog.tsx:145-177` — Theme showcase 当前结构、文案与 snippet 来源
  - Pattern: `src/dev/ComponentCatalog.tsx:373-404` — 当前整页被 `DevThemeRoot` 包裹，测试需要锁定将来拆分后的边界
  - API/Type: `src/dev/themeSwitcher.tsx:32-48` — `theme-root` 的 data-testid 来源
  - Test: `tests/ui/component-catalog-code.spec.ts:34-62` — Theme 区块 code toggle 的现有 Playwright 模式

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- ComponentCatalog.test.tsx` 通过，证明 Theme 区块不在 `theme-root` 下而 Button 区块仍在
  - [ ] `yarn test:ui --grep "Theme showcase"` 通过，Theme 区块代码面板行为未回归

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme 展示区与其余受主题控制区域被结构性隔离
    Tool: Bash
    Steps: 运行 `yarn test -- ComponentCatalog.test.tsx`
    Expected: `catalog-section-theme` 不被 `theme-root` 包含，而 `catalog-section-button` 被 `theme-root` 包含
    Evidence: .sisyphus/evidence/task-4-theme-demo-red.log

  Scenario: Theme 展示区代码面板仍可交互，且不再宣称支持嵌套
    Tool: Bash
    Steps: 运行 `yarn test:ui --grep "Theme showcase"`
    Expected: Playwright 通过；Theme code region 可展开/收起，且断言文本不包含 `Inner wins` 或 `nearest nested provider wins`
    Evidence: .sisyphus/evidence/task-4-theme-demo-red-error.log
  ```

  **Commit**: NO | Message: `test(dev): cover Theme showcase isolation` | Files: `tests/ComponentCatalog.test.tsx`, `tests/ui/component-catalog-code.spec.ts`

- [x] 5. 重构 Demo 结构并移除嵌套示例文案

  **What to do**: 在 `src/dev/ComponentCatalog.tsx` 中把 `ThemeShowcase` 从 `<DevThemeRoot theme={theme}>...</DevThemeRoot>` 包裹树中提出来，保持 `component-catalog` 根节点与 header 不变；推荐结构为：header 保持原位，`main` 先渲染单独的 `ThemeShowcase`，再在 `DevThemeRoot` 内渲染其余 showcase 网格。更新 `THEME_SNIPPET` 与说明文案：删除嵌套 provider 示例与“nearest provider wins”描述，替换为“Theme 不支持嵌套；局部覆盖请使用组件 `theme` prop”说明。不要改变 `catalog-section-theme`、`theme-root`、代码折叠按钮的现有 test id / 可访问名称。
  **Must NOT do**: 不要重排除 Theme showcase 以外的 catalog 布局；不要修改 `ThemeSwitcher` 的 API；不要把 Theme showcase 再包进新的外层 Theme。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 涉及 demo 结构调整，但目标是结构隔离而非视觉重设计
  - Skills: `[]` — 仓库现有模式即可完成
  - Omitted: `['frontend-ui-ux']` — 不做审美升级，只做污染隔离

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [6] | Blocked By: [3, 4]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/ComponentCatalog.tsx:126-177` — 当前 Theme snippet、说明文案与示例 DOM
  - Pattern: `src/dev/ComponentCatalog.tsx:373-404` — 当前 `ThemeShowcase` 位于 `DevThemeRoot` 内的具体位置
  - API/Type: `src/dev/themeSwitcher.tsx:37-48` — `DevThemeRoot` 当前只负责提供根主题；保留其 API，不要改调用契约
  - Test: `tests/ui/component-catalog-code.spec.ts:34-62` — Theme 区块现有交互测试必须继续通过

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- ComponentCatalog.test.tsx` 通过，Theme 区块已脱离 `theme-root`
  - [ ] `yarn test:ui --grep "Theme showcase"` 通过，代码面板交互与文案断言通过
  - [ ] `yarn build` 通过，Demo 入口仍可被 Vite 构建

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme 展示区不再被外层 Theme 污染
    Tool: Bash
    Steps: 运行 `yarn test -- ComponentCatalog.test.tsx`
    Expected: 结构断言通过，Theme 区块不属于 `theme-root` 子树
    Evidence: .sisyphus/evidence/task-5-theme-demo-green.log

  Scenario: Theme snippet 与说明文案不再展示嵌套方案
    Tool: Bash
    Steps: 运行 `yarn test:ui --grep "Theme showcase"`
    Expected: Theme code region 仍可展开/收起，且断言文本显示单层 Theme / explicit prop 方案，不出现 `Inner wins`
    Evidence: .sisyphus/evidence/task-5-theme-demo-green-error.log
  ```

  **Commit**: YES | Message: `refactor(dev): isolate Theme showcase from outer provider` | Files: `src/dev/ComponentCatalog.tsx`, `src/dev/themeSwitcher.tsx` (仅在确有必要时), `tests/ComponentCatalog.test.tsx`, `tests/ui/component-catalog-code.spec.ts`

- [x] 6. 同步 README 的 Theme 契约说明

  **What to do**: 更新 `README.md` 的 `## Theming` / `### Theme 组件` 段落，明确写出 `Theme` 不支持嵌套，并保留单层 wrapper 示例。增加一条简短迁移说明：如果只需局部覆盖单个组件，使用组件自己的 `theme` prop；不要补写更大的 theming 教程。文案要与 Demo snippet 一致，避免 README 继续暗示 nearest provider 语义。
  **Must NOT do**: 不要扩展成 changelog、发布说明或完整迁移文档；不要引入 README 中没有必要的新 API；不要复述已删除的嵌套用法作为“推荐方案”。

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: 纯文档对齐，需保证对外措辞准确
  - Skills: `[]` — 无需额外写作技能即可完成
  - Omitted: `['frontend-ui-ux']` — 不涉及界面设计

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [F1-F4] | Blocked By: [3, 5]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `README.md:64-98` — 现有 Theming 章节位置与示例形式
  - Pattern: `src/dev/ComponentCatalog.tsx:126-143` — Demo snippet 需要与 README 文案保持一致
  - API/Type: `src/components/Theme/Theme.tsx:24-35` — Theme 当前公开入口行为说明来源
  - Test: `tests/Button.test.tsx:68-119` — 当 README 提到局部覆盖时，应与现有组件 `theme` prop 能力对齐

  **Acceptance Criteria** (agent-executable only):
  - [ ] 仓库检索 `README.md` 的 Theming 章节可见“Theme 不支持嵌套”的明确说明
  - [ ] 仓库检索 `README.md` 时，仅保留单层 `Theme` 示例与组件 `theme` prop 示例，不新增嵌套示例
  - [ ] `yarn build` 通过，文档改动未影响仓库构建流程

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: README 已与新契约对齐
    Tool: Bash
    Steps: 运行 `yarn build`
    Expected: 构建通过，且复核 `README.md` 的 Theming 章节可见“不支持嵌套”与 `theme` prop 替代说明
    Evidence: .sisyphus/evidence/task-6-theme-docs.log

  Scenario: README 不再残留嵌套语义
    Tool: Bash
    Steps: 运行 `yarn build`
    Expected: 构建通过，且复核 `README.md` 中不存在“nearest provider wins / nested provider wins / Inner wins”类残留文案
    Evidence: .sisyphus/evidence/task-6-theme-docs-error.log
  ```

  **Commit**: YES | Message: `docs(theme): clarify unsupported nesting` | Files: `README.md`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [x] F4. Scope Fidelity Check — deep

## Commit Strategy
- `test(theme): lock nested Theme rejection contract`
- `fix(theme): reject nested Theme providers`
- `test(dev): cover Theme showcase isolation`
- `refactor(dev): isolate Theme showcase from outer provider`
- `docs(theme): clarify unsupported nesting`

## Success Criteria
- 所有现有“nested provider wins”行为被测试替换为“nested provider throws”
- `Theme` 相关核心测试、Theme 矩阵测试、Demo 测试、UI 测试、lint、build 全部通过
- Demo 中 Theme 栏目不再处于 `data-testid="theme-root"` 的 DOM 子树内
- README 与 Demo snippet 均不再示例或描述 Theme 嵌套
