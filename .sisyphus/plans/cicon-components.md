# CIcon 与 CIconContainer 实施计划

## TL;DR
> **Summary**: 为组件库新增 `CIcon` 与 `CIconContainer`，采用“容器托管状态 + 单图标拖拽”方案，复用现有 Theme / 组合组件 / Window 拖拽清理模式，并显式补齐右键与触摸长按语义。
> **Deliverables**:
> - `CIcon` 组件、类型与样式
> - `CIconContainer` 容器组件、内部拖拽协调与长按逻辑
> - 组件导出、dev catalog 展示、Jest + Playwright 覆盖
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 → 4 → 5 → 6

## Context
### Original Request
新增 `CIcon` 与 `CIconContainer`。`CIcon` 需要支持 `title`、`icon`（图片或 SVG）、`active`、`onActive`、`activeTrigger`（`click` / `hover`）、`onDragStart`、`onDrag`、`onDragEnd`、`position`、`onContextMenu`（右键或触摸长按）、`onOpen`、`openTrigger`（`click` / `doubleClick`）；拖动能力基于 `@system-ui-js/multi-drag`。`CIconContainer` 作为容器，接收 `config`（包含 `position` / `openTrigger` / `activeTrigger`）与 `iconList`（基于 `CIcon` props 类型剔除拖拽相关字段，拖拽由容器内部接管）。

### Interview Summary
- 状态归属：采用**容器托管**模式；`CIconContainer` 负责 active icon 与 position，同步保留 `CIcon` 的受控 props 能力。
- 拖拽范围：仅做**单图标拖拽**、位置更新、拖拽回调透传；明确排除框选、多选联动、吸附、边界约束、重排。
- 测试策略：**先实现后补测试**。
- `icon` 输入模型：`React.ReactNode`。
- `onContextMenu` 语义：桌面端右键 + 触摸端长按共用同一回调。
- 默认裁决：`config` 只提供默认值，单个 icon 显式值优先；坐标系为 container 内容区域左上角绝对定位；`openTrigger='doubleClick'` 时单击只处理 active、不触发 open；右键/长按会先激活目标 icon 再触发 `onContextMenu`；触摸长按默认 500ms，移动超过 6px 取消。

### Metis Review (gaps addressed)
- 已补充**触发优先级**：`active` 与 `open` 拆分；双击打开不会回退成单击打开。
- 已补充**config 优先级**：容器 `config` 只作为默认值，不覆盖单项显式配置。
- 已补充**长按与拖拽竞争规则**：移动超阈值取消长按，开始拖拽后不再触发长按菜单。
- 已补充**清理 guardrail**：参照 `WindowTitle` / `Widget` 的拖拽禁用与事件解绑模式，强制验证卸载中拖拽安全。
- 已补充**scope guardrail**：不扩展到依赖替换、键盘拖拽、桌面菜单系统、持久化或可访问性 overhaul。

## Work Objectives
### Core Objective
在现有组件库模式下新增一套可主题化、可容器托管、支持单图标拖拽与右键/触摸长按菜单入口的图标组件体系，并确保导出、展示、测试、构建链路完整接入。

### Deliverables
- `src/components/Icon/` 目录下的 `CIcon` / `CIconContainer` / 相关类型与 `index.scss`
- 对 `src/components/index.ts` 与 `src/index.ts` 的导出接入
- `src/dev/ComponentCatalog.tsx` 中的 Icon showcase
- `tests/` 下的 Jest 组件行为测试
- `tests/ui/` 下的 Playwright 拖拽 / 双击 / 右键 / 长按验证

### Definition of Done (verifiable conditions with commands)
- `yarn test --runInBand --runTestsByPath tests/Icon.test.tsx tests/IconContainer.test.tsx`
- `yarn test:ui tests/ui/icon-container.interactions.spec.ts`
- `yarn lint`
- `yarn build`

### Must Have
- `CIcon` 使用 `React.ReactNode` 渲染 icon，并支持 title、theme、className 与受控 `active`
- `CIconContainer` 能根据 `iconList` 渲染多个 icon，并托管 active / position
- `activeTrigger` 仅支持 `click | hover`；`openTrigger` 仅支持 `click | doubleClick`
- 右键与触摸长按共用 `onContextMenu`
- 拖拽基于 `@system-ui-js/multi-drag`，并包含 React 生命周期清理
- 显式验证拖拽中卸载/移除安全，不留预览态或抛错

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不新增多选拖拽、框选、吸附、边界限制、排序、持久化
- 不替换 `@system-ui-js/multi-drag` 依赖
- 不把 `touch-action: none` 粗暴施加到整个容器根节点
- 不把 `open` 扩展成内部可视菜单状态管理
- 不引入 `any`、CSS-in-JS、与项目现有目录结构不一致的导出方式

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after + Jest / React Testing Library / Playwright
- QA policy: Every task has agent-executed scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. This feature is bounded, so Wave 1 consolidates core contracts + component surface, then Wave 2 finishes drag integration and repo wiring.

Wave 1: 1) shared contracts & file scaffolding, 2) `CIcon` render surface, 3) `CIcon` interaction semantics, 4) `CIconContainer` state/default merge

Wave 2: 5) drag + long-press integration + teardown safety, 6) exports + catalog + integration verification

### Dependency Matrix (full, all tasks)
- 1 → blocks 2, 3, 4
- 2 → blocks 6
- 3 → blocks 4, 6
- 4 → blocks 5, 6
- 5 → blocks 6
- 6 → final verification wave

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 4 tasks → `quick`, `visual-engineering`, `unspecified-high`
- Wave 2 → 2 tasks → `unspecified-high`, `visual-engineering`
- Final Verification → 4 tasks → `oracle`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

<!-- TASKS_INSERTION_POINT -->

- [x] 1. 定义共享契约与 Icon 目录骨架

  **What to do**: 在 `src/components/Icon/` 下创建 `Icon.tsx`、`IconContainer.tsx`、`index.scss`、`index.ts` 的骨架，并先定义共享类型：`CIconPosition = { x: number; y: number }`、`CIconActiveTrigger = 'click' | 'hover'`、`CIconOpenTrigger = 'click' | 'doubleClick'`、`CIconProps`、`CIconContainerConfig`、`CIconContainerItem`（基于 `CIconProps` 省略 `onDragStart | onDrag | onDragEnd`）。明确容器内部用数组顺序作为单图标拖拽身份，不新增 `id`、不支持重排；同时约定测试/QA 用 `data-testid="icon-container"` 与 `data-testid="icon-item-{index}"`。
  **Must NOT do**: 不提前接入多选/排序能力；不引入额外全局类型文件；不让 `config` 覆盖 iconList 显式值。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 该任务以类型契约与文件骨架为主，变更集中且规则明确
  - Skills: `[]` — 不需要额外技能注入
  - Omitted: `[playwright]` — 浏览器级验证留给后续交互任务

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Button/Button.tsx:9-18` — 简单函数组件 props/interface 的书写方式
  - Pattern: `src/components/Radio/RadioGroup.tsx:6-27` — context value 与 props 类型集中定义的方式
  - Pattern: `src/components/Widget/Widget.tsx:58-61` — 仓库现有位置类型统一采用 `{ x, y }`
  - Pattern: `src/components/index.ts:1-12` — 组件统一导出入口结构
  - API/Type: `src/index.ts:1-6` — 包入口 re-export 模式
  - External: `https://github.com/SystemUI-js/multi-drag/blob/main/src/drag/base.ts#L10-L42` — `Pose` / `Options` / `DragOperationType` 的基础契约

  **Acceptance Criteria** (agent-executable only):
  - [ ] `CIconProps`、`CIconContainerConfig`、`CIconContainerItem` 能被 TypeScript 正确推导，且 `iconList` 项不暴露拖拽回调字段
  - [ ] `CIconPosition` 与容器默认 `config.position` 均固定为 `{ x: number; y: number }`
  - [ ] 新目录骨架创建后 `yarn build` 不因导入循环或类型缺失失败

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Type contracts compile cleanly
    Tool: Bash
    Steps: Run `yarn build`
    Expected: Build exits 0; no TypeScript errors for Icon folder contracts or exports.
    Evidence: .sisyphus/evidence/task-1-icon-contracts.txt

  Scenario: Drag props are excluded from container items
    Tool: Bash
    Steps: Run `yarn test --runInBand --runTestsByPath tests/IconContainer.test.tsx -t "excludes drag callbacks from iconList item contract"`
    Expected: Jest exits 0 and the contract-focused test proves `iconList` items omit `onDragStart`, `onDrag`, and `onDragEnd`.
    Evidence: .sisyphus/evidence/task-1-icon-contracts-error.txt
  ```

  **Commit**: NO | Message: `feat(icon): define shared icon contracts` | Files: `src/components/Icon/*`

- [x] 2. 实现 CIcon 渲染表面与主题样式

  **What to do**: 按 `CButton` 的函数组件模式实现 `CIcon`，支持 `icon: React.ReactNode`、`title`、`className`、`theme`、`active`、`position`、`data-testid`，并在 `index.scss` 中建立 `cm-icon` 基类、active 修饰符、图标内容区与标题区 class。`position` 只负责样式定位表达（如 absolute left/top），不在组件内部产生拖拽状态。对 `icon` 不做 URL/SVG 分支限制，直接渲染 ReactNode。
  **Must NOT do**: 不在 `CIcon` 内部创建拖拽实例；不把容器管理逻辑塞进单组件；不使用 CSS-in-JS。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 需要同时落地组件表面、主题类名与 SCSS 结构
  - Skills: `[]` — 现有模式足够支撑实现
  - Omitted: `[playwright]` — 此任务以组件静态结构和样式契约为主

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Button/Button.tsx:20-55` — `resolveThemeClass` + `mergeClasses` + `data-testid` 的完整写法
  - Pattern: `src/components/Grid/Grid.tsx:40-54` — `ResolvedThemeClassName` / class merge 的 class 组件用法（若容器侧需要）
  - Pattern: `src/components/Window/Window.tsx:96-129` — 绝对定位 frame render 与 test id 的组织方式
  - Test: `tests/Button.test.tsx:19-48` — 原生元素渲染与 modifier class 断言模式
  - Test: `tests/Button.test.tsx:68-120` — theme prop / provider / className 顺序测试模式

  **Acceptance Criteria** (agent-executable only):
  - [ ] `CIcon` 可渲染任意 ReactNode icon 与 title，并输出稳定的 base class / active class / title DOM
  - [ ] `theme` 与 `className` 合并顺序遵循 `base → theme → className`
  - [ ] `position` 被正确映射为定位样式且不影响未提供 position 的普通渲染

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Render icon node, title, and active class
    Tool: Bash
    Steps: Run `yarn test --runInBand --runTestsByPath tests/Icon.test.tsx -t "renders icon node title and active modifier"`
    Expected: Jest exits 0 and assertions verify `.cm-icon`, rendered ReactNode icon content, title text, and active modifier class.
    Evidence: .sisyphus/evidence/task-2-cicon-surface.txt

  Scenario: Theme and position styles stay deterministic
    Tool: Bash
    Steps: Run `yarn test --runInBand --runTestsByPath tests/Icon.test.tsx -t "merges theme class and maps position style"`
    Expected: Jest exits 0 and assertions verify theme precedence plus expected left/top style mapping.
    Evidence: .sisyphus/evidence/task-2-cicon-surface-error.txt
  ```

  **Commit**: NO | Message: `feat(icon): add cicon render surface` | Files: `src/components/Icon/Icon.tsx`, `src/components/Icon/index.scss`, `tests/Icon.test.tsx`

- [x] 3. 实现 CIcon 的 active / open / contextmenu 触发语义

  **What to do**: 为 `CIcon` 添加事件分发规则：`activeTrigger='click'` 时单击触发 `onActive`，`activeTrigger='hover'` 时 `mouseEnter` 触发 `onActive`；`openTrigger='click'` 时单击触发 `onOpen`，`openTrigger='doubleClick'` 时仅双击触发 `onOpen`；桌面端 `contextmenu` 触发前先执行激活，再回调 `onContextMenu`。所有回调必须只在对应 trigger 下触发一次，且不因 disabled/dragging 状态以外的实现细节重复触发。
  **Must NOT do**: 不在 `CIcon` 单组件里实现触摸长按定时器；不让 `doubleClick` 回退成单击 open；不让 hover 在 mouse leave 时自动清空 active。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 交互优先级与回调去重比纯渲染更容易出错
  - Skills: `[]` — 现有测试栈足够
  - Omitted: `[git-master]` — 当前不是 git 操作任务

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/Button.test.tsx:50-66` — click handler 触发/抑制断言模式
  - Pattern: `tests/Radio.test.tsx:73-125` — 受控/非受控与回调优先级测试写法
  - Pattern: `src/components/Window/WindowTitle.tsx:89-169` — pointer 生命周期中对状态与最终提交进行分支控制的方式
  - Test: `tests/CWindowTitleComposition.test.tsx:36-62` — 指针事件 helper 的复用模式

  **Acceptance Criteria** (agent-executable only):
  - [ ] `activeTrigger='click' | 'hover'` 的触发路径互不串线
  - [ ] `openTrigger='doubleClick'` 时单击仅允许 active，不触发 open
  - [ ] 桌面端右键会先激活目标 icon，再触发一次 `onContextMenu`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Single click activates but does not open under doubleClick mode
    Tool: Bash
    Steps: Run `yarn test --runInBand --runTestsByPath tests/Icon.test.tsx -t "single click only activates when open trigger is doubleClick"`
    Expected: Jest exits 0 and assertions show `onActive` called once while `onOpen` remains untouched until `fireEvent.dblClick`.
    Evidence: .sisyphus/evidence/task-3-cicon-triggers.txt

  Scenario: Hover and context menu do not cross-fire unintended callbacks
    Tool: Bash
    Steps: Run `yarn test --runInBand --runTestsByPath tests/Icon.test.tsx -t "hover and context menu follow configured trigger semantics"`
    Expected: Jest exits 0 and assertions verify `mouseEnter` only activates in hover mode, while `contextmenu` activates then fires one `onContextMenu` callback.
    Evidence: .sisyphus/evidence/task-3-cicon-triggers-error.txt
  ```

  **Commit**: YES | Message: `feat(icon): add cicon interaction semantics` | Files: `src/components/Icon/Icon.tsx`, `tests/Icon.test.tsx`

- [x] 4. 实现 CIconContainer 的默认值合并与状态托管

  **What to do**: 实现 `CIconContainer`：接收 `config` 与 `iconList`，以容器内部 state 维护 `activeIndex` 与每项当前位置；渲染时将 `config.position` / `activeTrigger` / `openTrigger` 作为默认值，与单项显式值做“item overrides config” 合并，再把最终 props 下发给 `CIcon`。点击/悬停激活后只更新目标项 active，不影响其他 icon 的位置；右键/长按同样先激活再转发。保持数组顺序稳定映射，不实现重排或 key 迁移逻辑。
  **Must NOT do**: 不把 `config` 当强制覆盖项；不在容器中偷偷维护 open 状态；不让一个 icon 的位置更新污染其他 icon。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 涉及默认值解析、受控/容器托管协作和 item 级状态更新
  - Skills: `[]` — 仓库现有模式可直接借鉴
  - Omitted: `[playwright]` — 先用 Jest 锁定合并与状态语义

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6 | Blocked By: 1, 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Radio/RadioGroup.tsx:36-95` — 容器托管 state、受控优先与 context/provider 组织方式
  - Pattern: `src/components/Window/Window.tsx:82-94` — 父组件为子组件注入交互 props 的方式
  - Pattern: `src/components/Widget/Widget.tsx:219-256` — 使用 position patch 更新局部 frame 的方式
  - Test: `tests/Radio.test.tsx:48-125` — 默认值、受控覆盖与 callback precedence 的测试模式

  **Acceptance Criteria** (agent-executable only):
  - [ ] `config` 仅在 icon 项缺省时生效，单项显式 `position` / `activeTrigger` / `openTrigger` 始终优先
  - [ ] 容器托管 active 时，同一时刻只有目标 icon 处于 active 状态
  - [ ] 更新某个 icon 的 position 时，其他 icon 的 position 不变

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Container defaults merge with per-item overrides deterministically
    Tool: Bash
    Steps: Run `yarn test --runInBand --runTestsByPath tests/IconContainer.test.tsx -t "applies config defaults and respects per-item overrides"`
    Expected: Jest exits 0 and assertions verify config values fill gaps only, while explicit item values win.
    Evidence: .sisyphus/evidence/task-4-icon-container-state.txt

  Scenario: Activating one icon does not mutate sibling positions
    Tool: Bash
    Steps: Run `yarn test --runInBand --runTestsByPath tests/IconContainer.test.tsx -t "tracks active icon without mutating sibling positions"`
    Expected: Jest exits 0 and assertions verify only the targeted item becomes active; sibling style positions remain unchanged.
    Evidence: .sisyphus/evidence/task-4-icon-container-state-error.txt
  ```

  **Commit**: YES | Message: `feat(icon-container): add managed icon container state` | Files: `src/components/Icon/IconContainer.tsx`, `tests/IconContainer.test.tsx`

- [x] 5. 集成 multi-drag、触摸长按与卸载清理保护

  **What to do**: 在 `CIconContainer` 内隔离拖拽集成：为每个 icon root 绑定 `@system-ui-js/multi-drag` 的 `Drag` 实例，拖拽基于容器相对坐标更新目标项 position，并透传 `onDragStart` / `onDrag` / `onDragEnd`。针对库约束补上 React 清理：组件卸载、iconList 缩减、active drag 中止时都必须 `setDisabled()`、解绑 pointer listener、清除长按 timer。触摸端实现自定义 long-press（500ms / 6px 阈值），仅在 `pointerType === 'touch'` 且未触发拖拽时调用 `onContextMenu`；一旦移动超阈值、pointerup、pointercancel 或 unmount，必须取消长按。仅对 icon 可拖拽热点设置最小化 `touch-action: none`，不要扩散到整个容器。
  **Must NOT do**: 不依赖 multi-drag 的私有销毁行为；不把 native context menu 与自定义长按混在一起重复触发；不让 drag/long-press timer 在卸载后继续回调。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 第三方拖拽库无 React 封装，生命周期与触摸竞争条件风险最高
  - Skills: `[]` — 需要严格按现有 Window/Widget 模式手工落地
  - Omitted: `[frontend-ui-ux]` — 此任务核心是交互安全与清理，而非视觉打磨

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 6 | Blocked By: 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Window/WindowTitle.tsx:30-67` — mount/unmount 中启停 Drag、清理状态与禁用实例
  - Pattern: `src/components/Window/WindowTitle.tsx:89-169` — pointerDown / pointerCancel / end commit 的优先级处理
  - Pattern: `src/components/Widget/Widget.tsx:154-171` — 组件级 setup/cleanup 生命周期入口
  - Pattern: `src/components/Widget/Widget.tsx:206-217` — `Pose` 到当前位置的映射方式
  - Pattern: `src/components/Widget/Widget.tsx:613-697` — `Drag` 实例注册、`setDisabled()`、事件解绑、防残留预览的完整清理模式
  - Test: `tests/CWindowTitleComposition.test.tsx:499-546` — 拖拽进行中卸载后不抛错的验证方式
  - Test: `tests/ui/window.move.spec.ts:13-62` — Playwright 拖拽与 outline/live 结果断言方式
  - External: `https://github.com/SystemUI-js/multi-drag/blob/main/src/drag/base.ts#L398-L420` — `DragOperationType` 事件生命周期
  - External: `https://github.com/SystemUI-js/multi-drag/blob/main/src/drag/base.ts#L154-L167` — Pointer Events / touchAction 行为与鼠标按键限制

  **Acceptance Criteria** (agent-executable only):
  - [ ] 拖拽一个 icon 只更新该项位置，并按顺序调用 `onDragStart` → `onDrag` → `onDragEnd`
  - [ ] 触摸长按在 500ms 内未移动超过 6px 时触发一次 `onContextMenu`；若移动超阈值则取消长按且允许拖拽接管
  - [ ] 容器卸载、图标移除、pointercancel、late pointer events 都不会抛错或残留激活中的 drag/timer 状态

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Drag updates only one icon and emits lifecycle callbacks
    Tool: Playwright
    Steps: Run `yarn test:ui tests/ui/icon-container.interactions.spec.ts -g "drag moves only the targeted icon"`; use `[data-testid="icon-item-0"]` as drag source inside `[data-testid="icon-container"]`.
    Expected: Playwright exits 0; the target icon's left/top change, sibling icon metrics stay unchanged, and the test records `onDragStart`, `onDrag`, `onDragEnd` in order.
    Evidence: .sisyphus/evidence/task-5-icon-drag.png

  Scenario: Long press cancels on movement and cleanup survives unmount
    Tool: Bash
    Steps: Run `yarn test --runInBand --runTestsByPath tests/IconContainer.test.tsx -t "cancels long press on movement and tears down active drag on unmount"`
    Expected: Jest exits 0 and assertions verify no `onContextMenu` after threshold-crossing move, plus no throw on unmount followed by late pointer events.
    Evidence: .sisyphus/evidence/task-5-icon-drag-error.txt
  ```

  **Commit**: YES | Message: `feat(icon-container): integrate drag and long press` | Files: `src/components/Icon/IconContainer.tsx`, `tests/IconContainer.test.tsx`, `tests/ui/icon-container.interactions.spec.ts`

- [x] 6. 接入导出、Catalog 展示与全链路验证

  **What to do**: 将 `CIcon` / `CIconContainer` 接入 `src/components/index.ts` 与 `src/index.ts`；在 `src/dev/ComponentCatalog.tsx` 新增 Icon showcase，展示 click/hover active、click/doubleClick open、右键/触摸长按、拖拽后的坐标更新，并使用前述 `data-testid` 命名供 Playwright 复用。补齐 package entry 测试、catalog 展示测试、Jest 集成测试与 Playwright 交互测试，确保最终命令 `yarn test`、`yarn test:ui`、`yarn lint`、`yarn build` 全通过。
  **Must NOT do**: 不仅在 dev catalog 手工演示而缺少自动化断言；不漏接包入口导出；不引入新的 demo-only 逻辑污染组件 API。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 需要同步处理对外导出、开发展示、测试夹具与交互可见性
  - Skills: `[]` — 现有 catalog 模式足够
  - Omitted: `[git-master]` — 非仓库管理任务

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Final Verification | Blocked By: 2, 3, 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/index.ts:1-12` — 组件目录聚合导出方式
  - Pattern: `src/index.ts:1-6` — 包入口双重导出方式
  - Pattern: `src/dev/ComponentCatalog.tsx:35-54` — `ShowcaseSection` 结构与 code snippet 挂载方式
  - Pattern: `src/dev/ComponentCatalog.tsx:254-274` — 交互型 showcase 的组织方式
  - Pattern: `src/dev/ComponentCatalog.tsx:382-393` — 将新 showcase 注入 catalog 列表的位置
  - Test: `tests/Button.test.tsx:7-17` — package entry export 测试模式
  - Test: `tests/Radio.test.tsx:12-28` — 多组件包入口测试模式
  - Test: `tests/ui/window.move.spec.ts:13-28` — 通过 `data-testid` 驱动 Playwright 断言的模式

  **Acceptance Criteria** (agent-executable only):
  - [ ] `CIcon` / `CIconContainer` 可从 `../src` 与包入口导入，且 package entry 测试通过
  - [ ] dev catalog 存在稳定的 `catalog-section-icon` 区块，并含可自动化驱动的 icon container 示例
  - [ ] 最终命令 `yarn test --runInBand --runTestsByPath tests/Icon.test.tsx tests/IconContainer.test.tsx && yarn test:ui tests/ui/icon-container.interactions.spec.ts && yarn lint && yarn build` 全部通过

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Package exports and catalog section are wired correctly
    Tool: Bash
    Steps: Run `yarn test --runInBand --runTestsByPath tests/Icon.test.tsx tests/IconContainer.test.tsx -t "exports"`
    Expected: Jest exits 0 and assertions verify both components are reachable from package entry and render expected base classes/test ids.
    Evidence: .sisyphus/evidence/task-6-icon-integration.txt

  Scenario: End-to-end verification passes across unit, UI, lint, and build
    Tool: Bash
    Steps: Run `yarn test --runInBand --runTestsByPath tests/Icon.test.tsx tests/IconContainer.test.tsx && yarn test:ui tests/ui/icon-container.interactions.spec.ts && yarn lint && yarn build`
    Expected: All commands exit 0; no lint, Jest, Playwright, or build regressions remain.
    Evidence: .sisyphus/evidence/task-6-icon-integration-error.txt
  ```

  **Commit**: YES | Message: `feat(icon): wire exports catalog and verification` | Files: `src/components/index.ts`, `src/index.ts`, `src/dev/ComponentCatalog.tsx`, `tests/Icon.test.tsx`, `tests/IconContainer.test.tsx`, `tests/ui/icon-container.interactions.spec.ts`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Every verification below is agent-executed with explicit Tool / Steps / Expected / Evidence. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle

  **What to do**: 让 oracle 对照本计划逐项核查实际实现是否满足任务 1-6 的显式决定：容器托管、单图标拖拽、`config` 默认值优先级、`doubleClick` open 语义、右键/长按先激活后回调、500ms/6px 长按阈值、禁止 scope creep。
  **QA Scenario**:
  ```
  Tool: task(subagent_type="oracle")
  Steps: 审阅 `.sisyphus/plans/cicon-components.md` 与实际改动 diff，逐项比对任务 1-6 的 Acceptance Criteria 与 Must NOT Have；输出 PASS/FAIL 清单。
  Expected: oracle 明确指出每一条计划约束是否落实；若有偏差，给出对应文件/行为证据。
  Evidence: .sisyphus/evidence/f1-plan-compliance.md
  ```
- [ ] F2. Code Quality Review — unspecified-high

  **What to do**: 让高强度审查代理评估类型安全、状态边界、拖拽清理、长按 timer 清理、测试充分性与代码复杂度，确认没有 `any`、无谓副作用、或 demo-only 逻辑泄漏到组件 API。
  **QA Scenario**:
  ```
  Tool: task(category="unspecified-high")
  Steps: 审阅 Icon 相关源码、测试与导出文件；重点检查 `@system-ui-js/multi-drag` 生命周期清理、事件解绑、timer 清理、受控/默认值合并和测试缺口。
  Expected: 输出 APPROVE/CHANGES NEEDED；若拒绝，必须列出具体文件、问题类别和修复建议。
  Evidence: .sisyphus/evidence/f2-code-quality.md
  ```
- [ ] F3. Browser QA Validation — unspecified-high (+ playwright if UI)

  **What to do**: 执行真实浏览器 QA，复跑 Icon showcase / fixture 中的 click、hover、doubleClick、右键、触摸长按模拟、拖拽、pointer cancel、页面刷新后再交互，确保行为与计划一致。
  **QA Scenario**:
  ```
  Tool: Playwright
  Steps: 运行 `yarn test:ui tests/ui/icon-container.interactions.spec.ts`，并在浏览器中使用 `[data-testid="icon-container"]`、`[data-testid="icon-item-0"]`、`[data-testid="icon-item-1"]` 依次完成单击激活、双击打开、右键菜单、触摸长按、拖拽和拖拽后 sibling 不变断言。
  Expected: Playwright 全绿，且交互日志/断言证明所有主路径和失败路径都符合计划。
  Evidence: .sisyphus/evidence/f3-real-qa.txt
  ```
- [ ] F4. Scope Fidelity Check — deep

  **What to do**: 让 deep 代理从范围控制角度复核，确认实现没有偷偷加入多选、排序、持久化、边界约束、依赖替换、菜单系统、可访问性扩展等未授权工作。
  **QA Scenario**:
  ```
  Tool: task(category="deep")
  Steps: 对照计划的 Must NOT Have、Interview Summary、Metis guardrails 与最终 diff，列出“in scope”与“out of scope”命中项。
  Expected: deep 给出 APPROVE/REJECT 结论；若 reject，必须指出超范围文件与超出的能力点。
  Evidence: .sisyphus/evidence/f4-scope-fidelity.md
  ```

## Commit Strategy
- Commit 1: contracts + `CIcon` surface + interaction semantics
- Commit 2: `CIconContainer` state orchestration + drag / long-press integration
- Commit 3: exports + catalog + Jest / Playwright verification fixes
- Commit messages should stay within conventional format such as `feat(icon): add cicon interaction surface`

## Success Criteria
- 新组件可从包入口导入并在 dev catalog 中展示
- `CIconContainer` 能稳定渲染多个图标、激活目标、更新单个位置且不影响其他项
- `click` / `hover` / `doubleClick` / `contextmenu` / `long-press` / `drag` 触发规则全部有自动化验证
- 拖拽过程中卸载、pointer cancel、late pointer events 均不会抛错或残留 UI 状态
