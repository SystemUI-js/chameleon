## Goals / Non-Goals

**Goals**

- 让 `CRadio`、`CRadioGroup`、`CStatusBar`、`CStatusBarItem`、`CScrollArea` 的源码默认依赖 `react-native` 宿主。
- 保持现有 public API、受控/非受控状态模型和过渡期测试语义稳定。
- 让这批组件继续兼容 legacy web 入口的使用方式，而不阻塞后续彻底收口。

**Non-Goals**

- 不在本次改造 `Select / Menu / Grid / Screen / CTab`。
- 不引入完整的原生滚动或菜单系统，只完成当前宿主替换与测试适配。

## Decisions

### 1. Radio 以抽象 checked 语义替代原生 input

`CRadio` 不再直接渲染 `<input type="radio">`，而是使用 `Pressable` 暴露 `role="radio"`、`aria-checked`、`disabled` 等过渡语义，并继续复用 `CRadioGroup` 的状态上下文。

### 2. StatusBar 系列作为纯容器切换到 `View`

`CStatusBar` 和 `CStatusBarItem` 仅承担布局和 class 语义，直接切到 `View` 即可，不改变现有组合方式。

### 3. ScrollArea 继续保持受控的 web-like 过渡属性

当前 `CScrollArea` 的公共面仍依赖 `overflowX`、`overflowY`、`tabIndex`、`onScroll` 和 `data-scroll-area-content`。本轮通过受控 interop props 保持这些能力可验证，而不一次性切断现有断言。

## Risks / Trade-offs

- `ScrollArea` 仍然依赖过渡期的 web-like 属性，不是最终形态。
- `Radio` 相关测试继续建立在角色与 `aria-checked` 上，而不是真实 RN 无障碍栈。

## Migration Plan

1. 扩展 `react-native` 本地类型和 Jest mock。
2. 重写 5 个组件到 RN 宿主。
3. 运行 lint / test / build，确认全量回归通过。
