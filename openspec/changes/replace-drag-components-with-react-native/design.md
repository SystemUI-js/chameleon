## Goals / Non-Goals

**Goals**

- 让窗口/拖拽相关组件链直接依赖 `react-native` 原生组件，而不是 DOM 标签。
- 让仓库能够继续构建这些组件，并通过测试 mock/适配来验证其公开行为。
- 保持现有 TypeScript 导出名与大部分 props 形态稳定，避免入口层再次大改。

**Non-Goals**

- 不保证这条组件链继续兼容当前 SCSS / className / DOM 交互测试语义。
- 不把仓库全部组件都改成 React Native，只覆盖窗口/拖拽相关链路。
- 不在本次实现完整的 RN 手势/动画体系，只先完成原生组件宿主替换与最小行为闭环。

## Decisions

### 1. 源码层直接 `import from 'react-native'`

目标组件源码将直接从 `react-native` 导入 `View`、`Text`、`Pressable` 等原生组件，而不是继续通过 web wrapper 间接渲染 DOM。这样可以保证组件语义已经转向 RN，而不是继续停留在 DOM 包装层。

### 2. 构建时将 `react-native` externalize

`react-native` 作为 peer dependency 暴露，并在 Vite library build 中 externalize。这样仓库不会把 RN 运行时打进产物，同时仍允许消费者在 RN 宿主中解析这些组件。

### 3. 测试通过 Jest module mapper 使用 RN mock 宿主

为了不把整个测试链一次性切到 RN preset，本次采用测试 mock 的方式：源码仍直接依赖 `react-native`，但 Jest 中将其映射到本地 mock 宿主组件，以便沿用当前测试基础设施并快速验证公开行为。

### 4. 以“整条链”替换而不是点状替换

仅替换 5 个局部组件会留下 `Widget / Window / Dock / StartBar` 等上游继承链仍然依赖 DOM 的断裂结构。本次按用户要求，将整条链一起替换，避免半 DOM 半 RN。

## Risks / Trade-offs

- 现有基于 DOM / className / SCSS 的行为断言需要改写。
- 这次实现是 RN 原生宿主优先，不再保证此前 web-only 交互细节保持一致。
- 使用 mock 测试宿主意味着测试验证的是公开契约，不是完整 RN 运行时细节。

## Migration Plan

1. 声明 `react-native` 模块类型与 peer dependency。
2. 调整 Vite/Jest 配置，让仓库可构建、可测试 RN 组件源码。
3. 用 RN 原生组件重写 `Widget / Window / WindowTitle / Dock / StartBar / CSlider / CSplitArea / IconContainer`。
4. 重写受影响测试，改为断言 RN 宿主语义与公开回调行为。
