## Context

本次变更围绕现有组件的能力增强展开，不涉及新组件的创建。所有变更均需在现有 React 18 + TypeScript + SCSS 组件库的技术约束内完成，遵循已有的 BEM 类名约定、导出模式与测试策略。

### CSplitArea 锁定

`CSplitArea` 当前仅支持通过 `separatorMovable` 全局控制分割线是否可拖动。业务场景中经常需要：
- 仅锁定某个特定 `CSplitArea` 实例，不影响其内部嵌套子区域；
- 递归锁定某棵子树，使父级及其所有后代的 `CSplitArea` 均不可拖动。

因此需要引入两个新属性：
- `lockCurrent?: boolean`：仅锁定当前实例。
- `lock?: boolean`：递归锁定当前实例及所有后代。

优先级规则：`lock` 优先级高于 `lockCurrent`；后代实例必须继承祖先的 `lock`，且不能通过 `lockCurrent` 覆盖。

### CInput 搜索建议

`CInput` 当前为纯文本输入组件。业务需要输入提示时，需要自行管理：
- 建议选项的数据结构与渲染；
- 输入防抖，避免频繁触发搜索；
- 选中后的值同步与回调通知。

因此需要为 `CInput` 扩展建议能力，保持 API 简洁且不与现有属性冲突。

### CLoading Demo

`CLoading` 组件已存在，但开发预览中缺少直观的示例页面。需要补充 Demo 以便开发者验证不同主题与状态下的加载效果。

### CSlider Step 验证

`CSlider` 的 `step` 支持已在 `add-cslider-component` 变更中实现。本次变更不修改其实现代码，仅通过规格文档与测试确认其步进对齐、边界裁剪行为符合预期。

## Goals / Non-Goals

**Goals:**

- 为 `CSplitArea` 提供精细化的锁定控制能力，支持当前实例锁定与递归锁定。
- 为 `CInput` 提供内建的建议列表能力，包括防抖搜索与选中回调。
- 在开发预览中暴露 `CLoading` 的 Demo 示例。
- 通过规格与测试确认 `CSlider` 的 `step` 行为正确。
- 所有新增能力均需配套测试与 Demo 更新。

**Non-Goals:**

- 不修改 `CSlider` 的实现代码（本次为验证性质）。
- 不引入新的主题系统或样式方案。
- 不支持 `CSplitArea` 部分后代解锁（`lock` 一旦启用，后代必须全部继承）。
- 不将 `CInput` 建议能力扩展为多选或异步远程搜索（保留为纯本地建议列表）。
- 不修改 `CLoading` 组件本身的 API 或样式。

## Decisions

### 1. CSplitArea 锁定语义：`lockCurrent` 与 `lock` 分离

采用两个独立布尔属性，而非单个枚举值，原因如下：
- `lockCurrent` 语义直观，对应"仅锁定当前"。
- `lock` 语义对应"递归锁定整棵子树"。
- 两个布尔属性的组合可以覆盖所有场景，且与现有 `separatorMovable` 保持正交。

优先级规则明确为：`lock` > `lockCurrent`；祖先 `lock` 强制后代继承，后代 `lockCurrent` 无法覆盖。

- 选择该方案的原因：布尔属性在 JSX 中使用简洁，与现有 API 风格一致。
- 备选方案：使用 `lockMode?: 'none' | 'current' | 'recursive'`。
- 不采用备选方案的原因：增加调用方记忆成本，且 `'none'` 与不传属性语义重复。

### 2. CInput 建议选项数据结构

定义显式类型 `CInputSuggestionOption`：

```typescript
type CInputSuggestionOption = {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
};
```

Props 扩展：
- `suggestionOptions?: readonly CInputSuggestionOption[]`
- `suggestionDebounce?: number`（默认 `0`，不防抖）
- `onSearch?: (value: string) => void`
- `onSelect?: (value: string, option: CInputSuggestionOption) => void`

- 选择该方案的原因：`value` 必填保证选中后的值同步；`label` 支持富文本渲染；`disabled` 支持禁用特定选项。`suggestionDebounce` 默认 `0` 保持向后兼容。
- 备选方案：直接接受 `string[]`。
- 不采用备选方案的原因：无法支持禁用状态与富文本标签，扩展性差。

### 3. CLoading Demo 仅做示例暴露

`CLoading` 组件本身不做任何 API 变更。Demo 层面仅在其示例页面中增加不同主题与尺寸的展示组合，使开发者能够直观验证加载效果。

### 4. CSlider Step 验证范围限定

本次变更对 `CSlider` 仅做规格验证与测试确认，不修改实现。验证范围包括：
- `step` 配置后拖拽结果是否正确对齐到步进点；
- 轨道点击与拖拽是否使用一致的步进约束；
- 边界值（min、max）附近的步进对齐是否正确。

若验证过程中发现实现缺陷，将记录在案并决定是否修复。

## Risks / Trade-offs

- [CSplitArea 锁定态与 `separatorMovable` 的交互] → 明确规格：`lock` 或 `lockCurrent` 为 `true` 时，分割线强制不可拖动，不受 `separatorMovable` 影响；`separatorMovable` 仍为 `false` 时自然也不可拖动。
- [CInput 建议列表的层级与遮挡] → 建议列表使用与现有下拉菜单一致的定位策略，必要时使用 portal 渲染。
- [CSlider 验证发现缺陷] → 若验证发现 `step` 实现存在边界问题，可能需要额外的修复任务，但修复范围应控制在最小化改动。
- [Demo 增加导致构建时间轻微上升] → 可接受，Demo 页面不参与库构建产物。

## Migration Plan

1. 更新 `CSplitArea` 规格与实现，添加 `lockCurrent` 与 `lock` 属性处理。
2. 更新 `CInput` 规格与实现，添加建议列表、防抖与回调。
3. 补充 `CLoading` Demo 示例页面。
4. 编写 `CSlider` `step` 验证测试，确认现有实现。
5. 更新 `src/index.ts` 如有新增类型导出。
6. 运行 `lint`、`test` 与 `build` 验证。
7. 若发现问题，记录并修复；若无问题，完成验证。

## Open Questions

- `CInput` 建议列表是否需要支持键盘导航（上下箭头、回车选中）作为首版能力？
- `CSplitArea` 锁定态是否需要额外的视觉样式区分（如改变分割线颜色或光标）？
- `CLoading` Demo 是否需要覆盖所有现有主题（default、win98、winxp）？

