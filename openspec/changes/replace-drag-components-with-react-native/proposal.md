## Why

当前仓库虽然已经把新的拖拽能力抽到 React Native 优先入口，但 `Widget / Window / WindowTitle / Dock / StartBar / CSlider / CSplitArea / IconContainer` 这条交互链仍然建立在 React DOM、SCSS、浏览器测量与 web 宿主节点之上。若继续保留这条 DOM 继承链，仓库就无法真正把这组基础交互组件转成 React Native 原生组件。

## What Changes

- 直接将拖拽相关组件链改为使用 `react-native` 原生组件（如 `View`、`Text`、`Pressable`）实现，而不再继续维护它们在源码层的 DOM 宿主实现。
- 同时调整打包、类型与测试配置，使仓库能够在保留其余 web 组件的同时构建并测试这条 RN 原生组件链。
- 受影响范围包含 `Widget / Window / WindowTitle / Dock / StartBar / CSlider / CSplitArea / IconContainer` 以及其导出与测试链路。

## Capabilities

### New Capabilities

- `native-window-widget-chain`: 定义窗口/拖拽组件链作为 React Native 原生组件集合的公开契约与工具链要求。

### Modified Capabilities

- `csplitarea-component`
- `cwidget-active-state`

## Impact

- 修改 `src/components/Widget/Widget.tsx`
- 修改 `src/components/Window/Window.tsx`
- 修改 `src/components/Window/WindowTitle.tsx`
- 修改 `src/components/Dock/Dock.tsx`
- 修改 `src/components/StartBar/StartBar.tsx`
- 修改 `src/components/CSlider/CSlider.tsx`
- 修改 `src/components/CSplitArea/CSplitArea.tsx`
- 修改 `src/components/Icon/IconContainer.tsx`
- 修改 `package.json`、`vite.config.ts`、`jest.config.ts`
- 调整受影响测试
