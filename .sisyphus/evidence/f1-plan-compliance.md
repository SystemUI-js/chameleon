# F1 Plan Compliance Audit

## Verdict
**APPROVE**

## Scope audited
- Plan task 1 contract: `.sisyphus/plans/systemtype-theme-refactor.md:106`, `.sisyphus/plans/systemtype-theme-refactor.md:108`, `.sisyphus/plans/systemtype-theme-refactor.md:127`, `.sisyphus/plans/systemtype-theme-refactor.md:128`, `.sisyphus/plans/systemtype-theme-refactor.md:129`
- Final-wave expectation and success criteria: `.sisyphus/plans/systemtype-theme-refactor.md:482`, `.sisyphus/plans/systemtype-theme-refactor.md:485`, `.sisyphus/plans/systemtype-theme-refactor.md:486`, `.sisyphus/plans/systemtype-theme-refactor.md:519`
- Rechecked files: `tests/SystemShellCharacterization.test.tsx:47`, `tests/SystemShellCharacterization.test.tsx:115`, `.sisyphus/evidence/task-1-shell-characterization.txt:1`, `src/system/windows/WindowsSystem.tsx:24`, `src/system/registry.ts:1`, `src/theme/default/index.tsx:4`, `src/theme/win98/index.tsx:4`, `src/theme/winxp/index.tsx:4`

## Re-check of the previous sole blocker
- **Resolved.** `tests/SystemShellCharacterization.test.tsx` now contains a test-local historical adapter layer: `HistoricalDevThemeRoot` plus `HistoricalDefaultThemeRoot` / `HistoricalWin98ThemeRoot` / `HistoricalWinXpThemeRoot` at `tests/SystemShellCharacterization.test.tsx:47`, `tests/SystemShellCharacterization.test.tsx:49`, `tests/SystemShellCharacterization.test.tsx:51`, `tests/SystemShellCharacterization.test.tsx:53`, `tests/SystemShellCharacterization.test.tsx:55`.
- The focused characterization test at `tests/SystemShellCharacterization.test.tsx:116` now executes an explicit full-root swap model and proves root/frame/content identity replacement across `default -> win98 -> winxp`: `tests/SystemShellCharacterization.test.tsx:134`, `tests/SystemShellCharacterization.test.tsx:135`, `tests/SystemShellCharacterization.test.tsx:136`, `tests/SystemShellCharacterization.test.tsx:137`, `tests/SystemShellCharacterization.test.tsx:147`, `tests/SystemShellCharacterization.test.tsx:149`, `tests/SystemShellCharacterization.test.tsx:150`, `tests/SystemShellCharacterization.test.tsx:151`.
- The task-1 evidence file now matches that executable artifact and shows the exact planned focused command passing: `.sisyphus/evidence/task-1-shell-characterization.txt:1`, `.sisyphus/evidence/task-1-shell-characterization.txt:6`, `.sisyphus/evidence/task-1-shell-characterization.txt:8`.
- The seam-proof requirement also remains satisfied: `tests/SystemShellCharacterization.test.tsx:165`, `.sisyphus/evidence/task-1-shell-characterization-proof.txt:1`.

## Brief re-check of already-closed blockers
- **Theme-owned Windows boot behavior:** still resolved. `WindowsSystem` is system-owned and no longer theme-specific in runtime boot content/geometry: `src/system/windows/WindowsSystem.tsx:24`, `src/system/windows/WindowsSystem.tsx:40`.
- **Callable theme bridges:** still resolved. Theme files export plain metadata only: `src/theme/default/index.tsx:4`, `src/theme/win98/index.tsx:4`, `src/theme/winxp/index.tsx:4`.
- **Registry dependency on bridge objects:** still resolved. `registry` imports metadata definitions directly: `src/system/registry.ts:1`, `src/system/registry.ts:60`.
- **Evidence coverage and release gates:** still resolved. Required task evidence files exist under `.sisyphus/evidence`, and release-gate order plus `npm pack --dry-run` proof remain visible in `.sisyphus/evidence/task-8-release-gates.txt:1`, `.sisyphus/evidence/task-8-release-gates.txt:159`.
- **File health:** `lsp_diagnostics` reports no issues for `tests/SystemShellCharacterization.test.tsx`.

## Plan-compliance summary
- **Task 1:** now satisfied. The workspace preserves an executable historical full-root swap characterization artifact and the focused evidence command passes.
- **Tasks 2-8:** no current contradictions found against the previously repaired architecture; the current state still matches the planned `SystemType` / `Theme` split.
- **Final architecture:** still matches the success criteria in the plan: runtime selection is `{ systemType, theme }`, same-system theme switch preserves runtime subtree identity, cross-system switch reboots to the target system boot layout, and themes remain CSS-scoped metadata.

## Final assessment
此前最后一个 F1 阻断项已经被修复，当前工作区满足 task 1 的历史基线工件要求，也没有发现已关闭 blocker 的回归。  
按当前实现、测试与证据集合，F1 计划合规审计可以通过。

**VERDICT: APPROVE**

---

# 2026-03-26 F1 Plan Compliance Audit — `systemtype-start-bar`

## Verdict
**REJECTED**

## Commands executed
- `yarn test --runInBand tests/Dock.test.tsx` ✅ passed
- `yarn test --runInBand tests/StartBar.test.tsx tests/SystemHost.test.tsx tests/SystemShellCharacterization.test.tsx tests/ThemeScopeClassNames.test.tsx` ✅ passed
- `yarn test:ui --grep "start bar|system/theme switch"` ✅ passed
- `yarn test:ui` ✅ passed (`21 passed`)
- `git diff --name-only main...HEAD -- src/system/SystemHost.tsx src/system/registry.ts src/system/types.ts src/dev/themeSwitcher.tsx src/components/Screen/Screen.tsx` ⚠️ returned forbidden-key-file changes

## Task-by-task audit

### Task 1 — Dock Layout Helper
**PASS**
- `src/components/Dock/dockLayout.ts` exists and centralizes edge style, class name, and style sanitization.
- `src/components/Dock/Dock.tsx` consumes the helper via `getDockEdgeStyle`, `getDockFrameClassName`, and `getDockFrameStyle`.
- `tests/Dock.test.tsx` passes in full, so the existing `CDock` top/right/bottom/left, class/style, and controlled-sync contract remains intact.

### Task 2 — `CStartBar` Component
**PASS**
- `src/components/StartBar/StartBar.tsx` and `src/components/StartBar/index.scss` both exist.
- Public export is present through `src/components/index.ts:9` and `src/index.ts:3`.
- Default height behavior is implemented as `30px` in `src/components/StartBar/StartBar.tsx:47`.
- Type-level rejection for `position` / `defaultPosition` is covered and passes in `tests/StartBar.test.tsx:17`.

### Task 3 — WindowsSystem Integration
**FAIL**
- Runtime behavior acceptance passes: `windows/win98` and `windows/winxp` render `windows-start-bar`, while `default/default` does not; related Jest coverage passes.
- However, the task explicitly requires `SystemHost` / `registry` / `types` / `themeSwitcher` to avoid unnecessary changes. Relative to `main`, the branch still changes `src/system/SystemHost.tsx`, `src/system/registry.ts`, `src/system/types.ts`, and `src/dev/themeSwitcher.tsx`.
- This means Task 3 acceptance criterion `SystemHost、registry、types、themeSwitcher 无不必要改动` is not satisfied by the current final diff.

### Task 4 — Theme Styles
**FAIL**
- Theme-specific Start Bar styling exists in both `src/theme/win98/styles/index.scss` and `src/theme/winxp/styles/index.scss`.
- Visual intent is correct: `win98` uses gray bevel styling and `winxp` uses blue/green XP styling; UI and Jest checks pass.
- But Task 4 requires component base layout to live only in `src/components/StartBar/index.scss`, with theme files limited to skin differences. The theme files currently include structural/layout declarations such as `min-height`, `padding`, `margin`, and `font-size` in `src/theme/win98/styles/index.scss:192`, `src/theme/win98/styles/index.scss:193`, `src/theme/win98/styles/index.scss:194`, `src/theme/winxp/styles/index.scss:231`, `src/theme/winxp/styles/index.scss:232`, and `src/theme/winxp/styles/index.scss:233`.
- This violates Task 4 acceptance criterion `组件基础布局仅在 src/components/StartBar/index.scss 定义，主题文件只负责皮肤差异`.

### Task 5 — Playwright UI Tests
**PASS**
- `tests/ui/start-bar.spec.ts` exists.
- The spec covers `windows/win98` and `windows/winxp` visibility, same-page theme switching, and absence under `default/default`.
- Both targeted and full `yarn test:ui` runs pass, so the spec is currently stable under the repository's Playwright command.

## Unmet acceptance criteria
1. **Task 3**: `SystemHost、registry、types、themeSwitcher 无不必要改动`
2. **Task 4**: `组件基础布局仅在 src/components/StartBar/index.scss 定义，主题文件只负责皮肤差异`

## Final assessment
当前实现的行为层面基本成立，且 Jest / Playwright 验证均通过；但按计划逐条审计时，仍存在至少两项明确偏差，因此本次 F1 结论只能是 **REJECTED**。

---

# 2026-03-26 F1 Plan Compliance Audit — `default-window-systemtype-switch`

## Verdict
**REJECT**

## Commands executed
- `git status --short` ✅ reviewed changed/untracked files
- `git diff --stat` ✅ reviewed touched scope
- `git diff` ✅ reviewed implementation details
- `lsp_diagnostics` on key changed TS/TSX files ⚠️ only `organizeImports` information-level hints; no errors/warnings
- `yarn test -- SystemTypeSwitch` ✅ passed (`12 passed`)
- `yarn test -- SystemHost` ✅ passed (`7 passed`)
- `yarn test:ui tests/ui/default-window-system-switch.spec.ts tests/ui/start-bar.spec.ts` ✅ passed (`2 passed`)
- `yarn lint` ✅ passed
- `yarn build` ✅ passed

## Deliverables presence
- Present: `src/system/default/DefaultSystem.tsx`
- Present: `src/system/SystemHost.tsx`
- Present: `src/dev/themeSwitcher.tsx`
- Present: registry-backed mapping usage in `src/system/registry.ts`
- Present: `tests/SystemTypeSwitch.test.tsx`
- Present: `tests/ui/default-window-system-switch.spec.ts`

## Task-by-task audit

### Task 1 — shared resolver
**PASS**
- `resolveDevSelectionForSystemType()` exists in `src/dev/themeSwitcher.tsx:44`.
- The resolver reads `DEFAULT_THEME_BY_SYSTEM` in `src/dev/themeSwitcher.tsx:47`.
- Canonical outputs are covered in `tests/SystemTypeSwitch.test.tsx:144` and pass.

### Task 2 — callback plumbing through dev root and host
**PASS**
- `DevSystemRoot` accepts optional `onSelectionChange` in `src/dev/themeSwitcher.tsx:61` and forwards it at `src/dev/themeSwitcher.tsx:75`.
- `SystemHost` accepts and forwards the callback only for the default shell in `src/system/SystemHost.tsx:11` and `src/system/SystemHost.tsx:33`.
- Existing remount semantics remain intact; `yarn test -- SystemHost` passes.

### Task 3 — mutable preview owners and URL sync
**PASS**
- Dev preview state owner now lives in `src/dev/main.tsx:27`.
- Playwright harness writes both `systemType` and `theme` back to URL in `src/dev/playwright/windowHarness.tsx:148`.
- Real UI flow proves URL sync in `tests/ui/default-window-system-switch.spec.ts:18`.

### Task 4 — labeled switch in default title bar
**FAIL**
- Visible label and real combobox exist in `src/system/default/DefaultSystem.tsx:69` and `src/system/default/DefaultSystem.tsx:72`; UI flow can operate them.
- However the task guardrail explicitly says **do not modify `CSelect` general API**. The implementation adds a new `id` prop in `src/components/Select/Select.tsx:10`, `src/components/Select/Select.tsx:16`, `src/components/Select/Select.tsx:24`, and `src/components/Select/Select.tsx:56`.
- This is a direct plan violation, so Task 4 cannot be approved even though runtime behavior works.

### Task 5 — prove reset + remount through the switch flow
**FAIL**
- The required behavior assertions exist, but they are proven by manual rerendering, not by operating the default-window combobox.
- Evidence: `tests/SystemTypeSwitch.test.tsx:184` rerenders directly to `{ systemType: 'windows', theme: 'win98' }`, and `tests/SystemTypeSwitch.test.tsx:208` rerenders directly back to `{ systemType: 'default', theme: 'default' }`.
- The only direct control interaction is `fireEvent.pointerDown(systemSwitch, ...)` at `tests/SystemTypeSwitch.test.tsx:132`, which checks drag safety only and never triggers a selection change.
- Therefore Task 5 acceptance criterion “通过默认窗口下拉切换到 `windows` 后...” is not satisfied by Jest coverage.

### Task 6 — UI coverage and CI-aligned validation
**PASS**
- `tests/ui/default-window-system-switch.spec.ts` performs a real dropdown selection via `page.getByLabel('切换系统')` and `selectOption('windows')` at `tests/ui/default-window-system-switch.spec.ts:9` and `tests/ui/default-window-system-switch.spec.ts:18`.
- URL assertions for both `systemType=windows` and `theme=win98` exist at `tests/ui/default-window-system-switch.spec.ts:20` and `tests/ui/default-window-system-switch.spec.ts:21`.
- Focused UI tests, lint, and build all pass in this audit run.

## Guardrail check
- **Violated:** `不重构 CSelect` / `不修改 CSelect 组件通用 API` — `src/components/Select/Select.tsx:10`.
- **Respected:** no new global state/context/store.
- **Respected:** no `useEffect`-based derived state inside `src/system/default/DefaultSystem.tsx`.
- **Respected:** system→defaultTheme mapping is not duplicated; implementation reuses registry mapping.

## Final assessment
当前实现的交互、测试和构建大体可运行，但 F1 审计要求是“所有验收标准 + 所有 guardrails 全满足”。当前仍有两个阻断项：

1. `src/components/Select/Select.tsx` 扩展了 `CSelect` 通用 API，违反 Task 4 guardrail。
2. `tests/SystemTypeSwitch.test.tsx` 没有通过默认窗口下拉真实触发切换链路，Task 5 的核心验收标准未被证明。

因此本次 **F1 结论为 REJECT**。
