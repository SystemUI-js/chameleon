## Why

当前组件库仍保留 `src/system/` 下的 legacy system shell 与注册表公开 API，这部分能力与“纯组件库”定位不一致，也持续扩大了需要维护和兼容的公开表面。现在移除这层 system 兼容实现，可以收敛包入口职责，减少无效测试与后续演进负担。

## What Changes

- **BREAKING** 删除 `src/system/` 下的系统壳层、注册表和相关类型实现，不再通过包入口暴露 `SystemHost`、`SYSTEM_TYPE`、`THEME`、`DEFAULT_SYSTEM_TYPE`、`DEFAULT_THEME_BY_SYSTEM`、`SYSTEM_THEME_MATRIX`、`resolveSystemTypeDefinition`、`assertValidSystemThemeSelection`、`resolveThemeDefinition` 及其关联类型。
- **BREAKING** 收缩 `src/index.ts` 的公开导出，去掉 system layer 相关导出，仅保留组件库本身的组件与主题定义导出。
- 保留现有纯主题定义导出能力（如 `defaultThemeDefinition`、`win98ThemeDefinition`、`winXpThemeDefinition`），但不再依赖 `src/system/registry` 参与计算。
- 删除验证 legacy system 兼容层的单元测试，并同步清理因 system 移除而失效的测试引用。

## Capabilities

### New Capabilities
- `package-entry-without-system`: 定义移除 system layer 后的包入口行为，包括保留哪些组件与纯主题定义导出，以及哪些 legacy system API 必须停止暴露。

### Modified Capabilities
- 无

## Impact

- 受影响代码：`src/index.ts`、`src/system/**`、纯主题定义导出接线代码。
- 受影响测试：`tests/LegacyPublicExports.test.tsx`，以及所有直接依赖 system 兼容层导出的测试。
- 受影响公开 API：`SystemHost` 与全部 system registry/type 导出将被移除；主题定义常量导出将改为直接基于 `src/theme/*`。
- 对外影响：依赖 legacy system shell 或 registry API 的消费者需要迁移到组件级 API 与纯主题定义导出。
