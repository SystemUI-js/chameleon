## 1. 宿主与测试适配

- [x] 1.1 扩展本地 `react-native` 类型声明与 Jest mock，支持这批过渡控件所需的 `className`、角色、ARIA 与事件适配

## 2. 五个组件 RN 化

- [x] 2.1 用 React Native 原生组件重写 `Button / ButtonGroup / ButtonSeparator`
- [x] 2.2 用 React Native 原生组件重写 `Checkbox`
- [x] 2.3 用 React Native 原生组件重写 `Icon`，消除 `IconContainer` 组合中的 button 嵌套告警

## 3. 验证

- [x] 3.1 调整并运行受影响测试，确认公开交互和过渡 class 语义仍可验证
- [x] 3.2 运行 `yarn lint`、`yarn test --runInBand` 与 `yarn build`
