## 1. CSplitArea 锁定能力

- [ ] 1.1 在 `CSplitArea` props 中定义 `lockCurrent?: boolean` 与 `lock?: boolean`
- [ ] 1.2 实现 `lockCurrent` 逻辑：为 `true` 时当前实例分割线禁止拖动
- [ ] 1.3 实现 `lock` 逻辑：为 `true` 时当前实例及所有后代 `CSplitArea` 分割线禁止拖动
- [ ] 1.4 实现优先级规则：`lock` 优先级高于 `lockCurrent`；祖先 `lock` 强制后代继承，后代 `lockCurrent` 不可覆盖
- [ ] 1.5 为锁定行为补充单元测试（当前锁定、递归锁定、优先级覆盖、后代继承）
- [ ] 1.6 更新 `CSplitArea` Demo，展示 `lockCurrent` 与 `lock` 的交互效果

## 2. CInput 搜索建议能力

- [ ] 2.1 定义 `CInputSuggestionOption` 类型与相关 props（`suggestionOptions`、`suggestionDebounce`、`onSearch`、`onSelect`）
- [ ] 2.2 实现建议列表渲染：根据输入值过滤 `suggestionOptions` 并展示下拉列表
- [ ] 2.3 实现防抖逻辑：`suggestionDebounce` 为大于 `0` 的值时，延迟触发 `onSearch`
- [ ] 2.4 实现选中回调：用户点击建议项时同步输入值并触发 `onSelect`
- [ ] 2.5 支持禁用选项：渲染时标记 `disabled` 为 `true` 的选项不可选中
- [ ] 2.6 为建议交互补充单元测试（渲染、防抖、选中、禁用、回调触发）
- [ ] 2.7 更新 `CInput` Demo，展示建议列表的交互效果

## 3. CLoading Demo 暴露

- [ ] 3.1 在开发预览中创建 `CLoading` 示例页面或路由
- [ ] 3.2 Demo 覆盖不同主题（default、win98、winxp）下的 `CLoading` 展示
- [ ] 3.3 Demo 覆盖不同尺寸或状态（如全屏、局部、有文字/无文字）的展示
- [ ] 3.4 验证 Demo 页面可在开发服务器正常访问

## 4. CSlider Step 验证

- [ ] 4.1 编写验证测试：配置 `step` 后拖拽结果对齐到步进点
- [ ] 4.2 编写验证测试：轨道点击与拖拽使用一致的步进约束
- [ ] 4.3 编写验证测试：边界值（min、max）附近的步进对齐正确
- [ ] 4.4 若测试发现缺陷，记录问题并评估是否需要修复
- [ ] 4.5 若测试通过，确认 `CSlider` `step` 实现符合规格，不做代码变更

