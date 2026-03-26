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
