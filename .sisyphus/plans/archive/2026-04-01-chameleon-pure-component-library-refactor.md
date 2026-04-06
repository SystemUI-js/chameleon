# Chameleon Pure Component Library Refactor

## TL;DR
> **Summary**: Reposition Chameleon from a desktop-shell flavored library into a pure component library by removing `WindowManager` / `Screen` / `SystemHost` / `systemType` orchestration while preserving reusable components (`CWindow`, `CGrid`, `CDock`, `CStartBar`, `CWidget`) and rebuilding the dev demo as a themeable component catalog.
> **Deliverables**:
> - Shell/runtime-manager concepts removed from source, exports, tests, harnesses, and docs
> - Theme model simplified to pure themes: `default`, `win98`, `winxp`
> - Demo rebuilt as component catalog with theme switching and interactive examples
> - Jest + Playwright coverage rewritten around standalone components instead of system shells
> **Effort**: Large
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 → 2 → 3 → 4 → 6 → 8

## Context
### Original Request
将当前项目重构为“纯粹的组件库项目”；剔除 `WindowManager`、`Screen` 概念；Demo 页面以展示组件和主题为主。

### Interview Summary
- 保留 `CWindow` 的拖拽与缩放能力；移除 `WindowManager` 能力。
- `Grid / Dock / StartBar / Widget` 都属于纯组件库范围，保留。
- Demo 采用“组件目录 + 主题切换 + 交互示例”。
- 主题体系按纯主题处理：移除 `SystemHost / systemType / system registry` 语义，仅保留 `default / win98 / winxp`。
- 测试策略采用 **tests-after**：先重构，再补齐 Jest / Playwright 覆盖。

### Metis Review (gaps addressed)
- 明确默认假设：`Screen` 直接删除，不做重命名保留。
- 明确 breaking change 允许一次性落地：不提供临时兼容层，直接收缩公开 API。
- 明确 `CWindow` 尽量保持现有组件 API 与行为，仅删除对 manager/screen 的依赖。
- 明确主题切换时 Demo 内交互状态 **应保留**，避免反复修改验收与测试。

### Oracle Review (gaps addressed)
- 最高风险在主题根契约与导出面收口，而非组件交互本身。
- 必须先把主题选择器从 `.cm-system--*.cm-theme--*` 改成纯 `.cm-theme--*` 根类，否则删掉 system 语义后主题会直接失效。
- `package.json:17` 为 `sideEffects: false`，主题样式导入路径必须在新入口中保持稳定可达，否则消费者可能拿到“有组件无样式”的产物。
- `CDock` / `CStartBar` 依赖相对定位容器与边缘布局；新 Demo 必须显式提供 catalog stage 容器，不可再隐式依赖 `CScreen`。

## Work Objectives
### Core Objective
把 Chameleon 改造成纯组件库：组件本身保留，桌面系统壳层与运行时管理模型移除，Demo 和测试全部围绕“独立组件 + 纯主题”重建。

### Deliverables
- 删除 `WindowManager` / `Screen` / `SystemHost` / `system/registry` / `system/types` 相关实现与公开导出
- 保留并重定位 `CWindow`、`CWindowTitle`、`CWindowBody`、`CGrid`、`CDock`、`CStartBar`、`CWidget`
- 重构主题定义，去掉 `systemType` 字段与 system-root 依赖
- 重构 `src/dev/*` 与 Playwright harness 为主题驱动的组件目录展示
- 重写/删除相关 Jest 与 Playwright 测试
- 更新 README、AGENTS、CHANGELOG 的定位与 API 说明

### Definition of Done (verifiable conditions with commands)
- `yarn lint` 通过
- `yarn test` 通过
- `yarn test:ui` 通过
- `yarn build` 通过
- `grep -R "SystemHost\|WindowManager\|ScreenManager\|SYSTEM_TYPE\|resolveThemeDefinition" src tests README.md AGENTS.md` 仅允许保留在 CHANGELOG 或迁移说明的删除记录中，不允许出现在现行 API/实现中
- `grep -R "cm-system--" src` 无匹配

### Must Have
- `CWindow` 继续支持标题栏拖拽与 8 方向 resize
- Demo 有统一主题切换控件与组件目录
- Demo 中常用组件至少包含 Button、RadioGroup、Select、Window、Dock、StartBar、Grid
- 主题切换不重置交互示例状态
- Win98 / WinXP / Default 三套主题继续可见且可测试

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不新增 ThemeProvider / hook / runtime registry 设计
- 不保留 `SystemHost`、`systemType`、`SYSTEM_TYPE`、`DEFAULT_THEME_BY_SYSTEM` 等系统壳层遗留语义
- 不让 Demo 继续依赖 `querySelector('[data-testid="*-window-body"]')` 这类挂载方式
- 不通过兼容 shim 延续旧 API
- 不把 `Grid / Dock / StartBar / Widget` 误删为桌面专用组件

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after + Jest + Playwright
- QA policy: Every task contains agent-executed scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: API/theme foundation + source decoupling + demo foundation + harness refactor + test rewrite foundation (Tasks 1-5)

Wave 2: docs/changelog + dependency cleanup + end-to-end verification alignment (Tasks 6-8)

### Dependency Matrix (full, all tasks)

| Task | Depends On | Blocks |
|---|---|---|
| 1. Public API reset | - | 2, 3, 4, 6, 7, 8 |
| 2. Theme contract refactor | 1 | 4, 5, 6, 7, 8 |
| 3. Remove manager/screen layer | 1 | 4, 5, 6, 7, 8 |
| 4. Rebuild demo catalog | 1, 2, 3 | 5, 6, 7, 8 |
| 5. Refactor Playwright harnesses/tests | 2, 3, 4 | 8 |
| 6. Rewrite Jest coverage | 1, 2, 3, 4 | 8 |
| 7. Docs + knowledge-base update | 1, 2, 3, 4 | 8 |
| 8. Dependency/build/release cleanup | 1, 2, 3, 5, 6, 7 | Final Verification |

### Agent Dispatch Summary

| Wave | Task Count | Categories |
|---|---:|---|
| Wave 1 | 5 | unspecified-high, visual-engineering |
| Wave 2 | 3 | writing, quick, unspecified-high |
| Final | 4 | oracle, unspecified-high, deep |

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Reset public API surface to pure component-library exports

  **What to do**:
  - Rewrite `src/index.ts` so it exports components and pure theme definitions only.
  - Remove exports of `./system/registry`, `./system/SystemHost`, and `./system/types`.
  - Remove `CWindowManager`, `CScreen`, and `CScreenManager` from `src/components/index.ts`.
  - Keep `CWindow`, `CWindowTitle`, `CWindowBody`, `createWindow`, `CGrid`, `CDock`, `CStartBar`, `CWidget`, Button/Radio/Select exports.
  - Introduce or update a pure `ThemeId` / `ThemeDefinition` type in a non-system namespace if needed by exported theme definitions.

  **Must NOT do**:
  - Do not preserve `SystemHost` or `systemType` as deprecated aliases.
  - Do not add a new provider API or runtime registry.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: public API reset with type-level breakage risk
  - Skills: `[]`
  - Omitted: `['git-master']` — no git action required inside implementation task

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 6, 7, 8 | Blocked By: none

  **References**:
  - Pattern: `src/index.ts:1-22` — current library entry exports system registry and resolves theme definitions through system selection
  - Pattern: `src/components/index.ts:1-14` — current component barrel still exports managers and screen layer
  - Pattern: `src/components/Window/index.ts:1-10` — keep `createWindow`, `CWindow`, `CWindowTitle`, resize types intact where possible
  - API/Type: `src/theme/default/index.tsx:1-9` — current theme definitions are tiny objects and can be retyped without system coupling
  - External: `package.json:10-17` — only root export exists today; API reset must still emit valid root typings/bundle

  **Acceptance Criteria**:
  - [ ] `src/index.ts` no longer imports from `src/system/registry`
  - [ ] `src/components/index.ts` no longer exports `WindowManager`, `Screen`, or `ScreenManager`
  - [ ] `grep -R "WindowManager\|ScreenManager\|SystemHost" tests --include='*.test.tsx' --include='*.test.ts'` shows no active legacy shell-manager test suites after replacement coverage lands
  - [ ] `yarn build` completes with the new root exports

  **QA Scenarios**:
  ```bash
  Scenario: API surface excludes shell concepts
    Tool: Bash
    Steps: run `grep -R "export .*SystemHost\|export .*WindowManager\|export .*ScreenManager\|export .*system/registry" src/index.ts src/components/index.ts`
    Expected: no matches
    Evidence: .sisyphus/evidence/task-1-api-surface.txt

  Scenario: preserved window exports remain available
    Tool: Bash
    Steps: run `grep -n "createWindow\|CWindow\|CWindowTitle\|CWindowResizeOptions" src/components/Window/index.ts src/index.ts src/components/index.ts`
    Expected: matches exist for preserved pure-component exports only
    Evidence: .sisyphus/evidence/task-1-api-surface-preserved.txt
  ```

  **Commit**: YES | Message: `refactor(api): remove shell-oriented public exports` | Files: `src/index.ts`, `src/components/index.ts`, related type files

- [x] 2. Refactor theme contract to pure themes without system roots

  **What to do**:
  - Remove `systemType` from exported theme definitions and any type contracts.
  - Replace `.cm-system--*.cm-theme--*` assumptions with a single stable theme root class: `.cm-theme--default`, `.cm-theme--win98`, `.cm-theme--winxp`.
  - Ensure theme SCSS remains imported from stable reachable modules so `sideEffects: false` does not strip styling.
  - Replace registry-based resolution with direct theme lookup for demo/harness use only.
  - Preserve theme definition exports `defaultThemeDefinition`, `win98ThemeDefinition`, `winXpThemeDefinition`.

  **Must NOT do**:
  - Do not keep `DEFAULT_THEME_BY_SYSTEM`, `SYSTEM_THEME_MATRIX`, or any validation that requires system pairing.
  - Do not move theme CSS imports to demo-only code paths.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: theme selector and bundle side-effect correctness are high risk
  - Skills: `[]`
  - Omitted: `['frontend-ui-ux']` — this is contract cleanup, not visual redesign

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 4, 5, 6, 7, 8 | Blocked By: 1

  **References**:
  - Pattern: `src/system/registry.ts:12-85` — remove system/theme matrix and selection validation model entirely
  - Pattern: `src/theme/default/index.tsx:1-9` — current theme definitions include `systemType`; remove that field
  - Pattern: `src/theme/win98/index.tsx:1-9` — same refactor for Win98
  - Pattern: `src/theme/winxp/index.tsx:1-9` — same refactor for WinXP
  - API/Type: `package.json:17` — `sideEffects: false` means style-import reachability must remain explicit
  - Test: `tests/ui/common-controls.smoke.spec.ts:34-43` — current UI tests assert `.cm-system--windows.cm-theme--win98`; update to pure `.cm-theme--win98`

  **Acceptance Criteria**:
  - [ ] `grep -R "systemType:" src/theme src/index.ts src/dev tests` has no matches except migration comments/tests explicitly asserting removal
  - [ ] `grep -R "cm-system--" src/theme src/dev tests` returns no matches
  - [ ] `yarn test -- --runInBand tests/ThemeDefinitions.test.tsx` passes with pure theme definitions

  **QA Scenarios**:
  ```bash
  Scenario: Win98 theme class still styles controls through pure theme root
    Tool: Playwright
    Steps: run `yarn test:ui --grep "Win98 controls"`; verify page root uses `.cm-theme--win98` without any `.cm-system--*` selector in DOM assertions
    Expected: tests pass and themed controls remain visible/styled
    Evidence: .sisyphus/evidence/task-2-theme-root.txt

  Scenario: Theme imports remain reachable in build output
    Tool: Bash
    Steps: run `yarn build && grep -R "cm-theme--win98\|cm-theme--winxp\|cm-theme--default" dist`
    Expected: built assets still contain theme root selectors
    Evidence: .sisyphus/evidence/task-2-theme-build.txt
  ```

  **Commit**: YES | Message: `refactor(theme): decouple themes from system semantics` | Files: `src/theme/**/*`, theme type files, `src/index.ts`, related tests

- [x] 3. Remove manager and screen abstractions while preserving standalone components

  **What to do**:
  - Delete `src/components/Window/WindowManager.tsx`, `src/components/Screen/Screen.tsx`, `src/components/Screen/ScreenManager.tsx`, `src/components/Manager/isManagedConstructor.ts`, and `src/system/*` shell files.
  - Preserve `CWindow`, `CWindowTitle`, `CWindowBody`, `CWidget`, `CDock`, `CStartBar`.
  - Move `CGrid` / `CGridItem` out of `src/components/Screen/Grid.tsx` into a neutral location such as `src/components/Grid/Grid.tsx` with matching barrel export.
  - Remove any hidden reliance on `CScreen` for layout or dataset attributes in remaining components/harnesses.
  - Ensure `CWindow` remains self-sufficient for move/resize through `CWindowTitle` + `@system-ui-js/multi-drag`.

  **Must NOT do**:
  - Do not redesign `CWindow` interaction API unless required for decoupling.
  - Do not delete `CDock` / `CStartBar` just because they originated in shell layouts.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: cross-file source deletion, relocation, and type fallout
  - Skills: `[]`
  - Omitted: `['refactor']` — task is bounded and can be handled directly

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 5, 6, 7, 8 | Blocked By: 1

  **References**:
  - Pattern: `src/system/SystemHost.tsx:11-44` — entire shell-selection root is to be deleted
  - Pattern: `src/system/default/DefaultSystem.tsx:40-86` — current demo shell composition uses `DefaultScreen + CWindowManager + CWindow`
  - Pattern: `src/system/windows/WindowsSystem.tsx:42-60` — current Windows shell composition uses `WindowsScreen + CWindowManager + CStartBar`
  - Pattern: `src/components/Window/Window.tsx:69-464` — preserve drag/resize implementation and child composition logic
  - Pattern: `src/components/Window/WindowTitle.tsx:27-90` — preserve title drag behavior
  - Pattern: `src/components/Widget/Widget.tsx:21-52` — preserve frame/layout primitive used by Window/Dock/StartBar
  - Pattern: `src/components/Dock/Dock.tsx:37-74` — standalone dock should remain valid without screen manager
  - Pattern: `src/components/StartBar/StartBar.tsx:22-68` — start bar should remain a component, not shell runtime chrome
  - Pattern: `src/components/Screen/Grid.tsx:21-86` — move to neutral component namespace and keep behavior

  **Acceptance Criteria**:
  - [ ] `src/system/` no longer contains runtime shell entrypoints used by production exports
  - [ ] `grep -R "WindowManager\|ScreenManager\|data-system-type\|data-theme" src/components src/dev tests` returns no remaining implementation coupling to deleted abstractions
  - [ ] `yarn test -- --runInBand tests/Grid.test.tsx tests/Dock.test.tsx tests/StartBar.test.tsx` passes after relocation/decoupling

  **QA Scenarios**:
  ```bash
  Scenario: standalone window still moves and resizes without manager/screen wrappers
    Tool: Playwright
    Steps: run `yarn test:ui --grep "window"`; use standalone window harness page, drag `[data-testid="window-title"]`, then drag `[data-testid="window-resize-se"]`
    Expected: frame metrics change in both move and resize tests with no screen-root dependency
    Evidence: .sisyphus/evidence/task-3-window-standalone.txt

  Scenario: neutral Grid component path is active
    Tool: Bash
    Steps: run `grep -R "from './Screen/Grid'\|from '../Screen/Grid'\|components/Screen/Grid" src tests`
    Expected: no matches; imports point to neutral Grid location
    Evidence: .sisyphus/evidence/task-3-grid-relocation.txt
  ```

  **Commit**: YES | Message: `refactor(core): remove screen and manager abstractions` | Files: `src/system/**/*`, `src/components/**/*`, moved Grid files, related tests

- [x] 4. Rebuild dev demo as a themeable component catalog

  **What to do**:
  - Replace `src/dev/main.tsx` polling mount strategy with a single direct React root that renders the entire catalog app.
  - Delete or fully repurpose `src/dev/themeSwitcher.tsx` so it manages theme-only selection state.
  - Keep `src/dev/commonControlsPreview.tsx` as the seed for a broader catalog; either rename it or embed it into a catalog page with sections.
  - Add a stable root container with `data-testid="component-catalog"`, `data-testid="catalog-theme-switch"`, and a `cm-theme--*` class.
  - Add explicit catalog sections for Button, RadioGroup, Select, Window, Dock, StartBar, and Grid.
  - Preserve interactive state per section when theme changes.
  - Provide a stage container with `position: relative; min-height: 100vh;` or equivalent so Window/Dock/StartBar demos remain visually correct without `CScreen`.

  **Must NOT do**:
  - Do not mount content into `default-window-body` or `windows-window-body` selectors.
  - Do not reintroduce system switching UI.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: demo information architecture + themed component showcase layout
  - Skills: `['frontend-ui-ux']` — use for catalog ergonomics and theme switcher presentation
  - Omitted: `['playwright']` — browser verification belongs to QA scenario, not implementation step

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6, 7, 8 | Blocked By: 1, 2, 3

  **References**:
  - Pattern: `src/dev/main.tsx:7-54` — remove window-body polling and replace with direct catalog app root
  - Pattern: `src/dev/themeSwitcher.tsx:1-76` — current selection model is system-based and should be reduced to pure theme switching
  - Pattern: `src/dev/commonControlsPreview.tsx:10-96` — existing interactive controls preview is the canonical seed section
  - Pattern: `src/system/default/DefaultSystem.tsx:29-38` — previous default window sizing hints can inform the standalone Window showcase sample
  - Pattern: `src/system/windows/WindowsSystem.tsx:26-35` — previous sample frame can inform a consistent Window demo fixture
  - Test: `tests/ui/common-controls.helpers.ts:3-96` — existing stable test IDs for common controls should be preserved where possible

  **Acceptance Criteria**:
  - [ ] `src/dev/main.tsx` no longer queries DOM for preview hosts
  - [ ] Visiting dev page shows `data-testid="component-catalog"`
  - [ ] Theme switch control toggles among `default`, `win98`, `winxp` while `buttonClicks`, selected radio, selected select option, and window pose/state remain intact
  - [ ] Catalog contains visible sections for Button, Radio, Select, Window, Dock, StartBar, and Grid

  **QA Scenarios**:
  ```bash
  Scenario: theme switch preserves interactive demo state
    Tool: Playwright
    Steps: open dev page; click `[data-testid="button-demo-primary"]` twice; select radio `Orange`; set `[data-testid="select-demo-size"]` to `large`; drag `[data-testid="window-title"]` by 40x20; change `[data-testid="catalog-theme-switch"]` from `default` to `win98`
    Expected: click count remains `2`, selected fruit remains `orange`, select value remains `large`, window frame metrics remain moved, root class becomes `cm-theme--win98`
    Evidence: .sisyphus/evidence/task-4-catalog-theme-switch.txt

  Scenario: catalog renders all planned component sections
    Tool: Playwright
    Steps: open dev page and assert presence of `[data-testid="catalog-section-button"]`, `catalog-section-radio`, `catalog-section-select`, `catalog-section-window`, `catalog-section-dock`, `catalog-section-start-bar`, `catalog-section-grid`
    Expected: all seven section containers are visible
    Evidence: .sisyphus/evidence/task-4-catalog-sections.txt
  ```

  **Commit**: YES | Message: `refactor(dev): replace system demo with component catalog` | Files: `src/dev/**/*`, demo styles, supporting helpers

- [x] 5. Refactor Playwright harnesses and UI tests to pure-theme standalone fixtures

  **What to do**:
  - Keep `playwright-common-controls.html` and `playwright-window.html`, but remove `systemType` query params and screen-root expectations.
  - Update harness code and helpers so supported URL shape is `?theme=<default|win98|winxp>&fixture=<name>` only.
  - Rewrite selectors/assertions from `.cm-system--windows.cm-theme--win98` to pure `.cm-theme--win98` roots.
  - Preserve direct interaction tests for Window move/resize and common control themed styling.
  - Delete UI tests that only validate system switching, screen scoping, or shell reboot semantics.

  **Must NOT do**:
  - Do not continue checking `data-system-type` / `data-theme` on `screen-root`.
  - Do not drop window interaction coverage just because the shell is removed.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: harness/test contract rewrite across multiple browser specs
  - Skills: `[]`
  - Omitted: `['frontend-ui-ux']` — this is test infrastructure, not design work

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 8 | Blocked By: 2, 3, 4

  **References**:
  - Pattern: `tests/ui/common-controls.helpers.ts:59-88` — remove `systemType` from helper URLs
  - Pattern: `tests/ui/window.helpers.ts:10-120` — remove `WindowHarnessSelection.systemType`, `screen-root` checks, and popstate-based system switching
  - Test: `tests/ui/common-controls.smoke.spec.ts:34-353` — current themed checks already exist and should be ported to pure-theme roots
  - Test: `tests/ui/window.helpers.ts:15-21` — current fixture IDs for frame/title/resize handles should remain stable to minimize churn

  **Acceptance Criteria**:
  - [ ] `tests/ui/common-controls.helpers.ts` exposes theme-only helper types
  - [ ] `tests/ui/window.helpers.ts` no longer references `screen-root`, `systemType`, or `PopStateEvent` for selection switching
  - [ ] `yarn test:ui` passes with remaining browser tests covering controls + window + catalog smoke

  **QA Scenarios**:
  ```
  Scenario: theme-only common controls harness works for Win98 disabled fixture
    Tool: Playwright
    Steps: run `yarn test:ui --grep "Win98 disabled controls"`
    Expected: browser tests pass using `?theme=win98&fixture=disabled` only
    Evidence: .sisyphus/evidence/task-5-common-controls-harness.txt

  Scenario: window harness no longer requires screen-root metadata
    Tool: Bash
    Steps: run `grep -R "screen-root\|systemType\|PopStateEvent" tests/ui/window.helpers.ts src/dev/playwright`
    Expected: no matches for removed shell semantics
    Evidence: .sisyphus/evidence/task-5-window-harness.txt
  ```

  **Commit**: YES | Message: `test(ui): rewrite harnesses for pure theme fixtures` | Files: `playwright-*.html`, `src/dev/playwright/**/*`, `tests/ui/**/*`

- [x] 6. Rewrite Jest coverage around standalone components and breaking API removal

  **What to do**:
  - Delete shell/manager-focused tests: `WindowManager.test.tsx`, `ScreenManager.test.tsx`, `ScreenScope.test.tsx`, `SystemShellCharacterization.test.tsx`, `SystemHost.test.tsx`, `SystemTypeSwitch.test.tsx`, `SystemTypeThemeRegistry.test.tsx`, `DevSystemSelection.test.tsx`, `ThemeSwitchPreservation.test.tsx`, plus any helper fixtures that only support those models.
  - Add/refresh unit tests for standalone `CWindow`, `CWindowTitle`, `CWindowBody`, `CGrid`, `CDock`, `CStartBar`, and pure theme-definition exports.
  - Validate that `CWindow` still updates pose/state via title dragging hooks and preserves resize clamps.
  - Validate catalog-level theme switching state preservation in a React test if feasible without Playwright duplication.

  **Must NOT do**:
  - Do not leave deleted-manager tests commented out or skipped.
  - Do not rely solely on Playwright for basic component contracts that Jest can cover faster.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: broad test-suite rewrite with contract decisions already made
  - Skills: `[]`
  - Omitted: `['playwright']` — browser-specific coverage handled in Task 5

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8 | Blocked By: 1, 2, 3, 4

  **References**:
  - Test: `tests/WindowManager.test.tsx:26-132` — delete entire manager-registration suite
  - Pattern: `src/components/Window/Window.tsx:217-347` — preserve resize clamp behavior with direct tests
  - Pattern: `src/components/Window/WindowTitle.tsx:31-54` — preserve drag lifecycle and cleanup behavior
  - Pattern: `src/components/Widget/Widget.tsx:24-48` — keep frame positioning contract stable for dependent components
  - Pattern: `src/components/Dock/Dock.tsx:58-73` — direct renderFrame usage should be tested without shell wrapper
  - Pattern: `src/components/StartBar/StartBar.tsx:41-67` — start bar structure should be directly asserted

  **Acceptance Criteria**:
  - [ ] No Jest test file imports from `src/system/*`, `WindowManager`, or `ScreenManager`
  - [ ] `yarn test -- --runInBand` passes
  - [ ] Replacement tests cover: pure theme exports, standalone window pose/resize behavior, Grid relocation, Dock/StartBar rendering

  **QA Scenarios**:
  ```
  Scenario: obsolete shell tests are fully removed
    Tool: Bash
    Steps: run `grep -R "WindowManager\|SystemHost\|ScreenManager\|SystemTypeSwitch" tests --include='*.test.tsx' --include='*.test.ts'`
    Expected: matches only appear in migration comments or snapshot names that document removal; no active imports/spec suites remain
    Evidence: .sisyphus/evidence/task-6-jest-cleanup.txt

  Scenario: standalone component Jest suite passes
    Tool: Bash
    Steps: run `yarn test -- --runInBand`
    Expected: all Jest suites pass
    Evidence: .sisyphus/evidence/task-6-jest-pass.txt
  ```

  **Commit**: YES | Message: `test(unit): replace shell coverage with component tests` | Files: `tests/**/*`, related fixtures/helpers

- [x] 7. Update docs and project knowledge to match the new component-library definition

  **What to do**:
  - Rewrite `README.md` to describe Chameleon as a pure component library with themeable component demos, not a desktop-shell library.
  - Keep Window documentation, but describe it as a standalone draggable/resizable component instead of a managed shell window.
  - Remove README instructions that mention registering themes through system-oriented APIs that no longer exist.
  - Update `AGENTS.md` structure/where-to-look notes so it no longer references shell-centric architecture or nonexistent `docs/` assumptions unless actually present.
  - Add a `[UnReleased]` entry to `CHANGELOG.md` documenting the breaking API reset.

  **Must NOT do**:
  - Do not leave stale references to `ThemeContext`, `systemType`, or `SystemHost` in docs.
  - Do not document APIs that are intentionally removed in this refactor.

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: API/docs migration and changelog authoring
  - Skills: `[]`
  - Omitted: `['frontend-ui-ux']` — prose update, not design work

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8 | Blocked By: 1, 2, 3, 4

  **References**:
  - Pattern: `README.md` “How to create a theme” + “Window composition” sections — currently mention obsolete theme registration and system-shaped theme model
  - Pattern: `AGENTS.md:11-35` — update structure hints and “where to look” guidance if component/demo layout moves
  - Pattern: `AGENTS.md:90-106` — ensure active technologies/notes reflect the new pure component-library positioning
  - External: `CHANGELOG.md` — add `[UnReleased]` entry per repo convention from root AGENTS instructions

  **Acceptance Criteria**:
  - [ ] `README.md` no longer contains `SystemHost`, `systemType`, `ScreenManager`, `WindowManager`, or stale theme registration examples
  - [ ] `AGENTS.md` accurately points contributors toward `src/components/`, `src/dev/`, tests, and theme files under the new model
  - [ ] `CHANGELOG.md` includes `[UnReleased]` entry for the breaking change

  **QA Scenarios**:
  ```
  Scenario: docs contain no removed API names
    Tool: Bash
    Steps: run `grep -R "SystemHost\|systemType\|ScreenManager\|WindowManager\|DEFAULT_THEME_BY_SYSTEM" README.md AGENTS.md CHANGELOG.md`
    Expected: no matches in README/AGENTS; CHANGELOG may mention removals only in the new UnReleased entry
    Evidence: .sisyphus/evidence/task-7-docs-grep.txt

  Scenario: changelog records the breaking reset
    Tool: Bash
    Steps: run `grep -n "\[UnReleased\]" CHANGELOG.md && grep -n "pure component library\|remove SystemHost\|remove WindowManager" CHANGELOG.md`
    Expected: both matches exist
    Evidence: .sisyphus/evidence/task-7-changelog.txt
  ```

  **Commit**: YES | Message: `docs: redefine chameleon as pure component library` | Files: `README.md`, `AGENTS.md`, `CHANGELOG.md`

- [x] 8. Clean dependencies, CI expectations, and release verification around the new model

  **What to do**:
  - Remove unused dependencies left behind by manager/shell deletion, especially `eventemitter3` if no remaining source imports it.
  - Keep `@system-ui-js/multi-drag` if still required by `CWindow` / `CWindowTitle`.
  - Ensure CI-relevant commands still cover lint, Jest, Playwright, and build without assuming deleted tests.
  - Run full release-gate sequence locally: lint → test → test:ui → build.
  - Confirm bundle output still exposes styles and types for preserved pure components and themes.

  **Must NOT do**:
  - Do not remove `multi-drag` if Window drag/resize still depends on it.
  - Do not leave unused shell-only helper files in source or tests.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: mostly cleanup + verification once prior tasks land
  - Skills: `[]`
  - Omitted: `['git-master']` — commit handled at workflow level, not inside task logic

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Final Verification | Blocked By: 1, 2, 3, 5, 6, 7

  **References**:
  - Pattern: `package.json:21-32` — release-gate command set remains lint/test/test:ui/build
  - Pattern: `package.json:75-78` — dependency cleanup target list includes `eventemitter3` and `@system-ui-js/multi-drag`
  - Pattern: `tests/ui/window.helpers.ts:15-120` — harness cleanup should eliminate shell-only assumptions before final UI gate
  - Pattern: `src/dev/main.tsx:27-54` — full dev catalog must remain bootable under Vite after root rewrite

  **Acceptance Criteria**:
  - [ ] `grep -R "eventemitter3" src tests package.json yarn.lock` shows either zero runtime usage plus dependency removal, or explicit retained usage with justification
  - [ ] `yarn lint && yarn test -- --runInBand && yarn test:ui && yarn build` all pass
  - [ ] No dead source/test files remain under deleted shell namespaces

  **QA Scenarios**:
  ```
  Scenario: dependency cleanup matches runtime reality
    Tool: Bash
    Steps: run `grep -R "eventemitter3\|multi-drag" src tests package.json`
    Expected: `multi-drag` remains only if Window logic still imports it; `eventemitter3` is gone unless justified by surviving code
    Evidence: .sisyphus/evidence/task-8-dependencies.txt

  Scenario: full release gate passes
    Tool: Bash
    Steps: run `yarn lint && yarn test -- --runInBand && yarn test:ui && yarn build`
    Expected: all commands exit 0
    Evidence: .sisyphus/evidence/task-8-release-gates.txt
  ```

  **Commit**: YES | Message: `chore: finalize pure component library cleanup` | Files: `package.json`, lockfile, CI/docs/test leftovers as needed

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [x] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit 1: API/theme contract reset (`refactor(api): ...`, `refactor(theme): ...`)
- Commit 2: core source + demo/harness rewrite (`refactor(core): ...`, `refactor(dev): ...`, `test(ui): ...`)
- Commit 3: Jest/docs/cleanup finish (`test(unit): ...`, `docs: ...`, `chore: ...`)

## Success Criteria
- Chameleon no longer models itself as a desktop shell or system host.
- Consumers import standalone components and pure theme definitions from the package root.
- Demo is a direct component catalog with preserved interaction state across theme changes.
- `CWindow` move/resize behavior still works without managers/screens.
- `CGrid`, `CDock`, `CStartBar`, and `CWidget` remain valid public library primitives.
- Tests and documentation describe only the new pure component-library model.
