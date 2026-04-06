# Add Common Components: Button, Radio, Select

## TL;DR

> **Summary**: 为现有 React 组件库新增基础版 `CButton`、`CRadio`、`CRadioGroup`、`CSelect`，并同步补齐统一导出、样式、单测、Playwright 烟测、开发预览和 README 用法。
> **Deliverables**:
>
> - 原生语义包装的基础表单控件
> - 统一导出与样式目录接入
> - Jest + Playwright 验证覆盖
> - `src/dev` 预览示例与 `README.md` 最小文档补充
>   **Effort**: Medium
>   **Parallel**: YES - 3 waves
>   **Critical Path**: 1/2/3 → 4/5 → 6

## Context

### Original Request

- 增加一些常用组件：`Button`、`Radio`、`Select`。

### Interview Summary

- 交付档位：基础版。
- 范围包含：组件、测试、开发预览、必要文档。
- 测试策略：测试后补，但每个实现任务内必须同步补齐验证。

### Metis Review (gaps addressed)

- 明确不强制继承 `CWidget`：`CWidget` 的 `renderFrame()` 带绝对定位，适合窗口/布局组件，不适合表单控件。
- 锁定 `CSelect` 为原生单选封装，排除 searchable / clearable / 多选 / 自定义弹层。
- 锁定 `CRadioGroup` 为受控/非受控兼容的原生 radio 语义编排，不引入自定义 ARIA radiogroup 行为。
- 锁定 `CButton` 默认 `type="button"`，避免表单内误提交。

## Work Objectives

### Core Objective

- 在不扰动现有窗口/屏幕组件体系的前提下，为库补齐最常用的基础表单控件，并让它们符合现有命名、导出、样式和验证约定。

### Deliverables

- `CButton`：基础按钮，支持文本内容、禁用、variant、`type`、`onClick`、`className`、`data-testid`。
- `CRadio`：单个原生 radio 项。
- `CRadioGroup`：协调同名 radio 的受控/非受控选择行为。
- `CSelect`：基于原生 `<select>` 的单选封装，支持 `options` 与可选 placeholder。
- 对应导出、SCSS 样式、单元测试、开发预览、README 使用说明、Playwright 烟测。

### Definition of Done (verifiable conditions with commands)

- `yarn test --runInBand tests/Button.test.tsx` 通过。
- `yarn test --runInBand tests/Radio.test.tsx` 通过。
- `yarn test --runInBand tests/Select.test.tsx` 通过。
- `npx playwright test --config=playwright.config.ts tests/ui/common-controls.smoke.spec.ts` 通过。
- `yarn lint` 通过。
- `yarn build` 通过。
- `npm pack --dry-run` 通过。

### Must Have

- 保持 `C*` 命名、按组件建目录、`cm-*` 类名前缀、统一导出入口。
- 控件底层使用原生 HTML 元素，不实现自定义 listbox/radiogroup/button 语义。
- `CRadioGroup` 与 `CSelect` 同时支持受控与非受控模式，但实现时必须明确优先级与同步规则。
- 每个组件都提供稳定的 `data-testid` 接口，支持 RTL 与 Playwright 验证。
- 预览入口展示 3 类组件的默认态、禁用态、交互态。

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)

- 不引入 `any`、Storybook、表单抽象层、搜索/清除/多选 Select、自定义弹层、加载态按钮、验证提示系统。
- 不重构现有 `Window` / `Dock` / `Screen` 体系。
- 不为表单控件继承 `CWidget` 仅为了表面一致性。
- 不新增需要人工主观判断的验收标准。

## Verification Strategy

> ZERO HUMAN INTERVENTION — all verification is agent-executed.

- Test decision: tests-after + Jest + React Testing Library + Playwright smoke。
- QA policy: 每个任务都包含 happy path 与 failure/edge case，两者都要产出可落地证据。
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`。

## Execution Strategy

### Parallel Execution Waves

> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: 3 个组件任务并行（Button / Radio / Select）
Wave 2: 2 个集成任务（主题/导出收口 + 预览/Playwright）
Wave 3: 1 个最终文档与 CI 对齐任务

### Dependency Matrix (full, all tasks)

- 1 blocks 4, 5, 6
- 2 blocks 4, 5, 6
- 3 blocks 4, 5, 6
- 4 blocks 6
- 5 blocks 6
- 6 blocks Final Verification Wave

### Agent Dispatch Summary (wave → task count → categories)

- Wave 1 → 3 tasks → `visual-engineering`, `unspecified-high`, `unspecified-high`
- Wave 2 → 2 tasks → `visual-engineering`, `unspecified-high`
- Wave 3 → 1 task → `writing`

## TODOs

> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Add `CButton` native wrapper

  **What to do**: 在 `src/components/Button/` 新建 `Button.tsx` 与 `index.scss`，实现轻量函数组件 `CButton`，底层使用原生 `<button>`；支持 `children`、`variant`（仅 `default | primary | ghost` 三档）、`type`（默认 `'button'`）、`disabled`、`onClick`、`className`、`data-testid`。本任务同时创建 `tests/Button.test.tsx`，仅覆盖组件直接入口的渲染、默认 `type="button"`、variant class、禁用态点击拦截。统一导出与包入口断言留给任务 4 集中处理，避免并行冲突。
  **Must NOT do**: 不继承 `CWidget`；不支持 loading、icon-only、button group、链接按钮、多尺寸矩阵；不引入非原生按钮语义。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 组件结构、样式类名与基础交互并重。
  - Skills: `[]` — 当前仓库已有明确模式，无需额外 skill。
  - Omitted: `openspec-apply-change` — 本任务不是 OpenSpec 执行流。

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 5, 6 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Dock/Dock.tsx:1` — 组件文件组织、SCSS 引入、`data-testid` 透传模式参考。
  - Pattern: `src/components/Dock/index.scss:1` — 组件局部 SCSS 命名约定。
  - API/Type: `tests/Dock.test.tsx:28` — className、style、children 验证组织方式。
  - API/Type: `tests/Dock.test.tsx:64` — children 渲染断言组织方式。
  - External: `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button` — 原生 button 语义与默认行为参考。

  **Acceptance Criteria** (agent-executable only):
  - [x] `yarn test --runInBand tests/Button.test.tsx` exits `0`.
  - [x] `tests/Button.test.tsx` 断言未传 `type` 时 DOM `button.type === 'button'`。
  - [x] `tests/Button.test.tsx` 断言 `disabled` 时点击不触发 `jest.fn()`。
  - [x] `tests/Button.test.tsx` 断言 `variant="primary"` 时具备 `cm-button--primary`。

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```
  Scenario: Button happy path
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Button.test.tsx`.
    Expected: Jest passes; assertions confirm native button render, default type=button, and primary variant class.
    Evidence: .sisyphus/evidence/task-1-button.txt

  Scenario: Disabled button edge case
    Tool: Bash
    Steps: Run the same targeted Jest spec and inspect the disabled-click assertion in the test output if failing.
    Expected: Disabled button stays disabled and mocked click handler call count remains 0.
    Evidence: .sisyphus/evidence/task-1-button-disabled.txt
  ```

  **Commit**: YES | Message: `feat(button): add native CButton component` | Files: `src/components/Button/*`, `tests/Button.test.tsx`

- [x] 2. Add `CRadio` and `CRadioGroup`

  **What to do**: 在 `src/components/Radio/` 新建 `Radio.tsx`、`RadioGroup.tsx`、`index.scss`。`CRadio` 底层必须使用原生 `<input type="radio">` + 可点击 label；`CRadioGroup` 负责向子 radio 提供共享 `name`、当前值、变更回调和禁用态。API 固定为：`CRadioGroup` 支持 `name`、`value`、`defaultValue`、`onChange(nextValue: string)`、`disabled`、`required`、`children`、`className`、`data-testid`；`CRadio` 支持 `value`、`disabled`、`children` 或 `label`、`data-testid`。同步新增 `tests/Radio.test.tsx`，覆盖直接入口下的 name 共享、受控/非受控切换、禁用态不能选中、默认值初始化。统一导出与包入口断言留给任务 4 集中处理，避免并行冲突。
  **Must NOT do**: 不实现自定义 roving tabindex、ARIA radiogroup、options 数组渲染器、校验消息、说明文字系统；不允许 group 脱离 `name` 工作。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 状态同步与受控/非受控边界比视觉更关键。
  - Skills: `[]` — 仓库已有 RTL 与受控 props 参考。
  - Omitted: `openspec-apply-change` — 不适用当前工作流。

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 5, 6 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Dock/Dock.tsx:37` — 受控与默认值并存时的 state 初始化与同步模式参考（思路参考，非继承方式）。
  - Pattern: `tests/Dock.test.tsx:188` — 受控 props 更新后通过 rerender 验证同步模式。
  - Pattern: `tests/Dock.test.tsx:223` — 默认值仅首次生效的验证模式。
  - External: `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio` — 原生 radio 语义与 name 互斥行为参考。

  **Acceptance Criteria** (agent-executable only):
  - [x] `yarn test --runInBand tests/Radio.test.tsx` exits `0`.
  - [x] `tests/Radio.test.tsx` 断言 group 下所有 radio 共享相同 `name`。
  - [x] `tests/Radio.test.tsx` 断言非受控模式点击后选中值更新，受控模式点击后若不 rerender 则界面不改变。
  - [x] `tests/Radio.test.tsx` 断言禁用 radio 点击后仍保持未选中。

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```
  Scenario: RadioGroup happy path
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Radio.test.tsx`.
    Expected: Jest passes; uncontrolled defaultValue selects expected radio and controlled rerender updates checked state.
    Evidence: .sisyphus/evidence/task-2-radio.txt

  Scenario: Disabled and controlled edge cases
    Tool: Bash
    Steps: Re-run the same targeted Jest suite after implementation.
    Expected: Disabled radio remains unchecked after click; controlled group does not visually switch selection until parent rerender changes `value`.
    Evidence: .sisyphus/evidence/task-2-radio-disabled.txt
  ```

  **Commit**: YES | Message: `feat(radio): add CRadio and CRadioGroup` | Files: `src/components/Radio/*`, `tests/Radio.test.tsx`

- [x] 3. Add `CSelect` native single-select wrapper

  **What to do**: 在 `src/components/Select/` 新建 `Select.tsx` 与 `index.scss`。`CSelect` 必须底层使用原生 `<select>`；固定支持 `options`（数组项至少含 `label`、`value`、可选 `disabled`）、`value`、`defaultValue`、`onChange(nextValue: string)`、`name`、`disabled`、`required`、`placeholder`、`className`、`data-testid`。若提供 `placeholder`，首项渲染为空值且不可作为真实业务值；非受控模式初始值为空时展示 placeholder。同步新增 `tests/Select.test.tsx`，覆盖直接入口下的 options 渲染、受控/非受控、禁用态、placeholder 与 required 组合行为。统一导出与包入口断言留给任务 4 集中处理，避免并行冲突。
  **Must NOT do**: 不实现 searchable、clearable、多选、异步加载、分组选项、自定义 dropdown/listbox、portal 弹层、option 自定义模板。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 受控/非受控与 placeholder/required 边界需要严密测试。
  - Skills: `[]` — 原生 select 封装足够明确。
  - Omitted: `openspec-apply-change` — 不适用当前工作流。

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 5, 6 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/Dock.test.tsx:17` — 类型与导出断言组织方式。
  - Pattern: `tests/Dock.test.tsx:188` — 受控 rerender 验证模式。
  - Pattern: `tests/Dock.test.tsx:223` — defaultValue 仅初始化生效的验证模式。
  - External: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select` — 原生 select 与 option 语义参考。

  **Acceptance Criteria** (agent-executable only):
  - [x] `yarn test --runInBand tests/Select.test.tsx` exits `0`.
  - [x] `tests/Select.test.tsx` 断言 `options` 正确渲染为原生 `<option>` 列表。
  - [x] `tests/Select.test.tsx` 断言非受控模式用户选择后值更新，受控模式若不 rerender 则值不变。
  - [x] `tests/Select.test.tsx` 断言 `placeholder + required` 时初始值为空且需显式选择真实 option。

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```
  Scenario: Select happy path
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Select.test.tsx`.
    Expected: Jest passes; native select renders 3 options and changing selection updates value in uncontrolled mode.
    Evidence: .sisyphus/evidence/task-3-select.txt

  Scenario: Controlled and placeholder edge cases
    Tool: Bash
    Steps: Re-run the same targeted Jest suite after implementation.
    Expected: Controlled select does not visually change until rerendered with a new `value`; placeholder option starts as empty value when configured.
    Evidence: .sisyphus/evidence/task-3-select-placeholder.txt
  ```

  **Commit**: YES | Message: `feat(select): add native CSelect component` | Files: `src/components/Select/*`, `tests/Select.test.tsx`

- [x] 4. Integrate centralized exports, theme-layer visuals, and dev preview examples

  **What to do**: 集中修改 `src/components/index.ts` 与 `src/index.ts`，挂出 `CButton`、`CRadio`、`CRadioGroup`、`CSelect`，并把 `tests/Button.test.tsx`、`tests/Radio.test.tsx`、`tests/Select.test.tsx` 补到“包入口导出与直接入口一致”的断言。随后将新控件的视觉样式接入 `src/theme/default/styles/index.scss`、`src/theme/win98/styles/index.scss`、`src/theme/winxp/styles/index.scss`，确保最少覆盖按钮主次态、radio 选中/禁用态、select 默认/禁用态。组件目录内 `index.scss` 仅保留结构类与 modifier。最后在 `src/dev/main.tsx` 引入一个新的开发预览内容组件（可新建 `src/dev/commonControlsPreview.tsx`），直接在 `DevSystemRoot` 下展示三类控件：`data-testid="button-demo-primary"`、`data-testid="radio-demo-fruit"`、`data-testid="select-demo-size"`。Radio demo 固定值为 `apple` / `orange`，Select demo 固定值为 `small` / `medium` / `large`。
  **Must NOT do**: 不修改 `themeSwitcher` 的选择逻辑；不把视觉样式全塞进组件局部 SCSS；不引入第四套主题或 token 系统重构。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 主题视觉与 demo 布局主要是样式/展示集成问题。
  - Skills: `[]` — 现有 dev/theme 模式足够清晰。
  - Omitted: `openspec-apply-change` — 不适用当前工作流。

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 6 | Blocked By: 1, 2, 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/index.ts:1` — 集中导出新增组件的唯一入口。
  - Pattern: `src/index.ts:3` — 包入口二次导出链路。
  - Pattern: `src/theme/default/styles/index.scss:1` — 默认主题视觉样式放置位置。
  - Pattern: `src/theme/win98/styles/index.scss:1` — Win98 主题覆写位置。
  - Pattern: `src/theme/winxp/styles/index.scss:1` — WinXP 主题覆写位置。
  - Pattern: `src/dev/main.tsx:1` — 当前 dev 入口挂载点。
  - Pattern: `src/dev/themeSwitcher.tsx:58` — `DevSystemRoot` 提供主题上下文方式。
  - Pattern: `src/components/Dock/index.scss:1` — 组件局部 SCSS 应保持轻量、命名一致。

  **Acceptance Criteria** (agent-executable only):
  - [x] `yarn build` exits `0` after adding exports, theme styles, and dev preview integration.
  - [x] `tests/Button.test.tsx`、`tests/Radio.test.tsx`、`tests/Select.test.tsx` 均新增“包入口导出等于直接导出”的断言并通过。
  - [x] Dev preview root renders `button-demo-primary`、`radio-demo-fruit`、`select-demo-size` 三个稳定节点。
  - [x] 组件局部 SCSS 与主题层 SCSS 同时存在，视觉样式主要位于 `src/theme/*/styles/index.scss`。

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```
  Scenario: Dev preview happy path
    Tool: Playwright
    Steps: Start `yarn dev`; open `/`; assert `getByTestId('button-demo-primary')`, `getByTestId('radio-demo-fruit')`, and `getByTestId('select-demo-size')` are visible.
    Expected: All three demos render in the default dev page without console-blocking errors.
    Evidence: .sisyphus/evidence/task-4-preview.png

  Scenario: Theme switch edge case
    Tool: Playwright
    Steps: Start `yarn dev`; open `/`; verify a disabled-state demo for the same three controls is rendered alongside the default demo and still exposes the same stable test ids for the active examples.
    Expected: Demo integration includes both default and disabled states without removing or renaming the required primary test ids.
    Evidence: .sisyphus/evidence/task-4-preview-theme.png
  ```

  **Commit**: YES | Message: `feat(common-controls): export components and wire themed preview` | Files: `src/components/index.ts`, `src/index.ts`, `src/theme/default/styles/index.scss`, `src/theme/win98/styles/index.scss`, `src/theme/winxp/styles/index.scss`, `src/dev/main.tsx`, `src/dev/commonControlsPreview.tsx`, `tests/Button.test.tsx`, `tests/Radio.test.tsx`, `tests/Select.test.tsx`

- [x] 5. Add Playwright common-controls harness and smoke spec

  **What to do**: 参照现有 `windowHarness` 结构，在 `src/dev/playwright/` 下新增 common-controls harness（建议 `commonControlsHarness.tsx`），并在仓库根目录新增 `playwright-common-controls.html`，其唯一职责是通过 `<script type="module" src="/src/dev/playwright/commonControlsHarness.tsx"></script>` 挂载该 harness。Playwright 统一访问 `/playwright-common-controls.html?fixture=...`，fixture 至少支持 `default` 与 `disabled` 两个场景，并为未知 fixture 输出 `data-testid="fixture-error"`。在 `tests/ui/` 新增 `common-controls.smoke.spec.ts` 与必要 helper，复用 `window.helpers.ts` 的 URL/fixture 组织思路，精确验证：默认 fixture 中主按钮可见、RadioGroup 默认值为 `apple`、Select 默认值为 `medium`；disabled fixture 中按钮禁用、`orange` radio 禁用、select 禁用；unknown fixture 显示明确错误。
  **Must NOT do**: 不复用窗口专用 selector 常量去强绑控件测试；不把 smoke spec 写成视觉快照回归；不依赖人工点击说明。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要把 dev harness、fixture 路由与 E2E 断言对齐。
  - Skills: `[]` — Playwright 与现有 harness 模式已存在。
  - Omitted: `openspec-apply-change` — 不适用当前工作流。

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 6 | Blocked By: 1, 2, 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `playwright-window.html:1` — 根目录 HTML harness 入口文件模式。
  - Pattern: `src/dev/playwright/windowHarness.tsx:13` — harness route 与 `?fixture=` 解析模式。
  - Pattern: `src/dev/playwright/windowHarness.tsx:89` — fixture switch 与未知 fixture 错误输出模式。
  - Pattern: `tests/ui/window.helpers.ts:15` — Playwright 侧 URL helper 与 fixture 导航方式。
  - Pattern: `tests/ui/window.smoke.spec.ts:4` — smoke spec 断言组织方式。
  - API/Type: `playwright.config.ts:3` — 测试目录、webServer 与 reporter 配置。

  **Acceptance Criteria** (agent-executable only):
  - [x] `npx playwright test --config=playwright.config.ts tests/ui/common-controls.smoke.spec.ts` exits `0`.
  - [x] 默认 fixture 通过 `/playwright-common-controls.html?fixture=default` 断言 `button-demo-primary` 可见、`radio-demo-fruit` 当前值为 `apple`、`select-demo-size` 当前值为 `medium`。
  - [x] disabled fixture 断言按钮、指定 radio、select 都为禁用态。
  - [x] unknown fixture 断言 `getByTestId('fixture-error')` 文本包含 `Unknown fixture:`。

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```
  Scenario: Smoke fixture happy path
    Tool: Bash
    Steps: Run `npx playwright test --config=playwright.config.ts tests/ui/common-controls.smoke.spec.ts --grep "default"`.
    Expected: Default fixture passes and verifies button visibility, radio checked state, and select value.
    Evidence: .sisyphus/evidence/task-5-smoke-default.txt

  Scenario: Disabled and unknown fixture edge cases
    Tool: Bash
    Steps: Run `npx playwright test --config=playwright.config.ts tests/ui/common-controls.smoke.spec.ts`.
    Expected: Disabled fixture and unknown fixture assertions both pass with no flaky retries required locally.
    Evidence: .sisyphus/evidence/task-5-smoke-all.txt
  ```

  **Commit**: YES | Message: `test(ui): add common controls smoke coverage` | Files: `playwright-common-controls.html`, `src/dev/playwright/commonControlsHarness.tsx`, `tests/ui/common-controls.smoke.spec.ts`, `tests/ui/common-controls.helpers.ts`

- [x] 6. Update README and run CI-parity validation

  **What to do**: 在 `README.md` 增加三类新控件的最小使用示例，示例必须与最终 API 完全一致：`CButton` 展示默认和 `primary` variant；`CRadioGroup` 演示 `apple` / `orange` 两个值；`CSelect` 演示 `small` / `medium` / `large` 与 placeholder。随后执行 CI 对齐命令：`yarn lint`、`yarn test --runInBand tests/Button.test.tsx`、`yarn test --runInBand tests/Radio.test.tsx`、`yarn test --runInBand tests/Select.test.tsx`、`npx playwright test --config=playwright.config.ts tests/ui/common-controls.smoke.spec.ts`、`yarn build`。若 README 示例与真实 API 不一致，优先修正文档，不再扩功能兜底。
  **Must NOT do**: 不新增文档站点；不扩写超出基础版的 API 示例；不在最终验证阶段顺手重构 unrelated 文件。

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: README 示例与最终 API 文案需要精确收口，同时带验证命令。
  - Skills: `[]` — 无需额外 skill。
  - Omitted: `openspec-apply-change` — 不适用当前工作流。

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Final Verification Wave | Blocked By: 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `README.md` — 本仓库对外使用说明更新位置。
  - Pattern: `package.json:21` — 可用 lint/test/build/test:ui 命令来源。
  - Pattern: `.github/workflows/ci-pr.yml:36` — CI 顺序与最终对齐目标。
  - Pattern: `jest.config.ts:3` — Jest 测试根目录与排除规则。
  - Pattern: `playwright.config.ts:15` — Playwright webServer 与 baseURL 配置。

  **Acceptance Criteria** (agent-executable only):
  - [x] `yarn lint` exits `0`.
  - [x] `yarn test --runInBand tests/Button.test.tsx && yarn test --runInBand tests/Radio.test.tsx && yarn test --runInBand tests/Select.test.tsx` exits `0`.
  - [x] `npx playwright test --config=playwright.config.ts tests/ui/common-controls.smoke.spec.ts` exits `0`.
  - [x] `yarn build` exits `0`.
  - [x] `npm pack --dry-run` exits `0`.
  - [x] `README.md` 中示例组件名、props 名和 demo 值与实际实现一致。

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```
  Scenario: Full validation happy path
    Tool: Bash
    Steps: Run `yarn lint && yarn test --runInBand tests/Button.test.tsx && yarn test --runInBand tests/Radio.test.tsx && yarn test --runInBand tests/Select.test.tsx && npx playwright test --config=playwright.config.ts tests/ui/common-controls.smoke.spec.ts && yarn build && npm pack --dry-run`.
    Expected: All commands exit 0 in sequence and leave the workspace in a CI-ready state including package dry-run.
    Evidence: .sisyphus/evidence/task-6-validation.txt

  Scenario: Documentation drift edge case
    Tool: Bash
    Steps: Run `rg -n "CButton|CRadioGroup|CSelect|primary|apple|orange|small|medium|large" README.md tests/Button.test.tsx tests/Radio.test.tsx tests/Select.test.tsx`.
    Expected: Ripgrep returns matches from `README.md` and from all three test files, proving documented names and demo values align with the implemented/tested contract.
    Evidence: .sisyphus/evidence/task-6-readme-check.txt
  ```

  **Commit**: YES | Message: `docs(components): document common controls and validate` | Files: `README.md`, affected test and source files from tasks 4-5 as needed

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [x] F1. Plan Compliance Audit — oracle

  **Acceptance Criteria**:
  - [x] Oracle 审核结论为 APPROVE，且未发现与 `.sisyphus/plans/common-components-button-radio-select.md` 相冲突的实现偏移。

  **QA Scenario**:

  ```
  Scenario: Oracle plan compliance audit
    Tool: task/oracle
    Steps: Run an oracle review against the final diff plus `.sisyphus/plans/common-components-button-radio-select.md`, asking whether each implemented artifact matches the planned scope, file targets, and guardrails.
    Expected: Oracle returns APPROVE with no unresolved scope or contract drift.
    Evidence: .sisyphus/evidence/f1-plan-compliance.md
  ```

- [x] F2. Code Quality Review — unspecified-high

  **Acceptance Criteria**:
  - [x] Reviewer finds no blocking typing, accessibility, or maintainability issues in new common-control files.

  **QA Scenario**:

  ```
  Scenario: Independent code quality review
    Tool: task/unspecified-high
    Steps: Run a code review focused on new Button/Radio/Select source, tests, preview integration, and smoke coverage after all validations pass.
    Expected: Review returns APPROVE with no blocking issues related to types, semantics, styling structure, or test reliability.
    Evidence: .sisyphus/evidence/f2-code-quality.md
  ```

- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)

  **Acceptance Criteria**:
  - [x] Review confirms the shipped UI behavior matches the documented demos and smoke scenarios in both default and disabled fixtures.

  **QA Scenario**:

  ```
  Scenario: Browser-level UI QA replay
    Tool: Bash
    Steps: Run `npx playwright test --config=playwright.config.ts tests/ui/common-controls.smoke.spec.ts --reporter=list`.
    Expected: Playwright replays the default, disabled, and unknown-fixture browser scenarios successfully with no failures.
    Evidence: .sisyphus/evidence/f3-manual-qa.txt
  ```

- [x] F4. Scope Fidelity Check — deep

  **Acceptance Criteria**:
  - [x] Reviewer confirms no out-of-scope features were added and no planned deliverable is missing.

  **QA Scenario**:

  ```
  Scenario: Deep scope fidelity review
    Tool: task/deep
    Steps: Run a scope audit comparing final changed files and exported APIs against the plan's IN/OUT boundaries.
    Expected: Audit confirms all required deliverables are present and no forbidden features (searchable select, custom popup, loading button, form abstraction) were introduced.
    Evidence: .sisyphus/evidence/f4-scope-fidelity.md
  ```

## Commit Strategy

- 推荐按组件切片提交，保证每次提交都处于可 lint / 可测 / 可构建状态。
- 提交顺序：Button → Radio → Select → 导出/主题/预览 → Playwright 烟测 → 文档与全量校验。

## Success Criteria

- 包入口与组件直接入口都能导出新增组件。
- 组件在 README 与 dev 预览中均有最小可运行示例。
- 单测覆盖导出、语义、受控/非受控、禁用态、关键 className / value 行为。
- Playwright 烟测覆盖一个按钮、一个 RadioGroup、一个 Select 的可见交互。
- 最终变更满足现有 CI 链路：lint → unit test → Playwright → build → npm pack dry-run。
