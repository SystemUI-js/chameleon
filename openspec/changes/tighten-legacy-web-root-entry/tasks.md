## 1. 根入口收口

- [x] 1.1 移除根入口对 `legacy-web` 的直接星号导出，仅保留 pure theme definitions 与 `legacyWeb` 命名空间
- [x] 1.2 补充入口契约测试，验证根入口不再直接暴露 legacy web 组件名

## 2. 仓库内迁移与说明

- [x] 2.1 将受影响测试改为从 `legacy-web` 子路径导入 web-only 组件
- [x] 2.2 更新 README 与 CHANGELOG，说明根入口不再直接导出 legacy web 组件
