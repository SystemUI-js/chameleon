## Goals / Non-Goals

**Goals**

- 让 5 个基础控件源码直接依赖 `react-native` 原生组件，而不是 DOM 标签。
- 保持现有公开组件名、关键交互语义和测试入口稳定。
- 顺带消除 `IconContainer` 内嵌 `Icon` 时的 button 嵌套告警。

**Non-Goals**

- 不在本次改造 `Menu / Select / Radio / ScrollArea` 等其余组件。
- 不追求完整 RN 动画或手势体系，只完成宿主替换和最小契约闭环。
- 不重写 legacy web 入口结构。

## Decisions

### 1. 基础控件统一切到 `react-native` 宿主

`Button / ButtonGroup / ButtonSeparator / Checkbox / Icon` 统一从 `react-native` 导入 `Pressable / View / Text`。其中 `Icon` 改为非 button 宿主，避免和 `IconContainer` 的可点击外层形成嵌套 button。

### 2. 保留过渡期的 DOM 风格测试语义

为降低本轮迁移成本，本地 `react-native` 类型声明与 Jest mock 会扩展少量 `className`、`role`、`aria-*`、事件回调等过渡属性，使测试和 legacy web 过渡面仍能验证既有公共语义，而不要求一次性重写整批断言。该 interop 仅服务于当前过渡层验证，后续仍应继续收敛到更纯的 RN 语义。

### 3. Checkbox 以抽象状态语义替代原生 input

`Checkbox` 不再依赖 `<input type="checkbox">`，改用 `Pressable + checked 状态 + disabled` 表达统一状态；在当前过渡测试层中继续通过角色和 checked 状态验证公开行为。

## Risks / Trade-offs

- 本地 `react-native` mock 会暂时承担更多过渡属性，增加一点测试适配复杂度。
- 这批组件虽然源码已 RN 化，但部分 legacy web 风格 class 语义仍作为过渡契约保留。

## Migration Plan

1. 扩展 `react-native` 本地类型和 Jest mock 的过渡能力。
2. 重写 5 个组件到 RN 原生宿主。
3. 运行 lint / test / build，确认入口和组合行为不回退。
