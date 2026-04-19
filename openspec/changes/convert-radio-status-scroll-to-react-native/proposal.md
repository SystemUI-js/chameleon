## Why

在 `Button / Checkbox / Icon` 完成 RN 宿主迁移后，`Radio / RadioGroup / StatusBar / StatusBarItem / ScrollArea` 仍然保留 DOM 标签实现。这一批组件要么是基础输入控件，要么是轻量布局壳层，继续停留在 `<input>` / `<div>` 上会让仓库长期维持混合宿主状态，也会拖慢后续从 legacy web 过渡到 RN 优先的收口速度。

## What Changes

- 将 `CRadio`、`CRadioGroup`、`CStatusBar`、`CStatusBarItem`、`CScrollArea` 的源码宿主切到 `react-native` 原生组件。
- 扩展本地 `react-native` 过渡类型和 Jest mock，支持 radio / scroll / data 属性等当前测试所需的 interop 语义。
- 保持 legacy web 入口和现有导出名稳定，同时继续通过 OpenSpec 明确这批组件已进入 RN 优先迁移序列。

## Capabilities

### New Capabilities

- `native-radio-status-scroll-chain`

## Impact

- 修改 `src/components/Radio/Radio.tsx`
- 修改 `src/components/Radio/RadioGroup.tsx`
- 修改 `src/components/StatusBar/StatusBar.tsx`
- 修改 `src/components/StatusBar/StatusBarItem.tsx`
- 修改 `src/components/ScrollArea/ScrollArea.tsx`
- 修改 `src/types/react-native.d.ts`
- 修改 `tests/mocks/react-native.tsx`
- 调整受影响测试与 `CHANGELOG.md`
