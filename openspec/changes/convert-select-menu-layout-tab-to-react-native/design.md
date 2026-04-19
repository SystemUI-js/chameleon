## Goals / Non-Goals

**Goals**

- 让 `Select / Menu / Grid / Screen / CTab` 的源码默认依赖 `react-native` 宿主。
- 保持现有 public API 与关键交互测试语义尽量稳定。
- 让剩余核心 legacy web 组件继续缩小到更少范围。

**Non-Goals**

- 不在本次改造 `Theme`、`WindowBody`、`ScreenManager`、`WindowManager`。
- 不追求最终纯 RN 语义，而是继续沿用受控 interop 作为过渡手段。

## Decisions

### 1. Select 使用受控的 combobox / option 过渡语义

`CSelect` 不再直接渲染 `<select>` / `<option>`，改为使用 `View` 承载 `role="combobox"` 与 option 列表的过渡语义。测试继续通过 `role`、`value`、`disabled` 和 change 事件验证行为。

### 2. Menu 保留现有状态机与 document 外部点击关闭逻辑

`CMenu` 的行为逻辑已较稳定，因此本轮只替换宿主标签，把 DOM 层容器改成 `View` / `Pressable`，并通过 ref + document 事件维持原有外部点击关闭与 hover/click 混合交互。

### 3. Grid / Screen / CTab 继续以过渡 class 和 ARIA 为主

`CGrid`、`CScreen`、`CTab` 在本轮依然通过 `className`、`style`、`role`、`aria-*` 等过渡属性表达布局与无障碍语义，但源码宿主不再直接返回 DOM 标签。

## Risks / Trade-offs

- 这批组件仍较依赖测试 mock 的 web-like interop，真实 RN 形态还需要后续进一步收敛。
- `Menu` 和 `CTab` 的键盘/焦点逻辑复杂，本轮更像宿主替换而不是完整交互体系重写。

## Migration Plan

1. 扩展 `react-native` 类型与 Jest mock。
2. 重写 5 个组件到 RN 宿主。
3. 跑全量 lint / test / build。
