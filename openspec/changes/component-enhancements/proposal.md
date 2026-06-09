## Why

当前组件库中已有 `CSplitArea`、`CInput`、`CLoading` 与 `CSlider` 组件，但在实际使用场景中仍存在以下 gaps：

1. `CSplitArea` 仅支持全局启用或禁用分割线拖动（`separatorMovable`），无法针对单个实例或嵌套结构进行锁定控制；当业务需要锁定某个面板或递归锁定整棵子树时，现有 API 无法满足。
2. `CInput` 缺少搜索建议能力，用户在需要输入提示或自动补全时只能自行实现下拉列表与防抖逻辑。
3. `CLoading` 的 Demo 示例未在开发预览中暴露，开发者无法直观查看不同主题与尺寸下的加载效果。
4. `CSlider` 已在 `add-cslider-component` 变更中实现 `step` 支持，但尚未经过正式的规格验证与测试覆盖确认。

本变更旨在填补上述 gaps，增强现有组件的可用性与可验证性，且不引入破坏性变更。

## What Changes

- 为 `CSplitArea` 新增 `lockCurrent` 与 `lock` 属性，支持锁定当前实例分割线及递归锁定所有后代实例。
- 为 `CInput` 新增搜索建议能力，包括建议选项列表、防抖触发、搜索回调与选中回调。
- 在开发预览中补充 `CLoading` 的 Demo 示例，覆盖不同主题与交互状态。
- 对 `CSlider` 的 `step` 支持进行规格验证与测试确认，不新增实现。

## Capabilities

### New Capabilities

- `csplitarea-lock`: 覆盖 `CSplitArea` 的 `lockCurrent` 与 `lock` 属性语义、优先级规则与递归锁定行为。
- `cinput-suggestions`: 覆盖 `CInput` 的建议选项数据结构、防抖搜索、下拉渲染与选中回调。
- `cloading-demo`: 覆盖 `CLoading` 在开发预览中的示例暴露与交互展示。

### Modified Capabilities

- `csplitarea-component`: 在现有规格基础上扩展锁定语义，不影响原有 `separatorMovable` 行为。
- `csplitarea-demo`: 在现有 Demo 规格基础上增加锁定分割线示例。

### Verified Capabilities

- `cslider-step-verify`: 对 `CSlider` 已实现的 `step` 支持进行规格验证与测试确认。

## Impact

- 影响 `src/components/CSplitArea/`: 新增 `lockCurrent` 与 `lock` 属性处理及递归锁定逻辑。
- 影响 `src/components/CInput/`: 新增建议列表渲染、防抖逻辑与相关回调。
- 影响 `src/dev/` 或 `src/components/CLoading/`: 补充 Demo 示例页面或路由。
- 影响 `tests/`: 为锁定行为、建议交互与 `CSlider` step 对齐补充测试。
- 不影响 `CSlider` 实现代码：仅验证已有实现是否符合规格。

