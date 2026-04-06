## 1. 组件 API 与状态骨架

- [x] 1.1 在 `src/components/Tab/` 新增 `CTab`、`CTabItem` 组件文件与类型定义，沿用现有组件库的 `theme`、`className`、`data-testid` 接入方式。
- [x] 1.2 在 `CTab` 中实现对子节点的 `CTabItem` 识别、`title` 提取与稳定内部标识生成，忽略非 `CTabItem` 直接子节点。
- [x] 1.3 实现默认激活首个标签、点击标签切换激活项，以及 `tablist` / `tab` / `tabpanel` 的基础可访问性关联。

## 2. 结构样式与主题接入

- [x] 2.1 在组件级样式中补齐 `.cm-ctab`、`.cm-ctab__list`、`.cm-ctab__tab`、`.cm-ctab__tab--active`、`.cm-ctab__panel` 等结构类名与布局规则。
- [x] 2.2 在 `default`、`win98`、`winxp` 主题样式中补充 `.cm-ctab*` 的视觉外观，保证各主题下的边框、背景与激活态表现一致。

## 3. 公共导出与库集成

- [x] 3.1 更新 `src/components/index.ts`，将 `CTab` 与 `CTabItem` 纳入组件级导出。
- [x] 3.2 更新 `src/index.ts` 的公共入口导出，确保消费者可直接从包入口导入标签组件。

## 4. 测试与交付验证

- [x] 4.1 在 `tests/` 中新增用例，覆盖根据 `CTabItem.title` 生成标签头、忽略非标签子项、默认激活首项与点击切换内容。
- [x] 4.2 增加对可访问性状态和公共入口导出的验证，确认激活标签与内容面板关联正确且组件可从包入口正常使用。
