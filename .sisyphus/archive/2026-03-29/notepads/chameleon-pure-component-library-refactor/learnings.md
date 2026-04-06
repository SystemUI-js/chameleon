- 2026-03-29: 公共 API 已从 `src/index.ts` 移除 `system/registry`、`SystemHost`、`system/types` 导出，改为仅暴露组件与纯主题定义。
- 2026-03-29: 新增 `src/theme/types.ts` 作为纯主题定义类型来源，`ThemeDefinition` 仅包含 `id`、`label`、`className`，不再依赖 `systemType`。
- 2026-03-29: `src/components/index.ts` 不再导出 `WindowManager`、`Screen`、`ScreenManager`，保留窗口组合组件、布局组件与基础表单组件导出。
- 2026-03-29: 主题样式根选择器已统一为纯 `.cm-theme--{themeId}`，系统壳层仅负责系统布局，不再通过 `.cm-system--*` 与主题根类组合驱动主题样式。
- 2026-03-29: `src/system/registry.ts` 已移除 `DEFAULT_THEME_BY_SYSTEM` 与 `SYSTEM_THEME_MATRIX` 常量，改用 `resolveDefaultThemeForSystemType` / `isThemeAllowedForSystemType` 函数封装系统与主题兼容关系。
- 2026-03-29: `CGrid` / `CGridItem` 已从 `src/components/Screen/Grid.tsx` 迁移到 `src/components/Grid/Grid.tsx`，组件总出口与 `tests/Grid.test.tsx` 已同步到新路径。
- 2026-03-29: 删除 `src/system/`、`WindowManager`、`Screen`、`ScreenManager` 与相关 shell 测试后，dev/playwright 入口改为纯 `theme` 根包装，`yarn build` 可直接通过。

- 2026-03-29: 重建 dev demo 为主题化组件目录。创建 `src/dev/ComponentCatalog.tsx`，包含 Button、RadioGroup、Select、Window、Dock、StartBar、Grid 展示区。主题切换状态由 ComponentCatalog 内部管理，交互状态在切换主题时保留。
- 2026-03-29: `CGridItem` 组件需要 `parentGrid` 属性，类型为 `[number, number]`。
