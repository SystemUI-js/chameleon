# Window Playwright UI Tests

## TL;DR

> **Summary**: 为 `Window` 组件新增基于 Playwright 的浏览器级 UI 自动化能力，并只覆盖窗口拖动与边框缩放相关行为。计划采用独立 deterministic harness、Chromium-only 执行、`tests-after` 策略，并把 UI 自动化接入现有 PR CI 必跑检查。
> **Deliverables**:
>
> - Playwright 依赖、配置、脚本与 Chromium-only 运行约束
> - 独立的 `Window` 浏览器测试入口与 deterministic harness
> - `Window` move / resize / resize guardrails 的 Playwright 用例
> - PR CI 中的 Playwright 执行与失败产物上传
>   **Effort**: Medium
>   **Parallel**: YES - 3 waves
>   **Critical Path**: Task 1 -> Task 2 -> Task 3 -> Task 4/5/6 -> Task 7

## Context

### Original Request

增加 UI 自动化测试，安装 Playwright 作为自动化测试工具，并写测试用例；本次只覆盖 `Window` 的移动和 Resize Test Case。

### Interview Summary

- 目标明确：新增 Playwright，不引入其他 E2E 工具。
- 覆盖范围明确：仅 `Window` move / resize 相关场景，不扩展到其他组件。
- 测试策略已定：`tests-after`。
- CI 策略已定：Playwright 进入现有 PR CI 主流程并作为必跑检查。

### Metis Review (gaps addressed)

- 采用独立 harness，而不是复用日常 dev preview，避免 demo 漂移导致 flaky。
- 默认只跑 Chromium，控制 CI 成本与稳定性；不在本次引入跨浏览器矩阵。
- 将 resize 覆盖钉死为 8 个方向句柄 + `resizable={false}` + min/max clamp，避免“只测部分方向”留下实现判断空间。
- 所有断言使用固定几何初始值、固定拖拽增量、固定命令和固定失败产物路径。

## Work Objectives

### Core Objective

为组件库补齐 Playwright 浏览器自动化测试基础设施，并为 `Window` 组件建立真实浏览器下可重复执行的 move / resize 回归测试面。

### Deliverables

- `package.json` 中的 Playwright 依赖与脚本
- `playwright.config.ts`
- 独立浏览器测试入口页（固定 URL）与对应 React harness
- `tests/ui/` 下的共享 helper 与 `Window` Playwright 用例
- `.github/workflows/ci-pr.yml` 中的 Playwright 执行与失败产物上传

### Definition of Done (verifiable conditions with commands)

- `yarn lint` 通过，包含新建 `tests/ui/**/*.ts` 与 Playwright 配置文件
- `yarn test` 通过，现有 Jest 契约不回归
- `yarn test:ui` 通过，Chromium 中所有 `Window` move / resize 场景通过
- `yarn test:ui --grep "move"` 可单独通过拖动用例
- `yarn test:ui --grep "resize"` 可单独通过缩放用例

### Must Have

- 基于现有 `data-testid`：`window-frame`、`window-title`、`window-content`、`window-resize-{dir}`
- 固定测试入口 URL：`/playwright-window.html`
- 固定测试窗口初始几何：`x=10, y=20, width=240, height=160`
- 固定 base URL / 端口：沿用 Vite `5673`
- CI 失败时上传 `playwright-report/` 与 `test-results/`

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)

- 不新增 Storybook、Cypress、visual snapshot、a11y 审计或跨浏览器矩阵
- 不把范围扩展到 `WindowManager`、z-index、focus、maximize/minimize、keyboard 行为
- 不因测试引入无证据的 `Window` 内部重构
- 不新增与现有 `data-testid` 重复的测试专用 DOM hooks，除非现有 hook 无法支撑断言且在任务中明确证明

## Verification Strategy

> ZERO HUMAN INTERVENTION — all verification is agent-executed.

- Test decision: `tests-after` + Playwright (`@playwright/test`) + Chromium-only
- QA policy: 每个任务都包含 agent-executed 场景；浏览器场景统一使用 Playwright
- Evidence:
  - `.sisyphus/evidence/task-1-playwright-tooling.txt`
  - `.sisyphus/evidence/task-2-window-harness.png`
  - `.sisyphus/evidence/task-3-playwright-helpers.txt`
  - `.sisyphus/evidence/task-4-window-move.json`
  - `.sisyphus/evidence/task-5-window-resize-matrix.json`
  - `.sisyphus/evidence/task-6-window-resize-guards.json`
  - `.sisyphus/evidence/task-7-playwright-ci.txt`

## Execution Strategy

### Parallel Execution Waves

> Target: 5-8 tasks per wave. Shared prerequisites are isolated into Wave 1 to maximize safe parallelism.

Wave 1: Task 1 (tooling/config), Task 2 (deterministic harness), Task 3 (shared Playwright helpers)
Wave 2: Task 4 (move coverage), Task 5 (resize direction matrix), Task 6 (resize guardrails)
Wave 3: Task 7 (PR CI wiring and failure artifacts)

### Dependency Matrix (full, all tasks)

| Task | Depends On | Blocks  |
| ---- | ---------- | ------- |
| 1    | none       | 2, 3, 7 |
| 2    | 1          | 4, 5, 6 |
| 3    | 1, 2       | 4, 5, 6 |
| 4    | 2, 3       | 7       |
| 5    | 2, 3       | 7       |
| 6    | 2, 3       | 7       |
| 7    | 1, 4, 5, 6 | F1-F4   |

### Agent Dispatch Summary (wave → task count → categories)

- Wave 1 -> 3 tasks -> `quick`, `visual-engineering`
- Wave 2 -> 3 tasks -> `visual-engineering`, `unspecified-low`
- Wave 3 -> 1 task -> `quick`
- Final Verification -> 4 tasks -> `oracle`, `unspecified-high`, `deep`, `playwright`

## TODOs

> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Add Playwright tooling and Chromium-only scripts

  **What to do**: 在 `package.json` 增加 `@playwright/test` 开发依赖与脚本 `test:ui` / `test:ui:headed`；新增 `playwright.config.ts`，固定 `testDir` 为 `tests/ui`、`baseURL` 为 `http://127.0.0.1:5673`、`webServer.command` 为 `yarn dev`、`reuseExistingServer` 为 `!process.env.CI`、report/trace/screenshot 采用 failure 保留策略；只声明 Chromium project；不要改动现有 `jest` 脚本与 Vite 开发端口。
  **Must NOT do**: 不新增 Firefox/WebKit project；不改动 `vite.config.ts` 端口；不引入 Storybook component testing；不修改现有 Jest 配置语义。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 依赖、脚本、配置文件变更集中且边界明确
  - Skills: [`playwright`] — browser tooling 和 config 约束由该技能最直接
  - Omitted: [`frontend-ui-ux`] — 无视觉设计改动

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 7 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `package.json:21` — 当前脚本仅有 `dev` / `build` / `test`，新增脚本必须保持风格一致
  - Pattern: `vite.config.ts:21` — Vite dev server 已固定到 `5673`，Playwright 必须复用该端口
  - Pattern: `.github/workflows/ci-pr.yml:17` — 后续 CI 任务将复用这里的 Node/Yarn 执行方式
  - Pattern: `.gitignore:150` — `test-results/` 与 `playwright-report/` 已被忽略，不要重复添加
  - External: `https://playwright.dev/docs/test-configuration` — Chromium-only config、webServer、artifact retention 参考

  **Acceptance Criteria** (agent-executable only):
  - [x] `package.json` 新增 `test:ui` 与 `test:ui:headed`，且 `yarn test` 保持不变
  - [x] `playwright.config.ts` 只声明 `chromium` project，`testDir` 指向 `tests/ui`
  - [x] `playwright.config.ts` 复用 `http://127.0.0.1:5673`，并通过 `yarn dev` 启动 web server
  - [x] `npx playwright test --config=playwright.config.ts --list` 可成功列出测试，不报配置错误

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```text
  Scenario: Chromium-only config loads
    Tool: Bash
    Steps: Run `npx playwright test --config=playwright.config.ts --list` after installing deps
    Expected: Command exits 0 and lists `tests/ui` specs under the `chromium` project only
    Evidence: .sisyphus/evidence/task-1-playwright-tooling.txt

  Scenario: Unsupported browser stays disabled
    Tool: Bash
    Steps: Run `npx playwright test --config=playwright.config.ts --project=firefox --list`
    Expected: Command exits non-zero with a clear project-not-found error proving the matrix is Chromium-only
    Evidence: .sisyphus/evidence/task-1-playwright-tooling-error.txt
  ```

  **Commit**: YES | Message: `chore(playwright): add browser test tooling` | Files: `package.json`, `playwright.config.ts`

- [x] 2. Create deterministic Window Playwright harness

  **What to do**: 新增根目录入口 `playwright-window.html` 与 React 入口 `src/dev/playwright/windowHarness.tsx`，页面只渲染单个 `Window` fixture，并通过 `fixture` query param 切换 `default`、`drag-only`、`min-clamp`、`max-clamp` 四种模式；未知 fixture 时渲染 `[data-testid="fixture-error"]` 错误提示。固定几何如下：`default` = `(10,20,240,160)`；`drag-only` = `(12,24,200,120,resizable=false)`；`min-clamp` = `(30,30,40,30)`；`max-clamp` = `(50,60,120,100, resizeOptions={ minContentWidth:20, minContentHeight:30, maxContentWidth:150, maxContentHeight:110 })`。
  **Must NOT do**: 不复用 `src/dev/main.tsx` 当前 theme switcher 页面做测试承载面；不在同一页面同时渲染多个同 selector 的测试窗口；不改动组件内部实现来迁就 harness。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 需要浏览器承载面与稳定 DOM 布局，但不是产品 UI 设计
  - Skills: [`playwright`] — 需要按浏览器自动化需要反推稳定 fixture 页面
  - Omitted: [`frontend-ui-ux`] — 目标是 test harness，不是视觉设计

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3, 4, 5, 6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/main.tsx:1` — 当前 dev 入口极薄，适合作为新增独立 harness 入口的参考，但不要复用其主题切换逻辑
  - Pattern: `src/components/Window/Window.tsx:349` — resize handles 由现有 `data-testid="window-resize-{dir}"` 生成
  - Pattern: `src/components/Window/Window.tsx:409` — `window-content` / `window-frame` / `data-window-uuid` 已可直接用于自动化断言
  - Pattern: `src/components/Window/WindowTitle.tsx:63` — `window-title` 是标题拖拽目标
  - Pattern: `src/components/Widget/Widget.tsx:24` — frame 的 `left/top/width/height` 由 inline style 输出，可用于几何断言
  - External: `https://vite.dev/guide/` — Vite 多 HTML entry 的 dev serving 行为参考

  **Acceptance Criteria** (agent-executable only):
  - [x] 访问 `/playwright-window.html?fixture=default` 时仅渲染一个 `window-frame`，初始样式为 `left: 10px; top: 20px; width: 240px; height: 160px`
  - [x] `drag-only` fixture 不渲染任何 `window-resize-*` handle，且标题栏仍存在
  - [x] `min-clamp` 与 `max-clamp` fixture 各自渲染一扇窗口并暴露既有 selector
  - [x] 未知 `fixture` 参数渲染 `[data-testid="fixture-error"]`，文本明确包含请求的 fixture 名称

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```text
  Scenario: Deterministic default fixture renders
    Tool: Playwright
    Steps: Open `/playwright-window.html?fixture=default`; assert exactly one `[data-testid="window-frame"]`; read inline styles from `[data-testid="window-frame"]`
    Expected: `left=10px`, `top=20px`, `width=240px`, `height=160px`, and one `[data-testid="window-title"]` is visible
    Evidence: .sisyphus/evidence/task-2-window-harness.png

  Scenario: Unknown fixture fails loudly
    Tool: Playwright
    Steps: Open `/playwright-window.html?fixture=unknown-mode` and locate `[data-testid="fixture-error"]`
    Expected: Error element is visible and includes `unknown-mode` in its text
    Evidence: .sisyphus/evidence/task-2-window-harness-error.png
  ```

  **Commit**: YES | Message: `test(window): add deterministic playwright harness` | Files: `playwright-window.html`, `src/dev/playwright/windowHarness.tsx`

- [x] 3. Add shared Playwright Window helpers and smoke coverage

  **What to do**: 在 `tests/ui/window.helpers.ts` 中封装 `gotoWindowFixture(page, fixture)`、`readFrameMetrics(page)`、`dragLocatorBy(locator, dx, dy)` 三类 helper；统一使用现有 `data-testid`；新增 `tests/ui/window.smoke.spec.ts`，至少包含两个具名用例：`default fixture exposes baseline metrics` 与 `unknown fixture shows explicit error`。前者验证 helper 能打开 `default` fixture 并读取固定几何，后者验证打开 `?fixture=unknown-mode` 时会显示 `[data-testid="fixture-error"]`，供后续 move / resize spec 复用。
  **Must NOT do**: 不在每个 spec 内复制几何读取逻辑；不通过 CSS class 做主选择器；不在 helper 中写与某个单一 spec 强绑定的断言。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 共享测试工具与薄 smoke spec，逻辑集中
  - Skills: [`playwright`] — 鼠标拖拽与 locator helper 要遵循浏览器自动化最佳实践
  - Omitted: [`frontend-ui-ux`] — 无视觉改造

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 4, 5, 6 | Blocked By: 1, 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/CWindowTitleComposition.test.tsx:29` — 现有 jsdom `dragPointer` / `getFrameMetrics` 是 Playwright helper 的行为来源
  - Pattern: `tests/CWindowTitleComposition.test.tsx:99` — move contract 的期望值来源
  - Pattern: `tests/CWindowTitleComposition.test.tsx:143` — resize delta/expected matrix 来源
  - Pattern: `src/components/Window/Window.tsx:197` — resize anchor-preserving 计算逻辑，helper 断言必须围绕几何结果而非视觉截图
  - External: `https://playwright.dev/docs/input#dragging-manually` — 使用 `mouse.move` steps 降低拖拽 flaky

  **Acceptance Criteria** (agent-executable only):
  - [x] `tests/ui/window.helpers.ts` 提供 fixture 导航、frame metrics 读取、locator 拖拽 helper，供多个 spec 复用
  - [x] `tests/ui/window.smoke.spec.ts` 使用 helper 打开 `default` fixture 并断言基线几何 `(10,20,240,160)`
  - [x] `tests/ui/window.smoke.spec.ts` 包含 `unknown fixture shows explicit error` 用例，并断言 `[data-testid="fixture-error"]` 可见
  - [x] helper 默认使用 `window-frame`、`window-title`、`window-content`、`window-resize-{dir}` 作为主 selector

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```text
  Scenario: Helper reads baseline metrics
    Tool: Playwright
    Steps: Run `npx playwright test tests/ui/window.smoke.spec.ts --project=chromium`
    Expected: Test passes and reports the default fixture metrics exactly as `10,20,240,160`
    Evidence: .sisyphus/evidence/task-3-playwright-helpers.txt

  Scenario: Helper rejects unknown fixture navigation
    Tool: Playwright
    Steps: Run `npx playwright test tests/ui/window.smoke.spec.ts --project=chromium --grep "unknown fixture shows explicit error"`
    Expected: Test passes after visiting `?fixture=unknown-mode` and asserting `[data-testid="fixture-error"]` is visible instead of hanging on missing selectors
    Evidence: .sisyphus/evidence/task-3-playwright-helpers-error.txt
  ```

  **Commit**: YES | Message: `test(window): add playwright helper utilities` | Files: `tests/ui/window.helpers.ts`, `tests/ui/window.smoke.spec.ts`

- [x] 4. Add Window move Playwright coverage

  **What to do**: 新增 `tests/ui/window.move.spec.ts`，使用 `default` fixture 验证标题栏拖拽会把窗口从 `(10,20)` 移到 `(30,60)`，并验证拖拽 `window-content` 不会移动窗口；拖拽操作统一复用 helper，拖拽增量固定为 `dx=20, dy=40`（标题）与 `dx=40, dy=40`（内容 no-op）。
  **Must NOT do**: 不使用 screenshot diff 代替几何断言；不通过 `nth()` 规避 selector 冲突；不把 `resizable={false}` 场景塞进本任务。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 真实浏览器指针交互测试，需要关注页面几何与拖拽稳定性
  - Skills: [`playwright`] — 必须用浏览器自动化精确驱动拖拽
  - Omitted: [`frontend-ui-ux`] — 不是界面设计任务

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 7 | Blocked By: 2, 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/CWindowTitleComposition.test.tsx:99` — 标题拖拽期望值：`(10,20) -> (30,60)`
  - Pattern: `tests/CWindowTitleComposition.test.tsx:122` — 内容区域拖拽不应改变 `left/top`
  - Pattern: `src/components/Window/WindowTitle.tsx:28` — 标题栏拖拽通过 `onWindowMove` 更新窗口位置
  - Pattern: `src/components/Widget/Widget.tsx:30` — 位置和尺寸由 inline style 暴露，浏览器测试直接读取该来源
  - Test: `tests/ui/window.smoke.spec.ts` — helper / fixture 导航复用模式

  **Acceptance Criteria** (agent-executable only):
  - [x] `window.move.spec.ts` 在 `default` fixture 中断言标题栏拖拽后 frame metrics 精确等于 `{ x: 30, y: 60, width: 240, height: 160 }`
  - [x] 同一 spec 断言拖拽 `window-content` 后 frame metrics 维持 `{ x: 10, y: 20, width: 240, height: 160 }`
  - [x] 所有 move 用例只通过现有 `data-testid` 完成定位

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```text
  Scenario: Title bar drag moves window
    Tool: Playwright
    Steps: Run `npx playwright test tests/ui/window.move.spec.ts --grep "title drag" --project=chromium`
    Expected: Spec passes with final frame metrics `{x:30,y:60,width:240,height:160}`
    Evidence: .sisyphus/evidence/task-4-window-move.json

  Scenario: Content drag is a no-op
    Tool: Playwright
    Steps: Run `npx playwright test tests/ui/window.move.spec.ts --grep "content drag" --project=chromium`
    Expected: Spec passes with final frame metrics unchanged at `{x:10,y:20,width:240,height:160}`
    Evidence: .sisyphus/evidence/task-4-window-move-error.json
  ```

  **Commit**: YES | Message: `test(window): add move coverage` | Files: `tests/ui/window.move.spec.ts`

- [x] 5. Add Window resize direction matrix Playwright coverage

  **What to do**: 新增 `tests/ui/window.resize.spec.ts`，在 `default` fixture 中覆盖 8 个方向句柄 `n/s/e/w/ne/nw/se/sw` 的 anchor-preserving 行为；复用现有 jsdom delta 与期望值：`e(+20,0)->(10,20,260,160)`、`w(-20,0)->(-10,20,260,160)`、`n(0,-10)->(10,10,240,170)`、`s(0,+10)->(10,20,240,170)`、`ne(+20,-10)->(10,10,260,170)`、`nw(-20,-10)->(-10,10,260,170)`、`se(+20,+10)->(10,20,260,170)`、`sw(-20,+10)->(-10,20,260,170)`。
  **Must NOT do**: 不只测代表性 subset；不通过等待动画或 sleep 解决不稳定；不把 min/max clamp 场景混入本任务。

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 8 方向真实拖拽需要稳定鼠标路径和几何断言
  - Skills: [`playwright`] — resize handle 交互必须由浏览器自动化驱动
  - Omitted: [`frontend-ui-ux`] — 无设计变更

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 7 | Blocked By: 2, 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/CWindowTitleComposition.test.tsx:143` — 8 方向 resize matrix 和 exact expected geometry 来源
  - Pattern: `src/components/Window/Window.tsx:197` — `getResizedRect` 的 east/west/north/south 锚点计算来源
  - Pattern: `src/components/Window/Window.tsx:349` — 8 个 resize handle 的 DOM 生成位置与 selector 来源
  - Test: `tests/ui/window.helpers.ts` — handle drag helper 与 frame metrics 读取入口

  **Acceptance Criteria** (agent-executable only):
  - [x] `window.resize.spec.ts` 参数化覆盖全部 8 个方向句柄
  - [x] 每个方向都断言精确 `x/y/width/height`，与 jsdom 契约保持一致
  - [x] spec 中不出现硬编码重复拖拽实现，统一复用 helper

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```text
  Scenario: East and south-east handles expand with anchor preserved
    Tool: Playwright
    Steps: Run `npx playwright test tests/ui/window.resize.spec.ts --grep "e|se" --project=chromium`
    Expected: `e` ends at `{10,20,260,160}` and `se` ends at `{10,20,260,170}`
    Evidence: .sisyphus/evidence/task-5-window-resize-matrix.json

  Scenario: West and north-west handles shift origin correctly
    Tool: Playwright
    Steps: Run `npx playwright test tests/ui/window.resize.spec.ts --grep "w|nw" --project=chromium`
    Expected: `w` ends at `{-10,20,260,160}` and `nw` ends at `{-10,10,260,170}`
    Evidence: .sisyphus/evidence/task-5-window-resize-matrix-error.json
  ```

  **Commit**: YES | Message: `test(window): add resize matrix coverage` | Files: `tests/ui/window.resize.spec.ts`

- [x] 6. Add Window resize guardrail Playwright coverage

  **What to do**: 新增 `tests/ui/window.resize-guards.spec.ts`，覆盖三个 guardrail：`drag-only` fixture 中 `resizable={false}` 不渲染 handle 且标题拖拽后 metrics 为 `{ x: 42, y: 64, width: 200, height: 120 }`；`min-clamp` fixture 中把东侧句柄向左拖 `60px`、南侧句柄向上拖 `70px` 后宽高都 clamp 到 `1`；`max-clamp` fixture 中先把东侧句柄向右拖 `100px` 再把西北句柄向左上拖 `70px/80px`，最终 metrics 为 `{ x: 50, y: 50, width: 150, height: 110 }`。
  **Must NOT do**: 不把默认 fixture 的方向矩阵重复到本任务；不通过修改组件默认 min/max 规则让测试通过；不忽略 `resizable={false}` 下标题仍可拖动这一契约。

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: 主要是把既有约束行为映射到浏览器回归测试
  - Skills: [`playwright`] — 约束场景依然需要浏览器级交互与断言
  - Omitted: [`frontend-ui-ux`] — 纯行为测试

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 7 | Blocked By: 2, 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/CWindowTitleComposition.test.tsx:199` — `resizable={false}` 时无 handle，但标题拖拽仍生效
  - Pattern: `tests/CWindowTitleComposition.test.tsx:253` — 默认最小尺寸 clamp 到 `1px`
  - Pattern: `tests/CWindowTitleComposition.test.tsx:278` — `maxContentWidth` / `maxContentHeight` 与 NW anchor 行为来源
  - Pattern: `src/components/Window/Window.tsx:141` — `resizeOptions` 归一化与 min/max 规则来源
  - Pattern: `src/components/Window/Window.tsx:255` — `resizable === false` 时不初始化 resize drags

  **Acceptance Criteria** (agent-executable only):
  - [x] `drag-only` fixture 中 `window-resize-e` 不存在，标题拖拽后 frame metrics 精确为 `{42,64,200,120}`
  - [x] `min-clamp` fixture 中宽高各自 clamp 到 `1`
  - [x] `max-clamp` fixture 中最终 frame metrics 精确为 `{50,50,150,110}`

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```text
  Scenario: resizable=false disables handles but keeps drag
    Tool: Playwright
    Steps: Run `npx playwright test tests/ui/window.resize-guards.spec.ts --grep "drag-only" --project=chromium`
    Expected: No resize handle is found and final frame metrics equal `{x:42,y:64,width:200,height:120}`
    Evidence: .sisyphus/evidence/task-6-window-resize-guards.json

  Scenario: clamp fixtures enforce min and max bounds
    Tool: Playwright
    Steps: Run `npx playwright test tests/ui/window.resize-guards.spec.ts --grep "clamp" --project=chromium`
    Expected: `min-clamp` ends at width/height `1`, and `max-clamp` ends at `{x:50,y:50,width:150,height:110}`
    Evidence: .sisyphus/evidence/task-6-window-resize-guards-error.json
  ```

  **Commit**: YES | Message: `test(window): add resize guardrail coverage` | Files: `tests/ui/window.resize-guards.spec.ts`

- [x] 7. Require Playwright Window UI automation in PR CI

     **What to do**: 更新 `.github/workflows/ci-pr.yml`，在现有 `Run unit tests` 之后、`Build` 之前新增 Playwright 安装与执行步骤：`npx playwright install --with-deps chromium`，随后运行 `yarn test:ui`；若 Playwright 步骤失败，上传 `playwright-report/` 与 `test-results/` artifact。保留当前 `lint -> test -> build -> npm pack` 主顺序，只在 unit test 与 build 之间插入 UI 自动化。
     **Must NOT do**: 不创建新的可选 workflow 来绕开 PR required check；不把 Playwright 放在 `build` 之后；不上传成功运行时的冗余 artifact。

     **Recommended Agent Profile**:
  - Category: `quick` — Reason: workflow 变更聚焦在单文件和固定命令串
  - Skills: [] — 纯 GitHub Actions wiring，不需要额外技能
  - Omitted: [`git-master`] — 当前任务不是 git 历史操作

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: F1, F2, F3, F4 | Blocked By: 1, 4, 5, 6

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.github/workflows/ci-pr.yml:17` — 当前唯一 PR job `pr-checks` 的结构与步骤顺序
  - Pattern: `package.json:21` — CI 必须调用与本地一致的 `yarn test:ui` 脚本，不要内联不同命令
  - Pattern: `playwright.config.ts` — CI project 与 artifact retention 必须与本地配置一致
  - External: `https://playwright.dev/docs/ci-intro` — GitHub Actions 中 Chromium 安装与 artifact retention 参考

  **Acceptance Criteria** (agent-executable only):
  - [x] `ci-pr.yml` 在 `Run unit tests` 之后新增 `npx playwright install --with-deps chromium` 与 `yarn test:ui`
  - [x] 失败时上传 `playwright-report/` 与 `test-results/` artifact
  - [x] 工作流仍保留原有 `lint`、`test`、`build`、`npm pack --dry-run` 步骤

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```text
  Scenario: Workflow invokes local-equivalent Playwright command
    Tool: Bash
    Steps: Run `python - <<'PY'
  from pathlib import Path
  text = Path('.github/workflows/ci-pr.yml').read_text()
  assert 'npx playwright install --with-deps chromium' in text
  assert 'yarn test:ui' in text
  assert 'playwright-report/' in text
  assert 'test-results/' in text
  print('workflow-playwright-checks-ok')
  PY`
    Expected: Script exits 0 and prints `workflow-playwright-checks-ok`
    Evidence: .sisyphus/evidence/task-7-playwright-ci.txt

  Scenario: Required workflow still preserves existing pipeline stages
    Tool: Bash
    Steps: Run `python - <<'PY'
  from pathlib import Path
  text = Path('.github/workflows/ci-pr.yml').read_text()
  required = ['Run lint', 'Run unit tests', 'Build', 'Verify npm pack (dry-run)']
  for item in required:
    assert item in text, item
  print('workflow-stages-preserved')
  PY`
    Expected: Script exits 0 and prints `workflow-stages-preserved`
    Evidence: .sisyphus/evidence/task-7-playwright-ci-error.txt
  ```

  **Commit**: YES | Message: `ci(playwright): require window ui automation` | Files: `.github/workflows/ci-pr.yml`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [x] F1. Plan Compliance Audit — oracle

  **What to do**: 调用 `oracle` 对照本计划与最终落地文件，逐项核对任务 1-7 的交付物、范围边界、验收项与 CI 接线是否全部兑现；输出 `PASS` / `FAIL` 以及逐条偏差列表。
  **Must NOT do**: 不要提出超出本计划的新特性；不要把“未来可优化项”记为阻塞缺陷。

  **Recommended Agent Profile**:
  - Category: `oracle` — Reason: 适合做高精度计划符合性审计
  - Skills: `[]` — 不需要额外技能，重点是逐条比对
  - Omitted: `[playwright]` — 该任务只做计划-实现一致性审计，不直接跑浏览器交互

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: none | Blocked By: 1, 2, 3, 4, 5, 6, 7

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.sisyphus/plans/window-playwright-ui-tests.md:1` — 审计基准，必须逐条核对 TODO、验收标准、CI 要求
  - Pattern: `package.json` — 核对 `test:ui`、Playwright 相关 script 与依赖是否按计划落地
  - Pattern: `playwright.config.ts` — 核对 Chromium-only、baseURL、artifact/reporter 配置
  - Pattern: `playwright-window.html` — 核对独立 deterministic harness 入口是否存在
  - Pattern: `src/dev/playwright/windowHarness.tsx` — 核对测试专用场景与固定几何
  - Pattern: `tests/ui/window.helpers.ts` — 核对共享 selector/geometry helper 是否存在
  - Pattern: `tests/ui/window.smoke.spec.ts` — 核对入口冒烟覆盖
  - Pattern: `tests/ui/window.move.spec.ts` — 核对标题拖拽与内容区 no-op 覆盖
  - Pattern: `tests/ui/window.resize.spec.ts` — 核对 8 方向 resize 覆盖
  - Pattern: `tests/ui/window.resize-guards.spec.ts` — 核对 `resizable={false}` 与 clamp 覆盖
  - Pattern: `.github/workflows/ci-pr.yml` — 核对 PR CI 是否已接入 Chromium 安装、`yarn test:ui` 与失败产物上传

  **Acceptance Criteria** (agent-executable only):
  - [x] `oracle` 输出明确 `PASS` 或 `FAIL`
  - [x] 审计结果逐条覆盖任务 1-7 的交付物，不得只给概括性结论
  - [x] 审计结果确认未引入计划外组件或超范围测试

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```text
  Scenario: Deterministic compliance audit checks required deliverables
    Tool: Bash
    Steps: Run `python - <<'PY'
  from pathlib import Path
  ```

required_files = [
'package.json',
'playwright.config.ts',
'playwright-window.html',
'src/dev/playwright/windowHarness.tsx',
'tests/ui/window.helpers.ts',
'tests/ui/window.smoke.spec.ts',
'tests/ui/window.move.spec.ts',
'tests/ui/window.resize.spec.ts',
'tests/ui/window.resize-guards.spec.ts',
'.github/workflows/ci-pr.yml',
]
for file in required_files:
assert Path(file).exists(), file

pkg = Path('package.json').read_text()
assert 'test:ui' in pkg
assert '@playwright/test' in pkg or 'playwright' in pkg

cfg = Path('playwright.config.ts').read_text()
assert 'chromium' in cfg.lower()
assert '127.0.0.1:5673' in cfg or '5673' in cfg

workflow = Path('.github/workflows/ci-pr.yml').read_text()
for needle in ['npx playwright install --with-deps chromium', 'yarn test:ui', 'playwright-report', 'test-results']:
assert needle in workflow, needle

move_spec = Path('tests/ui/window.move.spec.ts').read_text()
assert 'window-title' in move_spec
assert 'window-content' in move_spec

resize_spec = Path('tests/ui/window.resize.spec.ts').read_text()
for direction in ['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west']:
assert direction in resize_spec or direction.replace('-', '') in resize_spec or direction[:1] in resize_spec

guards = Path('tests/ui/window.resize-guards.spec.ts').read_text()
assert 'resizable={false}' in guards or 'resizable: false' in guards or 'resizable' in guards
assert 'min' in guards.lower() or 'max' in guards.lower()

print('PASS: deterministic plan compliance audit')
PY`    Expected: Script exits 0 and prints`PASS: deterministic plan compliance audit`
Evidence: .sisyphus/evidence/f1-plan-compliance.txt

Scenario: Compliance audit captures plan-critical references
Tool: Bash
Steps: Run `python - <<'PY'
from pathlib import Path
plan = Path('.sisyphus/plans/window-playwright-ui-tests.md').read_text()
for needle in [
    'playwright.config.ts',
    'playwright-window.html',
    'tests/ui/window.move.spec.ts',
    'tests/ui/window.resize.spec.ts',
    '.github/workflows/ci-pr.yml',
]:
    assert needle in plan, needle
print('f1-evidence-complete')
PY`
Expected: Script exits 0 and prints `f1-evidence-complete`
Evidence: .sisyphus/evidence/f1-plan-compliance-check.txt

````

**Commit**: NO | Message: `n/a` | Files: none

- [x] F2. Code Quality Review — unspecified-high

**What to do**: 由高能力审查代理检查新增 Playwright 配置、helpers、spec 组织、命名、一致性与可维护性，重点发现脆弱 selector、重复断言、非确定性等待、与现有库约定不一致的问题。
**Must NOT do**: 不要要求改动与本任务无关的旧代码；不要把样式偏好当成阻塞项。

**Recommended Agent Profile**:
- Category: `unspecified-high` — Reason: 适合做高强度代码质量审查
- Skills: `[]` — 审查重点是结构与稳定性，不依赖额外技能
- Omitted: `[git-master]` — 此处不是 git 历史分析任务

**Parallelization**: Can Parallel: YES | Wave Final | Blocks: none | Blocked By: 1, 2, 3, 4, 5, 6, 7

**References** (executor has NO interview context — be exhaustive):
- Pattern: `tests/CWindowTitleComposition.test.tsx` — 浏览器级断言应与现有 jsdom 契约保持一致
- Pattern: `src/components/Window/Window.tsx` — 现有 `Window` 行为与 selector 来源
- Pattern: `src/components/Window/WindowTitle.tsx` — 标题栏拖拽行为来源
- Pattern: `src/components/Widget/Widget.tsx` — frame inline style 几何断言来源
- Pattern: `tests/ui/window.helpers.ts` — helper 抽象是否避免重复并保持确定性
- Pattern: `tests/ui/window.move.spec.ts` — move spec 质量与等待策略
- Pattern: `tests/ui/window.resize.spec.ts` — resize matrix 是否系统且不重复
- Pattern: `tests/ui/window.resize-guards.spec.ts` — guardrail case 是否聚焦 `resizable={false}` 与 clamp
- Pattern: `playwright.config.ts` — reporter、timeout、project 配置是否合理

**Acceptance Criteria** (agent-executable only):
- [x] 代码审查结果明确区分阻塞问题与非阻塞建议
- [x] 审查结果至少覆盖配置、helpers、spec 结构、等待策略、选择器稳定性五个方面
- [x] 若判定通过，结果中明确写出“无阻塞问题”或等效结论

**QA Scenarios** (MANDATORY — task incomplete without these):
```text
Scenario: Quality gates pass across lint, unit, browser, and build checks
  Tool: Bash
  Steps: Run `yarn lint && yarn test && yarn test:ui && yarn build`
  Expected: Command exits 0 without lint/test/build failures
  Evidence: .sisyphus/evidence/f2-code-quality.txt

Scenario: Playwright additions avoid common flake and debug anti-patterns
  Tool: Bash
  Steps: Run `python - <<'PY'
from pathlib import Path
files = [
  Path('playwright.config.ts'),
  Path('tests/ui/window.helpers.ts'),
  Path('tests/ui/window.smoke.spec.ts'),
  Path('tests/ui/window.move.spec.ts'),
  Path('tests/ui/window.resize.spec.ts'),
  Path('tests/ui/window.resize-guards.spec.ts'),
]
for file in files:
  text = file.read_text()
  forbidden = ['test.only', 'page.pause(', 'waitForTimeout(', 'setTimeout(']
  for needle in forbidden:
      assert needle not in text, f'{file}: {needle}'
print('f2-evidence-complete')
PY`
  Expected: Script exits 0 and prints `f2-evidence-complete`
  Evidence: .sisyphus/evidence/f2-code-quality-check.txt

Scenario: Browser config remains deterministic and Chromium-only
  Tool: Bash
  Steps: Run `python - <<'PY'
from pathlib import Path
text = Path('playwright.config.ts').read_text().lower()
assert 'chromium' in text
assert 'firefox' not in text
assert 'webkit' not in text
assert '5673' in text
print('f2-evidence-complete')
PY`
  Expected: Script exits 0 and prints `f2-evidence-complete`
  Evidence: .sisyphus/evidence/f2-code-quality-config.txt
````

**Commit**: NO | Message: `n/a` | Files: none

- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)

  **What to do**: 用真实浏览器自动化做最终人工式验收：启动本地 harness，按用户视角验证页面可打开、窗口标题拖动可移动、内容区拖动不移动、8 方向 resize 生效、`resizable={false}` 禁止缩放、min/max clamp 正常，并保存截图/报告。
  **Must NOT do**: 不要只跑单元测试替代浏览器验收；不要手工口头描述结果而不产出证据文件。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要统筹运行服务、Playwright、证据采集
  - Skills: `[playwright]` — 需要浏览器级操作与证据采集
  - Omitted: `[frontend-ui-ux]` — 不是视觉设计任务

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: none | Blocked By: 1, 2, 3, 4, 5, 6, 7

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `playwright.config.ts` — 浏览器项目、baseURL、reporter 与 artifact 配置
  - Pattern: `playwright-window.html` — 最终验收入口
  - Pattern: `src/dev/playwright/windowHarness.tsx` — fixture 切换与固定几何来源
  - Pattern: `tests/ui/window.smoke.spec.ts` — 页面可用性/选择器存在的基线
  - Pattern: `tests/ui/window.move.spec.ts` — 标题拖动与内容区 no-op 期望
  - Pattern: `tests/ui/window.resize.spec.ts` — 8 方向 resize 期望
  - Pattern: `tests/ui/window.resize-guards.spec.ts` — `resizable={false}` 与 clamp 期望
  - Pattern: `vite.config.ts` — 本地 dev server 端口 `5673`

  **Acceptance Criteria** (agent-executable only):
  - [x] 浏览器自动化实际访问 `http://127.0.0.1:5673/playwright-window.html`
  - [x] 最终验收覆盖 move、content no-op、8 方向 resize、`resizable={false}`、min/max clamp
  - [x] 产出至少一份截图或 Playwright report 作为最终验收证据

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```text
  Scenario: Browser-level final acceptance passes on Window behaviors
    Tool: Bash
    Steps: Run `yarn test:ui`
    Expected: Command exits 0 and includes the implemented Window Playwright specs in the pass output
    Evidence: .sisyphus/evidence/f3-browser-qa.txt

  Scenario: Final QA preserves debuggable browser artifacts
    Tool: Bash
    Steps: Run `python - <<'PY'
  from pathlib import Path
  report = Path('playwright-report')
  results = Path('test-results')
  assert report.exists() or results.exists()
  print('f3-artifacts-present')
  PY`
    Expected: Script exits 0 and prints `f3-artifacts-present`
    Evidence: .sisyphus/evidence/f3-browser-qa-artifacts.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: none

- [x] F4. Scope Fidelity Check — deep

  **What to do**: 由 `deep` 代理审查最终交付是否严格限制在用户要求的 `Window` move / resize 自动化与 CI 接入，不得偷偷引入其他组件覆盖、额外框架迁移或无关重构；同时确认计划中声明的“不做事项”都被遵守。
  **Must NOT do**: 不要把合理的测试 helper 抽取误判为范围膨胀；不要建议新增与本需求无关的 E2E 基建扩展。

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: 适合做范围保真与隐性扩张识别
  - Skills: `[]` — 重点是范围审计，不需要专项技能
  - Omitted: `[playwright]` — 此任务不直接执行交互，而是验证范围忠实度

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: none | Blocked By: 1, 2, 3, 4, 5, 6, 7

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.sisyphus/plans/window-playwright-ui-tests.md:1` — 用户范围、Must NOT Have、任务 1-7 的唯一基准
  - Pattern: `package.json` — 范围仅允许新增 Playwright 所需依赖与脚本
  - Pattern: `.github/workflows/ci-pr.yml` — 范围仅允许接入 Window UI 测试所需 CI 步骤
  - Pattern: `tests/ui/` — 核对是否只新增 `Window` 相关 spec/helper
  - Pattern: `src/dev/playwright/windowHarness.tsx` — 核对 harness 是否只服务 Window 测试
  - Pattern: `src/components/Window/Window.tsx` — 范围内行为来源

  **Acceptance Criteria** (agent-executable only):
  - [x] 范围审查结果明确说明是否存在范围膨胀
  - [x] 若存在超范围项，结果逐条列出文件与原因
  - [x] 若无超范围项，结果明确写出只覆盖 `Window` move / resize 及其必要 guardrail/CI 配套

  **QA Scenarios** (MANDATORY — task incomplete without these):

  ```text
  Scenario: Scope audit confirms only Window UI automation artifacts were added
    Tool: Bash
    Steps: Run `python - <<'PY'
  from pathlib import Path
  ```

ui_dir = Path('tests/ui')
assert ui_dir.exists()
allowed = {
'window.helpers.ts',
'window.smoke.spec.ts',
'window.move.spec.ts',
'window.resize.spec.ts',
'window.resize-guards.spec.ts',
}
present = {p.name for p in ui_dir.iterdir() if p.is_file()}
assert allowed.issubset(present), present
unexpected_specs = [name for name in present if name.endswith('.spec.ts') and not name.startswith('window.') and not name.startswith('window-')]
assert not unexpected_specs, unexpected_specs
print('scope-window-only-pass')
PY`    Expected: Script exits 0 and prints`scope-window-only-pass`
Evidence: .sisyphus/evidence/f4-scope-fidelity.txt

Scenario: Scope evidence explicitly mentions Window-only focus
Tool: Bash
Steps: Run `python - <<'PY'
from pathlib import Path
pkg = Path('package.json').read_text()
assert 'test:ui' in pkg

workflow = Path('.github/workflows/ci-pr.yml').read_text()
assert 'yarn test:ui' in workflow

harness = Path('src/dev/playwright/windowHarness.tsx').read_text()
assert 'Window' in harness

plan = Path('.sisyphus/plans/window-playwright-ui-tests.md').read_text()
assert '仅 `Window` move / resize 相关场景，不扩展到其他组件。' in plan
assert '不把范围扩展到 `WindowManager`、z-index、focus、maximize/minimize、keyboard 行为' in plan
print('f4-evidence-complete')
PY`    Expected: Script exits 0 and prints`f4-evidence-complete`
Evidence: .sisyphus/evidence/f4-scope-fidelity-check.txt

```

**Commit**: NO | Message: `n/a` | Files: none

## Commit Strategy
- `chore(playwright): add browser test tooling`
- `test(window): add deterministic playwright harness`
- `test(window): add playwright helper utilities`
- `test(window): add move coverage`
- `test(window): add resize matrix coverage`
- `test(window): add resize guardrail coverage`
- `ci(playwright): require window ui automation`

## Success Criteria
- 仓库具备稳定的 Playwright 运行入口，且不影响现有 `Jest + Vite` 工作流
- `Window` 的标题拖动、内容区 no-op、8 方向 resize、`resizable={false}`、min/max clamp 都有浏览器级回归覆盖
- PR CI 在 Ubuntu runner 上能安装 Chromium、执行 Playwright，并在失败时保留可诊断产物
```
