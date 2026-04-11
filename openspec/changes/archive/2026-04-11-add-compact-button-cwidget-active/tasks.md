## 1. `CButton` 紧凑型能力

- [x] 1.1 扩展 `CButtonProps` 与按钮根节点类名合并逻辑，支持 `compact` 并输出 `cm-button--compact`
- [x] 1.2 在 `src/components/Button/index.scss` 中补充紧凑型样式定义，确保可与现有 `variant` 组合使用

## 2. `CWidget` 激活态模型

- [x] 2.1 扩展 `CWidgetProps`，增加 `active` 与 `onActive`，建立受控/非受控统一的激活态读取与更新入口
- [x] 2.2 将 widget-level active 与 `preview.active` 解耦，并在 `renderFrame` 根节点统一输出或移除 `cm-widget--active`
- [x] 2.3 接入内部激活态变更路径，确保非受控模式更新渲染且状态变化时触发 `onActive`

## 3. 验证与回归

- [x] 3.1 为 `CButton` 补充紧凑型默认态与变体组合测试
- [x] 3.2 为 `CWidget` 补充默认激活、受控覆盖、非受控变化、样式类名与 `onActive` 回调测试
- [x] 3.3 运行与按钮、组件窗口相关的测试验证变更未引入回归
