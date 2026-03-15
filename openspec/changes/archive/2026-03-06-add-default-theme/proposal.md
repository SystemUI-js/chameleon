## Why

当前开发入口的主题选择依赖手动修改常量，缺少明确的“默认主题”要求，导致新环境和新成员进入项目时体验不一致。现在补齐默认主题规范，可以降低接入成本并减少调试时的环境偏差。

## What Changes

- 明确系统在未显式指定主题时的默认主题行为。
- 统一开发入口与主题注册表的默认值约定，避免不同入口出现默认主题分歧。
- 增加对应测试覆盖，确保默认主题行为可回归验证。

## Capabilities

### New Capabilities
- （无）

### Modified Capabilities
- `dev-theme-selection`: 扩展主题选择能力，新增“未指定主题时必须使用默认主题”的规范，并约束默认值来源一致。

## Impact

- Affected specs: `openspec/specs/dev-theme-selection/spec.md`
- 预期影响代码：`src/dev/main.tsx` 及主题选择相关测试文件
- 无新增外部依赖；对外 API 预期无破坏性变更
