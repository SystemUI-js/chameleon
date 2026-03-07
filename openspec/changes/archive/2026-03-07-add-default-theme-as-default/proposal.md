## Why

当前开发主题默认值是 `winxp`，与“提供统一基础主题作为默认展示”的目标不一致；同时现有主题集合缺少名为 `Default` 的选项。现在需要把默认体验收敛到一个显式的 `Default` 主题，避免入口默认行为与预期不一致。

## What Changes

- 新增可选主题 `Default`，并将其纳入与 `win98`、`winxp` 一致的常量驱动主题选择流程。
- 将开发入口默认主题从 `winxp` 调整为 `Default`，并保持默认值单一来源（shared theme switch module）。
- 增加/调整测试，覆盖未显式传入主题时默认渲染 `Default`，并保持 `win98`/`winxp` 分支选择行为可验证。
- 更新相关规范文本，明确“默认主题为 `Default`”的契约与场景。

## Capabilities

### New Capabilities
- （无）

### Modified Capabilities
- `dev-theme-selection`: 变更默认主题契约（由 `winxp` 改为 `Default`），并扩展主题选项要求以包含 `Default`。

## Impact

- Affected specs: `openspec/specs/dev-theme-selection/spec.md`
- Affected code: `src/dev/themeSwitcher.tsx`, `src/dev/main.tsx`, `src/theme/default/*`, `src/index.ts`
- Affected tests: `tests/DevThemeSelection.test.tsx`（及新增 default 主题相关测试）
- 无新增外部依赖或公共 API 破坏性变更
