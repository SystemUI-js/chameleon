# Window Drag Resize Into CWidget

## TL;DR
> **Summary**: Move `CWindow`'s drag and resize mechanics into `CWidget`, make `CWidget` the single owner of interactive frame state, and keep window-specific rendering/theme behavior in `CWindow`.
> **Deliverables**:
> - `CWidget` owns frame state, pose helpers, resize lifecycle, and resize handle rendering
> - `CWindow` delegates drag/resize to `CWidget` and keeps only window-specific composition/styling behavior
> - Jest + Playwright regressions prove title drag, content no-op, 8-direction resize, clamp rules, and manager/theme compatibility
> **Effort**: Large
> **Parallel**: YES - 1 final review wave only; implementation is intentionally serialized
> **Critical Path**: Task 1 -> Task 2 -> Task 3 -> Task 4 -> Task 5

## Context
### Original Request
- 把 `Window` 的 `Resize` 和拖动功能，抽象到 `CWidget` 组件里面。

### Interview Summary
- 现状已经是 `CWidget -> CWindow` 继承关系，标题栏拖动由 `CWindowTitle` 注入式回调驱动，真正重耦合的是 `CWindow` 内部 resize 实现。
- 用户确认允许顺手整理 drag/resize 直接相关的 `CWindow` API/DOM 契约，不要求严格限制为纯内部重构。
- 用户确认测试策略为“测试后补”，但仍需复用现有 Jest、Playwright、CI 流程完成自动化验证。

### Metis Review (gaps addressed)
- 先固定一个明确结论：`CWidget` 作为交互 frame 的唯一状态拥有者，统一维护 `x/y/width/height` 与 gesture lifecycle，避免 `CWidget`/`CWindow` 双重写入。
- 为避免 scope creep，本次不引入 hooks、context、全新手势架构，也不替换 `@system-ui-js/multi-drag`。
- DOM/test 约定采用“保留测试可见契约，清理内部实现”的策略：保留 `window-frame`、`window-content`、`window-title`、`window-resize-*`、`data-window-uuid`，只清理 `CWindow` 内部 drag/resize 方法与注入路径。
- `CWindowTitle` 的对外 props 名称本次保持兼容；重构目标是把注入责任转移到 `CWidget`，不是同时发起命名迁移。

## Work Objectives
### Core Objective
- 让 `CWidget` 成为可复用的交互底座，统一承载 frame state、拖动 pose、resize 句柄与生命周期管理；`CWindow` 只保留 window-specific 的 className、内容结构、标题栏识别规则与主题扩展点。

### Deliverables
- `src/components/Widget/Widget.tsx` 承担 frame state ownership、受控 props 同步、generic pose helpers、resize 选项归一化、handle ref/Drag 实例生命周期。
- `src/components/Window/Window.tsx` 删除本地 drag/resize 核心逻辑，改为通过 `CWidget` 的受保护扩展点输出当前窗口 DOM。
- `src/components/Window/WindowTitle.tsx` 继续作为标题栏拖动句柄，但由 widget-level 注入链路驱动窗口移动。
- `src/components/Window/WindowManager.tsx`、`src/theme/default/index.tsx`、相关测试与 Playwright 夹具在新抽象下保持兼容。

### Definition of Done (verifiable conditions with commands)
- `yarn test --runInBand tests/CWindowTitleComposition.test.tsx` 通过，且覆盖 title drag、content no-op、8 向 resize、min/max clamp、`resizable={false}`。
- `yarn test --runInBand tests/WindowManager.test.tsx tests/DefaultTheme.test.tsx` 通过，且无 `CWidget` 注册/主题 class 回归。
- `yarn playwright test tests/ui/window.smoke.spec.ts tests/ui/window.move.spec.ts tests/ui/window.resize.spec.ts tests/ui/window.resize-guards.spec.ts` 通过。
- `yarn lint && yarn build` 通过。

### Must Have
- `CWidget` 成为 `x/y/width/height` 的单一事实来源，`CWindow` 不再维护独立 frame state。
- `CWindowTitle` 仍只能在显式组合时触发窗口移动，拖动内容区域必须保持无效。
- 8 个 resize 方向继续保持现有 anchor 语义；west/north 方向继续同步修正 `x/y`。
- `resizeOptions.edgeWidth/minContentWidth/minContentHeight/maxContentWidth/maxContentHeight` 语义保持不变。
- `CWindowManager` 对 `CWidget`/`CWindow`/子类的注册识别继续成立。

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不把本次重构扩展成 hooks/context 重写。
- 不修改 `WindowManager` 的业务语义，不改主题系统结构，不新增视觉改版。
- 不删除现有 test IDs 与 `data-window-uuid`，除非有测试同步迁移且只影响 drag/resize 内部实现；本计划默认不删除。
- 不引入第二套拖拽库或浏览器原生 pointer-gesture 重写。

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after + Jest 29 / React Testing Library / Playwright
- QA policy: Every task includes agent-executed command or browser scenario; no visual-only checks
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> This refactor is intentionally serialized because every implementation task mutates the same `CWidget`/`CWindow` inheritance chain. Parallelism is reserved for the final review wave after Task 5 is complete.

Wave 1: Task 1 `CWidget frame ownership`
Wave 2: Task 2 `CWidget resize engine`
Wave 3: Task 3 `CWindow/CWindowTitle delegation`
Wave 4: Task 4 `manager/theme compatibility`
Wave 5: Task 5 `Playwright contract refresh`

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
|---|---|---|
| 1 | none | 2, 3, 4, 5 |
| 2 | 1 | 3, 4, 5 |
| 3 | 1, 2 | 4, 5 |
| 4 | 1, 2, 3 | 5 |
| 5 | 1, 2, 3, 4 | F1-F4 |
| F1 | 1, 2, 3, 4, 5 | complete |
| F2 | 1, 2, 3, 4, 5 | complete |
| F3 | 1, 2, 3, 4, 5 | complete |
| F4 | 1, 2, 3, 4, 5 | complete |

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 -> 1 task -> `unspecified-high`
- Wave 2 -> 1 task -> `unspecified-high`
- Wave 3 -> 1 task -> `unspecified-high`
- Wave 4 -> 1 task -> `quick`
- Wave 5 -> 1 task -> `visual-engineering`
- Final Verification -> 4 tasks -> `deep`, `unspecified-high`, `visual-engineering`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Make `CWidget` the sole owner of interactive frame state

  **What to do**: Refactor `src/components/Widget/Widget.tsx` so `CWidget` owns normalized `x/y/width/height` state initialized from props, exposes protected frame helpers (`getDragPose`, frame patch/setter, controlled-prop sync), and keeps `renderFrame()` as the single renderer for positioned widget frames. Remove duplicated frame-state ownership from subclasses by making `CWindow` consume these protected helpers instead of its own state shape.
  **Must NOT do**: Do not introduce hooks/context, do not export a new public API from `src/index.ts`, and do not change `widget-frame` / `window-frame` test ids in this step.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: class-component refactor with state-ownership decisions and downstream compatibility impact
  - Skills: `[]` — no additional skill is required for the code move
  - Omitted: [`refactor`] — not needed because the change is localized and the plan already fixes the target structure

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 5 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Widget/Widget.tsx:21` — existing `CWidget` class and current `uuid` ownership
  - Pattern: `src/components/Widget/Widget.tsx:24` — current `renderFrame()` contract that all positioned widgets already use
  - Pattern: `src/components/Window/Window.tsx:72` — current subclass constructor-owned frame state that must move upward
  - Pattern: `src/components/Window/Window.tsx:113` — existing drag pose shape expected by `Drag`
  - Pattern: `src/components/Window/Window.tsx:124` — existing frame patch semantics for move updates
  - Test: `tests/CWindowTitleComposition.test.tsx:67` — `uuid` stability requirement across rerender
  - Test: `tests/WindowManager.test.tsx:96` — `CWidget` constructor is directly registrable in `CWindowManager`
  - API/Type: `src/components/Manager/isManagedConstructor.ts:7` — manager relies on prototype chain and must continue to recognize `CWidget`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `src/components/Widget/Widget.tsx` owns the authoritative interactive frame state and exposes protected helpers used by subclasses instead of forcing each subclass to reimplement `x/y/width/height` state.
  - [ ] `CWindow` no longer declares its own canonical frame state shape for steady-state rendering; frame reads come from the base class.
  - [ ] `CWidget.uuid` remains stable across rerender and still renders a positioned frame with inline `left/top/width/height` styles.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Base frame ownership remains stable
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/CWindowTitleComposition.test.tsx --testNamePattern="uuid|Composed Title|content area"`
    Expected: Exit code 0; output includes the uuid stability test and composition/no-op drag tests passing.
    Evidence: .sisyphus/evidence/task-1-widget-frame-state.txt

  Scenario: Manager still accepts CWidget constructor
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/WindowManager.test.tsx --testNamePattern="direct CWidget constructor|updates cached window element"`
    Expected: Exit code 0; output shows `CWidget` remains instantiable and manager updates rendered element props correctly.
    Evidence: .sisyphus/evidence/task-1-widget-frame-state-manager.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: none — hold changes for the shared widget refactor commit created after Task 2

- [x] 2. Move resize engine and handle lifecycle into `CWidget`

  **What to do**: Transfer resize option normalization, resize math, handle refs, `Drag` instance setup/cleanup, and handle rendering from `src/components/Window/Window.tsx` into `src/components/Widget/Widget.tsx`. Keep resize semantics generic in the base class, but preserve the existing `window-resize-${dir}` test ids and current edge geometry so browser and unit tests keep the same observable contract.
  **Must NOT do**: Do not rename `resizeOptions`, do not change min/max clamp rules, and do not remove the 8-direction handle matrix.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: shared gesture engine extraction with lifecycle cleanup risk
  - Skills: `[]` — existing repo patterns are sufficient
  - Omitted: [`frontend-ui-ux`] — no design work is involved

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 3, 4, 5 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Window/Window.tsx:141` — current resize option normalization and clamp rules
  - Pattern: `src/components/Window/Window.tsx:197` — anchor-preserving resize math for west/north directions
  - Pattern: `src/components/Window/Window.tsx:255` — current resize Drag lifecycle and pointerdown bookkeeping
  - Pattern: `src/components/Window/Window.tsx:308` — cleanup behavior that must still disable Drag instances and remove listeners
  - Pattern: `src/components/Window/Window.tsx:329` — handle style contract for `edgeWidth` and touch/pointer behavior
  - Pattern: `src/components/Window/Window.tsx:349` — current rendered handle matrix and `window-resize-*` ids
  - Test: `tests/CWindowTitleComposition.test.tsx:143` — 8-direction resize matrix
  - Test: `tests/CWindowTitleComposition.test.tsx:199` — `resizable={false}` still disables handles while preserving drag
  - Test: `tests/CWindowTitleComposition.test.tsx:223` — default and custom `edgeWidth` expectations
  - Test: `tests/CWindowTitleComposition.test.tsx:253` — min/max clamp assertions
  - External: `src/components/Window/Window.tsx:2` — `Drag` from `@system-ui-js/multi-drag` is the required engine to keep

  **Acceptance Criteria** (agent-executable only):
  - [ ] All resize setup/cleanup state moves to `CWidget`, and `CWindow` no longer directly owns resize handle refs, drag-instance maps, or resize-start maps.
  - [ ] The base class still renders eight resize handles with unchanged test ids and unchanged edgeWidth geometry.
  - [ ] East/west/north/south/corner resizing still preserves existing clamp and anchor behavior.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Resize matrix stays behaviorally identical
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/CWindowTitleComposition.test.tsx --testNamePattern="resizes window|edgeWidth|clamps"`
    Expected: Exit code 0; output shows the 8-direction matrix, edgeWidth, and clamp tests all passing.
    Evidence: .sisyphus/evidence/task-2-widget-resize-engine.txt

  Scenario: Browser-level resize guards remain intact
    Tool: Bash
    Steps: Run `yarn playwright test tests/ui/window.resize.spec.ts tests/ui/window.resize-guards.spec.ts`
    Expected: Exit code 0; all resize matrix and guard specs pass without selector changes.
    Evidence: .sisyphus/evidence/task-2-widget-resize-engine-playwright.txt
  ```

  **Commit**: YES | Message: `refactor(widget): centralize frame ownership and resize lifecycle in cwidget` | Files: `src/components/Widget/Widget.tsx`, `src/components/Window/Window.tsx`, `tests/CWindowTitleComposition.test.tsx`, `tests/WindowManager.test.tsx`, `tests/ui/window.resize.spec.ts`, `tests/ui/window.resize-guards.spec.ts`

- [x] 3. Delegate title-drag composition from `CWindow` to widget-level helpers

  **What to do**: Rewrite `src/components/Window/Window.tsx` so it stops owning `getDragPose`, `handleWindowMove`, and child-cloning drag wiring directly. Add protected widget-level composition hooks in `CWidget` for “move handle child detection” and “frame move application,” then have `CWindow` opt into those hooks for `CWindowTitle` children. Keep `CWindowTitle` public props compatible, but route the injected callbacks from `CWidget` rather than `CWindow`.
  **Must NOT do**: Do not make `CWindowTitle` implicit, do not allow dragging from content/body, and do not rename `window-title` / `window-content` test ids.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: brittle composition contract and prototype-based child detection must stay intact
  - Skills: `[]` — existing file-local patterns are sufficient
  - Omitted: [`artistry`] — unconventional redesign is explicitly out of scope

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 4, 5 | Blocked By: 1, 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Window/Window.tsx:113` — current drag pose shape used by title drag
  - Pattern: `src/components/Window/Window.tsx:124` — current move patch logic
  - Pattern: `src/components/Window/Window.tsx:377` — current child-cloning composition path
  - Pattern: `src/components/Window/Window.tsx:394` — current `CWindowTitle` detection logic, including subclass support
  - Pattern: `src/components/Window/Window.tsx:407` — current content + frame render nesting
  - Pattern: `src/components/Window/WindowTitle.tsx:9` — public props that currently receive injected move callbacks
  - Pattern: `src/components/Window/WindowTitle.tsx:21` — title drag lifecycle using `Drag`
  - Pattern: `src/components/Window/WindowTitle.tsx:46` — fallback pose behavior when explicit pose is absent
  - Test: `tests/CWindowTitleComposition.test.tsx:79` — title remains explicit composition only
  - Test: `tests/CWindowTitleComposition.test.tsx:99` — title drag moves frame
  - Test: `tests/CWindowTitleComposition.test.tsx:122` — content drag remains no-op
  - Test: `tests/CWindowTitleComposition.test.tsx:317` — drag remains independent from resize side effects

  **Acceptance Criteria** (agent-executable only):
  - [ ] `CWindow` no longer contains widget-generic move ownership logic; title-drag injection is driven by `CWidget` protected hooks.
  - [ ] `CWindowTitle` still works when explicitly composed, and body/content dragging still does nothing.
  - [ ] Drag behavior remains independent from resize behavior after the delegation move.
  - [ ] Add at least one unit case covering active-gesture teardown or post-unmount safety for the new widget-level drag wiring.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Title drag still moves only when explicitly composed
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/CWindowTitleComposition.test.tsx --testNamePattern="implicitly render|moves window frame|content area|independent from resize"`
    Expected: Exit code 0; composed-title, title-drag, content no-op, and drag independence tests all pass.
    Evidence: .sisyphus/evidence/task-3-widget-title-drag.txt

  Scenario: Browser move behavior stays unchanged
    Tool: Bash
    Steps: Run `yarn playwright test tests/ui/window.move.spec.ts tests/ui/window.smoke.spec.ts`
    Expected: Exit code 0; smoke and move specs pass with the existing `window-title`/`window-content` selectors.
    Evidence: .sisyphus/evidence/task-3-widget-title-drag-playwright.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: none — hold changes for the shared window delegation commit created after Task 4

- [x] 4. Preserve manager, theme, and selector compatibility after the base-class move

  **What to do**: Audit every place that depends on `CWidget`/`CWindow` identity or window DOM markers, then make only the compatibility edits required to keep them stable. This includes keeping `CWindowManager` prototype-chain registration valid, preserving `data-window-uuid` on `window-content`, and keeping default theme subclasses layered on top of `CWindow`/`CWindowTitle` without class-name regressions.
  **Must NOT do**: Do not change how `CWindowManager` deduplicates constructors, do not remove `data-window-uuid`, and do not rename default theme class names.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: compatibility sweep across a few focused files with precise regression assertions
  - Skills: `[]` — direct repository patterns are enough
  - Omitted: [`git-master`] — no git operation is required at this stage

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: 5 | Blocked By: 1, 2, 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Window/Window.tsx:410` — `window-content` and `data-window-uuid` placement that must survive the refactor
  - Pattern: `src/components/Window/Window.tsx:437` — `window-frame` class/testId contract
  - Pattern: `src/components/Window/WindowManager.tsx:9` — manager registers `typeof CWidget`
  - Pattern: `src/components/Window/WindowManager.tsx:73` — manager delegates type safety to `isManagedConstructor(candidate, CWidget)`
  - Pattern: `src/components/Manager/isManagedConstructor.ts:7` — prototype-chain contract that must keep working
  - Pattern: `src/theme/default/index.tsx:8` — default theme subclasses `CWindow`
  - Pattern: `src/theme/default/index.tsx:18` — default theme subclasses `CWindowTitle`
  - Test: `tests/WindowManager.test.tsx:26` — manager registration, deduplication, and cached element update behavior
  - Test: `tests/DefaultTheme.test.tsx:5` — base/default class layering and drag support contract
  - Search Result: `tests/ui/window.helpers.ts:10` — Playwright helpers still expect current test ids and selectors

  **Acceptance Criteria** (agent-executable only):
  - [ ] `CWindowManager` still accepts `CWidget`, `CWindow`, and subclasses with no duplicate render regressions.
  - [ ] `window-frame`, `window-content`, `window-title`, `window-resize-*`, and `data-window-uuid` remain available at their current semantic locations.
  - [ ] Default theme subclasses keep base class names plus theme-specific class names and still support dragging.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Manager compatibility remains intact
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/WindowManager.test.tsx`
    Expected: Exit code 0; all constructor registration, deduplication, and cached-element update assertions pass.
    Evidence: .sisyphus/evidence/task-4-manager-theme-compat.txt

  Scenario: Theme layering and drag contract stay stable
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/DefaultTheme.test.tsx`
    Expected: Exit code 0; output shows default theme retains base classes, theme classes, and drag behavior.
    Evidence: .sisyphus/evidence/task-4-manager-theme-theme.txt
  ```

  **Commit**: YES | Message: `refactor(window): delegate drag resize to cwidget and preserve compatibility` | Files: `src/components/Widget/Widget.tsx`, `src/components/Window/Window.tsx`, `src/components/Window/WindowTitle.tsx`, `src/components/Window/WindowManager.tsx`, `src/components/Manager/isManagedConstructor.ts`, `src/theme/default/index.tsx`, `tests/CWindowTitleComposition.test.tsx`, `tests/WindowManager.test.tsx`, `tests/DefaultTheme.test.tsx`, `tests/ui/window.move.spec.ts`, `tests/ui/window.smoke.spec.ts`

- [x] 5. Refresh Playwright contract coverage for the finalized widget abstraction

  **What to do**: Update `tests/ui/window.helpers.ts` and the window UI specs only where needed to reflect the finalized drag/resize contract after the base-class move. Preserve existing selectors by default; only adjust helper internals or fixture expectations if the refactor changes render timing or frame ownership timing. The goal is browser-level proof that no drag/resize regression escaped the unit suite.
  **Must NOT do**: Do not weaken assertions, do not replace exact metric assertions with loose ranges, and do not add manual verification steps.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: browser-interaction regression coverage with DOM-contract sensitivity
  - Skills: [`playwright`] — browser-task skill is required for interactive verification and fixture debugging
  - Omitted: [`frontend-ui-ux`] — no visual redesign is involved

  **Parallelization**: Can Parallel: NO | Wave 5 | Blocks: F1, F2, F3, F4 | Blocked By: 1, 2, 3, 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/ui/window.helpers.ts:10` — canonical test ids consumed by all UI specs
  - Pattern: `tests/ui/window.helpers.ts:26` — fixture bootstrapping and readiness contract
  - Pattern: `tests/ui/window.helpers.ts:70` — drag helper semantics used by move/resize specs
  - Test: `tests/ui/window.smoke.spec.ts:4` — baseline frame metrics and unknown-fixture error contract
  - Test: `tests/ui/window.move.spec.ts:4` — title drag and content no-op browser behavior
  - Test: `tests/ui/window.resize.spec.ts:62` — exact resize matrix contract
  - Test: `tests/ui/window.resize-guards.spec.ts:4` — no-handle, min clamp, and max-clamp guard coverage
  - CI: `.github/workflows/ci-pr.yml:36` — CI already runs lint, unit tests, Playwright UI tests, and build

  **Acceptance Criteria** (agent-executable only):
  - [ ] All Playwright helpers and specs pass against the refactored implementation without changing the semantic selectors they target.
  - [ ] Browser-level title drag, content no-op, 8-direction resize, no-handle guard, min clamp, max clamp, and smoke scenarios all remain exact-value assertions.
  - [ ] CI command sequence for lint/test/test:ui/build remains valid after the refactor.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Full browser regression matrix passes
    Tool: Bash
    Steps: Run `yarn playwright test tests/ui/window.smoke.spec.ts tests/ui/window.move.spec.ts tests/ui/window.resize.spec.ts tests/ui/window.resize-guards.spec.ts`
    Expected: Exit code 0; all smoke, move, resize, and guard specs pass with zero flaky selector failures.
    Evidence: .sisyphus/evidence/task-5-playwright-window-regressions.txt

  Scenario: CI-relevant local quality gates stay green
    Tool: Bash
    Steps: Run `yarn lint && yarn test --runInBand tests/CWindowTitleComposition.test.tsx tests/WindowManager.test.tsx tests/DefaultTheme.test.tsx && yarn build`
    Expected: Exit code 0; lint, targeted unit tests, and build all pass after the refactor.
    Evidence: .sisyphus/evidence/task-5-playwright-window-regressions-ci.txt
  ```

  **Commit**: YES | Message: `test(window): refresh regression coverage for cwidget interactions` | Files: `tests/ui/window.helpers.ts`, `tests/ui/window.smoke.spec.ts`, `tests/ui/window.move.spec.ts`, `tests/ui/window.resize.spec.ts`, `tests/ui/window.resize-guards.spec.ts`, `tests/CWindowTitleComposition.test.tsx`, `tests/WindowManager.test.tsx`, `tests/DefaultTheme.test.tsx`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
> Review-agent scenarios below use `Read`, `Grep`, and `Bash` inside the assigned review agent; browser scenarios use `Bash` to start the preview server and `Playwright` to drive the page.
- [ ] F1. Plan Compliance Audit — deep

  **What to do**: Run a final plan-vs-implementation audit after Tasks 1-5 finish. Use `.sisyphus/plans/window-resize-drag-cwidget.md` as the source of truth, compare delivered files and evidence against every task's acceptance criteria, and treat any omitted requirement as a blocker instead of a review note.
  **Must NOT do**: Do not fix code during this audit, do not waive missing evidence, and do not mark the task complete on a partial match.

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: cross-task audit across code, tests, and evidence requires multi-file reasoning
  - Skills: `[]` — the plan file and repository references are sufficient
  - Omitted: [`git-master`] — no git history manipulation is needed for the audit

  **Parallelization**: Can Parallel: YES | Final Verification | Blocks: complete | Blocked By: 1, 2, 3, 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Plan: `.sisyphus/plans/window-resize-drag-cwidget.md` — source of truth for deliverables, guardrails, and task-level acceptance criteria
  - Pattern: `src/components/Widget/Widget.tsx` — base-class frame ownership and resize lifecycle must now live here
  - Pattern: `src/components/Window/Window.tsx` — window-specific composition should remain here, but generic drag/resize ownership must not
  - Test: `tests/CWindowTitleComposition.test.tsx` — composed title drag, content no-op, and drag/resize independence contract
  - Test: `tests/WindowManager.test.tsx` — constructor registration and managed render compatibility contract
  - Test: `tests/DefaultTheme.test.tsx` — default-theme inheritance and drag contract
  - Test: `tests/ui/window.move.spec.ts` — browser move contract
  - Test: `tests/ui/window.resize.spec.ts` — 8-direction resize contract
  - Test: `tests/ui/window.resize-guards.spec.ts` — `resizable={false}` and clamp guard contract

  **Acceptance Criteria** (agent-executable only):
  - [ ] The plan-compliance audit approves or returns only file-specific blocking findings that can be routed into a fix loop.
  - [ ] Every implementation task from 1-5 has matching evidence under `.sisyphus/evidence/` and no orphan deliverable remains unexplained.
  - [ ] No must-have requirement or must-NOT-have guardrail is left unverified at plan closeout.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Plan deliverables map cleanly to implementation
    Tool: Read + Grep
    Steps: Read `.sisyphus/plans/window-resize-drag-cwidget.md`, then inspect `src/components/Widget/Widget.tsx`, `src/components/Window/Window.tsx`, `src/components/Window/WindowTitle.tsx`, `src/components/Window/WindowManager.tsx`, `src/theme/default/index.tsx`, `tests/CWindowTitleComposition.test.tsx`, `tests/WindowManager.test.tsx`, `tests/DefaultTheme.test.tsx`, and `tests/ui/window*.spec.ts` to verify every deliverable, must-have, and must-NOT-have item is either implemented or explicitly preserved.
    Expected: The audit confirms full coverage or lists only concrete missing/mismatched file paths; no vague approval is accepted.
    Evidence: .sisyphus/evidence/f1-plan-compliance.txt

  Scenario: Missing evidence or uncovered deliverable blocks closeout
    Tool: Bash
    Steps: Run `ls .sisyphus/evidence/task-1-* .sisyphus/evidence/task-2-* .sisyphus/evidence/task-3-* .sisyphus/evidence/task-4-* .sisyphus/evidence/task-5-*` and compare the resulting filenames against Tasks 1-5; if any task evidence is missing or a deliverable lacks coverage, record the gap and keep F1 open.
    Expected: Every task has evidence coverage; any missing evidence or unmatched deliverable is surfaced as a blocking audit result.
    Evidence: .sisyphus/evidence/f1-plan-compliance-gap.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: none

- [ ] F2. Code Quality Review — unspecified-high

  **What to do**: Perform a read-only code-quality review across the refactor output. Focus on lifecycle cleanup, state ownership duplication, selector stability, unnecessary branching, and whether the new base-class helpers make `CWindow` thinner instead of merely relocating duplicated logic.
  **Must NOT do**: Do not treat a green test run as sufficient by itself, do not suggest optional redesigns, and do not ignore leaked drag/resize ownership that survives in `CWindow`.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: the review spans refactor quality, maintainability, and regression risk
  - Skills: `[]` — static review plus existing quality commands are sufficient
  - Omitted: [`refactor`] — this is an audit, not an implementation step

  **Parallelization**: Can Parallel: YES | Final Verification | Blocks: complete | Blocked By: 1, 2, 3, 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Widget/Widget.tsx` — should now own frame state, resize option normalization, and drag/resize lifecycle cleanup
  - Pattern: `src/components/Window/Window.tsx` — should be reduced to window-specific composition and theme-facing structure
  - Pattern: `src/components/Window/WindowTitle.tsx` — public drag-handle contract must stay compatible
  - Test: `tests/CWindowTitleComposition.test.tsx` — unit coverage for composed title behavior and teardown safety
  - Test: `tests/WindowManager.test.tsx` — manager compatibility regression surface
  - Test: `tests/DefaultTheme.test.tsx` — theme subclassing regression surface
  - Test: `tests/ui/window.move.spec.ts` — browser move regression surface
  - Test: `tests/ui/window.resize.spec.ts` — browser resize regression surface

  **Acceptance Criteria** (agent-executable only):
  - [ ] Static review finds no duplicated canonical frame ownership between `CWidget` and `CWindow`.
  - [ ] Lint, targeted unit tests, browser tests, and build all pass with no new warnings/errors introduced by the refactor.
  - [ ] Review output contains either approval or a bounded list of actionable defects with exact file paths.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Quality gates and regression suite pass together
    Tool: Bash
    Steps: Run `yarn lint && yarn test --runInBand tests/CWindowTitleComposition.test.tsx tests/WindowManager.test.tsx tests/DefaultTheme.test.tsx && yarn playwright test tests/ui/window.smoke.spec.ts tests/ui/window.move.spec.ts tests/ui/window.resize.spec.ts tests/ui/window.resize-guards.spec.ts && yarn build`.
    Expected: Exit code 0; lint, targeted unit tests, Playwright regression suite, and build all pass in one run.
    Evidence: .sisyphus/evidence/f2-code-quality-gates.txt

  Scenario: Read-only review checks ownership and complexity directly
    Tool: Read
    Steps: Read `src/components/Widget/Widget.tsx`, `src/components/Window/Window.tsx`, and `src/components/Window/WindowTitle.tsx`; verify canonical frame state, resize lifecycle, and title-drag injection live only where intended, and record any duplicate ownership or brittle branching with exact file paths and symbol names.
    Expected: Review returns approval or a concise, file-specific defect list; unbounded style commentary is not accepted.
    Evidence: .sisyphus/evidence/f2-code-quality-review.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: none

- [ ] F3. Real Manual QA — visual-engineering

  **What to do**: Run true browser-driven QA against the real preview page, not just CLI test output. Start the local preview/dev server, use the `playwright` skill to interact with the rendered window fixtures directly, and confirm the exact drag/resize behaviors that the automated specs assert.
  **Must NOT do**: Do not substitute screenshots-only review, do not use approximate geometry checks, and do not skip the `drag-only`, `min-clamp`, or `max-clamp` fixtures.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: browser interaction verification with exact DOM selectors and geometry checks
  - Skills: [`playwright`] — required for real browser automation and evidence capture
  - Omitted: [`frontend-ui-ux`] — this is behavioral QA, not a design critique

  **Parallelization**: Can Parallel: YES | Final Verification | Blocks: complete | Blocked By: 1, 2, 3, 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/ui/window.helpers.ts:10` — canonical `window-frame`, `window-title`, `window-content`, and `window-resize-*` selectors
  - Pattern: `tests/ui/window.helpers.ts:26` — fixture URL contract `/playwright-window.html?fixture={name}`
  - Test: `tests/ui/window.move.spec.ts:4` — exact title-drag move from `(10,20)` to `(30,60)` and content no-op contract
  - Test: `tests/ui/window.resize.spec.ts:35` — exact 8-direction resize deltas and expected frame metrics
  - Test: `tests/ui/window.resize-guards.spec.ts:4` — `drag-only`, `min-clamp`, and `max-clamp` fixture expectations
  - Dev Command: `yarn dev --host 127.0.0.1 --port 5673` — preview server for manual browser QA

  **Acceptance Criteria** (agent-executable only):
  - [ ] Browser QA confirms title drag, content no-op, one representative resize direction, `resizable={false}`, min clamp, and max clamp on the real preview page.
  - [ ] All checks use the existing test ids and exact numeric frame expectations from the Playwright suite.
  - [ ] QA evidence includes at least one screenshot or trace, and the verification output records the exact observed metrics for each checked fixture.

  **Precondition**: Before running either browser scenario, start `yarn dev --host 127.0.0.1 --port 5673 > .sisyphus/evidence/f3-preview.log 2>&1 &` with `Bash`, wait until `http://127.0.0.1:5673/playwright-window.html?fixture=default` responds, and reuse that same server for both scenarios.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Default fixture drag and resize behave exactly in browser
    Tool: Bash + Playwright
    Steps: After satisfying the preview-server precondition, open `http://127.0.0.1:5673/playwright-window.html?fixture=default`, drag `[data-testid="window-title"]` by `(20, 40)` and confirm `window-frame` moves to `(30, 60, 240, 160)`, then refresh and drag `[data-testid="window-resize-se"]` by `(20, 10)` and confirm metrics become `(10, 20, 260, 170)`.
    Expected: Both interactions succeed with the exact metrics from the automated specs; selectors remain stable and visible.
    Evidence: .sisyphus/evidence/f3-manual-qa-default.png

  Scenario: Guard fixtures enforce no-handle and clamp rules
    Tool: Bash + Playwright
    Steps: Reuse the preview server started in the precondition, visit `http://127.0.0.1:5673/playwright-window.html?fixture=drag-only` and confirm `[data-testid^="window-resize-"]` count is `0` while title drag moves the frame to `(42, 64, 200, 120)`; then visit `min-clamp` and `max-clamp` fixtures to confirm final metrics `(30, 30, 1, 1)` and `(50, 50, 150, 110)` after the exact drag sequences from `tests/ui/window.resize-guards.spec.ts`.
    Expected: Hidden handles stay hidden on `drag-only`, and both clamp fixtures land on the exact expected metrics with no fallback selector changes.
    Evidence: .sisyphus/evidence/f3-manual-qa-guards.png
  ```

  **Commit**: NO | Message: `n/a` | Files: none

- [ ] F4. Scope Fidelity Check — deep

  **What to do**: Audit the delivered work against the original request and the plan's guardrails. Confirm the implementation moved drag/resize into `CWidget` without introducing hooks/context, new public exports, selector renames, dependency swaps, or unrelated window-system redesign work.
  **Must NOT do**: Do not accept adjacent cleanup outside the agreed scope, do not permit public API growth without explicit approval, and do not overlook dependency or selector churn because tests happen to pass.

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: scope-fidelity review requires comparing the implementation against request, plan guardrails, and observable surface area
  - Skills: `[]` — repository inspection and plan context are sufficient
  - Omitted: [`artistry`] — the goal is fidelity, not ideation

  **Parallelization**: Can Parallel: YES | Final Verification | Blocks: complete | Blocked By: 1, 2, 3, 4, 5

  **References** (executor has NO interview context — be exhaustive):
  - Original Request: `.sisyphus/plans/window-resize-drag-cwidget.md` — request and scope boundaries are captured in Context and Must NOT Have sections
  - Pattern: `src/components/Widget/Widget.tsx` — target home for generic drag/resize behavior
  - Pattern: `src/components/Window/Window.tsx` — should retain only window-specific composition/styling responsibilities
  - Pattern: `src/index.ts` — public export surface must not grow for this refactor
  - Pattern: `package.json` — dependency set should not replace `@system-ui-js/multi-drag`
  - Test: `tests/CWindowTitleComposition.test.tsx` — selector and behavior stability
  - Test: `tests/ui/window.helpers.ts` — shared selector/test-id contract

  **Acceptance Criteria** (agent-executable only):
  - [ ] No scope creep is found beyond moving drag/resize ownership into `CWidget` and preserving required compatibility points.
  - [ ] No hooks/context additions, public API expansion, selector renames, or drag-library replacement are introduced.
  - [ ] Any deviation from the agreed scope is reported as a blocker with exact file paths.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Guardrail search confirms no forbidden implementation patterns
    Tool: Grep
    Steps: Search `src/components/**/*.tsx`, `src/index.ts`, and `package.json` for `useState|useEffect|createContext|useContext|@system-ui-js/multi-drag`, then inspect the matches to confirm no hook/context introduction in the refactor path and no drag-library replacement.
    Expected: Search results confirm guardrail compliance or identify exact files that violate it; no speculative suggestions are accepted.
    Evidence: .sisyphus/evidence/f4-scope-fidelity.txt

  Scenario: Public surface and selector contract remain in scope
    Tool: Read + Grep
    Steps: Read `.sisyphus/plans/window-resize-drag-cwidget.md`, `src/index.ts`, `tests/ui/window.helpers.ts`, and `src/components/Window/Window.tsx`, then search for `window-frame|window-content|window-title|window-resize-` to verify public exports stay unchanged, selector tokens remain stable, and implementation changes stay within planned files/responsibilities.
    Expected: No scope creep is found beyond the planned refactor; any unexpected export, selector, or responsibility expansion is listed with exact file paths.
    Evidence: .sisyphus/evidence/f4-scope-fidelity-grep.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: none

## Commit Strategy
- Commit 1 (after Tasks 1-2): `refactor(widget): centralize frame ownership and resize lifecycle in cwidget`
- Commit 2 (after Tasks 3-4): `refactor(window): delegate drag resize to cwidget and preserve compatibility`
- Commit 3 (after Task 5): `test(window): refresh unit and ui regression for cwidget interactions`

## Success Criteria
- `CWindow` 不再直接持有 resize Drag 实例、resize start map、resize handle refs、drag pose/setState 逻辑。
- `CWidget` 可以在不依赖 window-specific className 的前提下复用 frame interaction 机制。
- `CWindowManager`、默认主题窗口、Playwright fixtures 与现有 test ids 全部继续工作。
- 所有命令式验证通过，且没有新增 lint/build 错误。
