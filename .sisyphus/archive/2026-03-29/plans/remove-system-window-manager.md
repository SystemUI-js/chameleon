# Remove system layer and window manager

## TL;DR
> **Summary**: 删除 `src/system/**` 与 `src/components/Window/WindowManager.tsx`，同步清理所有 system/theme 切换相关公共导出、dev 预览、Playwright harness、以及仅验证被删除能力的测试。保留 `CWindow`、`CWindowTitle`、`CWindowBody`、`CScreen`、`CScreenManager` 等未被证实无用的基础组件。
> **Deliverables**:
> - 删除 `src/system/**` 与 `src/components/Window/WindowManager.tsx`
> - 清理 `src/index.ts` / `src/components/index.ts` 的相关公共导出
> - 删除 system/theme 相关 dev 预览与 Playwright harness 路径
> - 删除失效 Jest / Playwright 用例并保留无关回归能力
> - 在 `CHANGELOG.md` 的 `[UnReleased]` 记录 breaking 变更
> **Effort**: Medium
> **Parallel**: YES - 3 waves
> **Critical Path**: 1 → 2 → 4 → 6 → 8

## Context
### Original Request
- 「去掉 `src/system` 文件夹，去掉 `@src/components/Window/WindowManager.tsx` ，以及相关依赖、测试用例」

### Interview Summary
- 用户确认：删除 `src/system` 后，system/theme 切换相关的 dev 预览与 Playwright harness 一并删除，不保留替代壳层。
- 用户确认：`src/index.ts` 当前导出的 `SystemHost`、registry、system types 可以直接移除，接受 breaking API 变更。
- 用户确认：测试策略采用“测试后补齐”，即先删失效实现与测试，再做完整 lint / test / build / pack 验证。

### Metis Review (gaps addressed)
- 将本次任务收敛为 **breaking cleanup**，禁止顺手删除未证实无用的 window/screen 基础组件。
- 要求显式覆盖公共 API 收缩、dev surface 清理、theme definition 依赖清理、以及 `[UnReleased]` changelog 记录。
- 要求所有验收条件都能由 agent 直接执行，并增加“仓库内不得残留 `@/system/` / `CWindowManager` 引用”的搜索式校验。

## Work Objectives
### Core Objective
- 彻底移除 system 层与 `CWindowManager`，让仓库在不再支持 system/theme 切换壳层的前提下继续通过 lint、Jest、Playwright、build 与 `npm pack --dry-run`。

### Deliverables
- 删除目录：`src/system/`
- 删除文件：`src/components/Window/WindowManager.tsx`
- 删除关联导出：`src/index.ts` 中的 system exports / theme-definition exports；`src/components/index.ts` 中的 `CWindowManager`
- 删除关联定义文件：`src/theme/default/index.tsx`、`src/theme/win98/index.tsx`、`src/theme/winxp/index.tsx`
- 删除关联 dev 文件：`src/dev/themeSwitcher.tsx`
- 删除仅验证已移除能力的 Jest / Playwright 用例与相关 helper
- 更新 `CHANGELOG.md`

### Definition of Done (verifiable conditions with commands)
- `yarn lint` 退出码为 0
- `yarn test --runInBand` 退出码为 0
- `yarn test:ui` 退出码为 0
- `yarn build` 退出码为 0
- `npm pack --dry-run` 退出码为 0
- 仓库搜索 `@/system/|../src/system|./system/|CWindowManager|SystemHost|SYSTEM_TYPE|THEME|SystemThemeSelection` 时，不再命中源代码与测试中的运行时代码引用（`CHANGELOG.md` 可保留历史文本）
- `src/index.ts` 不再导出 system registry / `SystemHost` / system types / theme definition 常量
- `src/components/index.ts` 不再导出 `./Window/WindowManager`

### Must Have
- 仅删除与 system 层、`WindowManager`、以及 system/theme 切换预览直接相关的实现与测试
- 保留并继续验证 fixture 模式下的 window Playwright 能力
- 保留 `CommonControlsPreview` 这类与 system 壳层无关的预览能力
- 明确记录 breaking API 收缩到 changelog

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不得顺手删除 `CWindow`、`CWindowTitle`、`CWindowBody`、`CScreen`、`CScreenManager` 等仍可独立存在的基础组件
- 不得引入新的 system 替代抽象或兼容壳层
- 不得把无关组件测试一并清空；只删除验证已删除能力的测试
- 不得修改 `node_modules`

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after + Jest + Playwright
- QA policy: Every task has agent-executed scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: API surface contraction + source deletion boundaries + dev entry cleanup
- Task 1 API/export cleanup
- Task 2 WindowManager and system implementation deletion
- Task 3 theme-definition dependency cleanup

Wave 2: runtime tooling cleanup
- Task 4 dev preview entrypoint simplification
- Task 5 Playwright harness/helper simplification
- Task 6 Jest regression triage and cleanup

Wave 3: test suite surface cleanup + release notes
- Task 7 Playwright spec triage and cleanup
- Task 8 changelog update and final package-surface check prep

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
|---|---|---|
| 1 | none | 4, 8 |
| 2 | none | 4, 5, 6 |
| 3 | 1, 2 | 4, 8 |
| 4 | 1, 2, 3 | 5, 6 |
| 5 | 2, 4 | 7 |
| 6 | 2, 4 | 8 |
| 7 | 5 | 8 |
| 8 | 1, 3, 6, 7 | F1-F4 |

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 3 tasks → `quick`, `unspecified-low`
- Wave 2 → 3 tasks → `quick`, `unspecified-low`
- Wave 3 → 2 tasks → `quick`, `writing`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. 收缩库入口与组件入口公共导出

  **What to do**: 编辑 `src/index.ts`，删除 `./system/registry`、`./system/SystemHost`、`./system/types` 的导出以及依赖 registry 计算出的 `defaultThemeDefinition` / `win98ThemeDefinition` / `winXpThemeDefinition` 常量；编辑 `src/components/index.ts` 删除 `export * from './Window/WindowManager'`。保留其余组件导出不变。
  **Must NOT do**: 不得改动与本次删除无关的组件导出顺序；不得新增兼容别名或空导出。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 入口文件修改集中且决策已定
  - Skills: `[]` — 无需额外技能
  - Omitted: `['git-master']` — 此任务只做代码变更规划，不要求 git 操作

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 3, 4, 8 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/index.ts:1-22` — 当前库入口直接导出 system registry、`SystemHost`、system types，并在 9-22 行派生三个 theme-definition 常量
  - Pattern: `src/components/index.ts:1-14` — 当前组件入口在第 5 行导出 `./Window/WindowManager`
  - API/Type: `package.json:10-15` — 包只暴露根入口，入口收缩会直接改变发布面
  - External: `.github/workflows/ci-pr.yml:36-76` — lint/test/build/pack 都会消费这些入口

  **Acceptance Criteria** (agent-executable only):
  - [ ] `src/index.ts` 不再包含 `./system/registry`、`./system/SystemHost`、`./system/types` 字样
  - [ ] `src/index.ts` 不再声明 `defaultThemeDefinition`、`win98ThemeDefinition`、`winXpThemeDefinition`
  - [ ] `src/components/index.ts` 不再包含 `./Window/WindowManager`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Root exports no longer expose removed APIs
    Tool: Bash
    Steps: Run a repository content search for `SystemHost|SYSTEM_TYPE|THEME|defaultThemeDefinition|win98ThemeDefinition|winXpThemeDefinition` scoped to `src/index.ts` and `src/components/index.ts`.
    Expected: Search returns no matches in those two entry files.
    Evidence: .sisyphus/evidence/task-1-export-cleanup.txt

  Scenario: Unrelated component exports remain intact
    Tool: Bash
    Steps: Read `src/components/index.ts` and verify exports for `./Window/Window`, `./Window/WindowTitle`, `./Window/WindowBody`, `./Screen/Screen`, `./Button/Button`, `./Select/Select` still exist.
    Expected: Only the WindowManager export is removed; remaining listed exports are present.
    Evidence: .sisyphus/evidence/task-1-export-cleanup-error.txt
  ```

  **Commit**: YES | Message: `refactor(exports): remove system and window manager public surface` | Files: `src/index.ts`, `src/components/index.ts`

- [ ] 2. 删除 `WindowManager` 与整个 system 实现层

  **What to do**: 删除 `src/components/Window/WindowManager.tsx`；删除 `src/system/types.ts`、`src/system/registry.ts`、`src/system/SystemHost.tsx`、`src/system/default/**`、`src/system/windows/**`。同时清理由这些文件引入的直接依赖链，但仅限于因为文件删除而必需的引用修正。
  **Must NOT do**: 不得顺手删除 `CWindow`、`CWindowTitle`、`CWindowBody`、`CStartBar`、`CScreen`、`CScreenManager` 等仍可独立工作的基础组件；不得重写窗口交互逻辑。

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: 涉及多文件删除与依赖边界控制
  - Skills: `[]` — 无需额外技能
  - Omitted: `['refactor']` — 不做结构性重构，只做定向删除

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 3, 4, 5, 6 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Window/WindowManager.tsx:1-97` — 待删除目标文件，定义 `CWindowManager`
  - Pattern: `src/system/SystemHost.tsx:1-44` — system 壳层总入口，依赖 registry 与 default/windows shell
  - Pattern: `src/system/registry.ts:1-85` — system/theme 注册表，引用三个 theme-definition 文件
  - Pattern: `src/system/default/DefaultSystem.tsx:1-86` — 默认 system shell，当前通过 `CWindowManager` 包装窗口
  - Pattern: `src/system/windows/WindowsSystem.tsx:1-61` — windows shell，当前通过 `CWindowManager` 包装窗口并渲染 `CStartBar`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `src/components/Window/WindowManager.tsx` 已删除
  - [ ] `src/system/` 目录下不再残留源码文件
  - [ ] 仓库运行时代码中不再存在对 `CWindowManager`、`SystemHost`、`resolveThemeDefinition`、`resolveSystemTypeDefinition` 的 import/export 引用

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Deleted source files are absent
    Tool: Bash
    Steps: List `src/components/Window` and `src/system` and verify `WindowManager.tsx` plus all former system files are absent.
    Expected: `WindowManager.tsx` is gone and `src/system` has been removed or is empty with no tracked source files.
    Evidence: .sisyphus/evidence/task-2-source-deletion.txt

  Scenario: No stale runtime imports remain
    Tool: Bash
    Steps: Run repository searches for `CWindowManager|SystemHost|resolveThemeDefinition|resolveSystemTypeDefinition|@/system/|../src/system` across `src/` and `tests/`.
    Expected: No matches remain outside files intentionally queued for deletion in later tasks.
    Evidence: .sisyphus/evidence/task-2-source-deletion-error.txt
  ```

  **Commit**: YES | Message: `refactor(system): delete system layer and window manager implementation` | Files: `src/components/Window/WindowManager.tsx`, `src/system/**`

- [ ] 3. 清理 theme-definition 关联文件

  **What to do**: 删除 `src/theme/default/index.tsx`、`src/theme/win98/index.tsx`、`src/theme/winxp/index.tsx`，因为这三个 definition 文件仅被 `src/system/registry.ts` 与 `src/index.ts` 的已删除导出链使用。保留各自 theme styles 目录与其他仍被消费的 theme 资产。
  **Must NOT do**: 不得删除 `src/theme/**/styles/**`；不得把现有 styles 迁移到新类型系统。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 删除边界清晰
  - Skills: `[]` — 无需额外技能
  - Omitted: `['refactor']` — 不做样式体系重构

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 8 | Blocked By: 1, 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/theme/default/index.tsx:1-9` — 仅导出 `defaultThemeDefinition`，依赖 `@/system/types`
  - Pattern: `src/theme/win98/index.tsx:1-9` — 仅导出 `win98ThemeDefinition`，依赖 `@/system/types`
  - Pattern: `src/theme/winxp/index.tsx:1-9` — 仅导出 `winXpThemeDefinition`，依赖 `@/system/types`
  - Pattern: `src/system/registry.ts:1-3,60-64` — 唯一内部消费这三个 definition 文件的注册表
  - Pattern: `src/index.ts:9-22` — 根入口此前二次导出这三个 definition 常量

  **Acceptance Criteria** (agent-executable only):
  - [ ] 三个 theme-definition 文件已删除
  - [ ] 样式目录仍保留，未因误删导致 Sass 资源缺失
  - [ ] 仓库内不再存在 `ThemeDefinition` 从 `@/system/types` 导入的语句

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme-definition modules are removed without deleting styles
    Tool: Bash
    Steps: Verify `src/theme/default/index.tsx`, `src/theme/win98/index.tsx`, and `src/theme/winxp/index.tsx` are absent while each corresponding `src/theme/*/styles` directory still exists.
    Expected: Only the definition entry files are gone; style folders remain.
    Evidence: .sisyphus/evidence/task-3-theme-definition-cleanup.txt

  Scenario: No system-type import remains in theme layer
    Tool: Bash
    Steps: Search `src/theme` for `@/system/types`.
    Expected: Search returns zero matches.
    Evidence: .sisyphus/evidence/task-3-theme-definition-cleanup-error.txt
  ```

  **Commit**: NO | Message: `refactor(system): delete obsolete theme definition modules` | Files: `src/theme/default/index.tsx`, `src/theme/win98/index.tsx`, `src/theme/winxp/index.tsx`

- [ ] 4. 精简 dev 预览入口为非 system 模式

  **What to do**: 删除 `src/dev/themeSwitcher.tsx`；改写 `src/dev/main.tsx`，不再维护 `SystemThemeSelection` 状态，也不再通过 `DevSystemRoot` 挂载预览；让 `CommonControlsPreview` 直接挂载到 `#root` 或现有非 system 容器中；同步清理任何仅为 system title-bar 注入而存在的挂载逻辑。
  **Must NOT do**: 不得保留伪造的 system/theme 查询参数兼容层；不得移除 `CommonControlsPreview` 本身。

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: 需要在不保留 system 壳层的前提下重建最小 dev 入口
  - Skills: `[]` — 无需额外技能
  - Omitted: `['frontend-ui-ux']` — 不涉及视觉重设计

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 5, 6 | Blocked By: 1, 2, 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/themeSwitcher.tsx:1-76` — 当前 dev 入口抽象，完全依赖 `SystemHost`、registry、system types
  - Pattern: `src/dev/main.tsx:1-54` — 当前通过 `DEFAULT_DEV_SELECTION` / `DevSystemRoot` 驱动预览，并查找 `[data-testid="default-window-body"], [data-testid="windows-window-body"]`
  - Pattern: `src/dev/commonControlsPreview.tsx:1-96` — 可独立存在的控件预览内容，应作为保留入口
  - Test: `tests/ui/common-controls.smoke.spec.ts:9-32` — fixture 模式下的 common-controls 基础冒烟用例应继续可用

  **Acceptance Criteria** (agent-executable only):
  - [ ] `src/dev/themeSwitcher.tsx` 已删除
  - [ ] `src/dev/main.tsx` 不再导入 `SystemThemeSelection`、`DEFAULT_DEV_SELECTION`、`DevSystemRoot`
  - [ ] `yarn dev` 启动后，根页面能直接渲染 `CommonControlsPreview`，不再依赖 window body 容器出现后再二次挂载

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Dev entry boots without system shell
    Tool: Playwright
    Steps: Start `yarn dev`, open the root preview page, and assert `button-demo-primary`, `radio-demo-fruit`, and `select-demo-size` are visible without interacting with any system/theme controls.
    Expected: All three controls are present without any `systemType`/`theme` selection UI.
    Evidence: .sisyphus/evidence/task-4-dev-entry.txt

  Scenario: Stale themeSwitcher imports are fully removed
    Tool: Bash
    Steps: Search the repository for `themeSwitcher`, `DevSystemRoot`, and `DEFAULT_DEV_SELECTION`.
    Expected: No runtime references remain after cleanup, except deleted-file history outside the source tree.
    Evidence: .sisyphus/evidence/task-4-dev-entry-error.txt
  ```

  **Commit**: YES | Message: `refactor(dev): remove system-based preview entrypoint` | Files: `src/dev/themeSwitcher.tsx`, `src/dev/main.tsx`

- [ ] 5. 精简 Playwright harness 与查询参数辅助逻辑

  **What to do**: 改写 `src/dev/playwright/windowHarness.tsx` 与 `src/dev/playwright/commonControlsHarness.tsx`，只保留 `fixture` 路由模式；删除 `system-theme` 分支、`SystemThemeSelection` 类型依赖、`DevSystemRoot` 依赖、system/theme URL 解析与 URL 回写逻辑。同步改写 `tests/ui/window.helpers.ts`，删除 `WindowHarnessSelection`、`gotoWindowSelection`、`switchWindowSelection` 及其等待逻辑中的 system/theme 校验；并改写 `tests/ui/common-controls.helpers.ts`，删除 `CommonControlsThemeSelection`、`gotoWin98CommonControls`、`gotoWin98DisabledCommonControls` 与 themed 等待逻辑，仅保留 fixture 模式工具。
  **Must NOT do**: 不得删除现有 window fixture（`default`、`drag-only`、`min-clamp`、`max-clamp`）或 common-controls fixture（`default`、`disabled`）；不得修改与 fixture 无关的窗口交互行为。

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: 需要同时清理 harness 与测试 helper 的协议
  - Skills: `[]` — 无需额外技能
  - Omitted: `['playwright']` — 此任务先处理源码与 helper，UI 验证放在 QA 场景中执行

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 7 | Blocked By: 2, 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/playwright/windowHarness.tsx:5-27,37-70,133-172` — 当前支持 `fixture` 与 `system-theme` 双路由，并在 164-168 行挂载 `DevSystemRoot`
  - Pattern: `src/dev/playwright/commonControlsHarness.tsx:3-10,12-75,181-206,213-234` — 当前解析 `system-theme` 查询参数并通过 className 模拟 system/theme 外观
  - Pattern: `tests/ui/window.helpers.ts:10-20,33-120` — 当前 helper 维护 `WindowHarnessSelection` 与 system/theme 导航/切换 API
  - Pattern: `tests/ui/common-controls.helpers.ts:37-88` — 当前 helper 仍提供 Win98 themed 导航与等待逻辑
  - Test: `tests/ui/system-theme-switch.spec.ts:1-99` — 依赖 `gotoWindowSelection` 与 `switchWindowSelection`
  - Test: `tests/ui/default-window-system-switch.spec.ts:1-27` — 依赖 `gotoWindowSelection`
  - Test: `tests/ui/common-controls.smoke.spec.ts:34-312` — 当前 Win98 themed common-controls 断言将在 harness 切换能力删除后失效

  **Acceptance Criteria** (agent-executable only):
  - [ ] `windowHarness.tsx` 与 `commonControlsHarness.tsx` 中不再出现 `system-theme` 路由或 `SystemThemeSelection` 引用
  - [ ] `tests/ui/window.helpers.ts` 与 `tests/ui/common-controls.helpers.ts` 中仅保留 fixture 导航与交互工具
  - [ ] `playwright-window.html?fixture=default` 与 `playwright-common-controls.html?fixture=default|disabled` 仍能正确加载

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Fixture-only Playwright harness still serves window fixtures
    Tool: Playwright
    Steps: Open `/playwright-window.html?fixture=default`, assert `window-frame`, `window-title`, and `window-content` are visible; then open `?fixture=drag-only` and assert no resize handles are exposed.
    Expected: Both fixture routes render correctly without any `systemType`/`theme` URL parameters.
    Evidence: .sisyphus/evidence/task-5-playwright-harness.txt

  Scenario: Removed system-query helpers are gone
    Tool: Bash
    Steps: Search `tests/ui/window.helpers.ts`, `tests/ui/common-controls.helpers.ts`, and `src/dev/playwright/*.tsx` for `gotoWindowSelection|switchWindowSelection|gotoWin98CommonControls|gotoWin98DisabledCommonControls|system-theme|SystemThemeSelection|CommonControlsThemeSelection`.
    Expected: Search returns zero matches.
    Evidence: .sisyphus/evidence/task-5-playwright-harness-error.txt
  ```

  **Commit**: YES | Message: `refactor(dev): simplify playwright harness to fixture-only mode` | Files: `src/dev/playwright/windowHarness.tsx`, `src/dev/playwright/commonControlsHarness.tsx`, `tests/ui/window.helpers.ts`, `tests/ui/common-controls.helpers.ts`

- [ ] 6. 删除 Jest 中仅验证 system / WindowManager 能力的测试与辅助件

  **What to do**: 删除 `tests/WindowManager.test.tsx`、`tests/SystemHost.test.tsx`、`tests/SystemTypeSwitch.test.tsx`、`tests/SystemTypeThemeRegistry.test.tsx`、`tests/SystemShellCharacterization.test.tsx`、`tests/ThemeSwitchPreservation.test.tsx`、`tests/GlobalRenderer.test.tsx`、`tests/DefaultTheme.test.tsx`、`tests/ThemeScopeClassNames.test.tsx`、`tests/Win98WindowTitle.test.tsx`、`tests/DevSystemSelection.test.tsx`。如果 `tests/helpers/systemSession.fixture.tsx` 在删除上述测试后已无剩余引用，也一并删除；若仍被其他保留测试消费，则仅清理失效字段而非整文件删除。
  **Must NOT do**: 不得删除 `tests/ScreenManager.test.tsx`、`tests/CWindowTitleComposition.test.tsx`、以及 button/radio/select 等无关组件测试；不得为了“清静”删除整个 `tests/helpers` 目录。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 删除边界以文件清单为主
  - Skills: `[]` — 无需额外技能
  - Omitted: `['refactor']` — 不重写 surviving 测试语义

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8 | Blocked By: 2, 4

  **References** (executor has NO interview context — be exhaustive):
  - Test: `tests/WindowManager.test.tsx:1-132` — 直接覆盖 `CWindowManager`
  - Test: `tests/SystemHost.test.tsx:1-157` — 直接覆盖 `SystemHost` 与 registry 边界校验
  - Test: `tests/SystemTypeThemeRegistry.test.tsx:1-74` — 直接覆盖 `SYSTEM_TYPE` / `THEME` / `resolveThemeDefinition`
  - Test: `tests/DevSystemSelection.test.tsx:1-57` — 直接覆盖 `src/dev/themeSwitcher.tsx`
  - Pattern: `tests/helpers/systemSession.fixture.tsx:1-70` — 如删除后无引用可一起清理
  - Pattern: `.github/workflows/ci-pr.yml:40-76` — Jest、Playwright、build、pack 均在 CI 中强制执行

  **Acceptance Criteria** (agent-executable only):
  - [ ] 上述 system / WindowManager 相关 Jest 文件已删除
  - [ ] 保留测试文件不再 import 已删除的 system/window-manager API
  - [ ] 若 `tests/helpers/systemSession.fixture.tsx` 无剩余引用，则一并删除；否则保留且无死字段导致 lint/test 失败

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Removed Jest suites no longer exist while unrelated suites remain
    Tool: Bash
    Steps: Verify the listed removal-target test files are absent and confirm `tests/ScreenManager.test.tsx`, `tests/CWindowTitleComposition.test.tsx`, and `tests/Button.test.tsx` still exist.
    Expected: Only system-specific Jest suites are removed.
    Evidence: .sisyphus/evidence/task-6-jest-cleanup.txt

  Scenario: No remaining Jest import points to deleted system code
    Tool: Bash
    Steps: Search `tests/**/*.ts*` for `../src/system`, `@/system`, `CWindowManager`, and `themeSwitcher`.
    Expected: Search returns zero matches in remaining test files.
    Evidence: .sisyphus/evidence/task-6-jest-cleanup-error.txt
  ```

  **Commit**: YES | Message: `test(cleanup): remove system-specific jest suites` | Files: `tests/WindowManager.test.tsx`, `tests/SystemHost.test.tsx`, `tests/SystemTypeSwitch.test.tsx`, `tests/SystemTypeThemeRegistry.test.tsx`, `tests/SystemShellCharacterization.test.tsx`, `tests/ThemeSwitchPreservation.test.tsx`, `tests/GlobalRenderer.test.tsx`, `tests/DefaultTheme.test.tsx`, `tests/ThemeScopeClassNames.test.tsx`, `tests/Win98WindowTitle.test.tsx`, `tests/DevSystemSelection.test.tsx`, `tests/helpers/systemSession.fixture.tsx?`

- [ ] 7. 删除 Playwright 中仅验证 system/theme 切换的用例并保留 fixture 回归

  **What to do**: 删除 `tests/ui/system-theme-switch.spec.ts`、`tests/ui/default-window-system-switch.spec.ts`、`tests/ui/start-bar.spec.ts` 这三类仅验证 system/theme 切换或 Windows system 专属 shell 的用例。清理 `tests/ui/common-controls.smoke.spec.ts` 中 34-312 行的 Win98 themed describe 块，仅保留 fixture 模式下的 `default` / `disabled` / `unknown fixture` 覆盖。保留并修正 `tests/ui/window.smoke.spec.ts`、`tests/ui/window.move.spec.ts`、`tests/ui/window.resize.spec.ts`、`tests/ui/window.resize-guards.spec.ts`，让它们只走 fixture 路径。若某个保留 spec 仍使用 `gotoWindowSelection`，改为 `gotoWindowFixture`。
  **Must NOT do**: 不得删除仍验证通用 window 拖拽/缩放能力的 fixture spec；不得把 UI 验证完全降级为只跑 build。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 以 spec triage 为主，保留面明确
  - Skills: `[]` — 无需额外技能
  - Omitted: `['playwright']` — 先清理 spec，再在 QA 场景中执行

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 8 | Blocked By: 5

  **References** (executor has NO interview context — be exhaustive):
  - Test: `tests/ui/system-theme-switch.spec.ts:1-99` — 完整验证 system/theme 切换，必须删除
  - Test: `tests/ui/default-window-system-switch.spec.ts:1-27` — 验证 default → windows 切换，必须删除
  - Test: `tests/ui/common-controls.smoke.spec.ts:34-312` — Win98 themed describe 块在 fixture-only harness 下失效，需删除；`9-32` 的 fixture 冒烟覆盖需保留
  - Pattern: `tests/ui/window.helpers.ts:86-120` — `gotoWindowFixture` / `gotoWindowSelection` / `switchWindowSelection` 定义位置
  - External: `package.json:28-31` — `yarn test:ui` 启用 `--pass-with-no-tests`，但本计划要求保留 fixture UI 回归，不允许删空 UI 测试集

  **Acceptance Criteria** (agent-executable only):
  - [ ] 三个 system/theme 切换相关 Playwright spec 已删除
  - [ ] `tests/ui/common-controls.smoke.spec.ts` 仅保留 fixture 模式测试，不再断言 Win98 themed 容器或 themed 样式
  - [ ] 保留的 window fixture spec 仅使用 fixture 模式 helper
  - [ ] `yarn test:ui` 至少仍执行一组 fixture window 用例和一组 common-controls 用例

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Remaining Playwright specs use fixture-only navigation
    Tool: Bash
    Steps: Search `tests/ui/*.spec.ts` for `gotoWindowSelection`, `switchWindowSelection`, `gotoWin98CommonControls`, and `gotoWin98DisabledCommonControls`, then inspect remaining specs for `gotoWindowFixture` or `gotoCommonControlsFixture` usage.
    Expected: No remaining UI spec calls removed themed helpers; at least one window spec and one common-controls spec still use fixture navigation.
    Evidence: .sisyphus/evidence/task-7-playwright-spec-cleanup.txt

  Scenario: UI regression suite still exercises surviving features
    Tool: Playwright
    Steps: Run the surviving window drag/resize specs and one common-controls spec against the fixture harness pages.
    Expected: Drag, resize, and common controls scenarios all pass without system/theme routing.
    Evidence: .sisyphus/evidence/task-7-playwright-spec-cleanup-error.txt
  ```

  **Commit**: YES | Message: `test(cleanup): remove system-switch playwright suites` | Files: `tests/ui/system-theme-switch.spec.ts`, `tests/ui/default-window-system-switch.spec.ts`, `tests/ui/start-bar.spec.ts`, `tests/ui/common-controls.smoke.spec.ts`, surviving `tests/ui/*.spec.ts`

- [ ] 8. 更新 changelog 并完成发布面校验准备

  **What to do**: 在 `CHANGELOG.md` 的 `[UnReleased]` 下新增 breaking 条目，明确说明删除 `src/system/**`、`SystemHost`、system registry/types、`CWindowManager`、system/theme 切换 dev 预览与对应测试入口。同步复查根入口与保留测试/预览，确保最终全量验证前不存在已知残留引用。
  **Must NOT do**: 不得改写既有历史版本记录；不得遗漏 breaking 影响面。

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: 以 release note 与最终校验清单为主
  - Skills: `[]` — 无需额外技能
  - Omitted: `['git-master']` — 不在此任务内做发布/提交

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: F1-F4 | Blocked By: 1, 3, 6, 7

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `CHANGELOG.md:1-25` — `[UnReleased]` 当前已有 Feature/Fix/Test 条目，新增 breaking 条目应放在该段中
  - Pattern: `src/index.ts:1-22` — 需要与 changelog 中声明的 API 收缩保持一致
  - Pattern: `src/components/index.ts:1-14` — 需要与 changelog 中声明的组件导出收缩保持一致
  - External: `README.md` — 当前 README 主要展示通用组件；若未提及 system API，无需扩展本次范围去改 README

  **Acceptance Criteria** (agent-executable only):
  - [ ] `CHANGELOG.md` 的 `[UnReleased]` 下新增 breaking 条目，内容覆盖源码删除、公共 API 收缩、dev/harness 清理三类影响
  - [ ] 变更说明与实际删除文件/导出一致，无遗漏 `SystemHost`、registry/types、`CWindowManager`
  - [ ] 全量验证前的仓库搜索不再发现已知残留 system/window-manager 运行时代码引用

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Changelog documents the breaking surface accurately
    Tool: Bash
    Steps: Read the `[UnReleased]` section and compare it against actual removed exports/files (`src/system/**`, `SystemHost`, system registry/types, `CWindowManager`, dev themeSwitcher/harness routes).
    Expected: Every removed public/runtime surface is mentioned exactly once with clear breaking wording.
    Evidence: .sisyphus/evidence/task-8-changelog.txt

  Scenario: Final pre-verification search is clean
    Tool: Bash
    Steps: Run repository-wide searches for `@/system/|../src/system|SystemHost|SYSTEM_TYPE|THEME|SystemThemeSelection|CWindowManager|gotoWindowSelection|switchWindowSelection` scoped to `src/`, `tests/`, root HTML/Vite entry files, and explicitly exclude `.sisyphus/**` plus `CHANGELOG.md`.
    Expected: No remaining source/test/runtime matches are found.
    Evidence: .sisyphus/evidence/task-8-changelog-error.txt
  ```

  **Commit**: YES | Message: `docs(changelog): record breaking removal of system APIs` | Files: `CHANGELOG.md`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle

  **What to do**: 让 `oracle` 审核实现结果是否逐项满足本计划 1-8 号任务的范围、保留面、删除面、提交策略与 breaking 说明，不得放过任何越界删除或漏删引用。
  **Must NOT do**: 不得只看最终测试结果；必须对照计划逐项比对。

  **Parallelization**: Can Parallel: YES | Final Wave | Blocks: none | Blocked By: 1-8

  **Acceptance Criteria**:
  - [ ] Oracle 明确给出 APPROVED / REJECTED 结论
  - [ ] 若 REJECTED，必须列出具体偏离的任务编号与文件路径

  **QA Scenarios**:
  ```
  Scenario: Oracle verifies plan fidelity
    Tool: task(subagent_type="oracle")
    Steps: Submit the completed diff plus `.sisyphus/plans/remove-system-window-manager.md` to oracle and ask for a plan-compliance audit covering Tasks 1-8, preserved components, and declared exclusions.
    Expected: Oracle returns APPROVED, or returns a file-specific rejection list that must be fixed before completion.
    Evidence: .sisyphus/evidence/f1-plan-compliance.md
  ```
- [ ] F2. Code Quality Review — unspecified-high

  **What to do**: 让独立 reviewer 审核删除后的代码质量，重点检查死引用、错误保留、误删、类型残留、以及仅为过测试而引入的脆弱逻辑。
  **Must NOT do**: 不得把测试通过等同于代码质量通过。

  **Parallelization**: Can Parallel: YES | Final Wave | Blocks: none | Blocked By: 1-8

  **Acceptance Criteria**:
  - [ ] Reviewer 明确给出 APPROVED / REJECTED 结论
  - [ ] 所有高严重度问题已修复或不存在

  **QA Scenarios**:
  ```
  Scenario: Independent quality review on cleanup diff
    Tool: task(category="unspecified-high")
    Steps: Provide the final diff and ask for a code-quality review focused on cleanup correctness, dead code, type safety, and accidental scope expansion.
    Expected: Reviewer returns APPROVED with no high-severity findings.
    Evidence: .sisyphus/evidence/f2-code-quality.md
  ```
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)

  **What to do**: 运行完整 agent-executed 回归，覆盖 lint、Jest、Playwright、build、pack，以及 dev preview 与 fixture 页面关键路径。
  **Must NOT do**: 不得以“理论上应该通过”代替实际运行。

  **Parallelization**: Can Parallel: YES | Final Wave | Blocks: none | Blocked By: 1-8

  **Acceptance Criteria**:
  - [ ] `yarn lint`、`yarn test --runInBand`、`yarn test:ui`、`yarn build`、`npm pack --dry-run` 全部通过
  - [ ] dev preview 与保留的 fixture 页面可被浏览器验证

  **QA Scenarios**:
  ```
  Scenario: Full automated regression sweep
    Tool: Bash
    Steps: Run `yarn lint && yarn test --runInBand && yarn test:ui && yarn build && npm pack --dry-run`.
    Expected: Entire command chain exits 0.
    Evidence: .sisyphus/evidence/f3-full-regression.txt

  Scenario: Browser verification of retained preview/harness surfaces
    Tool: Playwright
    Steps: Open the dev preview root, `/playwright-window.html?fixture=default`, and `/playwright-common-controls.html?fixture=default`; assert the expected retained controls and window fixtures render.
    Expected: All retained browser surfaces load without system/theme routing.
    Evidence: .sisyphus/evidence/f3-browser-regression.txt
  ```
- [ ] F4. Scope Fidelity Check — deep

  **What to do**: 让 `deep` reviewer 检查最终结果是否严格符合用户原始诉求，没有遗漏“相关依赖、测试用例”，也没有扩展到不必要的大范围重构。
  **Must NOT do**: 不得只复述 changelog 或测试结果，必须回到原始需求与访谈决策。

  **Parallelization**: Can Parallel: YES | Final Wave | Blocks: none | Blocked By: 1-8

  **Acceptance Criteria**:
  - [ ] Reviewer 明确确认“IN 范围已完成，OUT 范围未被侵入”
  - [ ] 若发现范围偏差，输出具体文件与修正建议

  **QA Scenarios**:
  ```
  Scenario: Deep scope fidelity audit
    Tool: task(category="deep")
    Steps: Provide the original request, confirmed decisions, and final diff; ask the reviewer to verify that all related dependencies/tests were removed while unrelated primitives/components were preserved.
    Expected: Reviewer confirms scope fidelity or returns a concrete fix list.
    Evidence: .sisyphus/evidence/f4-scope-fidelity.md
  ```

## Commit Strategy
- Commit 1: `refactor(exports): remove system and window manager public surface`
- Commit 2: `refactor(system): delete system layer and window manager implementation`
- Commit 3: `refactor(dev): remove system-based preview and harness flows`
- Commit 4: `test(cleanup): remove system-specific regression suites`
- Commit 5: `docs(changelog): record breaking removal of system APIs`

## Success Criteria
- 运行时代码中不再存在 `src/system/**` 或 `CWindowManager` 依赖链
- 剩余 window fixture 与 common controls 预览/测试仍可正常运行
- 包入口导出与 changelog 一致反映 breaking 变更
