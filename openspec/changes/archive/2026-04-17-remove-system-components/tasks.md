## 1. Public API 收敛

- [x] 1.1 调整 `src/index.ts`，移除所有 legacy system shell、registry 常量、解析函数及关联类型导出
- [x] 1.2 将 `defaultThemeDefinition`、`win98ThemeDefinition`、`winXpThemeDefinition` 改为直接导出对应 `src/theme/*` 中的 canonical theme definition

## 2. 仓库内部迁移与清理

- [x] 2.1 搜索并替换仓库内对 `src/system/registry`、`SystemHost` 与 system 常量/类型的直接依赖，优先处理 dev 入口与预览用法
- [x] 2.2 删除 `src/system/**` 下不再需要的实现、类型与相关残留引用

## 3. 测试与发布准备

- [x] 3.1 删除 `tests/LegacyPublicExports.test.tsx` 等针对 legacy system 公开 API 的测试
- [x] 3.2 改写主题相关测试，验证包入口直接导出的主题定义与 `src/theme/*` canonical definitions 保持一致
- [x] 3.3 运行 `yarn lint`、`yarn test`、`yarn build`，修复残留引用并确认变更通过验证
- [x] 3.4 在 `CHANGELOG` 的 `[UnReleased]` 中记录本次 breaking change 与迁移说明
