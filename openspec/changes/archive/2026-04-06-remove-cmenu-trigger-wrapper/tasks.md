## 1. 根触发器 DOM 收敛

- [x] 1.1 修改 `src/components/Menu/Menu.tsx`，移除根级 `.cm-menu__trigger` wrapper，直接渲染注入交互与 ARIA 属性后的触发元素
- [x] 1.2 确认根级 popup、`rootRef`、`onPointerLeave` 与外部点击关闭逻辑仍以 `.cm-menu` 作为定位和命中边界

## 2. 样式与交互回归

- [x] 2.1 修改 `src/components/Menu/index.scss`，删除 `.cm-menu__trigger` 样式并保留 `.cm-menu` 的定位职责
- [x] 2.2 更新菜单相关测试，覆盖无 wrapper 的 DOM 结构，以及 click / hover 打开、ARIA 注入、外部点击关闭行为

## 3. 示例与变更说明

- [x] 3.1 更新开发示例或相关断言/选择器，使其匹配新的根触发器 DOM 结构
- [x] 3.2 在 `CHANGELOG` 的 `[UnReleased]` 中记录移除 `.cm-menu__trigger` 的 BREAKING CHANGE
