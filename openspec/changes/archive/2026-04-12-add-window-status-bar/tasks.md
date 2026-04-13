## 1. 组件与样式实现

- [x] 1.1 在 `src/components/` 中新增 `CStatusBar` 与 `CStatusBarItem` 组件，支持独立渲染、`children` 透传与 `className` 合并。
- [x] 1.2 为状态栏组件补充样式文件，提供默认横向 `flex` 布局、基础 item 外观与稳定类名钩子。

## 2. 集成入口与示例

- [x] 2.1 更新组件库公共入口导出 `CStatusBar` 与 `CStatusBarItem`，确保消费者可直接从包入口导入。
- [x] 2.2 更新开发预览或示例代码，展示 `CWindow` 与 `CStatusBar` 的组合用法且不新增 `CWindow` 专用状态栏 API。

## 3. 测试与交付验证

- [x] 3.1 补充渲染测试，覆盖 `CStatusBar` 横向容器、`CStatusBarItem` 独立使用以及自定义 `className` 合并。
- [x] 3.2 补充组合与导出测试，验证 `CWindow` 默认不渲染预置状态栏，且状态栏组件可从公共入口导入使用。
