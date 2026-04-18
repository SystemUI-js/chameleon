## 1. 工具链切换

- [x] 1.1 将 `react-native` 作为 peer dependency / build external 接入仓库
- [x] 1.2 调整 Jest，使源码中的 `react-native` 导入可以在当前测试链路下运行

## 2. 整条组件链 RN 化

- [x] 2.1 用 React Native 原生组件重写 `Widget / Window / WindowTitle`
- [x] 2.2 用 React Native 原生组件重写 `Dock / StartBar`
- [x] 2.3 用 React Native 原生组件重写 `CSlider / CSplitArea / IconContainer`

## 3. 验证

- [x] 3.1 改写受影响测试，验证新的 RN 宿主语义与公开行为
- [x] 3.2 运行 `yarn lint`、`yarn test` 与 `yarn build`
