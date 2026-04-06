## 1. 触发规则实现

- [x] 1.1 调整 `src/components/Menu/Menu.tsx` 中父级菜单项触发方式解析逻辑，将根级 `trigger` 与嵌套子菜单默认触发规则分开处理。
- [x] 1.2 保留 `item.trigger` 的最高优先级，并更新父级菜单项的 `onPointerEnter` / `onClick` 分支逻辑，确保根菜单 click 打开、子菜单 hover 切换、同层级分支互斥行为保持一致。

## 2. 行为验证与示例更新

- [x] 2.1 在 `tests/Menu.test.tsx` 补充混合触发模式测试，覆盖默认 hover 展开、显式 `trigger: 'click'` 覆盖、叶子点击关闭与外部点击关闭场景。
- [x] 2.2 更新 `src/dev/playwright/menuHarness.tsx` 与 `src/dev/ComponentCatalog.tsx` 的菜单示例，提供 mixed trigger 演示并明确展示显式覆盖行为。

## 3. 发布准备

- [x] 3.1 在 `[UnReleased]` 中更新 CHANGELOG，说明“根菜单 click、子菜单默认 hover”的行为变化以及使用 `item.trigger='click'` 的兼容迁移方式。
- [x] 3.2 运行并确认相关校验通过（至少包括 `yarn test`、`yarn lint`、`yarn build`），确保混合触发模式实现可发布。
