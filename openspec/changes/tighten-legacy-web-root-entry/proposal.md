## Why

当前根入口虽然已经通过 `legacyWeb` 命名空间声明 web-only 能力属于过渡范围，但 `src/index.ts` 仍然直接 `export * from './legacy-web'`。这会继续鼓励消费者从根入口直接导入 `CButton`、`Theme`、`CWindow` 等 legacy web 组件，削弱 React Native 优先迁移的边界。

## What Changes

- 移除根入口对 `legacy-web` 的直接星号导出，只保留纯主题定义与 `legacyWeb` 显式命名空间。
- 对齐 README、测试与迁移说明，要求 web-only 组件通过 `@system-ui-js/chameleon/legacy-web` 或 `legacyWeb.*` 使用。
- 保持 React Native 显式入口与纯主题定义导出不变。

## Capabilities

### Modified Capabilities

- `package-entry-without-system`

## Impact

- 修改 `src/index.ts`
- 修改 `tests/PackageEntryContract.test.ts`
- 修改受影响的 legacy web 测试导入
- 修改 `README.md` 与 `CHANGELOG.md`
