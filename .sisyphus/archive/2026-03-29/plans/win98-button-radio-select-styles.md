# Refine Win98 Button Radio Select Styles

## TL;DR
> **Summary**: 以 `98.css` 为高拟真视觉参考，收敛 `Win98` 主题下 `Button`、`Radio`、`Select` 的颜色、尺寸、bevel 边框和状态表现，只改样式层，不触碰组件行为逻辑。
> **Deliverables**:
> - Win98 主题下 `Button` / `Radio` / `Select` 的高拟真样式修订
> - 可执行的 Playwright Win98 样式校验与证据产物
> - 开发预览与现有冒烟路径保持可用，且不影响 `WinXP` / `default`
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 → 2/3/4 → 5

## Context
### Original Request
- 根据 `https://jdan.github.io/98.css` 这个网站中的颜色值、大小等等，配合项目代码，优化 Win98 主题下 `Button`、`Radio`、`Select` 的样式；这次只管 CSS 样式，不管行为逻辑。

### Interview Summary
- 用户确认采用 **高拟真映射**：尽量贴近 `98.css` 的颜色、边框层次、尺寸与 focus/active 细节。
- 用户确认采用 **全状态覆盖**：默认、hover、active、focus、disabled 都需要纳入 Win98 校准。
- 用户确认 `Button` 的 `default`、`primary`、`ghost` 三个既有 variant 都要统一收敛到 Win98 语言，不只修默认按钮。
- 已探明仓库架构：视觉样式集中在 `src/theme/*/styles/index.scss`，`src/components/*/index.scss` 仅保留结构壳层；Win98 现有实现已存在，但与 `98.css` 在 bevel 层次、focus offset、select 箭头/field 边框等处仍有差距。

### Metis Review (gaps addressed)
- 增加护栏：Win98 控件必须保持 `border-radius: 0` 与明确的 raised/sunken bevel 方向，不允许退化为现代扁平边框。
- 增加护栏：按钮 focus 必须是内收的 dotted outline，而不是任意可见 outline。
- 增加护栏：Select 必须保持 field-style inset 边框与 Win98 风格箭头处理，不能退化为 generic native select。
- 增加护栏：禁止为了复刻 98.css 而顺手改 markup/行为、引入隐藏 input 技巧、全局字体重写、data URI/SVG 机制复制等实现级漂移；只复制视觉原语，不复制库实现机制。
- 增加边界说明：若现有 markup 无法精准复刻某个细节，优先在现有类名和伪元素内求解，明确拒绝通过结构改动“解决”样式问题。

## Work Objectives
### Core Objective
- 在不改动 `CButton`、`CRadio`、`CRadioGroup`、`CSelect` 行为逻辑、类名体系和主题注册关系的前提下，将 `Win98` 主题的三类控件样式拉齐到接近 `98.css` 的视觉基准。

### Deliverables
- `src/theme/win98/styles/index.scss` 中 `Button`、`Radio`、`Select` 的样式更新，覆盖默认、hover、active、focus、disabled 状态。
- Win98 专用的 UI 验证路径（基于现有 Playwright harness/fixture 扩展），可对关键 CSS 表现做 agent-executed 验证。
- 针对 `Button` / `Radio` / `Select` 的 targeted Jest、Win98 UI smoke、lint、build 通过的证据文件。

### Definition of Done (verifiable conditions with commands)
- `yarn test --runInBand tests/Button.test.tsx tests/Radio.test.tsx tests/Select.test.tsx` exits `0`.
- `yarn test:ui --grep "Win98 controls"` exits `0`.
- `yarn lint` exits `0`.
- `yarn build` exits `0`.
- Playwright 证据确认 Win98 `Button` 呈现 raised/sunken bevel、`Radio` 呈现 checked dot、`Select` 呈现 field-style inset border 与 Win98 arrow treatment。

### Must Have
- 仅在 `Win98` 主题实现层调整，不改组件 TSX 行为逻辑。
- 保持 `.cm-system--windows.cm-theme--win98` 作用域，不污染 `WinXP` / `default`。
- 保持现有类名契约：`cm-button`、`cm-button--primary`、`cm-button--ghost`、`cm-radio`、`cm-radio__input`、`cm-radio__label`、`cm-select`。
- `Button` 三个 variant 全部保留，但要统一收敛到 Win98 语言：默认更贴近标准按钮，`primary` 为同语汇的强化态，`ghost` 为同语汇的弱化态，不能跳出现有 API。
- 全状态覆盖：默认、hover、active、focus、disabled。
- Win98 关键视觉值按 `98.css` 映射：面色 `#c0c0c0`、高光 `#ffffff`、阴影 `#808080`、最暗边框 `#0a0a0a`、按钮约 `75x23`、radio 约 `12px`、select field 风格约 `21px`。
- Button 目标值固定为：`min-width: 75px`、`min-height: 23px`、水平 padding `12px`、`border-radius: 0`；默认态 raised bevel，active 态 sunken bevel，hover 态仅允许轻微提亮面色且必须保持 raised bevel 方向。
- Radio 目标值固定为：可视圆点直径 `12px`、label 间距 `6px`、未选中底面为白色、checked dot 为纯黑中心点、disabled 面为 `#c0c0c0`。
- Select 目标值固定为：field 高度 `21px`、内边距遵循左 `4px` / 右侧预留箭头区、`border-radius: 0`、field-style inset border、纯 CSS Win98 箭头、focus 采用 **inner dotted outline**；本次明确 **不实现蓝底白字反转**。

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不修改 `src/components/Button/Button.tsx:17`、`src/components/Radio/Radio.tsx:13`、`src/components/Select/Select.tsx:24` 的行为逻辑、DOM 结构或类名拼接方式。
- 不新增主题、不调整 `src/system/registry.ts:23` 的 `SYSTEM_THEME_MATRIX`、不影响 `src/theme/winxp/styles/index.scss:90` 或 `src/theme/default/styles/index.scss:152` 的视觉表现。
- 不引入新的全局 token 系统、CSS-in-JS、全局字体重写、SVG/data-uri 资产复制、JS 态样式驱动。
- 不把“更像 98.css”扩展为无边界的像素级复刻项目；仅聚焦 Button/Radio/Select 的 Win98 主题样式。
- 不接受依赖人工主观口头判断的验收；必须有可运行命令与证据文件。

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after，复用 Jest + Playwright + 现有 dev/playwright harness。
- QA policy: 每个任务都自带 happy path 与 edge/failure path，必须产出 `.sisyphus/evidence/task-{N}-{slug}.{ext}`。
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`；Playwright 失败截图可辅以 `test-results/` 自动产物，但计划内主证据仍写入 `.sisyphus/evidence/`。

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: 1 个 QA 基础任务 + 3 个控件样式任务并行（Button / Radio / Select）
Wave 2: 1 个回归收口任务（跨主题确认 + 预览/冒烟收尾）

### Dependency Matrix (full, all tasks)
- 1 blocks 2, 3, 4, 5
- 2 blocks 5
- 3 blocks 5
- 4 blocks 5
- 5 blocks Final Verification Wave

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 4 tasks → `visual-engineering`, `visual-engineering`, `visual-engineering`, `visual-engineering`
- Wave 2 → 1 task → `unspecified-high`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Extend Win98 CSS QA harness and assertions

  **What to do**: 基于现有 `src/dev/playwright/commonControlsHarness.tsx:79` 与 `tests/ui/common-controls.smoke.spec.ts:1`，为 Win98 样式校验补一条专用验证路径。优先方案是扩展现有 harness/route 支持明确的 Win98 system/theme 进入方式，并新增或扩展 Playwright spec，使其能对 `Button`、`Radio`、`Select` 的关键 CSS 属性做断言：bevel 方向、背景/边框色、focus dotted outline、disabled 呈现、radio checked dot、select field border 与箭头处理。若现有 smoke spec 已适合承载，则在原 spec 内新增 `describe('Win98 controls')`；若会造成语义混乱，则新增同目录 Win98 样式 spec，但必须复用已有 helper/fixture 思路。
  **Must NOT do**: 不改 Button/Radio/Select 组件逻辑；不新增视觉回归 SaaS；不为了测试方便改生产 DOM 结构；不把 QA 扩成全主题截图体系。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 同时涉及样式验证、harness 路由与 Playwright CSS 断言。
  - Skills: `[]` — 仓库已有 Playwright 基础设施与 common controls harness 模式。
  - Omitted: `playwright` — 计划只指定执行方式，不在规划阶段直接跑浏览器。

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 5 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/playwright/commonControlsHarness.tsx:79` — 现有 default fixture，包含 primary button、radio group、select，可作为 Win98 路由/fixture 扩展起点。
  - Pattern: `src/dev/playwright/commonControlsHarness.tsx:108` — disabled fixture，适合 disabled CSS 校验。
  - Pattern: `tests/ui/common-controls.smoke.spec.ts:1` — 现有 common controls 冒烟结构，说明如何组织控件级 UI 断言。
  - Pattern: `tests/ui/common-controls.helpers.ts:1` — 现有 common controls 跳转/helper 组织方式，应复用而非另起一套无关 harness。
  - Pattern: `src/dev/commonControlsPreview.tsx:10` — 手工预览与 fixture 的文案/控件组合来源，便于统一 selector 和文本。
  - API/Type: `src/system/registry.ts:23` — `SYSTEM_THEME_MATRIX` 约束，仅 `windows` 系统可搭配 `win98`。
  - API/Type: `src/theme/win98/index.tsx:1` — Win98 theme definition 与 className 入口。
  - External: `https://jdan.github.io/98.css/` — Win98 控件视觉基准。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test:ui --grep "Win98 controls"` exits `0`.
  - [ ] Playwright 断言 `button-demo-primary` 在 Win98 路径下具备 raised bevel 的上/左高光与下/右阴影。
  - [ ] Playwright 断言 Win98 focus 为 inner dotted outline，而非仅“存在 outline”。
  - [ ] Playwright 断言 disabled radio/select 呈现 Win98 灰面色与禁用文案色。
  - [ ] 证据文件写入 `.sisyphus/evidence/task-1-win98-qa.txt`，失败时保留 `.sisyphus/evidence/task-1-win98-qa-error.txt`。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Win98 controls happy path
    Tool: Bash
    Steps: Run `yarn test:ui --grep "Win98 controls"` after adding the Win98 route/helper and assertions for `[data-testid="button-demo-primary"]`, `[data-testid="radio-demo-fruit"] input[type="radio"]`, and `[data-testid="select-demo-size"]`.
    Expected: Playwright exits 0 and verifies Win98 button bevel, radio checked dot, and select field/arrow treatment on the Win98 fixture.
    Evidence: .sisyphus/evidence/task-1-win98-qa.txt

  Scenario: Win98 route or selector edge case
    Tool: Bash
    Steps: Run the same command with the Win98 fixture forced to `disabled` coverage and inspect failure output if the route/theme class is not applied to `[data-testid="button-demo-disabled"]`, the disabled radio fixture, and the disabled select fixture.
    Expected: If routing/theme application is wrong, the test fails on explicit CSS assertions instead of silently passing against default theme styles.
    Evidence: .sisyphus/evidence/task-1-win98-qa-error.txt
  ```

  **Commit**: YES | Message: `test(win98): add css verification for common controls` | Files: `tests/ui/*`, `src/dev/playwright/*`

- [x] 2. Refine Win98 Button variants to authentic bevel language

  **What to do**: 只在 `src/theme/win98/styles/index.scss:65` 起的 `.cm-button` 区块内修正 `default`、`primary`、`ghost` 三个 variant 的 Win98 样式。将默认按钮对齐到 `98.css` 的 raised bevel：`#c0c0c0` 面色、`#ffffff` 高光、`#808080` 阴影、`#0a0a0a` 最暗线；active 态切为 sunken bevel；focus 改为内收 dotted outline；disabled 体现灰字 + 白色文字阴影。`primary` 与 `ghost` 不得沿用现代扁平思路，必须在同一 Win98 bevel 语言内做“强调 / 弱化”差异：允许通过边框层次、字重/文本色、背景明度做区分，但禁止引入现代渐变、圆角、发光 ring 或 XP 风格。
  **Must NOT do**: 不改 `src/components/Button/Button.tsx:26` 的类名逻辑；不新增 variant；不把 hover 做成现代高亮卡片效果；不把 `primary` 做成 WinXP 蓝色胶囊按钮。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 需要对 98.css bevel 语言做精确 CSS 映射。
  - Skills: `[]` — 现有 Win98/WinXP/default 主题已提供风格对照。
  - Omitted: `frontend-ui-ux` — 仓库已有明确参考源，重点是精确映射而非开放式设计探索。

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/theme/win98/styles/index.scss:65` — 当前 Win98 button 区块，需在原作用域内收敛而非搬到组件 SCSS。
  - Pattern: `src/theme/winxp/styles/index.scss:90` — WinXP button 对照，帮助避免误把 XP 圆角/渐变带进 Win98。
  - Pattern: `src/theme/default/styles/index.scss:152` — default button 对照，帮助识别并隔离现代风格属性。
  - Pattern: `src/components/Button/index.scss:1` — 组件 SCSS 只有壳类名，说明视觉应继续留在 theme 文件。
  - API/Type: `src/components/Button/Button.tsx:26` — Button variant 类名拼接契约。
  - Test: `tests/Button.test.tsx:1` — 行为测试已存在，样式修改不能破坏 disabled/variant 基本逻辑。
  - External: `https://jdan.github.io/98.css/` — raised/sunken bevel、focus inner dotted outline、disabled text treatment 参考。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/Button.test.tsx` exits `0`.
  - [ ] `yarn test:ui --grep "Win98 controls"` exits `0` and asserts default button shows raised bevel in normal state.
  - [ ] Playwright 断言默认按钮满足 `min-width: 75px`、`min-height: 23px`、`border-radius: 0`、默认面色 `rgb(192, 192, 192)`。
  - [ ] Active/pressed button CSS 断言表现为 sunken bevel，且 box-shadow/边框方向发生完整反转，而不是仅交换单侧 border color 的简化效果。
  - [ ] Focus button CSS 断言表现为 inner dotted outline，并带 inner/negative offset behavior。
  - [ ] `primary` / `ghost` 仍然保留各自 variant class，且 Playwright 断言二者都保持 `border-radius: 0`、无 XP 渐变、无 default-theme shadow 泄漏。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Button bevel happy path
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Button.test.tsx && yarn test:ui --grep "Win98 controls"` after updating the Win98 button block; assert against `[data-testid="button-demo-primary"]` and the default button fixture node.
    Expected: Jest preserves variant/disabled behavior; Playwright confirms raised bevel at rest and sunken bevel on active button under Win98.
    Evidence: .sisyphus/evidence/task-2-win98-button.txt

  Scenario: Ghost/primary drift edge case
    Tool: Bash
    Steps: Re-run `yarn test:ui --grep "Win98 controls"` and inspect the Win98 button selectors for `.cm-button--primary` and `.cm-button--ghost` under the Win98 fixture.
    Expected: Both variants remain visually in Win98 language; no rounded corners, XP gradients, or default-theme shadows leak in.
    Evidence: .sisyphus/evidence/task-2-win98-button-error.txt
  ```

  **Commit**: YES | Message: `style(win98): refine button bevel states` | Files: `src/theme/win98/styles/index.scss`

- [x] 3. Refine Win98 Radio presentation without markup changes

  **What to do**: 只在 `src/theme/win98/styles/index.scss:111` 起的 `.cm-radio` 区块内收敛 radio 样式，使其更贴近 `98.css`：radio 视觉尺寸约 `12px`，保留圆形外观、`#ffffff` 面与暗边/内阴影，checked dot 使用当前 markup 可实现的纯 CSS 方案（伪元素或 radial-gradient 均可），focus 改为 label/input 对应的 dotted outline，disabled 维持 Win98 灰面色与文案降级。若需微调 `.cm-radio__label` 间距，必须只在当前类名体系内进行。
  **Must NOT do**: 不改 `Radio.tsx` 结构、不引入自定义 SVG 资产或额外 wrapper、不实现新的 checked indicator DOM。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 需要在现有 markup 约束下复刻 Win98 radio 细节。
  - Skills: `[]` — 现有 `.cm-radio__input` / `.cm-radio__label` 已足够承载样式。
  - Omitted: `frontend-ui-ux` — 视觉参考足够明确，无需额外设计自由度。

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/theme/win98/styles/index.scss:111` — 当前 Win98 radio 区块。
  - Pattern: `src/theme/winxp/styles/index.scss:143` — WinXP radio 对照，避免引入 XP 蓝色 dot。
  - Pattern: `src/theme/default/styles/index.scss:219` — default radio 对照，避免引入现代边框/过渡。
  - Pattern: `src/components/Radio/index.scss:1` — radio 相关空壳类名清单。
  - API/Type: `src/components/Radio/Radio.tsx:29` — disabled class 名拼接；`src/components/Radio/Radio.tsx:45` — `.cm-radio__input` 实际挂载位置。
  - Test: `tests/Radio.test.tsx:1` — name/controlled/disabled 逻辑不得受样式改动影响。
  - External: `https://jdan.github.io/98.css/` — 12px radio、checked dot、disabled field 参考。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/Radio.test.tsx` exits `0`.
  - [ ] `yarn test:ui --grep "Win98 controls"` exits `0` and asserts checked radio shows visible dot under Win98 styling.
  - [ ] Playwright 断言 radio 可视尺寸为 `12px`、label gap 为 `6px`、unchecked face 为白色。
  - [ ] Playwright 断言 radio focus 为 dotted outline，disabled radio 使用 Win98 灰面色而非白底。
  - [ ] Radio 视觉改动不要求新增 DOM 或类名。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Radio checked-dot happy path
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Radio.test.tsx && yarn test:ui --grep "Win98 controls"` after updating the Win98 radio block; assert against `[data-testid="radio-demo-fruit"] input[type="radio"]` and its checked state.
    Expected: Jest preserves radio-group logic; Playwright confirms Win98-sized radio, checked dot visibility, and dotted focus treatment.
    Evidence: .sisyphus/evidence/task-3-win98-radio.txt

  Scenario: Disabled radio edge case
    Tool: Bash
    Steps: Re-run `yarn test:ui --grep "Win98 controls"` against the disabled fixture and inspect CSS assertions for the disabled radio node inside `[data-testid="radio-demo-fruit-disabled"]` or equivalent disabled radio fixture container.
    Expected: Disabled radio keeps Win98 grey surface/text treatment and does not fall back to default theme radio styling.
    Evidence: .sisyphus/evidence/task-3-win98-radio-error.txt
  ```

  **Commit**: YES | Message: `style(win98): refine radio control styling` | Files: `src/theme/win98/styles/index.scss`

- [x] 4. Refine Win98 Select field styling and arrow treatment

  **What to do**: 只在 `src/theme/win98/styles/index.scss:148` 起的 `.cm-select` 区块内收敛 select 样式，对齐 `98.css` 的 field-style inset border、白色字段面、Win98 箭头区域与 focus/disabled 呈现。优先保留纯 CSS 箭头方案，但其视觉必须明显接近 Win98 button-down treatment；必要时可在现有背景层写法上重构 gradient/伪元素组合。本次 focus 方案固定为 **field-style inset border + inner dotted outline**，明确 **不实现蓝底白字反转**，以避免跨浏览器原生 select 差异扩大。
  **Must NOT do**: 不改 `Select.tsx`、不新增自定义下拉列表、不用 JS 驱动 arrow 状态、不把高度做成 WinXP/default 的圆角 modern input。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: select 是本次最容易因浏览器差异而漂移的控件。
  - Skills: `[]` — 仓库已有 select harness 和类名契约。
  - Omitted: `frontend-ui-ux` — 重点是既有 markup 上的 Win98 对齐，不是发散式 UI 设计。

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/theme/win98/styles/index.scss:148` — 当前 Win98 select 区块。
  - Pattern: `src/theme/winxp/styles/index.scss:188` — WinXP select 对照，避免引入圆角蓝色箭头舱。
  - Pattern: `src/theme/default/styles/index.scss:264` — default select 对照，避免保留 modern input 风格。
  - Pattern: `src/components/Select/index.scss:1` — select 组件样式壳层为空，确认改动应留在 theme 文件。
  - API/Type: `src/components/Select/Select.tsx:37` — select 类名拼接契约；`src/components/Select/Select.tsx:61` — `.cm-select` 实际挂载位置。
  - Test: `tests/Select.test.tsx:1` — value/defaultValue/disabled/placeholder 行为不得受影响。
  - External: `https://jdan.github.io/98.css/` — field border、arrow treatment、focus/disabled 基准。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/Select.test.tsx` exits `0`.
  - [ ] `yarn test:ui --grep "Win98 controls"` exits `0` and asserts Win98 select shows field-style inset border and dedicated arrow treatment.
  - [ ] Playwright 断言 select 高度为 `21px`、`border-radius: 0`、field 面为白色且右侧保留 Win98 箭头区。
  - [ ] Disabled select 在 Win98 路径下呈现灰面色与禁用文本色，不退化为浏览器默认样式。
  - [ ] Select focus 样式固定为 inner dotted outline，且无蓝底白字反转实现。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Select field happy path
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Select.test.tsx && yarn test:ui --grep "Win98 controls"` after updating the Win98 select block; assert against `[data-testid="select-demo-size"]`.
    Expected: Jest preserves native select behavior; Playwright confirms field-style inset border, Win98 arrow treatment, and focus behavior on the Win98 fixture.
    Evidence: .sisyphus/evidence/task-4-win98-select.txt

  Scenario: Disabled/select-focus edge case
    Tool: Bash
    Steps: Re-run `yarn test:ui --grep "Win98 controls"` against the disabled select fixture and the focused `[data-testid="select-demo-size"]` node.
    Expected: Disabled select remains visibly Win98 and focus treatment matches the chosen plan path instead of silently using browser defaults.
    Evidence: .sisyphus/evidence/task-4-win98-select-error.txt
  ```

  **Commit**: YES | Message: `style(win98): refine select field styling` | Files: `src/theme/win98/styles/index.scss`

- [x] 5. Close regression gaps across preview, themes, and release gates

  **What to do**: 在前四项完成后，统一回归现有预览与多主题边界。确认 `src/dev/commonControlsPreview.tsx:30`、`src/dev/commonControlsPreview.tsx:57`、`src/dev/commonControlsPreview.tsx:82` 的按钮/单选/下拉预览仍可正常展示；确认 Win98 新样式没有污染 `winxp` 与 `default`；补齐或更新现有 UI smoke 断言以覆盖默认与 disabled fixture 的 Win98 路径；收口 lint/build/targeted test 证据。若 Task 1 选择了新 spec 文件而非扩展旧 smoke spec，这里要确保命令入口仍清晰且不会让 CI 漏跑 Win98 样式校验。
  **Must NOT do**: 不顺手调整预览文案或新增无关组件示例；不修改 `SYSTEM_THEME_MATRIX`；不把本任务扩展成跨主题设计统一重构。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要整体验证、边界复查与命令入口收口。
  - Skills: `[]` — 已有基础设施足够。
  - Omitted: `git-master` — 当前输出是执行计划，不包含提交动作。

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Final Verification Wave | Blocked By: 1, 2, 3, 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/commonControlsPreview.tsx:30` — button preview 区块。
  - Pattern: `src/dev/commonControlsPreview.tsx:57` — radio preview 区块。
  - Pattern: `src/dev/commonControlsPreview.tsx:82` — select preview 区块。
  - Pattern: `src/theme/winxp/styles/index.scss:90` — WinXP 对照，回归时确认未受 Win98 改动污染。
  - Pattern: `src/theme/default/styles/index.scss:152` — default 对照，回归时确认未受 Win98 改动污染。
  - Test: `tests/Button.test.tsx:1` — Button 逻辑回归入口。
  - Test: `tests/Radio.test.tsx:1` — Radio 逻辑回归入口。
  - Test: `tests/Select.test.tsx:1` — Select 逻辑回归入口。
  - Test: `tests/SystemTypeThemeRegistry.test.tsx:1` — 主题映射不应被误改。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/Button.test.tsx tests/Radio.test.tsx tests/Select.test.tsx` exits `0`.
  - [ ] `yarn test:ui --grep "Win98 controls"` exits `0` and still exercises both default and disabled Win98 fixtures.
  - [ ] `yarn lint` exits `0`.
  - [ ] `yarn build` exits `0`.
  - [ ] 证据文件写入 `.sisyphus/evidence/task-5-win98-regression.txt`，记录命令与通过结果。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Full regression happy path
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Button.test.tsx tests/Radio.test.tsx tests/Select.test.tsx && yarn test:ui --grep "Win98 controls" && yarn lint && yarn build`.
    Expected: All targeted logic tests, Win98 UI checks, lint, and build pass without cross-theme regressions.
    Evidence: .sisyphus/evidence/task-5-win98-regression.txt

  Scenario: Theme bleed edge case
    Tool: Bash
    Steps: Re-run the same command set after explicitly checking that only `src/theme/win98/styles/index.scss` and QA-supporting files changed.
    Expected: No failures indicate style leakage into WinXP/default or accidental behavior changes in components.
    Evidence: .sisyphus/evidence/task-5-win98-regression-error.txt
  ```

  **Commit**: YES | Message: `chore(win98): close common controls style regression gates` | Files: `src/theme/win98/styles/index.scss`, `tests/ui/*`, `src/dev/playwright/*`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle

  **Execution**:
  - Tool: `task(subagent_type="oracle")`
  - Prompt: review the completed diff against `.sisyphus/plans/win98-button-radio-select-styles.md` and verify Tasks 1-5 acceptance criteria were actually met, with emphasis on Win98-only scope, no behavior logic edits, and evidence completeness.
  - Expected: Oracle response contains an explicit approval verdict and cites any plan/task mismatches.
  - Evidence: `.sisyphus/evidence/f1-plan-compliance.md`

- [ ] F2. Code Quality Review — unspecified-high

  **Execution**:
  - Tool: `task(category="unspecified-high")`
  - Prompt: review the implementation for CSS maintainability, selector safety, cross-theme bleed, unnecessary specificity, and brittle browser-dependent hacks in the Win98 control styling work.
  - Expected: Review explicitly says APPROVE or REJECT and lists any required fixes.
  - Evidence: `.sisyphus/evidence/f2-code-quality.md`

- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)

  **Execution**:
  - Tool: `task(category="unspecified-high")` plus Playwright-backed verification if the reviewer needs browser confirmation.
  - Prompt: run through the implemented Win98 controls using the plan’s QA commands, confirm button bevel states, radio checked dot/focus, select field/arrow/focus, and validate default + disabled fixtures in the Win98 route.
  - Expected: Reviewer confirms all interactive visual checks pass, or returns a concrete failure with selector/state details.
  - Evidence: `.sisyphus/evidence/f3-manual-qa.md`

- [ ] F4. Scope Fidelity Check — deep

  **Execution**:
  - Tool: `task(category="deep")`
  - Prompt: audit the final diff for scope fidelity: ensure changes are limited to Win98 control styling and QA-supporting files, with no behavior-logic drift, no new theme system, no unrelated component refactors, and no WinXP/default regressions.
  - Expected: Deep reviewer explicitly approves scope fidelity or enumerates exact scope violations.
  - Evidence: `.sisyphus/evidence/f4-scope-fidelity.md`

**Final Verification Acceptance Criteria**:
- [ ] All four review artifacts exist at the evidence paths above.
- [ ] All four reviewers return explicit APPROVE-equivalent verdicts.
- [ ] Consolidated verification summary is presented to the user before completion.
- [ ] User gives explicit "okay" before any work is marked fully complete.

## Commit Strategy
- 建议按任务粒度提交 3 个原子提交：
- `test(win98): add css verification for common controls`
- `style(win98): refine button radio select controls`
- `chore(win98): close common controls style regression gates`
- 若执行代理偏好更细粒度，也可保持任务 2/3/4 各自独立提交，但必须在最终回归前完成 rebase/整理，避免 QA harness 与主题 SCSS 交叉冲突。

## Success Criteria
- Win98 Button/Radio/Select 在视觉上明显更接近 `98.css`，核心 fidelity 标记（bevel、field border、checked dot、inner focus）可被 Playwright 直接断言。
- 改动限定在 Win98 样式实现与必要 QA 支撑，不包含行为逻辑重构。
- `WinXP` / `default` 主题、主题注册矩阵、组件 API 与行为测试保持稳定。
- 所有执行证据落盘到 `.sisyphus/evidence/`，无需人工口头确认即可判定完成。
