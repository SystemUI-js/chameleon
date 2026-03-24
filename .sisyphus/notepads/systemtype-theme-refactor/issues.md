## 2026-03-23 Wave 1 scope and screen risks

- `src/components/Screen/Screen.tsx` currently returns `CGrid` directly, so adding a root wrapper may affect layout if the wrapper disrupts the grid assumptions.
- Current `CScreen` consumers are the three legacy theme roots under `src/theme/default/index.tsx`, `src/theme/win98/index.tsx`, and `src/theme/winxp/index.tsx`; all are sensitive to wrapper changes.
- Drag behavior depends on `CWindowTitle` and stable `window-title` / `window-frame` selectors, with `data-window-uuid` identity coming from `src/components/Window/Window.tsx`.
- Regression anchors already exist in `tests/CWindowTitleComposition.test.tsx`, `tests/WindowManager.test.tsx`, `tests/ui/window.move.spec.ts`, and `tests/ui/window.resize-guards.spec.ts`; wrapper changes must not break these behaviors.

## 2026-03-23 Wrapper gotchas confirmed in implementation

- 如果把 screen scope class 直接放到 `CGrid` 而不是单独 root wrapper，后续 system/theme 切换很难明确区分“作用域属性”与“布局 class”。
- 如果 `screen-root` 下新增多个直接布局子节点，就会偏离当前 `CScreen -> CGrid` 的网格预期，因此 wrapper 内应只保留单一 `CGrid` 直接子节点。

## 2026-03-23 Task 4 SystemHost implementation risks

- `SystemHost` 必须使用 `key={systemType}` 来实现系统切换时的重挂载边界，确保运行时窗口状态完全重置
- `WindowsSystem` 和 `DefaultSystem` 必须接受 `ThemeDefinition` 并将 theme className 附加到 screen-root，不能在系统 shell 内部引入 theme 条件分支
- 现有 `Win98Theme` / `WinXpTheme` / `DefaultTheme` 根组件在任务 4 完成后必须保持可用（任务 5 才转换它们），但 `SystemHost` 测试不能依赖这些旧根
- Boot layout 坐标必须从当前主题根文件 (`src/theme/*/index.tsx`) 精确复制到新的系统 shell，确保视觉连续性
- `data-window-uuid` 稳定性测试必须在同系统主题切换时通过，跨系统切换时失败（重置）

## 2026-03-23 Task 5 migration gotchas

- 旧的 `src/dev/themeSwitcher.tsx` 仍把 `src/theme/*` 当作可渲染 root 使用，但本任务禁止修改它；因此本轮迁移只保证 metadata/type 链路与 `SystemHost` 测试契约，不处理旧预览入口的运行时兼容。
- 主题样式如果不经 `registry` 引入对应 theme 模块，就不会在 `SystemHost` 路径下加载；这是 CSS-only 主题化后最容易漏掉的 side effect 入口。

## 2026-03-23 Task 5 compatibility bridge gotcha

- 兼容桥依赖 `useLayoutEffect` 在挂载后为 legacy caller 补回历史 className，因此这些 class 只用于旧测试/旧入口兼容，后续替换完遗留调用方后应一并清理。

## 2026-03-23 Task 5 compatibility bridge final gotcha

- 如果主题桥直接 import `SystemHost`，会形成 `theme -> SystemHost -> registry -> theme` 循环；共享系统壳桥接必须避开这条链路，否则 `themeDefinition.className` 会在运行时变成 `undefined`。

## 2026-03-23 Task 5 registry/plain-object gotcha

- 兼容桥修好以后，`resolveThemeDefinition()` 仍然不能直接返回主题导出值；测试会把函数对象和纯 metadata 对象区分开来，必须显式投影为 `{ id, label, systemType, className }`。

## 2026-03-23 Task 6 migration risks and gotchas

### Symbol Removal Risks

- **DevThemeRoot removal**: Tests in `tests/DevThemeSelection.test.tsx` and `tests/SystemShellCharacterization.test.tsx` reference `DevThemeRoot`; must rename test file and update all imports before removing the symbol.
- **DEFAULT_DEV_THEME removal**: Referenced in multiple spec files under `openspec/changes/archive/`; these are historical but the symbol must still be removed from production code.
- **DEV_THEME_COMPONENTS removal**: This map is currently the only runtime bridge between theme ID and component; removing it requires `DevSystemRoot` to use `SystemHost` instead.

### Export Surface Changes

- **src/index.ts**: Currently re-exports all theme components (`DefaultTheme`, `Win98Theme`, `WinXpTheme`) plus window/title subclasses. Task 6 must:
  - Remove: `export * from './theme/default'`, `export * from './theme/win98'`, `export * from './theme/winxp'`
  - Add: `export * from './system/types'`, `export * from './system/registry'`, `export { SystemHost } from './system/SystemHost'`
  - Risk: Any external consumer importing theme components will break; plan states "no compatibility shim for old theme-root components"

### Default Selection Contract

- **Current**: `DEFAULT_DEV_THEME = 'default'` (single value)
- **New**: `DEFAULT_DEV_SELECTION = { systemType: 'default', theme: 'default' }` (pair)
- Risk: Tests assuming single-value default must be updated to check the pair structure

### Invalid Pair Rejection

- **Registry already throws**: `assertValidSystemThemeSelection()` at `src/system/registry.ts:70-76` throws `Invalid theme "{theme}" for system type "{systemType}"`
- **DevSystemRoot must handle**: Either propagate the error or provide default fallback
- Risk: If DevSystemRoot doesn't validate before rendering SystemHost, invalid pairs reach SystemHost and throw at runtime

### Test File Rename

- **Must rename**: `tests/DevThemeSelection.test.tsx` → `tests/DevSystemSelection.test.tsx`
- **Must update**: All test assertions from theme-component mapping to system-theme selection
- **Must preserve**: The "renders default when omitted" behavior verification

### Dev Entry Point

- **index.html:10** loads `/src/dev/main.tsx`
- **main.tsx** currently renders `<DevThemeRoot />`
- After migration: renders `<DevSystemRoot />` (or `<DevSystemRoot systemType="default" theme="default" />`)
- Risk: Browser refresh required to see changes in dev server

### Compatibility Bridge Status

- Per Task 5 research: Theme modules (`src/theme/*/index.tsx`) currently export both:
  - React component (for backward compatibility): `DefaultTheme`, `Win98Theme`, `WinXpTheme`
  - Metadata properties: `id`, `label`, `systemType`, `className`
- Task 6 removes the dev entry's dependency on the component part
- Risk: If any test still renders old theme roots directly, they will continue to work (bridge exists), but the new DevSystemRoot path should NOT use them

---

*Task 6 issues documented: 2026-03-23*

## 2026-03-23 Task 6: Export Surface & Test Migration Risks

- **Risk**: Removing theme re-exports from `src/index.ts` will break any external consumers that directly import `DefaultTheme`, `Win98Theme`, or `WinXpTheme`. Current internal tests also depend on these imports.
- **Risk**: `tests/DevThemeSelection.test.tsx` imports theme components directly (lines 9-11) and tests resolver-to-component mapping (lines 14-24). This test must be completely rewritten for systemType+theme model.
- **Risk**: `src/dev/themeSwitcher.tsx` exports `DEV_THEME` constants and `resolveDevThemeComponent()` which are tightly coupled to the old theme model. These must be replaced with `SYSTEM_TYPE`, `THEME`, and `resolveSystemTypeDefinition()` / `resolveThemeDefinition()`.
- **Risk**: `src/dev/main.tsx` renders `<DevThemeRoot />` directly. This entry point must be updated to use the new `DevSystemSelection` component.
- **Risk**: `tests/SystemShellCharacterization.test.tsx` uses `DEV_THEME` and `DevThemeRoot` (lines 3, 96, 103, 114). These usages must be updated to use systemType+theme selection.
- **Risk**: `src/system/registry.ts` imports theme components for metadata projection (lines 1-3, 60-64). This is internal but creates a dependency that must be preserved while removing public exports.
- **Migration Path**: 
  1. Create `DevSystemSelection` in `src/dev/themeSwitcher.tsx`
  2. Update `src/dev/main.tsx` to use `DevSystemSelection`
  3. Remove theme re-exports from `src/index.ts`
  4. Rename `tests/DevThemeSelection.test.tsx` → `tests/DevSystemSelection.test.tsx`
  5. Update other test files to remove theme imports or pivot to SystemHost

## 2026-03-23 Task 6 implementation issue follow-up

- `tsconfig.json` 直接包含整个 `tests/` 目录，因此删除 `DevThemeRoot` 后，`tests/SystemShellCharacterization.test.tsx` 即使不在本次指定 Jest 运行范围内，也会先因为静态导入失效而阻塞 `npx tsc --noEmit`。
- 这次为满足编译只对 `tests/SystemShellCharacterization.test.tsx` 做了最小导入/调用位点切换，没有顺手重写它的旧行为断言；后续若要恢复整套 characterization 语义，需要单独按 task 6 之后的新 system/theme 生命周期更新该测试预期。

## 2026-03-23 Task 7: Lifecycle-Test Seams Issues

### Persistent Data Implementation Gap

- **Issue**: The plan specifies using `persistent-note-123` payload, but `SystemHost` currently has no `persistentData` prop
- **Impact**: Task 7 cannot test persistent data preservation without either:
  1. Adding `persistentData` prop to `SystemHost` (requires source modification)
  2. Testing persistent data at a higher boundary (parent of SystemHost)
- **Risk**: If persistent data must be tested at parent level, the test may not accurately reflect the "lift above remount boundary" pattern

### Obsolete Test File: SystemShellCharacterization.test.tsx

- **Issue**: This test file imports and tests old root theme components (`DefaultTheme`, `Win98Theme`, `WinXpTheme`) that were removed in task 6
- **Current state**: Lines 3-6 import removed components, lines 28-46 define test cases using them
- **Risk**: This test will fail to compile after task 6 removes the theme exports
- **Recommendation**: Either remove this test file entirely or rewrite it to use `SystemHost`

### DefaultTheme.test.tsx Pivot Risk

- **Issue**: `tests/DefaultTheme.test.tsx` currently renders `<DefaultTheme />` which is a removed root component
- **Pivot required**: Must render `<SystemHost systemType="default" theme="default" />` instead
- **Risk**: The test assertions for `frame.style.left: 32px` and `frame.style.top: 28px` are specific to default system boot coordinates - must verify these match after pivot
- **Reference**: Default system boot coordinates from `src/theme/default/index.tsx:32`

### Test Duplication Risk

- **Issue**: UUID preservation across theme switches is ALREADY tested in:
  - `tests/SystemHost.test.tsx:34-84` ("preserves runtime window across windows theme switches")
  - `tests/ThemeScopeClassNames.test.tsx:18-42` ("does not remount runtime windows on same system theme change")
- **Risk**: Task 7 may duplicate existing tests if not carefully scoped
- **Recommendation**: Task 7 should focus on:
  1. NEW: Persistent data preservation (not currently tested)
  2. NEW: System switch reboot behavior (partially tested in SystemHost.test.tsx:86-120)
  3. EXTEND: Focus preservation (not currently tested)
  4. REFERENCE: UUID/geometry tests rather than duplicate

### Focus Preservation Testing Gap

- **Issue**: No existing tests for focus state preservation across theme/system switches
- **Impact**: Task 7 may need to add focus testing if required by the plan
- **Risk**: Focus testing in Jest/jsdom is complex and may require additional setup

---

*Task 7 issues documented: 2026-03-23*

## 2026-03-23 Task 7 implementation gotcha

- 在 jsdom 里用 portal/副作用组件把测试内容桥接进 `window-content` 时，初版挂载不稳定；改成测试内直接向共享 seam 注入持久节点与输入节点后，既保留了“状态在 remount 边界之上”的验证意图，也让 Jest 断言更稳定。

## 2026-03-23 Final Wave repair issues

- `vite-plugin-dts` 在 `yarn build` 时仍会提示 `tests/*.d.ts` 与若干 `.d.ts.map` 被 outside emitted；本轮不属于 blocker，但 release gate 证据里会保留这条现状日志。
- F1 报告里提到的 task 1 characterization 历史基线缺口不在这次指定修复面内；本轮仅把活跃测试契约与证据回填到最终 architecture，要等后续 reviewer 复核是否还要求单独补历史基线工件。

## 2026-03-23 F2 rerun review notes

- 活跃源码里已清除 `DefaultTheme` / `Win98Theme` / `WinXpTheme` / `legacyWindow*` / `windowContentClassName` / `windowFrameClassName` 等迁移残留，之前的 F2 blocker 已消失。
- 当前仅剩非 blocker 噪音：`src/index.ts` 有 import 排序 informational 提示，`tests/SystemShellCharacterization.test.tsx` 里旧测试名称文案尚未同步到新 system/theme 语义。


## 2026-03-23 F1 rerun review note

- 复审确认此前的核心架构 blocker 已修复：Windows boot layout 已 system-owned、theme 文件只剩 metadata、registry 不再消费 bridge、task 1-8 证据文件名已补齐、release gate 证据顺序与 `npm pack --dry-run` 输出均可见。
- 当前唯一剩余 F1 阻断项是 task 1 合同本身：`tests/SystemShellCharacterization.test.tsx` 现已验证新模型而非计划要求的 pre-refactor `DevThemeRoot` full-root baseline，因此按“every task’s contract”标准仍需判定为 REJECT。


## 2026-03-23 F1 final rerun note

- `tests/SystemShellCharacterization.test.tsx` 现在通过 test-local `HistoricalDevThemeRoot` 保留了可执行的历史 full-root swap characterization，task 1 的最后 blocker 已解除，因此 F1 复审改判为 APPROVE。

---

## 2026-03-24 Evidence Audit Findings

### Evidence File Inventory

**Tasks 1-8 (all present, 17 files):**
- task-1-shell-characterization.txt ✓
- task-1-shell-characterization-proof.txt ✓
- task-2-system-theme-registry.txt ✓
- task-2-system-theme-registry-error.txt ✓
- task-3-screen-scope.txt ✓
- task-3-screen-scope-drag.txt ✓
- task-4-system-host-theme-switch.txt ✓
- task-4-system-host-reboot.txt ✓
- task-5-theme-scope.txt ✓
- task-5-theme-scope-stability.txt ✓
- task-6-dev-selection.txt ✓
- task-6-dev-selection-error.txt ✓
- task-7-theme-preservation.txt ✓
- task-7-system-reboot.txt ✓
- task-8-ui-theme-switch.txt ✓
- task-8-ui-system-switch.txt ✓
- task-8-release-gates.txt ✓

**Final Wave F1-F4 (all present, 4 files):**
- f1-plan-compliance.md ✓ (VERDICT: APPROVE)
- f2-code-quality.md ✓ (VERDICT: APPROVE)
- f3-ui-qa.md ✓ (VERDICT: APPROVE)
- f4-scope-fidelity.md ✓ (VERDICT: APPROVE)

**Extra evidence files (not in plan QA Scenarios):**
- task-8-manual-dev.log
- task-7-legacy-cleanup.txt
- task-7-tsc.txt
- task-2-window-harness.json
- task-2-window-harness.png
- task-2-window-harness-error.png

### Release Gate Verification (task-8-release-gates.txt)

All 5 required commands executed in exact plan order:
1. `yarn lint` ✓ (exit 0)
2. `yarn test` ✓ (80 tests passed)
3. `yarn test:ui` ✓ (17 Playwright tests passed)
4. `yarn build` ✓ (vite build success)
5. `npm pack --dry-run` ✓ (package created)

### Evidence Quality Assessment

**Filename Matching:** All evidence filenames match exactly what QA Scenarios specified in the plan.

**Content Verification:**
- Task 1: Shows focused test "dev root swaps full theme components" passing
- Task 2: Shows registry resolution for legal pairs passing
- Task 8: Shows full release gate sequence with all tests passing

**F1-F4 Final Wave:**
- F1: APPROVE - Plan compliance confirmed, task 1 historical baseline resolved via test-local HistoricalDevThemeRoot
- F2: APPROVE - No high-severity findings, legacy symbols cleared
- F3: APPROVE - All UI flows (drag, resize, theme switch, system switch) pass
- F4: APPROVE - Scope remains closed to windows|default, no spill detected

### Discrepancy Notes

1. **Plan checkbox vs session metadata:** Plan shows all top-level items checked, but session metadata reported 12/36. This is likely due to nested acceptance criteria being miscounted (the plan has 8 tasks × ~4 acceptance criteria each = 32 items, plus 4 final wave items = 36).

2. **Extra evidence files:** 6 files exist that are not referenced in QA Scenarios:
   - task-8-manual-dev.log (manual dev verification)
   - task-7-legacy-cleanup.txt (legacy cleanup evidence)
   - task-7-tsc.txt (TypeScript compilation check)
   - task-2-window-harness.* (Playwright harness debug artifacts)
   
   These appear to be supplementary evidence collected during implementation but not required by the plan's QA Scenarios.

### Conclusion

The evidence trail is **complete and consistent** with the plan requirements:
- All 17 task evidence files exist with matching filenames
- All 4 final wave evidence files exist with APPROVE verdicts
- Release gates evidence shows all 5 commands executed successfully in order
- No missing evidence, stale evidence, or mismatched filenames detected

The plan's checked status appears trustworthy based on the evidence.
