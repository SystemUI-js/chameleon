## Goals / Non-Goals

**Goals**

- 让根入口不再直接暴露 legacy web 组件名，继续收紧 React Native 优先的公开边界。
- 保持纯主题定义与 `legacyWeb` 显式命名空间稳定，降低迁移歧义。
- 通过测试与文档明确新的导入方式。

**Non-Goals**

- 不修改 `legacy-web` 子路径本身的导出集合。
- 不改变 `react-native-multi-drag` 入口与其契约。
- 不在本次继续改写组件内部实现，仅调整公开入口边界。

## Decisions

### 1. 根入口仅保留显式边界

根入口继续导出 pure theme definitions 与 `legacyWeb` 命名空间，但不再把 `legacy-web` 的所有符号平铺到根层级。这样使用方在导入 web-only 组件时必须显式选择 legacy 边界。

### 2. README 与测试同步迁移

由于仓库内已有测试和示例直接从根入口导入 web-only 组件，本次同步改为 `legacy-web` 子路径或 `legacyWeb` 命名空间，避免仓库自身继续固化旧用法。

## Risks / Trade-offs

- 这是一个破坏性收口，依赖根入口直出 web 组件的使用方需要迁移。
- 仓库内部分“package entry”测试需要改为验证 `legacy-web` 子路径，而不是根入口直出。

## Migration Plan

1. 移除 `src/index.ts` 中对 `legacy-web` 的直接星号导出。
2. 调整 README 与 CHANGELOG，明确新的 web-only 导入方式。
3. 更新测试，确保根入口不再暴露 legacy web 组件名。
