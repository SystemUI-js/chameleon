## 1. 平台层脚手架

- [x] 1.1 新增 `src/platform/web/` 基础原语，提供 `View`、`Text` 等可复用宿主包装
- [x] 1.2 新增布局测量 helper，将 `getBoundingClientRect()` 读取收敛到平台层

## 2. 五个拖拽组件迁移

- [x] 2.1 将 `WindowTitle` 与 `Widget` 改为消费平台原语，移除组件文件中的 raw `div`/`span`
- [x] 2.2 将 `IconContainer`、`CSplitArea`、`CSlider` 改为消费平台原语，移除组件文件中的 raw `div`/`span`
- [x] 2.3 将这五个组件中的布局读取改为调用平台 helper，而不是在组件内直接读取 DOMRect

## 3. 验证与说明

- [x] 3.1 运行受影响测试，确认交互、className 与入口契约保持兼容
- [x] 3.2 运行 `yarn lint`、`yarn test` 与 `yarn build`，验证平台层迁移未破坏现有 legacy web 能力
