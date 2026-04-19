## Why

上一轮已经把窗口/拖拽主链切到 React Native 原生宿主，但 `Button / ButtonGroup / ButtonSeparator / Checkbox / Icon` 仍停留在 DOM 标签实现上。这几组控件仍是组件库的基础交互面，继续保留 `<button> / <input> / <span>` 会让仓库长期维持“双宿主”状态，并且已经在 `IconContainer -> Icon` 组合里暴露出 button 嵌套告警。

## What Changes

- 将 `Button / ButtonGroup / ButtonSeparator / Checkbox / Icon` 的源码宿主切到 `react-native` 原生组件。
- 调整本地 `react-native` 类型声明与 Jest mock，使这批组件在当前过渡阶段仍可验证 legacy web 公开行为，而不要求一次性切断所有 DOM 风格断言。
- 保持 legacy web 入口与公开导出名稳定，但内部默认宿主不再依赖 DOM 标签。

## Capabilities

### New Capabilities

- `native-basic-controls-chain`

## Impact

- 修改 `src/components/Button/Button.tsx`
- 修改 `src/components/ButtonGroup/ButtonGroup.tsx`
- 修改 `src/components/ButtonSeparator/ButtonSeparator.tsx`
- 修改 `src/components/Checkbox/Checkbox.tsx`
- 修改 `src/components/Icon/Icon.tsx`
- 修改 `src/types/react-native.d.ts`
- 修改 `tests/mocks/react-native.tsx`
- 调整受影响测试
