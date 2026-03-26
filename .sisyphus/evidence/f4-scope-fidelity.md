# F4 Scope Fidelity Check

## 结论

REJECTED

## 1) 计划外 Windows shell 功能关键词检查

- 执行命令：
  - `rg -n "StartMenu|Tray|Clock|TaskList|pin|pinned|menu popover|system tray" src/components/StartBar src/system/windows tests`
- 实际结果：
  - 命中 `tests/Dock.test.tsx:17`，文本为 `typing`（包含 `pin` 子串）
  - 退出码为 `0`
- 预期结果：
  - 无匹配，退出码 `1`
- 判定：
  - 未满足该步预期。

## 2) 计划外文件修改检查

- 核验命令：
  - `git diff --name-only HEAD`
- 变更文件：
  - `.sisyphus/plans/add-cdock.md`
  - `.sisyphus/plans/common-components-button-radio-select.md`
  - `.sisyphus/plans/systemtype-start-bar.md`
  - `src/components/Dock/Dock.tsx`
  - `src/components/Screen/Screen.tsx`
  - `src/components/index.ts`
  - `src/system/windows/WindowsSystem.tsx`
  - `src/theme/win98/styles/index.scss`
  - `src/theme/winxp/styles/index.scss`
  - `tests/SystemHost.test.tsx`
  - `tests/SystemShellCharacterization.test.tsx`
  - `tests/ThemeScopeClassNames.test.tsx`
- 受限文件核验：
  - `src/system/SystemHost.tsx` 未修改
  - `src/system/types.ts` 未修改
  - `src/system/registry.ts` 未修改

## 3) 允许变更清单一致性检查

- 允许范围（任务给定）内命中：
  - `src/components/Dock/Dock.tsx`
  - `src/components/index.ts`
  - `src/system/windows/WindowsSystem.tsx`
  - `src/theme/win98/styles/index.scss`
  - `src/theme/winxp/styles/index.scss`
  - `tests/SystemHost.test.tsx`
  - `tests/SystemShellCharacterization.test.tsx`
  - `tests/ThemeScopeClassNames.test.tsx`
- 范围外变更：
  - `.sisyphus/plans/add-cdock.md`
  - `.sisyphus/plans/common-components-button-radio-select.md`
  - `.sisyphus/plans/systemtype-start-bar.md`
  - `src/components/Screen/Screen.tsx`

## 4) 架构漂移检查

- 未发现 `SystemHost/types/registry` 契约文件被修改。
- 但存在范围外文件修改，且关键词检查未满足“无匹配”预期。

## 范围偏差列表

1. 关键词扫描存在匹配，未达到“无匹配（退出码 1）”预期。
2. 存在允许清单之外的变更文件：
   - `.sisyphus/plans/add-cdock.md`
   - `.sisyphus/plans/common-components-button-radio-select.md`
   - `.sisyphus/plans/systemtype-start-bar.md`
   - `src/components/Screen/Screen.tsx`
# F4 Scope Fidelity Check

- Time (UTC): 2026-03-26T07:33:26Z
- Original request: `在默认展示的这个窗口中，增加切换 SystemType 的选项，显示名称为：切换系统`
- Plan: `.sisyphus/plans/default-window-systemtype-switch.md`
- Verdict: **REJECT**

## Scope comparison

### In-scope items (implemented)
- Default window title area contains a switch labeled `切换系统` (`src/system/default/DefaultSystem.tsx`).
- Selection plumbing exists from default window to owner state (`src/system/default/DefaultSystem.tsx`, `src/system/SystemHost.tsx`, `src/dev/themeSwitcher.tsx`, `src/dev/main.tsx`, `src/dev/playwright/windowHarness.tsx`).
- System→theme resolution reuses registry default mapping via `DEFAULT_THEME_BY_SYSTEM` (`src/dev/themeSwitcher.tsx`).
- Test coverage added for switch behavior (`tests/SystemTypeSwitch.test.tsx`, `tests/SystemHost.test.tsx`, `tests/ui/default-window-system-switch.spec.ts`).

### Blocking scope violations
1. **Unauthorized refactor of unrelated component `CSelect`**
   - Guardrail explicitly forbids refactoring `CSelect`.
   - Change detected: new `id` prop added to shared component API and forwarded to `<select>`.
   - Evidence: `src/components/Select/Select.tsx` diff adds `id?: string`, destructures `id`, and sets `id={id}`.

2. **Changed files exceed expected scope boundary list**
   - Expected changes list for this check: `DefaultSystem.tsx`, `themeSwitcher.tsx`, `SystemHost.tsx`, `main.tsx`, `windowHarness.tsx`, tests only.
   - Additional non-listed changed runtime files:
     - `src/components/Select/Select.tsx`
     - `src/system/registry.ts`
     - `src/theme/default/styles/index.scss`
   - Even if some are arguably supportive, boundary definition is strict for fidelity review; unauthorized files are scope creep unless explicitly approved.

## Must-do guardrails audit

- Only default window has switch (not windows): **PASS**
  - No switch string/usage added under windows system files.
- No new global state/context/store: **PASS**
  - Only local component state used in preview/harness owners.
- No `useEffect` for derived state in `DefaultSystem`: **PASS**
  - `DefaultSystem` uses no `useEffect`.
- No refactor of `CSelect`, `CWindowTitle`, `RadioGroup`: **FAIL**
  - `CSelect` API changed.
- No theme switcher/settings panel added: **PASS**
  - No new generic settings panel/theme switch UI introduced.
- No duplicated system→theme mapping: **PASS**
  - Mapping reused through `DEFAULT_THEME_BY_SYSTEM`.

## Final decision

**REJECT** — scope creep present due to unauthorized shared component refactor (`CSelect`) and boundary overrun in changed runtime files outside the expected file set.
