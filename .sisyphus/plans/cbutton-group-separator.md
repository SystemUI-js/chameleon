# CButtonGroup and CButtonSeparator

## TL;DR
> **Summary**: Add an enhanced `CButtonGroup` wrapper and a standalone `CButtonSeparator` component that follow existing Chameleon button/theme/export patterns, support horizontal and vertical grouping, and provide deterministic grouped-button styling without introducing toolbar keyboard complexity.
> **Deliverables**:
> - Public `CButtonGroup` and `CButtonSeparator` components with repo-standard prop surfaces
> - Group-level orientation and default variant/disabled inheritance for direct `CButton` children
> - Separator orientation support with group-aware defaulting
> - Theme-aware grouped-button and separator styles for `default`, `win98`, and `winxp`
> - Package exports, catalog showcase, common-controls harness updates, Jest coverage, and Playwright UI coverage
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 → 2 → 4 → 5 → 6

## Context
### Original Request
增加 CButtonGroup 组件，参考网上的前端组件库完善它的功能，再增加 CButtonSeparator 组件，用来在一组按钮中间放竖线间隔。

### Interview Summary
- `CButtonGroup` 采用增强版 v1：支持横向/纵向分组、组级默认 `variant` / `disabled` 约束、首中尾位置样式，但不做复杂 toolbar roving tabindex。
- `CButtonSeparator` 做成独立公开组件，支持双方向 API；在按钮组中使用时按视觉分隔用途处理。
- 测试策略确定为 tests-after，沿用现有 Jest + React Testing Library + Playwright 基础设施。
- 默认收敛：不新增 `CButton` 的 `size` 公共 API；组级继承仅覆盖现有按钮已支持的 `variant` 与 `disabled`，避免把请求扩展成按钮体系重构。
- 默认收敛：`CButtonGroup` 采用 wrapper-first + child cloning 方案，仅协调直接 `CButton` / `CButtonSeparator` 子节点，不引入 Context 状态机。

### Metis Review (gaps addressed)
- 明确 guardrail：新组件必须复用现有 `useTheme` + `mergeClasses` + 目录/导出规范，不单独发明实现模式。
- 补充 guardrail：主题视觉样式必须在 `default` / `win98` / `winxp` 三套主题样式文件中同步落地，不能只写组件基础 SCSS。
- 关闭不确定项：`CButtonGroup` 仅做视觉分组与默认 props 协调，不复制 `CRadioGroup` 的受控/非受控状态模型。
- 补充边界：需要覆盖空组、单按钮、Fragment/null、separator 打断按钮连接关系、组级 disabled 与子按钮 disabled 合并规则。

## Work Objectives
### Core Objective
交付一个可公开导出的 `CButtonGroup` 与 `CButtonSeparator` 组合方案，使现有 `CButton` 可以按按钮组模式稳定排布、共享默认视觉参数并在三套主题下呈现正确的连接样式与分隔样式。

### Deliverables
- `src/components/ButtonGroup/ButtonGroup.tsx` 与 `src/components/ButtonSeparator/ButtonSeparator.tsx`
- 组件基础样式文件与三套主题样式补充
- `src/components/index.ts` / `src/index.ts` 导出更新
- `tests/ButtonGroup.test.tsx`（含 separator 相关断言）
- `src/dev/ComponentCatalog.tsx` 中的 ButtonGroup 展示区
- `src/dev/playwright/commonControlsHarness.tsx` 与 `tests/ui/common-controls.*` 的分组按钮场景验证

### Definition of Done (verifiable conditions with commands)
- `yarn lint` 通过
- `yarn test --runInBand tests/ButtonGroup.test.tsx` 通过
- `yarn test` 通过全量 Jest 套件
- `yarn test:ui` 通过且包含新的 grouped button 场景
- `yarn build` 通过并包含新组件导出

### Must Have
- `CButtonGroup` 使用 children 组合模式，而非 data-driven items API
- `CButtonGroup` 支持 `orientation?: 'horizontal' | 'vertical'`
- `CButtonGroup` 支持组级 `variant?: CButtonVariant` 与 `disabled?: boolean` 默认继承给直接 `CButton` 子节点
- 子按钮显式 `variant` 优先于组级 `variant`；组级 `disabled` 为 `true` 时必须强制禁用所有直接按钮子节点
- `CButtonGroup` 为直接按钮子节点注入稳定的位置 class（首/中/尾/单个）与方向 class，用于主题样式控制
- `CButtonSeparator` 支持 `orientation?: 'horizontal' | 'vertical'`、`className`、`theme`、`data-testid`
- 当 `CButtonSeparator` 在 `CButtonGroup` 中未显式声明方向时，方向应自动跟随按钮组：横向组用竖线，纵向组用横线
- Separator 必须打断按钮连接关系：分隔线左右两侧的按钮各自重新计算首/尾位置
- 新组件必须在 `src/components/index.ts` 与 `src/index.ts` 双层导出，并接入 catalog 与 Playwright harness

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不新增 `CButton` 的 `size` API
- 不实现 `role="toolbar"`、方向键导航、roving tabindex、focus trap
- 不实现 split button、dropdown/menu、icon-only 特殊布局系统
- 不引入 `any`、CSS-in-JS、portal、Context 状态管理
- 不要求按钮组支持任意复杂子组件协调；仅协调直接 `CButton` / `CButtonSeparator` / Fragment / nullish children
- 不只修一个主题；三套主题必须一起规划

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after using Jest + React Testing Library plus Playwright
- QA policy: Every task has agent-executed happy-path and failure-path scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: 1) public API and export scaffold, 2) grouped child classification and position classes, 3) group-level variant/disabled inheritance

Wave 2: 4) separator component and orientation propagation, 5) theme stylesheet integration, 6) catalog/harness/UI regression integration

### Dependency Matrix (full, all tasks)
| Task | Depends On | Unblocks |
|---|---|---|
| 1 | none | 2, 3, 4, 5, 6 |
| 2 | 1 | 3, 4, 5, 6 |
| 3 | 1, 2 | 5, 6 |
| 4 | 1, 2 | 5, 6 |
| 5 | 2, 3, 4 | 6 |
| 6 | 1, 2, 3, 4, 5 | F1-F4 |

### Agent Dispatch Summary (wave → task count → categories)
| Wave | Task Count | Recommended Categories |
|---|---:|---|
| Wave 1 | 3 | quick, unspecified-low |
| Wave 2 | 3 | visual-engineering, unspecified-low |
| Final | 4 | oracle, unspecified-high, deep |

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Define `CButtonGroup` / `CButtonSeparator` public contracts and export surface

  **What to do**: Create `src/components/ButtonGroup/ButtonGroup.tsx` and `src/components/ButtonSeparator/ButtonSeparator.tsx` using the same function-component structure as existing controls: local `resolveThemeClass`, `useTheme(theme)`, `mergeClasses`, local `index.scss`, and repo-standard optional props `className`, `theme`, and `data-testid`. Define `CButtonGroupProps` with `children`, `orientation`, `variant`, `disabled`, `className`, `theme`, and `data-testid`. Define `CButtonSeparatorProps` with `orientation`, `className`, `theme`, and `data-testid`; keep the separator purely decorative (non-focusable and `aria-hidden`). Update `src/components/index.ts` and `src/index.ts` so both components are exported from the component barrel and package root. Add initial Jest contract tests covering package-entry exports, theme/class merge behavior, and default orientation values.
  **Must NOT do**: Do not add `size`, `toolbar`, `aria-label`, menu/split-button props, context state, or any second public alias names.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: bounded API scaffolding plus barrel wiring
  - Skills: `[]` — repo-local patterns are sufficient
  - Omitted: [`frontend-ui-ux`] — no visual exploration needed in this slice

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 2, 3, 4, 5, 6 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Button/Button.tsx:1-55` — function component shape, local `resolveThemeClass`, and `mergeClasses` usage
  - Pattern: `src/components/Radio/RadioGroup.tsx:6-95` — repo-standard grouped control prop surface (`className`, `theme`, `data-testid`, `children`)
  - Pattern: `src/components/Theme/useTheme.ts:1-23` — explicit theme prop precedence over provider theme
  - Pattern: `src/components/Theme/mergeClasses.ts:1-19` — class merge order `base → theme → className`
  - Pattern: `src/components/index.ts:1-12` — component barrel export format
  - Pattern: `src/index.ts:1-6` — package-root export format
  - Test: `tests/Button.test.tsx:6-121` — package export, theme, and class merge assertion style

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="exports CButtonGroup from package entry|exports CButtonSeparator from package entry|uses horizontal as the default group orientation|uses vertical as the default separator orientation"` passes
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="applies explicit theme and className to CButtonGroup|applies explicit theme and className to CButtonSeparator"` passes
  - [ ] `yarn lint` passes after adding the new component files and barrel updates

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Public export and default prop contract
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="exports CButtonGroup from package entry|exports CButtonSeparator from package entry|uses horizontal as the default group orientation|uses vertical as the default separator orientation"`
    Expected: Jest reports all matching tests passing and confirms package-entry exports plus default orientation behavior
    Evidence: .sisyphus/evidence/task-1-button-group-contract.txt

  Scenario: Theme/class merge contract
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="applies explicit theme and className to CButtonGroup|applies explicit theme and className to CButtonSeparator"`
    Expected: Jest confirms both components follow base → theme → className behavior and explicit theme class application
    Evidence: .sisyphus/evidence/task-1-button-group-contract-error.txt
  ```

  **Commit**: NO | Message: `feat(button-group): scaffold public grouped button API` | Files: `src/components/ButtonGroup/ButtonGroup.tsx`, `src/components/ButtonSeparator/ButtonSeparator.tsx`, `src/components/index.ts`, `src/index.ts`, `tests/ButtonGroup.test.tsx`

- [ ] 2. Implement grouped child classification and button position markers

  **What to do**: Build `CButtonGroup` as a wrapper-first component that flattens `children`, unwraps Fragments, ignores null/boolean children, and classifies only direct `CButton` / `CButtonSeparator` elements for group coordination. Render the wrapper with `cm-button-group` plus `cm-button-group--horizontal` / `cm-button-group--vertical`. Clone direct `CButton` children to inject positional classes on the child `className`: `cm-button--grouped`, `cm-button--group-first`, `cm-button--group-middle`, `cm-button--group-last`, `cm-button--group-single`, plus `cm-button--group-horizontal` or `cm-button--group-vertical`. Treat separators as hard segment boundaries so buttons on each side recompute first/last positions independently. Preserve non-groupable valid React elements unchanged and unmodified.
  **Must NOT do**: Do not introduce Context, do not mutate child order, do not style through DOM querying, and do not let separators inherit button position classes.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: child traversal and cloning logic with segment-aware edge cases
  - Skills: `[]` — no external library work is required
  - Omitted: [`playwright`] — browser automation is unnecessary for this structural slice

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 3, 4, 5, 6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Button/Button.tsx:27-55` — child button props that must survive cloning (`variant`, `disabled`, `onClick`, `className`, `theme`, `data-testid`)
  - Pattern: `src/components/Radio/RadioGroup.tsx:47-94` — grouped wrapper rendering and base class composition
  - Pattern: `src/components/Button/index.scss:1-11` — existing button class namespace that grouped modifier classes must extend
  - Test: `tests/Button.test.tsx:19-48` — class assertion and rerender style for button modifiers
  - Test: `tests/Button.test.tsx:107-119` — class merge expectations after augmenting `className`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="marks first middle and last grouped buttons|marks a single grouped button as single|applies vertical wrapper modifier"` passes
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="unwraps fragment children and ignores nullish children|separator resets position markers between button segments|renders an empty group without crashing|preserves non-button children unchanged"` passes

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Horizontal and vertical position markers
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="marks first middle and last grouped buttons|marks a single grouped button as single|applies vertical wrapper modifier"`
    Expected: Jest confirms grouped buttons receive deterministic first/middle/last/single markers and wrapper orientation classes
    Evidence: .sisyphus/evidence/task-2-button-group-positions.txt

  Scenario: Fragment/null/separator boundary handling
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="unwraps fragment children and ignores nullish children|separator resets position markers between button segments|renders an empty group without crashing|preserves non-button children unchanged"`
    Expected: Jest confirms nullish children do not break grouping, separators split button segments correctly, empty groups render safely, and non-button children are preserved without injected button markers
    Evidence: .sisyphus/evidence/task-2-button-group-positions-error.txt
  ```

  **Commit**: NO | Message: `feat(button-group): add grouped child classification` | Files: `src/components/ButtonGroup/ButtonGroup.tsx`, `src/components/ButtonGroup/index.scss`, `tests/ButtonGroup.test.tsx`

- [ ] 3. Implement group-level `variant` / `disabled` inheritance for direct buttons

  **What to do**: Extend `CButtonGroup` cloning so direct `CButton` children receive group defaults without altering the `CButton` public API. Apply `variant={child.props.variant ?? groupVariant}` and `disabled={groupDisabled || child.props.disabled}` when cloning direct button children, while preserving the child’s explicit `theme`, `className`, `type`, `onClick`, and `data-testid`. Ensure group-level `disabled` prevents clicks by flowing through the native button `disabled` attribute, and ensure an explicitly set child `variant` still wins over the group default.
  **Must NOT do**: Do not add a new `size` prop, do not override an explicit child `variant`, and do not try to disable non-button children by CSS only.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: prop-precedence logic with disabled-state edge cases
  - Skills: `[]` — existing button tests give enough guidance
  - Omitted: [`frontend-ui-ux`] — visual design is not the main risk here

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6 | Blocked By: 1, 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Button/Button.tsx:9-18` — existing public button props; inheritance must stay within this contract
  - Pattern: `src/components/Button/Button.tsx:27-55` — `disabled` and `variant` wiring to the native button/className
  - Test: `tests/Button.test.tsx:36-66` — variant modifier and disabled click-blocking expectations
  - Test: `tests/Button.test.tsx:68-119` — theme/class merge precedence that must remain intact after cloning

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="applies group variant to child buttons without explicit variant|child variant overrides group variant"` passes
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="group disabled disables all direct buttons|group disabled blocks child click handlers"` passes
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="preserves child theme and className when applying group defaults"` passes

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Group default variant precedence
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="applies group variant to child buttons without explicit variant|child variant overrides group variant"`
    Expected: Jest confirms group-level variant acts as a default only and never overwrites an explicit child variant
    Evidence: .sisyphus/evidence/task-3-button-group-variant.txt

  Scenario: Group disabled enforcement
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="group disabled disables all direct buttons|group disabled blocks child click handlers"`
    Expected: Jest confirms all direct button children become natively disabled and click handlers are not invoked
    Evidence: .sisyphus/evidence/task-3-button-group-disabled-error.txt
  ```

  **Commit**: NO | Message: `feat(button-group): add inherited grouped defaults` | Files: `src/components/ButtonGroup/ButtonGroup.tsx`, `tests/ButtonGroup.test.tsx`

- [ ] 4. Implement `CButtonSeparator` orientation logic and group-aware propagation

  **What to do**: Build `CButtonSeparator` as a standalone decorative component with wrapper classes `cm-button-separator`, `cm-button-separator--vertical`, and `cm-button-separator--horizontal`, plus repo-standard theme/className handling. Default standalone orientation to `vertical`. In `CButtonGroup`, detect direct `CButtonSeparator` children and clone them with an effective orientation of `child.props.orientation ?? (groupOrientation === 'horizontal' ? 'vertical' : 'horizontal')`. Keep separators non-focusable, `aria-hidden="true"`, and excluded from variant/disabled inheritance. Verify separators reset the button position algorithm from Task 2 and do not pick up button modifier classes.
  **Must NOT do**: Do not expose toolbar semantics, interactive behavior, or dropdown affordances; do not make separator focusable; do not let separator orientation default ignore the parent group direction.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: bounded standalone component plus a small amount of group integration logic
  - Skills: `[]` — existing component patterns are enough
  - Omitted: [`playwright`] — UI automation comes later after the harness is updated

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 5, 6 | Blocked By: 1, 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Button/Button.tsx:20-55` — local theme normalization plus render-time class merge pattern to mirror in a standalone control
  - Pattern: `src/components/Theme/useTheme.ts:14-23` — explicit theme precedence for decorative child components too
  - Pattern: `src/components/Theme/mergeClasses.ts:12-19` — deterministic base/theme/class merge order
  - Test: `tests/Button.test.tsx:68-119` — explicit theme prop, Theme provider, and class merge test style
  - Task dependency note: `src/components/ButtonGroup/ButtonGroup.tsx` from Tasks 1-3 must already classify separators as non-button boundaries

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="uses vertical as the default separator orientation|uses horizontal separator when a vertical group omits separator orientation"` passes
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="explicit separator orientation overrides group-derived orientation|separator is aria-hidden and non-focusable"` passes
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="separator does not inherit grouped button variant or disabled behavior"` passes

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Separator defaulting and group propagation
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="uses vertical as the default separator orientation|uses horizontal separator when a vertical group omits separator orientation"`
    Expected: Jest confirms standalone separators default to vertical and group-provided orientation flips correctly for vertical groups
    Evidence: .sisyphus/evidence/task-4-button-separator-orientation.txt

  Scenario: Separator accessibility and override contract
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="explicit separator orientation overrides group-derived orientation|separator is aria-hidden and non-focusable|separator does not inherit grouped button variant or disabled behavior"`
    Expected: Jest confirms explicit separator props win, separator remains decorative, and button-only inheritance never leaks onto separator elements
    Evidence: .sisyphus/evidence/task-4-button-separator-orientation-error.txt
  ```

  **Commit**: NO | Message: `feat(button-group): add decorative button separator` | Files: `src/components/ButtonSeparator/ButtonSeparator.tsx`, `src/components/ButtonSeparator/index.scss`, `src/components/ButtonGroup/ButtonGroup.tsx`, `tests/ButtonGroup.test.tsx`

- [ ] 5. Add grouped-button and separator theme styling across all shipped themes

  **What to do**: Keep component-local SCSS minimal and structural only: `ButtonGroup` should define layout/flex rules, orientation gaps, and overflow-safe container behavior; `ButtonSeparator` should define structural block sizing hooks only. Put all visual button-joining and separator color/thickness rules into `src/theme/default/styles/index.scss`, `src/theme/win98/styles/index.scss`, and `src/theme/winxp/styles/index.scss`. For grouped buttons, style joined edges using the position/orientation classes from Task 2 so adjacent buttons share borders/radii correctly, while separators break the chain and restore outer radii on each side. Style separators to visually match each theme’s existing button chrome. Add Jest assertions for Theme-provider inheritance and explicit group/separator theme override contracts, then run `yarn build` to validate SCSS compilation.
  **Must NOT do**: Do not leave visual rules only in component-local SCSS, do not implement a single-theme shortcut, and do not require style logic that depends on DOM mutation after render.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: multi-theme styling with joined-edge behavior is the highest visual-risk slice
  - Skills: [`frontend-ui-ux`] — helps reason about grouped-control and separator presentation without over-scoping behavior
  - Omitted: [`playwright`] — UI smoke execution is handled in Task 6 after harness wiring exists

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 6 | Blocked By: 2, 3, 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Button/index.scss:1-11` — local component SCSS is structural/minimal, not theme-complete
  - Pattern: `src/components/Radio/index.scss:1-14` — lightweight component-level style file precedent
  - Pattern: `src/theme/default/styles/index.scss:158-233` — default-theme button visuals, focus ring, and disabled styling to extend for grouped states
  - Pattern: `src/theme/win98/styles/index.scss:89-155` — Win98 button visuals and border treatment that grouped buttons/separators must preserve
  - Pattern: `src/theme/winxp/styles/index.scss:85-146` — WinXP rounded button visuals and disabled state that grouped buttons/separators must preserve
  - Test: `tests/Button.test.tsx:68-119` — theme prop/provider/override regression structure
  - Build: `package.json:21-31` — `yarn build` is the required SCSS compilation gate

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="inherits Theme provider for grouped buttons|explicit group theme overrides Theme provider|explicit separator theme overrides Theme provider"` passes
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="applies horizontal and vertical orientation classes needed by theme styles"` passes
  - [ ] `yarn build` passes after updating component SCSS plus all three theme style bundles

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme inheritance contract for group and separator
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ButtonGroup.test.tsx --testNamePattern="inherits Theme provider for grouped buttons|explicit group theme overrides Theme provider|explicit separator theme overrides Theme provider"`
    Expected: Jest confirms theme provider inheritance and explicit theme override rules remain consistent with existing component behavior
    Evidence: .sisyphus/evidence/task-5-button-group-theme.txt

  Scenario: Theme styles compile cleanly
    Tool: Bash
    Steps: Run `yarn build`
    Expected: Vite library build succeeds with no SCSS compilation or type errors after adding grouped-button and separator theme rules
    Evidence: .sisyphus/evidence/task-5-button-group-theme-error.txt
  ```

  **Commit**: NO | Message: `feat(button-group): add themed grouped button styles` | Files: `src/components/ButtonGroup/index.scss`, `src/components/ButtonSeparator/index.scss`, `src/theme/default/styles/index.scss`, `src/theme/win98/styles/index.scss`, `src/theme/winxp/styles/index.scss`, `tests/ButtonGroup.test.tsx`

- [ ] 6. Integrate catalog, common-controls harness, and UI regression coverage

  **What to do**: Add a `ButtonGroup` showcase to `src/dev/ComponentCatalog.tsx` using the existing `ShowcaseSection` pattern and include horizontal, vertical, disabled, and separator examples that demonstrate grouped defaults and explicit child overrides. Extend `src/dev/playwright/commonControlsHarness.tsx` with grouped-button fixtures for default and disabled states, and update `tests/ui/common-controls.helpers.ts` with the exact test IDs/selectors required to wait for and inspect the new fixture. Add Playwright smoke coverage to `tests/ui/common-controls.smoke.spec.ts` for grouped-button visibility, disabled enforcement, separator rendering, and at least one Win98 or WinXP style assertion proving grouped edges/separators pick up themed visuals. Finish by running `yarn test:ui`, `yarn test`, and `yarn lint` so the repo’s CI gates stay green.
  **Must NOT do**: Do not create a brand-new harness page when `playwright-common-controls.html` already exists, do not add manual-only verification steps, and do not leave showcase examples out of sync with the exported API.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: repo integration work across dev surface, harness, and automated regression commands
  - Skills: [`playwright`] — needed for deterministic browser verification guidance and selectors
  - Omitted: [`frontend-ui-ux`] — visual design decisions are already locked by Task 5

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: F1, F2, F3, F4 | Blocked By: 1, 2, 3, 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/ComponentCatalog.tsx:98-125` — Button showcase structure and local state pattern
  - Pattern: `src/dev/ComponentCatalog.tsx:184-210` — grouped control section layout using `ShowcaseSection` plus value text
  - Pattern: `src/dev/ComponentCatalog.tsx:369-398` — showcase registration in the main catalog list
  - Pattern: `src/dev/playwright/commonControlsHarness.tsx:61-145` — default/disabled fixture routing and themed harness container
  - Pattern: `tests/ui/common-controls.helpers.ts:4-108` — helper-based navigation and harness readiness checks
  - Pattern: `tests/ui/common-controls.smoke.spec.ts:9-100` — smoke + Win98 style assertion format for common controls
  - Test infra: `playwright.config.ts:1-28` — baseURL/webServer/testDir for UI tests
  - CI gate: `.github/workflows/ci-pr.yml:36-76` — required repo verification commands before work is considered complete

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test:ui --grep "grouped buttons"` passes after adding grouped-button smoke/spec coverage
  - [ ] `yarn test --runInBand tests/ButtonGroup.test.tsx` passes with the full grouped-button/unit coverage suite
  - [ ] `yarn lint && yarn test && yarn test:ui && yarn build` all pass in sequence

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Grouped-button smoke and themed UI coverage
    Tool: Bash
    Steps: Run `yarn test:ui --grep "grouped buttons"`
    Expected: Playwright passes grouped-button fixture tests covering visibility, disabled state, separator rendering, and at least one theme-specific grouped-edge assertion
    Evidence: .sisyphus/evidence/task-6-button-group-ui.txt

  Scenario: Full CI-equivalent verification
    Tool: Bash
    Steps: Run `yarn lint && yarn test && yarn test:ui && yarn build`
    Expected: All lint, unit, UI, and build commands complete successfully with no new failures
    Evidence: .sisyphus/evidence/task-6-button-group-ui-error.txt
  ```

  **Commit**: NO | Message: `feat(button-group): add previews and regression coverage` | Files: `src/dev/ComponentCatalog.tsx`, `src/dev/playwright/commonControlsHarness.tsx`, `tests/ui/common-controls.helpers.ts`, `tests/ui/common-controls.smoke.spec.ts`, `tests/ButtonGroup.test.tsx`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit 1: `feat(button-group): scaffold grouped button components`
- Commit 2: `feat(button-group): add grouped inheritance and separators`
- Commit 3: `feat(button-group): add themed styles and coverage`

## Success Criteria
- New grouped-button components are publicly exported, documented in dev surfaces, and verifiable through unit + UI automation.
- Grouped buttons render correctly in all shipped themes with separator-aware connection logic.
- No toolbar keyboard complexity, menu behavior, or unrelated button API expansion is introduced.
