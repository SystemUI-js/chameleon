# Theme Demo Usage Plan

## TL;DR
> **Summary**: 在现有 dev catalog 中新增一个独立的 Theme 展示区，完整说明 `Theme` 包裹用法、局部主题覆盖与组件 `theme` prop 的区别，同时保持 Button/Window 展示区独立不变。
> **Deliverables**:
> - `ComponentCatalog` 中新增 `Theme` section
> - 更新 `ComponentCatalog` 自动化测试覆盖 Theme section 与 code disclosure
> - 视触发面决定是否补充 Playwright catalog code toggle 覆盖
> **Effort**: Short
> **Parallel**: YES - 2 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Final Verification

## Context
### Original Request
当前的 demo 中，没有体现出 Theme 这个组件的使用方法，独立于 Button、Window 一栏，增加一个 Theme 的演示和使用方法。

### Interview Summary
- 需求目标：不是最小示例，而是“完整主题指南”级别的独立 Theme 展示。
- 范围限定：独立于 Button、Window section；不修改 Theme 组件 API、主题定义导出或现有组件行为。
- 验证策略：采用“测试后补”。

### Metis Review (gaps addressed)
- 防止 scope creep 成为完整主题 playground：本计划仅在 `ComponentCatalog` 中增加静态/轻交互展示，不新增新的主题配置器或全局状态。
- 明确 Theme section 的职责：解释局部 `<Theme name={...}>` 包裹语义，不重复现有 header 全局 theme switcher。
- 明确 guardrail：仅使用现有 theme definitions（default/win98/winxp），不得新增公开 API、导出或重构 dev 架构。

## Work Objectives
### Core Objective
让执行代理在 `src/dev/ComponentCatalog.tsx` 中新增一个可验证的独立 Theme section，展示 Theme 组件的实际使用方式，并通过现有 Jest/Playwright/CI 验证链路证明其正确性。

### Deliverables
- `src/dev/ComponentCatalog.tsx` 新增 `THEME_SNIPPET` 与 `ThemeShowcase()`，并注册到 catalog 布局。
- Theme section 展示以下三类信息：
  1. `Theme` wrapper 的基本用法；
  2. 嵌套/局部主题覆盖示例；
  3. 组件 `theme` prop 与 `Theme` wrapper 的区别说明。
- `tests/ComponentCatalog.test.tsx` 覆盖 Theme section 渲染、code disclosure 与独立性。
- 若现有 `tests/ui/component-catalog-code.spec.ts` 无法覆盖新增 section，则扩展其 code toggle 验证。
- 仅在必要时更新 `src/dev/styles/catalog.scss` 以支持 Theme section 排版；不得改动其他样式入口。

### Definition of Done (verifiable conditions with commands)
- `yarn test -- ComponentCatalog` 通过，且新增断言覆盖 `catalog-section-theme`、Theme section code disclosure、示例文案/代码片段显示。
- `yarn test` 通过，证明 catalog 与 Theme 相关测试未回归。
- 若触及 Playwright catalog code 展示行为，`yarn test:ui` 通过。
- `yarn build` 通过。
- 最终变更未修改 `src/components/Theme/Theme.tsx`、`src/dev/themeSwitcher.tsx` 的 API 契约，除非仅为导入复用而发生零语义变更。

### Must Have
- 独立 Theme section，`data-testid="catalog-section-theme"`。
- 延续 `ShowcaseSection + *_SNIPPET + *Showcase()` 模式。
- 示例明确展示 `<Theme name="cm-theme--...">` 的使用方式。
- 示例说明 `Theme` wrapper 与组件级 `theme` prop 的差异。
- Theme section 与 Button/Window section 解耦，不复用其 section 容器，也不修改其原有演示语义。

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不得新增“主题编辑器”“主题 playground”“设计 token 文档页”。
- 不得修改 `Theme` 组件 API、`ThemeDefinition` 类型、theme exports。
- 不得把需求实现为仅修改 README；本次必须是 demo 层展示增强。
- 不得在 `src/theme/**` 中加入 showcase 样式。
- 不得把 Theme section 设计成依赖用户手工观察的验收方式；所有验收必须可自动化执行。

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after + Jest / React Testing Library，必要时补 Playwright。
- QA policy: Every task has agent-executed scenarios.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> 该需求本身较小，维持 2 个实现 wave；依赖以测试→实现→UI 补充为主。

Wave 1: Task 1（测试基线与断言扩充）
Wave 2: Task 2-3（Theme section 实现 + 可选 UI 覆盖）

### Dependency Matrix (full, all tasks)
- Task 1 → blocks Task 2, Task 3
- Task 2 → blocks Task 3, F1-F4
- Task 3 → blocks F1-F4

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 1 task → `quick`
- Wave 2 → 2 tasks → `visual-engineering`, `quick`
- Final Verification → 4 tasks → `oracle`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. 扩充 ComponentCatalog 测试以锁定 Theme section 契约

  **What to do**: 在 `tests/ComponentCatalog.test.tsx` 先补充对新 Theme section 的测试约束，覆盖 section 存在性、`Show code` 按钮、展开后 snippet/说明文案可见，以及 Theme section 展开不应自动展开 Button/Window 等其它 section。测试命名要明确指向 Theme showcase，不修改既有测试语义。若需要额外断言 Theme wrapper 与 `theme` prop 区别，应通过稳定的可见文本或 `data-testid` 进行。
  **Must NOT do**: 不得在这一步修改 `src/dev/ComponentCatalog.tsx` 实现；不得把 Theme 的 provider 行为测试塞进 `tests/Theme.test.tsx` 之外的新职责里；不得引入快照测试替代明确断言。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 单文件测试增强，范围集中且判断标准明确。
  - Skills: `[]` — 无需额外技能。
  - Omitted: `["openspec-apply-change"]` — 本任务不是 OpenSpec 实施流。

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [2, 3] | Blocked By: []

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/ComponentCatalog.tsx:33-53` — `ShowcaseSection` 统一定义了 section 标题、`data-testid` 与 code disclosure 挂载方式。
  - Pattern: `src/dev/ComponentCatalog.tsx:82-123` — Button showcase 的 snippet + section 组织方式。
  - Pattern: `src/dev/ComponentCatalog.tsx:202-224` — Window showcase 的 stage 型展示方式，可参考 section 结构但不要复制其语义。
  - Test: `tests/ComponentCatalog.test.tsx:14-39` — 现有 section 的 “Show code” 按钮断言模式。
  - Test: `tests/ComponentCatalog.test.tsx:41-63` — section 独立展开行为断言模式。
  - Test: `tests/ComponentCatalog.test.tsx:101-130` — 展开 code disclosure 后验证片段文本显示的模式。
  - API/Type: `src/dev/themeSwitcher.tsx:8-29` — 现有 dev theme id 与 theme definitions 映射。
  - API/Type: `src/components/Theme/Theme.tsx:7-35` — Theme 的公开 props 与 wrapper 渲染语义。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- ComponentCatalog` 先失败，且失败原因指向缺少 `catalog-section-theme` 或 Theme section 相关断言未满足。
  - [ ] `tests/ComponentCatalog.test.tsx` 新增覆盖 Theme section 基线渲染，断言 `screen.getByTestId('catalog-section-theme')` 可找到。
  - [ ] `tests/ComponentCatalog.test.tsx` 新增覆盖 Theme section 的 `Show code` 按钮，断言初始 `aria-expanded="false"`。
  - [ ] `tests/ComponentCatalog.test.tsx` 新增覆盖 Theme section 展开后可见代表性文本，至少包含 `Theme` 代码片段或说明文案中的稳定字符串。
  - [ ] `tests/ComponentCatalog.test.tsx` 新增覆盖 Theme section 展开不会自动展开 Window 或 Button section。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme section contract turns red before implementation
    Tool: Bash
    Steps: 1) Run `yarn test -- ComponentCatalog` after only adding the new Theme-section assertions; 2) capture failing test names.
    Expected: Jest exits non-zero and reports missing Theme showcase expectations.
    Evidence: .sisyphus/evidence/task-1-theme-catalog-red.txt

  Scenario: Existing sections remain independently collapsible in tests
    Tool: Bash
    Steps: 1) Keep the new Theme section tests alongside existing Button/Window/Grid tests; 2) run `yarn test -- ComponentCatalog` after implementation lands in Task 2.
    Expected: The Theme-specific independence assertions pass without changing the existing section expectations.
    Evidence: .sisyphus/evidence/task-1-theme-catalog-green.txt
  ```

  **Commit**: YES | Message: `test(dev-demo): cover theme showcase expectations` | Files: [`tests/ComponentCatalog.test.tsx`]

- [x] 2. 在 ComponentCatalog 中实现独立 Theme showcase

  **What to do**: 在 `src/dev/ComponentCatalog.tsx` 中新增 `THEME_SNIPPET` 与 `ThemeShowcase()`，并把它注册成独立 section。该 section 必须自包含地展示三件事：① 基础 `<Theme name="cm-theme--win98">...</Theme>` 包裹用法；② 局部/嵌套主题覆盖（最近 provider 生效）；③ 组件 `theme` prop 会优先于 provider theme 的说明或对照。推荐使用 Button 作为主要演示控件，因为它已有稳定展示模式且比 Window 更轻；Window 不作为 Theme section 的主要示例，避免与现有 Window section 语义重叠。将 Theme section 放入左列，位置在 ButtonShowcase 之后、RadioGroupShowcase 之前，使其与基础组件示例同层且明显独立于 Window 列。只有在现有 `.cm-catalog__stack` / `.cm-catalog__row` / `.cm-catalog__value` 不足以表达布局时，才最小化更新 `src/dev/styles/catalog.scss`。
  **Must NOT do**: 不得修改 `src/components/Theme/Theme.tsx`、`src/dev/themeSwitcher.tsx`、`src/theme/**` 导出；不得新增主题切换 state；不得把 Theme section 设计成另一个全局 switcher；不得让 Button/Window 原 section 文案、测试 id 或交互语义发生变化。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 需要在现有 catalog 中增加新展示区并处理内容排版。
  - Skills: `[]` — 无需额外技能。
  - Omitted: `["openspec-apply-change"]` — 非 OpenSpec 执行路径。

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [3, F1, F2, F3, F4] | Blocked By: [1]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/ComponentCatalog.tsx:82-123` — Button showcase 使用 `React.useState` 与 `cm-catalog__row`/`cm-catalog__value` 的简洁演示方式，适合作为 Theme section 子内容风格参考。
  - Pattern: `src/dev/ComponentCatalog.tsx:319-343` — 当前左/右列注册顺序；新 Theme section 应插入左列，位于 Button 后、RadioGroup 前。
  - Pattern: `src/dev/themeSwitcher.tsx:20-48` — 复用现有 theme definitions 与 `<Theme name={themeDefinition.className}>` 的实际用法。
  - API/Type: `src/components/Theme/Theme.tsx:7-35` — `ThemeProps.name` 接收字符串 className；Theme 以 wrapper `div.className=name` 渲染。
  - Test oracle: `tests/Theme.test.tsx:27-57` — provider theme、nested provider theme 与 explicit theme prop precedence 的真实行为，Theme section 内容必须与这些行为一致。
  - API/Type: `src/theme/default/index.tsx:4-8` — `cm-theme--default`
  - API/Type: `src/theme/win98/index.tsx:4-8` — `cm-theme--win98`
  - API/Type: `src/theme/winxp/index.tsx:4-8` — `cm-theme--winxp`
  - Style surface: `src/dev/styles/catalog.scss:65-205` — catalog section、stack、row、code disclosure 样式统一从这里扩展，禁止向 theme 源码写 showcase 样式。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `src/dev/ComponentCatalog.tsx` 新增 `THEME_SNIPPET` 常量与 `ThemeShowcase(): React.ReactElement`，并通过 `ShowcaseSection title="Theme" testId="catalog-section-theme" code={THEME_SNIPPET}` 渲染。
  - [ ] Theme section 至少包含一段稳定文案，明确说明 `Theme` wrapper 用于对子树统一套用主题，组件 `theme` prop 用于单组件覆盖。
  - [ ] Theme section 至少包含一个嵌套 provider 或局部覆盖示例，其展示文案与 `tests/Theme.test.tsx:47-57` 的“nearest nested provider wins”行为一致。
  - [ ] Theme section 至少包含一个组件级 `theme` prop 覆盖示例，其展示文案与 `tests/Theme.test.tsx:37-45` 的“explicit theme prop before provider”行为一致。
  - [ ] `yarn test -- ComponentCatalog` 通过。
  - [ ] 如果修改了 `src/dev/styles/catalog.scss`，变更仅限 Theme section 排版所需的最小新增类，且不覆盖现有 section 样式语义。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme showcase renders as an independent catalog section
    Tool: Bash
    Steps: 1) Run `yarn test -- ComponentCatalog`; 2) inspect the passing output for Theme-related tests added in Task 1.
    Expected: Jest exits 0 and the Theme section tests pass, including `catalog-section-theme` presence and code disclosure assertions.
    Evidence: .sisyphus/evidence/task-2-theme-catalog-jest.txt

  Scenario: Theme showcase does not mutate existing Theme API or global switcher behavior
    Tool: Bash
    Steps: 1) Run `yarn test -- Theme`; 2) run `yarn build`.
    Expected: Theme provider/preference tests still pass and the library builds successfully without API regressions.
    Evidence: .sisyphus/evidence/task-2-theme-api-build.txt
  ```

  **Commit**: YES | Message: `feat(dev-demo): add standalone theme showcase` | Files: [`src/dev/ComponentCatalog.tsx`, `src/dev/styles/catalog.scss` (if needed)]

- [x] 3. 补齐 catalog code disclosure 的 UI 自动化覆盖

  **What to do**: 检查 `tests/ui/component-catalog-code.spec.ts` 是否已经足以覆盖新增 Theme section 的 code toggle 行为；如果没有，则在该 spec 中补充 Theme section 的浏览器级验证。优先沿用现有 Button code toggle 流程，增加对 `#catalog-section-theme-code-region` 初始隐藏、点击后可见、包含代表性 Theme snippet 文本、收起后再次隐藏的断言。若 Theme section 增加了稳定说明文案，也可在浏览器级断言中验证其可见性，但不要依赖纯视觉比对。
  **Must NOT do**: 不得新增与本任务无关的 Playwright 场景；不得把该任务扩展为拖拽/窗口行为测试；若现有 Playwright 已足够，不要为了“凑覆盖”而修改 spec。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 小范围 E2E 断言补充，直接复用现有 Playwright 模式。
  - Skills: `[]` — 无需额外技能。
  - Omitted: `["openspec-apply-change"]` — 非 OpenSpec 执行。

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [F1, F2, F3, F4] | Blocked By: [1, 2]

  **References** (executor has NO interview context — be exhaustive):
  - Test: `tests/ui/component-catalog-code.spec.ts:3-32` — 现有 Button showcase 的浏览器级 code toggle 断言模式。
  - Pattern: `src/dev/ComponentCatalog.tsx:47-50` — code disclosure 由 `ShowcaseCodeDisclosure` 绑定到 sectionId，Theme section 的 code region ID 预计遵循 `catalog-section-theme-code-region`。
  - Test: `tests/ComponentCatalog.test.tsx:101-130` — 展开后按 snippet 关键字验证文本的 Jest 模式，可转译为 Playwright 选择器断言。
  - CI: `.github/workflows/ci-pr.yml:44-76` — 任何 UI spec 变更都必须兼容 `yarn test:ui` 与后续 build/npm pack dry-run 流程。

  **Acceptance Criteria** (agent-executable only):
  - [ ] 若 Theme section 的 code toggle 尚无 E2E 覆盖，则 `tests/ui/component-catalog-code.spec.ts` 新增 Theme section 浏览器断言；若已有足够覆盖，则计划执行记录需注明“不改 spec”的依据。
  - [ ] 运行 `yarn test:ui` 时，Theme section code region 初始隐藏、展开可见、收起再隐藏的行为通过自动化验证。
  - [ ] 浏览器级断言使用稳定选择器（`getByTestId` 或 `#catalog-section-theme-code-region`），不得依赖像素或截图比较。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme code region toggles in a real browser
    Tool: Bash
    Steps: 1) Run `yarn test:ui`; 2) capture the Playwright output for the catalog code spec.
    Expected: Playwright exits 0 and the Theme code region visibility transitions pass.
    Evidence: .sisyphus/evidence/task-3-theme-playwright.txt

  Scenario: Theme UI coverage remains scoped to code disclosure behavior only
    Tool: Bash
    Steps: 1) Review the touched Playwright spec diff; 2) run `yarn test:ui`.
    Expected: The spec validates only catalog code disclosure behavior and does not add unrelated UI flows.
    Evidence: .sisyphus/evidence/task-3-theme-playwright-scope.txt
  ```

  **Commit**: YES | Message: `test(ui): cover theme code disclosure` | Files: [`tests/ui/component-catalog-code.spec.ts`] 

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle

  **What to do**: 使用 oracle 对照本计划与最终实现，逐项核验 Task 1-3 的交付物、文件边界、默认决策和 acceptance criteria 是否全部达成。审查范围仅限：`src/dev/ComponentCatalog.tsx`、`src/dev/styles/catalog.scss`（如被修改）、`tests/ComponentCatalog.test.tsx`、`tests/ui/component-catalog-code.spec.ts`（如被修改），以及对应测试/构建执行结果。
  **Must NOT do**: 不得在该审计中新增实现需求；不得将“看起来合理”替代为“有证据证明已完成”。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要严格逐项对照计划与结果。
  - Skills: `[]` — 无需额外技能。
  - Omitted: `[]` — 无。

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: [] | Blocked By: [1, 2, 3]

  **Acceptance Criteria** (agent-executable only):
  - [x] 审计输出明确列出 Task 1-3 每项是否满足，并引用对应文件或测试结果。
  - [x] 若发现偏差，输出必须标记为 FAIL 并给出精确缺口，不得含糊表述。
  - [x] 若无偏差，输出必须明确为 PASS。

  **QA Scenarios**:
  ```
  Scenario: Oracle validates implementation against the plan
    Tool: task (oracle)
    Steps: 1) Read this plan and the final touched files; 2) compare every completed task and acceptance criterion to the actual diff and command outputs; 3) return PASS/FAIL with cited evidence.
    Expected: Oracle returns a binary verdict with file-backed evidence for every task.
    Evidence: .sisyphus/evidence/f1-plan-compliance.md
  ```

- [x] F2. Code Quality Review — unspecified-high

  **What to do**: 对最终 diff 做代码质量审查，确认新增 Theme showcase 保持组件库约定、无多余状态、无 API 漂移、无样式污染、无无关重构。重点审查新增文案是否与真实 Theme 行为一致，尤其是 nested provider 与 explicit `theme` prop precedence 的表述。
  **Must NOT do**: 不得将功能建议伪装成缺陷；不得超出本计划范围要求重构。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要综合代码质量与架构边界判断。
  - Skills: `[]` — 无需额外技能。
  - Omitted: `[]` — 无。

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: [] | Blocked By: [1, 2, 3]

  **Acceptance Criteria** (agent-executable only):
  - [x] 审查结果明确说明是否存在无关重构、API 变更或超范围样式改动。
  - [x] 审查结果明确验证文案/示例与 `tests/Theme.test.tsx` 行为一致。
  - [x] 输出必须给出 PASS/FAIL 结论与文件级证据。

  **QA Scenarios**:
  ```
  Scenario: Quality review checks for scope-safe implementation
    Tool: task (unspecified-high)
    Steps: 1) Inspect the final diff and touched files; 2) verify no Theme API/export changes, no playground behavior, no unrelated refactors, and no style leakage outside catalog.scss; 3) return PASS/FAIL with citations.
    Expected: Reviewer returns a binary quality verdict with concrete evidence.
    Evidence: .sisyphus/evidence/f2-code-quality.md
  ```

- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)

  **What to do**: 运行最终自动化验证命令并基于实际执行结果确认功能通过。最少执行：`yarn test -- ComponentCatalog`、`yarn test -- Theme`、`yarn build`；若 Task 3 修改了 Playwright spec，则额外执行 `yarn test:ui`。同时核验 Theme section 的 code disclosure 与示例文本在自动化结果中被覆盖。
  **Must NOT do**: 不得使用人工目测作为唯一结论；不得跳过失败命令。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要整合测试/构建结果做最终 QA 结论。
  - Skills: `[]` — 无需额外技能。
  - Omitted: `[]` — 无。

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: [] | Blocked By: [1, 2, 3]

  **Acceptance Criteria** (agent-executable only):
  - [x] `yarn test -- ComponentCatalog` 成功。
  - [x] `yarn test -- Theme` 成功。
  - [x] `yarn build` 成功。
  - [x] 如有 UI spec 变更，`yarn test:ui` 成功。
  - [x] QA 输出包含每条命令的成功/失败状态与关键证据。

  **QA Scenarios**:
  ```
  Scenario: Final automated QA command sweep passes
    Tool: Bash
    Steps: 1) Run `yarn test -- ComponentCatalog`; 2) run `yarn test -- Theme`; 3) run `yarn build`; 4) if Task 3 changed Playwright coverage, run `yarn test:ui`.
    Expected: All required commands exit 0 and validate the Theme showcase changes without regression.
    Evidence: .sisyphus/evidence/f3-final-qa.txt
  ```

- [x] F4. Scope Fidelity Check — deep

  **What to do**: 从“用户原始目标”回看最终结果，确认交付确实是“独立于 Button、Window 一栏，增加 Theme 的演示和使用方法”，而不是更小（仅示例）或更大（完整 playground）的实现。重点检查：Theme section 是否独立存在、是否解释使用方法、是否未侵入 Button/Window section。
  **Must NOT do**: 不得把新的产品建议当成 scope 缺陷；不得重写用户目标。

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: 需要从需求语义与实现结果之间做范围一致性核验。
  - Skills: `[]` — 无需额外技能。
  - Omitted: `[]` — 无。

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: [] | Blocked By: [1, 2, 3]

  **Acceptance Criteria** (agent-executable only):
  - [x] 审查结果明确判断交付是否满足“独立 Theme 演示 + 使用方法”这一目标。
  - [x] 审查结果明确判断是否超出范围（playground / API 变更 / 侵入 Button/Window）。
  - [x] 输出必须给出 PASS/FAIL 及依据。

  **QA Scenarios**:
  ```
  Scenario: Deep scope-fidelity review validates user intent match
    Tool: task (deep)
    Steps: 1) Compare the original request, this plan, and the final touched files; 2) decide whether the result is an independent Theme guide and not an overbuilt theming tool; 3) return PASS/FAIL with rationale.
    Expected: Reviewer returns a binary fidelity verdict tied directly to the original request.
    Evidence: .sisyphus/evidence/f4-scope-fidelity.md
  ```

## Commit Strategy
- Commit 1: `test(dev-demo): cover theme showcase expectations`
- Commit 2: `feat(dev-demo): add standalone theme showcase`
- Commit 3: `test(ui): cover theme code disclosure`（仅在 Task 3 实际触发时创建）

## Success Criteria
- Dev catalog 中存在单独 Theme 展示区，且不依附 Button / Window section。
- Theme section 同时讲清 Theme wrapper、局部覆盖、组件 `theme` prop。
- 自动化测试能证明该 section 渲染、展示代码、与其他 section 的独立性。
- 所有 CI 关键命令通过：`yarn lint`、`yarn test`、`yarn test:ui`（如适用）、`yarn build`。
