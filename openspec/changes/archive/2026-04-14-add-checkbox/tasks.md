## 1. 组件骨架与状态模型

- [x] 1.1 新增 `src/components/Checkbox/` 组件文件和 props 类型，基于原生 `<input type="checkbox">` 渲染独立复选框
- [x] 1.2 实现 `checked`、`defaultChecked`、`onChange` 的受控与非受控状态切换逻辑
- [x] 1.3 统一 `children ?? label` 标签内容、`disabled` 语义和 `cm-checkbox` 系列稳定类名输出

## 2. 样式与公共导出接入

- [x] 2.1 新增 `src/components/Checkbox/index.scss`，补齐根节点、输入节点、标签节点和禁用态样式
- [x] 2.2 在组件实现中接入 `useTheme`、`normalizeThemeClassName` 与 `mergeClasses`，确保主题类名与基础类名共存
- [x] 2.3 更新 `src/components/index.ts` 与 `src/index.ts`，导出 `CCheckbox` 及其 props 类型

## 3. 测试覆盖

- [x] 3.1 新增 `tests/Checkbox.test.tsx`，覆盖非受控初始值和交互切换场景
- [x] 3.2 补充受控模式、禁用态与可访问名称相关断言
- [x] 3.3 补充公共入口导出与主题类名共存相关断言

## 4. 验证与收尾

- [x] 4.1 运行 `yarn lint`，修复本次变更引入的问题
- [x] 4.2 运行 `yarn test`，确认 `CCheckbox` 相关行为通过验证
- [x] 4.3 运行 `yarn build`，确认组件库构建通过
