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

---

## F4 Scope Fidelity Audit (Win98 控制样式专项)

- Time (UTC): 2026-03-27T05:18:18Z
- Verdict: **REJECT**

### 检查命令与证据

1. `git diff --stat`

```text
.opencode/package.json                       |   2 +-
src/dev/playwright/commonControlsHarness.tsx | 112 ++++++++++++++++++-
src/theme/win98/styles/index.scss            |  92 ++++++++++------
tests/ui/common-controls.helpers.ts          |  37 +++++++
tests/ui/common-controls.smoke.spec.ts       | 154 ++++++++++++++++++++++++++-
5 files changed, 358 insertions(+), 39 deletions(-)
```

2. `git diff --name-only`

```text
.opencode/package.json
src/dev/playwright/commonControlsHarness.tsx
src/theme/win98/styles/index.scss
tests/ui/common-controls.helpers.ts
tests/ui/common-controls.smoke.spec.ts
```

3. `git diff --name-only -- src/theme/winxp/styles/index.scss src/theme/default/styles/index.scss`

```text
(no output)
```

4. `git diff --name-only -- src/components/**/*.tsx`

```text
(no output)
```

5. `git diff --name-only -- src/theme`

```text
src/theme/win98/styles/index.scss
```

### 逐项判定

1. 改动仅限 Win98 控制样式和 QA 支撑文件：**FAIL**
   - `src/theme/win98/styles/index.scss`：符合样式范围。
   - `tests/ui/common-controls.helpers.ts`、`tests/ui/common-controls.smoke.spec.ts`：符合 QA 文件范围。
   - `src/dev/playwright/commonControlsHarness.tsx`：可归类为 QA harness 支撑。
   - **`.opencode/package.json`：不属于 Win98 样式或 QA 支撑文件，范围违规。**

2. 没有行为逻辑漂移：**PASS（就产品组件范围）**
   - 未发现 `src/components/**/*.tsx` 组件实现变更。

3. 没有新主题系统：**PASS**
   - `src/theme` 目录仅 `win98` 样式文件变化，未新增主题系统文件。

4. 没有无关组件重构：**PASS**
   - 组件 TSX 文件无改动。

5. WinXP/default 没有回归：**PASS（文件级）**
   - `src/theme/winxp/styles/index.scss` 与 `src/theme/default/styles/index.scss` 未改动。

### 范围违规项（精确）

- `.opencode/package.json` 被修改（仅换行差异），不在允许范围内。

### 验证补充

- LSP diagnostics（变更 TS 文件）
  - `src/dev/playwright/commonControlsHarness.tsx`: 1 条 information（imports 未排序），无 error。
  - `tests/ui/common-controls.helpers.ts`: 无诊断。
  - `tests/ui/common-controls.smoke.spec.ts`: 无诊断。
- `yarn build`: 命令完成并产出构建文件（过程中存在既有 TS2533 输出于 `src/components/Screen/Grid.tsx` 的 dts 生成日志）。
