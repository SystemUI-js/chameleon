# Windows Start Bar × WindowManager Integration

## TL;DR
> **Summary**: 在 Windows 系统壳层中，把 `CStartBar` 与 `CWindowManager` 接成同一套运行时窗口状态；开始栏展示当前打开窗口，点击仅执行激活；`CWindowTitle` 增加关闭按钮并通过 `WindowManager` 卸载对应窗口。
> **Deliverables**:
> - 独立功能分支 `feat/windows-start-bar-windowmanager`
> - `CWindowManager` 运行时打开窗口/激活窗口模型
> - `CStartBar` 打开窗口列表 UI 与激活回调
> - `CWindow` / `CWindowTitle` 关闭按钮链路
> - `WindowsSystem` 联动、Jest 覆盖、Playwright 回归
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: 2 → 3 → 4 → 5 → 6 → 8

## Context
### Original Request
- Windows 系统中的开始栏接入 `WindowManager`，显示正在打开的窗口。
- `Window` 组件增加关闭按钮。
- 执行阶段先新建独立分支。

### Interview Summary
- 开始栏窗口项行为固定为“仅显示 + 激活”，不做最小化切换。
- 关闭语义固定为“从 `WindowManager` 打开列表移除并卸载”。
- 测试策略固定为“先实现，再补 Jest + Playwright 自动化覆盖”。
- 分支方案固定为独立功能分支，不使用 worktree。
- 明确排除：最小化、任务栏分组、系统托盘、开始菜单内容改造。

### Metis Review (gaps addressed)
- 强制使用稳定运行时 `windowId`，禁止依赖构造器名或标题文本做身份标识。
- `WindowManager` 只新增两类运行时状态：`openWindows` 与 `activeWindowId`，禁止顺手引入 `minimized` / `maximized` / `hidden`。
- 关闭当前激活窗口后的回退规则固定为“激活最近一次处于激活态的剩余窗口；若无则设为 `null`”。
- 激活来源固定为两处：开始栏点击、窗口框体/标题栏交互。
- 关闭按钮事件必须与拖拽隔离，不能触发窗口移动。

## Work Objectives
### Core Objective
- 为 Windows 系统补齐一套最小可用的窗口运行时状态：打开窗口列表、激活窗口、关闭窗口，并由 `CStartBar` 消费该状态。

### Deliverables
- `CWindowManager`：维护 `openWindows` + `activeWindowId`，并向子窗口与开始栏暴露派生数据与操作。
- `CWindow`：新增 `windowId`、`windowLabel`、`active`、`onActivate`、`onRequestClose` 等受控接口。
- `CWindowTitle`：仅在接收到 `onRequestClose` 时渲染关闭按钮，按钮 `data-testid` 固定为 `window-title-close-{windowId}`。
- `CStartBar`：新增窗口列表区，窗口项 `data-testid` 固定为 `{rootTestId}-window-{windowId}`，点击触发激活，当前激活项使用 `aria-pressed="true"`。
- `WindowsSystem`：为引导窗口显式提供 `windowId="windows-main"` 与 `windowLabel`，并把开始栏窗口列表接到 `WindowManager` 派生状态。
- Win98 / WinXP 主题：补齐开始栏窗口项与关闭按钮样式。

### Definition of Done (verifiable conditions with commands)
- `git branch --show-current` 输出 `feat/windows-start-bar-windowmanager`。
- `npx jest tests/WindowManager.test.tsx tests/StartBar.test.tsx tests/CWindowTitleComposition.test.tsx --runInBand` 全绿。
- `npx playwright test tests/ui/start-bar.spec.ts tests/ui/window.move.spec.ts tests/ui/window.resize.spec.ts --project=chromium` 全绿。
- `yarn lint` 通过。
- `yarn build` 通过。

### Must Have
- 开始栏显示所有打开窗口，且一项对应一个运行时窗口实例。
- 新打开或 newly-mounted 窗口默认成为激活窗口。
- 点击开始栏中的非激活窗口项：对应窗口变为激活态，并在渲染顺序上置顶。
- 点击已激活窗口项：不切换、不最小化、不关闭，保持幂等。
- 点击窗口标题栏或窗口框体：对应窗口变为激活态。
- 点击关闭按钮：仅移除对应窗口与对应开始栏项。
- 关闭当前激活窗口：激活上一个最近激活的剩余窗口；如果没有剩余窗口，`activeWindowId` 设为 `null`。
- 保持现有拖拽与八方向缩放行为不回归。

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不得新增最小化、最大化、恢复、持久化、任务栏分组、托盘、图标徽标。
- 不得把开始栏变成状态源；开始栏只能消费 `WindowManager` 的派生状态。
- 不得依赖 `WindowCtor.name`、标题文字或数组下标来标识运行时窗口。
- 不得因关闭按钮引入拖拽串扰或标题栏布局重构。
- 不得改造默认系统（`default`）以显示开始栏。

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after + Jest 29 / React Testing Library / Playwright Chromium
- QA policy: 每个任务都包含 agent-executed 场景；所有证据写入 `.sisyphus/evidence/`
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Maximize safe parallelism. When hard blockers exist, smaller waves are REQUIRED rather than optional.
> Treat dependency order as authoritative; never start a task before every listed blocker is complete.

Wave 1: 1) branch preflight, 2) manager runtime records

Wave 2: 3) active-state ordering, 4) window/title close contract

Wave 3: 5) start-bar window list UI

Wave 4: 6) WindowsSystem wiring, 7) theme styling

Wave 5: 8) Playwright + regression wave

### Dependency Matrix (full, all tasks)
- 1 blocks 2-8
- 2 blocks 3, 4, 5, 6, 8
- 3 blocks 5, 6, 8
- 4 blocks 6, 8
- 5 blocks 6, 7, 8
- 6 blocks 8
- 7 blocks 8
- 8 blocks Final Verification Wave only

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 2 tasks → `quick` ×1, `unspecified-high` ×1
- Wave 2 → 2 tasks → `unspecified-high` ×1, `unspecified-low` ×1
- Wave 3 → 1 task → `visual-engineering` ×1
- Wave 4 → 2 tasks → `unspecified-low` ×1, `visual-engineering` ×1
- Wave 5 → 1 task → `unspecified-high` ×1

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Create feature branch and capture clean baseline

  **What to do**: 基于当前分支创建 `feat/windows-start-bar-windowmanager`；记录 `git status --short`、`git branch --show-current` 与基线测试命令输出路径，确保实现从隔离分支开始。
  **Must NOT do**: 不得修改 git config；不得 push；不得在脏工作树上强行开分支。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 纯 git/基线准备，低复杂度。
  - Skills: [`git-master`] — 需要安全分支操作与原子提交流程。
  - Omitted: [`frontend-ui-ux`] — 本任务不涉及界面实现。

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 5, 6, 7, 8 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `package.json:21` — 项目标准命令入口。
  - Pattern: `.github/workflows/ci-pr.yml:16` — CI 基线要求是 lint → jest → playwright → build → pack。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `git branch --show-current` 输出 `feat/windows-start-bar-windowmanager`
  - [ ] `git status --short` 不包含意外未跟踪变更（仅允许本需求相关文件）

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Feature branch baseline
    Tool: Bash
    Steps: 运行 `git checkout -b feat/windows-start-bar-windowmanager`；随后运行 `git branch --show-current` 与 `git status --short`
    Expected: 当前分支为 `feat/windows-start-bar-windowmanager`；状态输出仅包含实现前已知工作区内容，无额外异常
    Evidence: .sisyphus/evidence/task-1-branch-baseline.txt

  Scenario: Baseline commands discoverability
    Tool: Bash
    Steps: 运行 `yarn lint --help`、`yarn test --help`、`yarn test:ui --help`
    Expected: 三个命令均可解析，未出现脚本缺失错误
    Evidence: .sisyphus/evidence/task-1-command-baseline.txt
  ```

  **Commit**: NO | Message: `chore(branch): create feature branch` | Files: none

- [ ] 2. Replace constructor-only registry with stable runtime window records

  **What to do**: 在 `CWindowManager` 中引入运行时窗口记录模型，固定字段为 `{ windowId, windowLabel, element, activeOrder }`；直接子元素为 `CWindow` 时，从 `CWindowProps.windowId` 与 `CWindowProps.windowLabel` 读取稳定身份与显示标签；保留 `addWindow(windowCtor)` 兼容路径，但兼容路径只允许单实例 fallback，自动使用 `windowCtor.name` 作为回退标签，且生成内部 `windowId`。不要把 `StartBar` 或 `WindowsSystem` 变成状态源。
  **Must NOT do**: 不得引入 `minimized` / `hidden` / `maximized` 字段；不得继续用 `WindowCtor.name` 作为直接子元素的身份键。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要重塑核心状态模型并保留兼容路径。
  - Skills: [] — 现有仓库模式足够，不需要额外技能。
  - Omitted: [`frontend-ui-ux`] — 核心是状态建模而非视觉实现。

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3, 4, 5, 6, 8 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Window/WindowManager.tsx:11` — 当前构造器集合 / 元素缓存实现起点。
  - Pattern: `src/components/Window/WindowManager.tsx:25` — 现有 `addWindow(windowCtor)` 兼容入口必须保留。
  - Pattern: `src/components/Window/WindowManager.tsx:35` — 当前 children 注册逻辑需要升级为运行时记录解析。
  - API/Type: `src/components/Window/Window.tsx:15` — `CWindowProps` 是新增 `windowId` / `windowLabel` 的宿主位置。
  - Test: `tests/WindowManager.test.tsx:26` — 现有注册/去重测试模式。
  - Test: `tests/WindowManager.test.tsx:107` — 相同构造器收到新 props 时的缓存更新模式。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npx jest tests/WindowManager.test.tsx --runInBand` 覆盖并验证：显式 `windowId` 被采用、兼容 `addWindow(windowCtor)` 仍可工作、同标题多实例可被不同 `windowId` 区分
  - [ ] `CWindowManager` 内部只维护 `openWindows` 与 `activeWindowId` 两类运行时状态

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Manager records explicit window ids
    Tool: Bash
    Steps: 运行 `npx jest tests/WindowManager.test.tsx --runInBand --testNamePattern="window id|runtime|label|duplicate"`
    Expected: 新增单测证明两个相同标题窗口仍可按不同 `windowId` 分别渲染与寻址
    Evidence: .sisyphus/evidence/task-2-window-manager-runtime.txt

  Scenario: Legacy addWindow compatibility
    Tool: Bash
    Steps: 运行 `npx jest tests/WindowManager.test.tsx --runInBand --testNamePattern="addWindow|constructor"`
    Expected: 既有 `addWindow(windowCtor)` 相关测试继续通过，无回归
    Evidence: .sisyphus/evidence/task-2-window-manager-compat.txt
  ```

  **Commit**: YES | Message: `feat(window-manager): add runtime window records` | Files: `src/components/Window/WindowManager.tsx`, `tests/WindowManager.test.tsx`

- [ ] 3. Add activation state, ordering, and fallback semantics to WindowManager

  **What to do**: 为 `CWindowManager` 增加 `activateWindow(windowId)` 与 `closeWindow(windowId)` 行为；窗口 mount / add 后默认激活；激活某窗口时更新 `activeWindowId` 并把该窗口渲染到最后（确保视觉置顶）；关闭激活窗口时按最近激活顺序回退到前一个剩余窗口；关闭最后一个窗口后 `activeWindowId` 为 `null`。向受控子窗口注入 `active`、`onActivate`、`onRequestClose`。
  **Must NOT do**: 不得把“点击已激活任务栏项”实现成最小化；不得把关闭逻辑下放到 `StartBar`。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 涉及交互状态、一致性和渲染顺序。
  - Skills: [] — 逻辑在本仓库内闭合。
  - Omitted: [`git-master`] — 与 git 无关。

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 5, 6, 8 | Blocked By: 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Window/WindowManager.tsx:77` — 当前渲染窗口数组的地方要改成“活动窗口最后渲染”。
  - API/Type: `src/components/Window/Window.tsx:432` — `CWindow` 可通过 clone 注入受控 props 并保留现有 frame 渲染。
  - Test: `tests/WindowManager.test.tsx:49` — 适合扩展 manager ref API 测试。
  - Test: `tests/WindowManager.test.tsx:107` — 适合扩展 active/fallback 更新断言。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npx jest tests/WindowManager.test.tsx --runInBand` 覆盖并验证：默认激活、显式激活、点击已激活项无副作用、关闭激活窗口的 fallback、关闭最后一个窗口得到 `null`
  - [ ] 受控子窗口能收到 `active`、`onActivate`、`onRequestClose`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Active window ordering and fallback
    Tool: Bash
    Steps: 运行 `npx jest tests/WindowManager.test.tsx --runInBand --testNamePattern="active|fallback|close"`
    Expected: 新增测试断言 active 窗口最后渲染，关闭当前 active 后回退到最近一次 active 的剩余窗口
    Evidence: .sisyphus/evidence/task-3-window-manager-active.txt

  Scenario: Active no-op on same target
    Tool: Bash
    Steps: 运行 `npx jest tests/WindowManager.test.tsx --runInBand --testNamePattern="no-op|already active"`
    Expected: 激活已激活窗口不会新增排序写入，也不会改变 open windows 数量
    Evidence: .sisyphus/evidence/task-3-window-manager-noop.txt
  ```

  **Commit**: YES | Message: `feat(window-manager): add activate and close semantics` | Files: `src/components/Window/WindowManager.tsx`, `tests/WindowManager.test.tsx`

- [ ] 4. Extend CWindow and CWindowTitle with close-button and activation hooks

  **What to do**: 在 `CWindowProps` 中新增 `windowId`, `windowLabel`, `active`, `onActivate`, `onRequestClose`；在 `CWindow` 的 frame 根节点上增加 `data-window-id` 与 `data-active`，并在 `pointerdown` / 标题栏拖拽开始前调用 `onActivate`；在 `mapComposedChildren()` 中向 `CWindowTitle` 注入 `windowId`、`active`、`onRequestClose`；在 `CWindowTitle` 中仅当 `onRequestClose` 存在时渲染关闭按钮，按钮 test id 固定为 `window-title-close-{windowId}`，并在 `pointerdown` / `click` 上阻止冒泡，避免拖拽启动。
  **Must NOT do**: 不得隐式插入 `CWindowTitle`；不得让关闭按钮点击触发 `onWindowMove`；不得改掉现有 resize handle 结构。

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: 以现有 clone/composition 模式局部增强，范围明确。
  - Skills: [] — 无额外技能依赖。
  - Omitted: [`frontend-ui-ux`] — 主要是行为与 API，非视觉决策。

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 6, 8 | Blocked By: 2

  **References** (executor has NO interview context — be exhaustive):
  - API/Type: `src/components/Window/Window.tsx:15` — `CWindowProps` 扩展入口。
  - Pattern: `src/components/Window/Window.tsx:402` — 当前 title child clone 注入点。
  - Pattern: `src/components/Window/Window.tsx:450` — frame 渲染点，适合附加 `data-window-id` / `data-active`。
  - API/Type: `src/components/Window/WindowTitle.tsx:9` — `CWindowTitleProps` 扩展入口。
  - Pattern: `src/components/Window/WindowTitle.tsx:61` — 标题栏 DOM 结构起点，关闭按钮需内聚到这里。
  - Test: `tests/CWindowTitleComposition.test.tsx:66` — 现有拖拽/组合测试基线。
  - Test: `tests/CWindowTitleComposition.test.tsx:120` — 标题栏拖拽不应被关闭按钮破坏。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npx jest tests/CWindowTitleComposition.test.tsx --runInBand` 覆盖并验证：关闭按钮存在、点击仅调用关闭、关闭按钮 pointer 事件不触发拖拽、点击 frame/title 可触发激活
  - [ ] `CWindow` 在未提供 `onRequestClose` 时不渲染关闭按钮，保持兼容

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Close button isolates drag events
    Tool: Bash
    Steps: 运行 `npx jest tests/CWindowTitleComposition.test.tsx --runInBand --testNamePattern="close|drag"`
    Expected: 点击 `window-title-close-{windowId}` 只触发关闭回调；窗口位置不改变
    Evidence: .sisyphus/evidence/task-4-window-close-button.txt

  Scenario: Frame activation callback
    Tool: Bash
    Steps: 运行 `npx jest tests/CWindowTitleComposition.test.tsx --runInBand --testNamePattern="activate|pointer"`
    Expected: 点击标题栏或 frame 能触发 `onActivate`，且不影响既有 resize / move 测试
    Evidence: .sisyphus/evidence/task-4-window-activate.txt
  ```

  **Commit**: YES | Message: `feat(window): add close control and activation hooks` | Files: `src/components/Window/Window.tsx`, `src/components/Window/WindowTitle.tsx`, `tests/CWindowTitleComposition.test.tsx`

- [ ] 5. Render open-window items in CStartBar without changing Start button semantics

  **What to do**: 为 `CStartBarProps` 增加 `windows`, `activeWindowId`, `onWindowSelect`；在 `cm-start-bar__content` 内部新增窗口列表容器，容器 test id 固定为 `{rootTestId}-window-list`；每个窗口项渲染为 `<button type="button">`，test id 固定为 `{rootTestId}-window-{windowId}`，文本取 `windowLabel`；当前激活项设置 `aria-pressed="true"`，非激活项为 `false`；点击激活项时 no-op；原 `children` 继续渲染在窗口列表后方，保证旧用法兼容。
  **Must NOT do**: 不得改变 `Start` 按钮文案默认值、test id、结构顺序；不得让 `children` 消失；不得把 close 逻辑塞进开始栏。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 同时涉及结构、交互和样式契约。
  - Skills: [] — 现有组件模式足够。
  - Omitted: [`git-master`] — 非 git 任务。

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 6, 7, 8 | Blocked By: 2, 3

  **References** (executor has NO interview context — be exhaustive):
  - API/Type: `src/components/StartBar/StartBar.tsx:10` — `CStartBarProps` 扩展入口。
  - Pattern: `src/components/StartBar/StartBar.tsx:41` — root / button / content 的当前 DOM 结构。
  - Test: `tests/StartBar.test.tsx:42` — Start 按钮与 content slot 结构断言。
  - Test: `tests/StartBar.test.tsx:60` — children slot 兼容模式。
  - Test: `tests/StartBar.test.tsx:122` — 文案与默认 test id 断言。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npx jest tests/StartBar.test.tsx --runInBand` 覆盖并验证：窗口列表渲染、激活态标识、点击非激活项触发 `onWindowSelect(windowId)`、点击激活项 no-op、`children` 仍在 content 区展示
  - [ ] 现有 StartBar 单测全部继续通过

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: StartBar window list behavior
    Tool: Bash
    Steps: 运行 `npx jest tests/StartBar.test.tsx --runInBand --testNamePattern="window|active|select|children"`
    Expected: 新增测试证明窗口项文本、test id、aria-pressed 与选择回调都符合约定
    Evidence: .sisyphus/evidence/task-5-start-bar-window-list.txt

  Scenario: Start button regression safety
    Tool: Bash
    Steps: 运行 `npx jest tests/StartBar.test.tsx --runInBand --testNamePattern="default|label|structure|package entry"`
    Expected: 既有 Start 按钮结构、默认 test id 与导出行为全部无回归
    Evidence: .sisyphus/evidence/task-5-start-bar-regression.txt
  ```

  **Commit**: YES | Message: `feat(start-bar): render open windows and activation state` | Files: `src/components/StartBar/StartBar.tsx`, `tests/StartBar.test.tsx`

- [ ] 6. Wire WindowsSystem to manager-owned window state and StartBar consumption

  **What to do**: 在 `WindowsSystem` 中把 boot window 元数据扩展为明确的 `windowId` 与 `windowLabel`；在 `CWindowManager` 与 `CStartBar` 之间建立单向数据流：由 `CWindowManager` 暴露派生 open-window 列表与激活操作，`WindowsSystem` 负责把这些数据喂给 `CStartBar`；对 boot 窗口传入 `windowId="windows-main"`、`windowLabel={bootLayout.title}`、`onRequestClose`。关闭后开始栏项与窗口一并消失；默认系统仍不渲染开始栏。
  **Must NOT do**: 不得在 `WindowsSystem` 内再维护第二份 active/open 状态；不得让默认系统路径显示开始栏。

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: 集成 wiring 明确，但要保持系统壳层简洁。
  - Skills: [] — 无额外技能依赖。
  - Omitted: [`frontend-ui-ux`] — 不是视觉设计主任务。

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: 8 | Blocked By: 3, 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/system/windows/WindowsSystem.tsx:25` — boot layout 元数据扩展入口。
  - Pattern: `src/system/windows/WindowsSystem.tsx:41` — 当前 Windows 系统壳层组合入口。
  - API/Type: `src/components/StartBar/StartBar.tsx:10` — 开始栏消费窗口派生状态的 props。
  - API/Type: `src/components/Window/WindowManager.tsx:11` — manager 对外暴露派生状态/操作的宿主。
  - Test: `tests/ui/start-bar.spec.ts:23` — 当前 Windows / default system 切换行为必须保持。
  - Test: `tests/ui/window.helpers.ts:91` — `gotoWindowSelection` 是 Windows system E2E 入口。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npx jest tests/StartBar.test.tsx tests/WindowManager.test.tsx tests/CWindowTitleComposition.test.tsx --runInBand` 在集成 wiring 完成后仍全绿
  - [ ] `npx playwright test tests/ui/start-bar.spec.ts --project=chromium` 证明 Windows 系统显示开始栏，default system 仍不显示

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Windows system boot window appears in StartBar
    Tool: Bash
    Steps: 运行 `npx playwright test tests/ui/start-bar.spec.ts --project=chromium --grep "start bar"`
    Expected: `windows-start-bar-window-list` 可见，包含 `windows-start-bar-window-windows-main`，按钮文本为 `Windows Window`
    Evidence: .sisyphus/evidence/task-6-windows-system-start-bar.txt

  Scenario: Default system remains unchanged
    Tool: Bash
    Steps: 在同一条 Playwright 用例中切到 `systemType=default&theme=default`
    Expected: `windows-start-bar` 与任何 `*-window-list` 项都不存在
    Evidence: .sisyphus/evidence/task-6-default-system-regression.txt
  ```

  **Commit**: YES | Message: `feat(windows-system): connect start bar to manager state` | Files: `src/system/windows/WindowsSystem.tsx`, `src/components/Window/WindowManager.tsx`, `src/components/StartBar/StartBar.tsx`

- [ ] 7. Add Win98 and WinXP styles for taskbar items and title close control

  **What to do**: 在 `win98` 与 `winxp` 主题样式中新增 `.cm-start-bar__window-list`, `.cm-start-bar__window-item`, `.cm-start-bar__window-item[aria-pressed='true']`, `.cm-window__title-close` 等类；Win98 保持经典 beveled 风格，WinXP 保持圆角渐变风格；开始栏内容区仍保留现有文字颜色继承。关闭按钮需要在 hover / active / focus-visible 下有清晰状态，但不引入额外主题 token。
  **Must NOT do**: 不得大改现有 Start 按钮视觉；不得改 default theme；不得新增 CSS-in-JS。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 纯样式与视觉状态实现。
  - Skills: [] — 现有 SCSS 结构足够。
  - Omitted: [`git-master`] — 无 git 操作。

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: 8 | Blocked By: 5

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/theme/win98/styles/index.scss:185` — Win98 start bar 现有样式起点。
  - Pattern: `src/theme/winxp/styles/index.scss:224` — WinXP start bar 现有样式起点。
  - API/Type: `src/components/StartBar/StartBar.tsx:58` — 新窗口列表 DOM 将落在 start bar root 下。
  - API/Type: `src/components/Window/WindowTitle.tsx:61` — 关闭按钮 DOM 将落在标题栏内。
  - Test: `tests/ui/start-bar.spec.ts:38` — 现有主题可见性与背景断言需要继续保留。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npx playwright test tests/ui/start-bar.spec.ts --project=chromium` 覆盖并验证：Win98 / WinXP 下开始栏窗口项可见，active 样式可区分，背景主样式不回归
  - [ ] `yarn build` 在 SCSS 修改后继续通过

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Win98 and WinXP taskbar item states
    Tool: Bash
    Steps: 运行 `npx playwright test tests/ui/start-bar.spec.ts --project=chromium`
    Expected: 两个主题下都能看到开始栏窗口项；active 项视觉与非 active 项不同；Start 按钮仍可见
    Evidence: .sisyphus/evidence/task-7-theme-start-bar-states.txt

  Scenario: Build after style changes
    Tool: Bash
    Steps: 运行 `yarn build`
    Expected: 构建成功，未出现 Sass 或类型打包错误
    Evidence: .sisyphus/evidence/task-7-build.txt
  ```

  **Commit**: YES | Message: `style(windows): add start bar item and close button styles` | Files: `src/theme/win98/styles/index.scss`, `src/theme/winxp/styles/index.scss`

- [ ] 8. Add Playwright flows for activation, close removal, and drag/resize regression

  **What to do**: 扩展 `tests/ui/start-bar.spec.ts`，新增以下自动化场景：Windows system 下开始栏显示 boot 窗口项；点击该窗口项将对应 frame 标记为 active 并置顶；点击 `window-title-close-windows-main` 后窗口 frame 与开始栏项一并消失。保留并执行 `tests/ui/window.move.spec.ts` 与 `tests/ui/window.resize.spec.ts` 回归。若需要，复用 `tests/ui/window.helpers.ts` 中现有 `gotoWindowSelection`, `dragLocatorBy`, `readFrameMetrics`，不要新造浏览器辅助层。
  **Must NOT do**: 不得把手工验证写成验收标准；不得忽略现有拖拽/缩放回归。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要把新交互与既有 E2E harness 串起来并防止回归。
  - Skills: [] — 当前 Playwright 基础已足够。
  - Omitted: [`playwright`] — 计划中只描述执行方式，不需额外技能选择。

  **Parallelization**: Can Parallel: NO | Wave 5 | Blocks: Final Verification Wave only | Blocked By: 2, 3, 4, 5, 6, 7

  **References** (executor has NO interview context — be exhaustive):
  - Test: `tests/ui/start-bar.spec.ts:23` — StartBar E2E 现有入口，直接扩展。
  - Test: `tests/ui/window.helpers.ts:91` — 进入 Windows system 选择页的稳定方法。
  - Test: `tests/ui/window.helpers.ts:122` — frame 位置度量工具，适合回归置顶/位置不变断言。
  - Test: `tests/ui/window.helpers.ts:142` — 拖拽辅助必须复用，避免自写低质量鼠标步骤。
  - Test: `tests/ui/window.move.spec.ts:1` — 标题栏拖拽回归。
  - Test: `tests/ui/window.resize.spec.ts:1` — 八方向缩放回归。

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npx playwright test tests/ui/start-bar.spec.ts --project=chromium` 覆盖并验证：开始栏显示窗口项、点击窗口项激活、关闭后 frame 与窗口项同时消失
  - [ ] `npx playwright test tests/ui/window.move.spec.ts tests/ui/window.resize.spec.ts --project=chromium` 继续全绿
  - [ ] `yarn lint` 与 `yarn build` 在 E2E 改动后继续通过

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Activate and close from StartBar flow
    Tool: Bash
    Steps: 运行 `npx playwright test tests/ui/start-bar.spec.ts --project=chromium`
    Expected: `windows-start-bar-window-windows-main` 可点击；点击后 `window-frame[data-active="true"]` 存在；点击 `window-title-close-windows-main` 后 frame 与开始栏项同时为 0 个
    Evidence: .sisyphus/evidence/task-8-start-bar-e2e.txt

  Scenario: Drag/resize regressions stay green
    Tool: Bash
    Steps: 运行 `npx playwright test tests/ui/window.move.spec.ts tests/ui/window.resize.spec.ts --project=chromium`
    Expected: 既有拖拽与缩放 spec 全部通过，无因 active/close 接入导致的交互回归
    Evidence: .sisyphus/evidence/task-8-window-regressions.txt
  ```

  **Commit**: YES | Message: `test(ui): cover taskbar activation and close flow` | Files: `tests/ui/start-bar.spec.ts`, `tests/ui/window.move.spec.ts`, `tests/ui/window.resize.spec.ts`, `tests/ui/window.helpers.ts`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle

  **What to do**: 让 `oracle` 对照计划文件、最终 diff、验证产物，逐项检查 1-8 号任务与验收标准是否全部兑现；若发现偏差，输出阻塞项编号与修复建议。
  **Acceptance Criteria**:
  - [ ] `oracle` 明确返回 `APPROVE` 或等价批准结论；若拒绝，必须附带可执行修复项
  - [ ] 审查结果逐项覆盖任务 1-8 与 Final Verification Wave，不允许只审最近改动
  **QA Scenarios**:
  ```
  Scenario: Full plan compliance audit
    Tool: task (oracle)
    Steps: Invoke `task(subagent_type="oracle", load_skills=[], run_in_background=false, prompt="Audit implemented changes against .sisyphus/plans/windows-start-bar-windowmanager.md. Return APPROVE or REJECT with numbered findings.")`
    Expected: 明确输出 APPROVE；若为 REJECT，列出编号化缺口，且执行流回到修复阶段
    Evidence: .sisyphus/evidence/f1-plan-compliance.md

  Scenario: Missing acceptance criteria guard
    Tool: task (oracle)
    Steps: 要求审查报告单独列出“未满足的 Acceptance Criteria”小节，并核对是否为空
    Expected: “未满足”列表为空；非空则视为失败，不得进入交付
    Evidence: .sisyphus/evidence/f1-plan-compliance-guard.md
  ```

  **Commit**: NO | Message: `n/a` | Files: none

- [ ] F2. Code Quality Review — unspecified-high

  **What to do**: 让高强度审查代理检查类型边界、状态归属、事件隔离、回归风险与测试质量；重点确认没有把状态错误地下沉到 `StartBar`，没有引入最小化/最大化等超范围状态。
  **Acceptance Criteria**:
  - [ ] 审查明确确认 `windowId` 是唯一运行时身份，且未使用标题或构造器名做 identity
  - [ ] 审查明确确认 `StartBar` 仅消费状态，`WindowManager`/系统壳层持有状态
  **QA Scenarios**:
  ```
  Scenario: Architecture and code-quality review
    Tool: task (unspecified-high)
    Steps: Invoke `task(category="unspecified-high", load_skills=[], run_in_background=false, description="Review window integration", prompt="Review the implementation for state ownership, event isolation, duplicate-title safety, and regression risk against .sisyphus/plans/windows-start-bar-windowmanager.md. Return APPROVE or REJECT with numbered findings.")`
    Expected: 明确输出 APPROVE；报告确认未引入 minimize/maximize/persistence 等越界行为
    Evidence: .sisyphus/evidence/f2-code-quality.md

  Scenario: Close-button event isolation review
    Tool: task (unspecified-high)
    Steps: 要求报告单独核对关闭按钮不会触发 title drag/start-drag，并检查相关测试是否存在
    Expected: 报告明确写出“event isolation verified”或等价结论；否则视为失败
    Evidence: .sisyphus/evidence/f2-code-quality-event-isolation.md
  ```

  **Commit**: NO | Message: `n/a` | Files: none

- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)

  **What to do**: 在浏览器里执行真实交互验收，覆盖开始栏窗口项渲染、窗口激活、关闭移除、重复标题安全、以及 drag/resize 不回归；所有结果必须有 Playwright 或命令输出证据。
  **Acceptance Criteria**:
  - [ ] `tests/ui/start-bar.spec.ts` 通过并覆盖开始栏激活与关闭流
  - [ ] `tests/ui/window.move.spec.ts` 与 `tests/ui/window.resize.spec.ts` 通过，证明交互未回归
  **QA Scenarios**:
  ```
  Scenario: Browser acceptance sweep
    Tool: Bash
    Steps: Run `npx playwright test tests/ui/start-bar.spec.ts --project=chromium`
    Expected: 退出码为 0，且报告显示任务栏激活、关闭移除相关用例全部通过
    Evidence: .sisyphus/evidence/f3-playwright-start-bar.txt

  Scenario: Drag/resize regression sweep
    Tool: Bash
    Steps: Run `npx playwright test tests/ui/window.move.spec.ts tests/ui/window.resize.spec.ts --project=chromium`
    Expected: 退出码为 0，且无新增失败用例；若失败则回到实现修复
    Evidence: .sisyphus/evidence/f3-playwright-regressions.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: none

- [ ] F4. Scope Fidelity Check — deep

  **What to do**: 让 `deep` 代理核对最终改动是否严格落在需求范围内：只实现开始栏显示+激活、关闭按钮、以及 `WindowManager` 接线；不得夹带最小化、开始菜单增强、托盘、持久化或其他桌面能力。
  **Acceptance Criteria**:
  - [ ] 审查明确确认所有新增能力均可映射回原始需求或已确认默认值
  - [ ] 审查明确确认不存在超范围 API、状态字段、视觉控件或未要求的交互
  **QA Scenarios**:
  ```
  Scenario: Scope fidelity audit
    Tool: task (deep)
    Steps: Invoke `task(category="deep", load_skills=[], run_in_background=false, description="Check scope fidelity", prompt="Audit the final diff against the original request and .sisyphus/plans/windows-start-bar-windowmanager.md. Return APPROVE only if the implementation stays within scope and all defaults are honored.")`
    Expected: 明确输出 APPROVE；若发现超范围内容，逐项列出并要求回滚/修复
    Evidence: .sisyphus/evidence/f4-scope-fidelity.md

  Scenario: Out-of-scope feature guard
    Tool: task (deep)
    Steps: 要求报告单独检查 minimize/maximize/restore/tray/persistence/start-menu enhancement 是否被引入
    Expected: 报告明确写出这些能力均未引入；任一项出现即失败
    Evidence: .sisyphus/evidence/f4-scope-fidelity-guard.md
  ```

  **Commit**: NO | Message: `n/a` | Files: none

## Commit Strategy
- `feat(window-manager): add runtime window records`
- `feat(window-manager): add activate and close semantics`
- `feat(window): add close control and activation hooks`
- `feat(start-bar): render open windows and activation state`
- `feat(windows-system): connect start bar to manager state`
- `style(windows): add start bar item and close button styles`
- `test(ui): cover taskbar activation and close flow`

## Success Criteria
- Windows system 下开始栏始终展示当前打开窗口列表，且每个项目与唯一 `windowId` 对应。
- 激活逻辑只有一种：点击开始栏项或窗口交互均把对应窗口置为 active 并渲染在顶层。
- 关闭逻辑只有一种：点击标题栏关闭按钮后立即卸载该窗口并移除对应开始栏项。
- 既有 StartBar、Window drag、Window resize、default system 行为全部保留。
- 全部验证命令可由 agent 执行，无需人工介入。
