# Default Window SystemType Switch

## TL;DR
> **Summary**: 在默认展示窗口内部新增一个名为“切换系统”的下拉选择器，复用现有 `CSelect` 与系统注册表，使切换动作在同一事件链路中同时更新 `systemType` 与目标系统默认主题。
> **Deliverables**:
> - 默认窗口标题区新增可访问的 `切换系统` 下拉控件
> - dev 选择状态链路支持从默认窗口向上触发 systemType 切换
> - 切换时基于注册表联动目标系统默认主题
> - Jest 与 Playwright 覆盖新增交互和既有 remount 语义
> **Effort**: Short
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 → 2 → 3 → 5 → 6

## Context
### Original Request
在默认展示的这个窗口中，增加切换 SystemType 的选项，显示名称为：切换系统。

### Interview Summary
- 用户确认交互形式为下拉选择，优先复用现有 `CSelect`
- 用户确认切换 SystemType 时联动到目标系统默认主题
- 用户确认测试策略为测试后补，不要求 TDD

### Metis Review (gaps addressed)
- 保持 `systemType` / `theme` 的 source-of-truth 在 dev 选择状态拥有者，不在 `DefaultSystem` 保存局部真状态
- 默认主题映射必须复用 `src/system/registry.ts:30` 的 `DEFAULT_THEME_BY_SYSTEM`
- 保持 `src/system/SystemHost.tsx:21` 的系统校验与 `key={systemType}` remount 语义不变
- 测试必须通过可访问名称 `切换系统` 查询控件，并验证切换后系统、主题与 remount 行为

## Work Objectives
### Core Objective
在 `src/system/default/DefaultSystem.tsx:34` 渲染的默认窗口标题区加入一个受控下拉控件，让开发预览在默认系统下可直接切换到其他注册系统，并在同一回调中切换到该系统的默认主题。

### Deliverables
- `src/system/default/DefaultSystem.tsx` 支持渲染带标签的系统切换控件
- `src/system/SystemHost.tsx` / `src/dev/themeSwitcher.tsx` 链路支持向下传入当前值与向上传出切换事件
- `src/system/registry.ts` 暴露的默认主题映射被直接复用为切换逻辑依据
- `tests/SystemTypeSwitch.test.tsx` 与必要的 UI 测试覆盖切换行为

### Definition of Done (verifiable conditions with commands)
- `yarn test -- SystemTypeSwitch`
- `yarn test -- SystemHost`
- `yarn test:ui tests/ui/default-window-system-switch.spec.ts tests/ui/start-bar.spec.ts`
- `yarn lint`
- `yarn build`

### Must Have
- 在默认窗口中显示可见文本 `切换系统`
- 下拉选项来源于注册表中的系统定义，而不是硬编码重复列表
- 切换时同步应用目标系统默认主题，避免产生非法 system/theme 组合
- 继续沿用现有 `SystemHost` 校验与系统切换 remount 行为
- 测试通过 `getByRole('combobox', { name: '切换系统' })` 或等价 Playwright 语义查询验证控件

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不新增全局状态、context、store 或通用设置面板
- 不在 `DefaultSystem` 内用 `useEffect` 同步衍生状态
- 不重构 `CSelect`、`CWindowTitle`、`RadioGroup` 或其他无关系统 UI
- 不扩展为主题切换器、系统设置中心或多控件面板
- 不重复定义 system→defaultTheme 映射

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after + Jest / React Testing Library / Playwright
- QA policy: Every task has agent-executed scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: state plumbing + registry/default-theme resolution + default-window title-bar UI foundation
Wave 2: focused Jest coverage + focused Playwright coverage + full validation sweep

### Dependency Matrix (full, all tasks)
- 1 blocks 2, 3, 5
- 2 blocks 4, 5
- 3 blocks 4
- 4 blocks 6
- 5 blocks 6
- 6 precedes Final Verification Wave

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 3 tasks → `quick`, `visual-engineering`
- Wave 2 → 3 tasks → `quick`, `unspecified-low`
- Final Verification → 4 review tasks → `oracle`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Add shared system-switch resolver

  **What to do**: 在 `src/dev/themeSwitcher.tsx` 新增一个明确导出的选择解析函数（例如 `resolveDevSelectionForSystemType`），输入 `SystemTypeId`，输出合法的 `SystemThemeSelection`；该函数必须直接读取 `src/system/registry.ts` 中的 `DEFAULT_THEME_BY_SYSTEM`，并通过现有 `resolveDevThemeDefinition` / `resolveThemeDefinition` 路径确保返回组合合法。保留 `DEFAULT_DEV_SELECTION` 现有默认值，不改默认开机系统。
  **Must NOT do**: 不在 `themeSwitcher.tsx` 或 `DefaultSystem` 重复写一份 system→theme 映射；不使用 `useEffect` 做衍生同步；不引入新的枚举或重复类型。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 单文件逻辑补强，决策已定
  - Skills: `[]` — 不需要额外技能
  - Omitted: `openspec-apply-change` — 当前是局部代码切片，不需要完整 OpenSpec 执行链

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 2, 3, 4 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/themeSwitcher.tsx:25` — 当前 dev 选择默认值与解析入口都在这里，新的解析函数必须与这里保持同源
  - API/Type: `src/system/registry.ts:30` — `DEFAULT_THEME_BY_SYSTEM` 是唯一允许的默认主题映射来源
  - API/Type: `src/system/types.ts:18` — `SystemThemeSelection` 是返回值契约
  - Test: `tests/SystemTypeSwitch.test.tsx:52` — 现有系统切换测试已覆盖系统切换语义，可在同文件追加解析函数断言

  **Acceptance Criteria** (agent-executable only):
  - [ ] `src/dev/themeSwitcher.tsx` 暴露的切换解析函数对 `windows` 返回 `{ systemType: 'windows', theme: 'win98' }`
  - [ ] `src/dev/themeSwitcher.tsx` 暴露的切换解析函数对 `default` 返回 `{ systemType: 'default', theme: 'default' }`
  - [ ] `yarn test -- SystemTypeSwitch`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Shared resolver returns canonical defaults
    Tool: Bash
    Steps: Run `yarn test -- SystemTypeSwitch`
    Expected: Added resolver assertions pass for both registered systems with exact theme values
    Evidence: .sisyphus/evidence/task-1-system-switch-resolver.txt

  Scenario: Invalid mapping is not introduced
    Tool: Bash
    Steps: Run `yarn test -- SystemHost`
    Expected: Existing invalid selection protections still pass; no helper bypasses registry validation
    Evidence: .sisyphus/evidence/task-1-system-switch-resolver-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: [`src/dev/themeSwitcher.tsx`, `tests/SystemTypeSwitch.test.tsx`]

- [x] 2. Wire change callbacks through dev root and host

  **What to do**: 扩展 `DevSystemRoot` 以接收可选的 `onSelectionChange` 回调，并在 `SystemHost` 中改为显式分支渲染：仅当 `systemType === 'default'` 时，将当前 `systemType`、可选系统列表和回调传给 `DefaultSystem`；`WindowsSystem` 保持现有 props 契约不变。这里的回调入参必须是完整 `SystemThemeSelection`，由任务 1 的解析函数生成，而不是仅传字符串。
  **Must NOT do**: 不给 `WindowsSystem` 塞无用 props；不移除 `key={systemType}` 的 remount 机制；不把 source-of-truth 下放到 `DefaultSystem`。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 多文件小范围状态管道改造
  - Skills: `[]` — 不需要额外技能
  - Omitted: `work-with-pr` — 当前仅规划代码改动，不进入 PR 流程

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3, 4, 5 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/themeSwitcher.tsx:53` — `DevSystemRootProps` 现有输入型契约需要向事件型契约扩展
  - Pattern: `src/system/SystemHost.tsx:21` — 现有统一壳层路由点，需在这里分支把切换能力只传给默认系统
  - Pattern: `src/system/windows/WindowsSystem.tsx:21` — `WindowsSystemProps` 只接收 `themeDefinition`，应保持不变
  - API/Type: `src/system/types.ts:18` — 回调使用完整 `SystemThemeSelection` 类型
  - Test: `tests/SystemHost.test.tsx:88` — 这里已验证跨系统 remount，改造后必须继续通过

  **Acceptance Criteria** (agent-executable only):
  - [ ] `DevSystemRoot` 新增可选 `onSelectionChange`，且未传入时行为与当前一致
  - [ ] `SystemHost` 继续在跨系统切换时按 `key={systemType}` 重新挂载系统壳
  - [ ] `yarn test -- SystemHost`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Host preserves remount semantics after callback plumbing
    Tool: Bash
    Steps: Run `yarn test -- SystemHost`
    Expected: Existing cross-theme preserve and cross-system reboot assertions all pass unchanged
    Evidence: .sisyphus/evidence/task-2-host-plumbing.txt

  Scenario: No callback does not break static preview mode
    Tool: Bash
    Steps: Run `yarn test -- SystemTypeSwitch`
    Expected: Rendering `DevSystemRoot` without `onSelectionChange` still works and no new prop is required
    Evidence: .sisyphus/evidence/task-2-host-plumbing-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: [`src/dev/themeSwitcher.tsx`, `src/system/SystemHost.tsx`, `src/system/default/DefaultSystem.tsx`]

- [x] 3. Make preview owners mutable and URL-aware

  **What to do**: 将 `src/dev/main.tsx` 从固定渲染 `DEFAULT_DEV_SELECTION` 改为在入口组件内持有 `selection` 状态，并把 `onSelectionChange` 传给 `DevSystemRoot`；同时更新 `src/dev/playwright/windowHarness.tsx`，在 `system-theme` 路由下把系统切换事件回写到 URL（`systemType` + `theme`），继续沿用 `history.replaceState` + `PopStateEvent('popstate')` 的现有模式，确保交互测试和深链接行为一致。
  **Must NOT do**: 不改变 `fixture` 路由分支；不把切换事件写成只改 `systemType` 的半更新；不让预览入口在首次加载时偏离 `DEFAULT_DEV_SELECTION`。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 入口层状态接线，影响面有限
  - Skills: `[]` — 不需要额外技能
  - Omitted: `openspec-continue-change` — 当前不需要推进新的 artifact 流程

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6 | Blocked By: 1, 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/main.tsx:25` — 当前直接渲染固定默认值，需改为 stateful owner
  - Pattern: `src/dev/playwright/windowHarness.tsx:71` — 现有 URL→state 同步逻辑已在 `useHarnessRoute` 中实现
  - Pattern: `src/dev/playwright/windowHarness.tsx:104` — `switchWindowSelection` 使用的 URL 更新模式必须与真实交互保持一致
  - Test: `tests/ui/window.helpers.ts:104` — UI 测试对 URL 切换结果有既有等待逻辑，可直接复用
  - Test: `tests/ui/start-bar.spec.ts:59` — 现有 UI 用例已经依赖 URL 切换后系统/主题变化

  **Acceptance Criteria** (agent-executable only):
  - [ ] 普通 dev 预览可通过 `onSelectionChange` 在运行时切换系统而不是只显示初始默认值
  - [ ] Playwright 夹具在交互切换后 URL 中同时反映新的 `systemType` 与 `theme`
  - [ ] `yarn test:ui --grep "start bar"`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: URL-backed harness remains in sync after runtime selection changes
    Tool: Playwright
    Steps: Run `yarn test:ui --grep "start bar"`
    Expected: Existing URL-based switch helper continues to pass against updated ownership model
    Evidence: .sisyphus/evidence/task-3-preview-owners.txt

  Scenario: Fixture mode stays isolated
    Tool: Playwright
    Steps: Run `yarn test:ui tests/ui/window.move.spec.ts tests/ui/window.resize.spec.ts tests/ui/window.resize-guards.spec.ts`
    Expected: Fixture-based routes still render and operate without requiring selection state
    Evidence: .sisyphus/evidence/task-3-preview-owners-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: [`src/dev/main.tsx`, `src/dev/playwright/windowHarness.tsx`, `src/dev/themeSwitcher.tsx`]

- [x] 4. Render labeled switch in default window title bar

  **What to do**: 在 `src/system/default/DefaultSystem.tsx` 的 `CWindowTitle` 内把纯文本标题改为“标题文本 + 标签 + 下拉”的标题栏布局；新增一个默认系统专用的标题栏 class，使用 `CSelect` 渲染选项，选项来源于已注册系统定义的 label/id。下拉必须有可见文本 `切换系统`，并通过 `<label htmlFor>` 或等效无障碍方式与 `<select>` 绑定。因为 `CWindowTitle` 整个标题栏是拖拽热区，必须在切换控件容器上阻断会触发窗口拖拽的指针/鼠标事件传播，保证用户操作下拉时不会先拖动窗口。若布局需要，样式只改默认主题标题栏相关规则。
  **Must NOT do**: 不修改 `CSelect` 组件通用 API；不把切换控件加到窗口 body；不在 windows 系统标题栏加入相同控件；不为了解决拖拽冲突去改第三方 drag 库。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 涉及标题栏布局、交互热区与样式协调
  - Skills: `[]` — 不需要额外技能
  - Omitted: `openspec-explore` — 当前不再需要扩展探索，决策已完成

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 5, 6 | Blocked By: 2, 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/system/default/DefaultSystem.tsx:23` — 默认窗口 boot layout 与标题栏当前在这里定义
  - Pattern: `src/components/Select/Select.tsx:23` — 现有受控 `CSelect` API 和 `onChange` 签名必须直接复用
  - Pattern: `src/components/Window/WindowTitle.tsx:17` — 标题栏根节点本身就是拖拽热区，嵌入交互控件时必须显式阻断事件冒泡
  - Pattern: `src/theme/default/styles/index.scss:25` — 默认主题标题栏当前只有纯文本样式，需要在这里扩展布局/间距/控件样式位
  - Test: `tests/SystemTypeSwitch.test.tsx:61` — 现有测试已经查询默认窗口 frame/title，可在同文件追加标题栏控件与位置断言

  **Acceptance Criteria** (agent-executable only):
  - [ ] 默认窗口标题栏出现可访问名称为 `切换系统` 的 `combobox`
  - [ ] 下拉选项至少包含 `Default` 与 `Windows` 两个注册系统标签
  - [ ] 与下拉交互不会在选择前把默认窗口从 `left=32px top=28px` 拖离初始位置
  - [ ] `yarn test -- SystemTypeSwitch`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Default window exposes accessible switch control
    Tool: Bash
    Steps: Run `yarn test -- SystemTypeSwitch`
    Expected: Test queries `getByRole('combobox', { name: '切换系统' })` successfully and sees registered system options
    Evidence: .sisyphus/evidence/task-4-default-window-switch-ui.txt

  Scenario: Opening the select does not drag the window
    Tool: Bash
    Steps: Run `yarn test -- SystemTypeSwitch`
    Expected: After pointer/mouse interaction with the select, default window frame remains at left `32px` and top `28px` until selection change occurs
    Evidence: .sisyphus/evidence/task-4-default-window-switch-ui-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: [`src/system/default/DefaultSystem.tsx`, `src/theme/default/styles/index.scss`, `tests/SystemTypeSwitch.test.tsx`]

- [x] 5. Prove switch behavior resets theme and remounts shell

  **What to do**: 扩展 `tests/SystemTypeSwitch.test.tsx` 与必要时的 `tests/SystemHost.test.tsx`，覆盖从默认窗口触发切换后的完整行为：选择 `Windows` 后渲染 `cm-system--windows`、主题自动落到 `win98`、StartBar 出现、窗口 UUID 变化；切回 `default` 时主题回到 `default`。同时补一个失败/边界断言，证明切换逻辑不会把非法 `systemType/theme` 组合交给 `SystemHost`。优先复用现有 `PersistentSystemHarness` 风格，而不是发明新测试基座。
  **Must NOT do**: 不删除既有 remount 测试；不写“renders correctly”这类空泛断言；不通过内部 state 读值代替 DOM/属性验证。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 聚焦 Jest/RTL 行为验证
  - Skills: `[]` — 不需要额外技能
  - Omitted: `pre-publish-review` — 当前不是发布门禁场景

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 6 | Blocked By: 2, 3, 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/SystemTypeSwitch.test.tsx:40` — 现有 `PersistentSystemHarness` 可直接扩展为可切换 owner
  - Pattern: `tests/SystemTypeSwitch.test.tsx:87` — 现有跨系统 rerender 断言已验证 UUID/remount 语义
  - Pattern: `tests/SystemHost.test.tsx:88` — host 层 remount 断言是回归基线，必要时同步补强
  - API/Type: `src/system/registry.ts:23` — 非法 system/theme 组合定义由矩阵控制，测试必须围绕矩阵而不是硬编码规则描述
  - API/Type: `src/system/registry.ts:30` — 目标系统默认主题来自这里，不允许测试期待与该映射不一致的值

  **Acceptance Criteria** (agent-executable only):
  - [ ] 通过默认窗口下拉切换到 `windows` 后，断言 `data-system-type="windows"` 与 `data-theme="win98"`
  - [ ] 切换后 `window-content` 的 `data-window-uuid` 发生变化，证明跨系统 remount 仍存在
  - [ ] 不会向 `SystemHost` 传入 `windows/default` 之类非法组合
  - [ ] `yarn test -- SystemTypeSwitch`
  - [ ] `yarn test -- SystemHost`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Switching from default window boots windows with canonical theme
    Tool: Bash
    Steps: Run `yarn test -- SystemTypeSwitch`
    Expected: Assertions confirm `screen-root` changes to `windows`, theme becomes `win98`, StartBar exists, and window UUID changes
    Evidence: .sisyphus/evidence/task-5-switch-behavior.txt

  Scenario: Invalid theme pair is never rendered
    Tool: Bash
    Steps: Run `yarn test -- SystemHost`
    Expected: Tests prove invalid combinations still throw or are prevented before render; no regression to permissive behavior
    Evidence: .sisyphus/evidence/task-5-switch-behavior-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: [`tests/SystemTypeSwitch.test.tsx`, `tests/SystemHost.test.tsx`]

- [x] 6. Add real UI coverage and run CI-aligned validation

  **What to do**: 新增 `tests/ui/default-window-system-switch.spec.ts`（不要挤进无关 spec），从 `default/default` 启动真实窗口夹具，通过标题栏里的 `切换系统` 下拉选择 `Windows`，断言 URL、`screen-root` 的 `data-system-type` / `data-theme`、`windows-start-bar` 可见性以及默认窗口 body 消失。然后运行与 CI 对齐的聚焦验证命令，并把结果保存为 evidence。
  **Must NOT do**: 不做纯视觉截图比对；不通过 `page.evaluate` 直接改 URL 来替代真实下拉交互；不把整套 `yarn test:ui` 作为唯一验证而缺少聚焦用例。

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: 以现有 Playwright 模式编写一条聚焦 UI 回归并跑验证链路
  - Skills: `[]` — 不需要额外技能
  - Omitted: `github-triage` — 与 GitHub 读操作无关

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Final Verification Wave | Blocked By: 3, 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/ui/start-bar.spec.ts:23` — 现有系统/主题 UI 断言风格与 `expect` 使用方式
  - Pattern: `tests/ui/window.helpers.ts:91` — 夹具导航与等待 harness ready 的通用辅助函数
  - Pattern: `src/dev/playwright/windowHarness.tsx:135` — `system-theme` 路由会渲染 `DevSystemRoot`，真实 UI 交互必须落在这条路径上
  - Pattern: `.github/workflows/ci-pr.yml:36` — 最终验证命令必须与 CI 顺序保持一致
  - API/Type: `src/dev/main.tsx:5` — 预览 host 依赖 `default-window-body` / `windows-window-body`，切换后要验证 body 容器也发生变化

  **Acceptance Criteria** (agent-executable only):
  - [ ] `tests/ui/default-window-system-switch.spec.ts` 通过真实下拉操作完成系统切换，不直接篡改 URL
  - [ ] UI 断言切换后 URL 中同时包含 `systemType=windows` 与 `theme=win98`
  - [ ] `yarn test:ui tests/ui/default-window-system-switch.spec.ts tests/ui/start-bar.spec.ts`
  - [ ] `yarn lint`
  - [ ] `yarn build`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Real default-window switch flow works end to end
    Tool: Playwright
    Steps: Run `yarn test:ui tests/ui/default-window-system-switch.spec.ts tests/ui/start-bar.spec.ts`
    Expected: New spec switches via the combobox, URL updates to `systemType=windows&theme=win98`, and StartBar becomes visible
    Evidence: .sisyphus/evidence/task-6-ui-switch-flow.txt

  Scenario: CI-aligned validation catches regressions
    Tool: Bash
    Steps: Run `yarn lint && yarn test -- SystemTypeSwitch && yarn test -- SystemHost && yarn test:ui tests/ui/default-window-system-switch.spec.ts tests/ui/start-bar.spec.ts && yarn build`
    Expected: All commands exit 0 with no unrelated file mutations
    Evidence: .sisyphus/evidence/task-6-ui-switch-flow-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: [`tests/ui/default-window-system-switch.spec.ts`, `tests/ui/start-bar.spec.ts`, `src/dev/playwright/windowHarness.tsx`]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle

  **QA Scenario**:
  ```
  Tool: task (oracle)
  Steps: Review implementation diff against `.sisyphus/plans/default-window-systemtype-switch.md`; verify every acceptance criterion and guardrail is satisfied.
  Expected: Oracle returns explicit approval with no critical plan deviations.
  Evidence: .sisyphus/evidence/f1-plan-compliance.md
  ```

- [x] F2. Code Quality Review — unspecified-high

  **QA Scenario**:
  ```
  Tool: task (unspecified-high)
  Steps: Review touched files for typing quality, unnecessary abstraction, accessibility regressions, and style drift.
  Expected: Reviewer returns APPROVED or lists only non-blocking notes; zero critical code-quality defects remain.
  Evidence: .sisyphus/evidence/f2-code-quality.md
  ```

- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)

  **QA Scenario**:
  ```
  Tool: task (unspecified-high) + Playwright
  Steps: Execute the real UI flow in the preview harness, operate the `切换系统` combobox, and confirm DOM/URL/start-bar outcomes match the plan.
  Expected: Reviewer confirms the feature works through real interaction and reproduces no regressions in the tested flow.
  Evidence: .sisyphus/evidence/f3-ui-qa.md
  ```

- [x] F4. Scope Fidelity Check — deep

  **QA Scenario**:
  ```
  Tool: task (deep)
  Steps: Compare changed files and behaviors against the original request and plan scope boundaries.
  Expected: Deep reviewer confirms only the default-window system switch and required plumbing/tests changed; no unauthorized scope creep remains.
  Evidence: .sisyphus/evidence/f4-scope-fidelity.md
  ```

## Commit Strategy
- 默认不提交；仅在用户显式要求时，按“测试先行提交 / 功能提交 / UI 测试提交”拆成原子提交
- 如需提交，优先消息：`test(system): cover default-window switch`, `feat(system): add default-window system switch`, `test(ui): cover default-window system switch`

## Success Criteria
- 默认系统窗口标题区出现名称为 `切换系统` 的可访问下拉控件
- 从默认窗口选择 `Windows` 后，`screen-root` 反映 `data-system-type="windows"`，主题自动变为该系统默认主题
- 通过现有 owner/URL 驱动切回 `Default` 后，`data-theme="default"` 且默认窗口重新挂载
- 现有窗口拖拽/StartBar 相关行为未被破坏
- `yarn lint`、相关 Jest、相关 Playwright、`yarn build` 全部通过
