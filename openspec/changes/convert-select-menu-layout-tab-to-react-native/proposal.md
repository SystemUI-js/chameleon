## Why

当前仓库在完成窗口链、基础控件链和 radio/status/scroll 链迁移后，仍有 `Select / Menu / Grid / Screen / CTab` 这批关键组件保留 DOM 源码实现。它们分别覆盖表单选择、菜单交互、布局容器、页面壳层和标签页，是剩余 legacy web 公开面里最核心的一组。如果不继续迁移，这些组件会成为 React Native 转向中的长期阻塞点。

## What Changes

- 将 `CSelect`、`CMenu`、`CGrid`、`CGridItem`、`CScreen`、`CTab` 的源码宿主切到 `react-native` 原生组件。
- 扩展本地 `react-native` 过渡类型与 Jest mock，补齐 `ref`、键盘、pointer、ARIA、data 属性和 change 事件等现有测试链路所需 interop。
- 保持 legacy web 入口与导出名稳定，同时继续通过 OpenSpec 收敛这批组件的过渡契约。

## Capabilities

### New Capabilities

- `native-select-menu-layout-tab-chain`

## Impact

- 修改 `src/components/Select/Select.tsx`
- 修改 `src/components/Menu/Menu.tsx`
- 修改 `src/components/Grid/Grid.tsx`
- 修改 `src/components/Screen/Screen.tsx`
- 修改 `src/components/Tab/CTab.tsx`
- 修改 `src/types/react-native.d.ts`
- 修改 `tests/mocks/react-native.tsx`
- 调整受影响测试与 `CHANGELOG.md`
