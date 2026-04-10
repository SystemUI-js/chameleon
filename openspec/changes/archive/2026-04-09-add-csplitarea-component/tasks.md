## 1. 组件骨架与基础渲染

- [x] 1.1 新增 `src/components/CSplitArea/` 组件目录、入口文件和严格类型的 Props 定义，支持 `children`、`direction` 与 `separatorMovable`
- [x] 1.2 实现子节点归一化、区域包装与分割线基础渲染，确保 `horizontal` / `vertical` 两种方向下都能按顺序生成连续布局

## 2. 尺寸状态与拖动交互

- [x] 2.1 实现区域比例状态、初始均分逻辑以及子区域增删后的保守重算策略，保证布局持续有效
- [x] 2.2 集成 `@system-ui-js/multi-drag` 到分割线层，在 `separatorMovable` 为 `true` 时支持拖动调整相邻区域尺寸，并设置基础下限避免区域过窄

## 3. 样式、导出与开发示例

- [x] 3.1 补充 `CSplitArea` 的 SCSS 样式，覆盖横向/纵向容器、区域容器、分割线及可拖动态样式
- [x] 3.2 将 `CSplitArea` 接入 `src/components/index.ts` 和 `src/index.ts` 的公共导出链路
- [x] 3.3 在 `src/dev/` 中新增示例，展示横竖嵌套布局、可拖动分割线以及动态移除子区域后的布局变化

## 4. 测试与变更验证

- [x] 4.1 在 `tests/` 中新增覆盖区域渲染、方向切换、公共导出和子区域动态变化的测试用例
- [x] 4.2 补充分割线可拖动相关的结构或交互测试，并执行 `yarn lint`、`yarn test`、`yarn build` 验证本次变更
