# 批量组件增强变更提案

## 概述

本次变更涵盖 4 个并行计划，共完成 39 个任务，涉及 13+ 个组件的新增、增强和修复。

## 变更内容

### 1. 进度条、列表布局与右键菜单 (`progress-list-context-components`)

**CProgress 组件** — 全新的进度指示器：
- 三种变体：`bar`（条形）、`circle`（圆形）、`ring`（环形）
- 确定模式（`value` 0-100）和不定模式（`indeterminate`）
- 支持 `max`、`label`、`showValue`、`format`、`classNames` 子对象
- 尺寸：`small` / `medium` / `large` / 数值 / 字符串
- 状态：`default` / `active` / `success` / `exception`
- CSS `conic-gradient` 实现 circle/ring 变体
- BEM 类前缀：`cm-cprogress`

**CList 布局扩展** — 灵活的列表布局：
- 新增 `direction`（`vertical` / `horizontal`）、`wrap`（`boolean` / `'wrap'` / `'nowrap'` / `'wrap-reverse'`）、`gap`（数值 / 字符串 / `{ row, column }`）
- CSS 变量：`--cm-clist-row-gap`、`--cm-clist-column-gap`
- 键盘拖拽方向感知：水平列表使用 ArrowLeft/Right，垂直列表保持 ArrowUp/Down

**CContextMenu 组件** — 右键菜单包装器：
- 触发方式：`contextmenu`（右键）、`longpress`（触摸长按）、`both`（默认）
- 支持 `Shift+F10` 和 `ContextMenu` 键盘键打开
- 通过 `createPortal` 渲染到 `document.body`
- 视口边缘自动修正位置（8px 边距）
- 集成 `useLongPress` 共享 hook

### 2. 组件增强 (`component-enhancements`)

**CLoading Demo** — 组件目录集成展示

**CSplitArea 锁定** — 分隔器拖拽控制：
- `lockCurrent?: boolean` — 仅锁定当前分隔器
- `lock?: boolean` — 递归锁定所有子分隔器
- 锁定优先级：`lock` 支配 `lockCurrent`

**CInput 建议下拉** — 搜索建议功能：
- `suggestionOptions` — 选项数组
- `suggestionDebounce` — 防抖延迟（默认 0ms）
- `onSearch` / `onSelect` — 搜索和选择回调
- 键盘导航：↑↓ 移动、Enter 选择、disabled 选项跳过

**CSlider 验证** — 确认步进行为正确（仅验证，无代码变更）

### 3. 样式组件修复 (`style-component-fixes`)

**Modal 居中修复**：
- 根因：`CWidget.renderFrame` 始终输出 `position: absolute; left: x; top: y` 内联样式
- 修复：`.cm-modal .cm-window-frame { position: static !important; left: auto !important; top: auto !important; height: auto !important }`

**Confirm 高度修复**：
- 根因：`CWidget.renderFrame` 输出 `height: 0px`（默认值），导致内容不可见
- 修复：`.cm-confirm .cm-window-frame { height: auto !important }` + body/actions `flex: 0 0 auto`

**DatePicker/TimePicker 外部点击关闭**：
- 复制 CMenu 的 `document mousedown` 模式
- 使用 `rootRef.contains(event.target)` 判断点击位置
- 选择 `mousedown` 而非 `click` 以避免 blur/focus 竞态

**Checkbox 半选状态**：
- 新增 `indeterminate?: boolean` 受控 prop
- `useRef` + `useEffect` 同步 `input.indeterminate` DOM 属性
- `aria-checked="mixed"` + `cm-checkbox--indeterminate` CSS 类

**Tree 半选**：
- 消费 CCheckbox 的 `indeterminate` prop
- `areSomeCheckableDescendantsChecked` 辅助函数计算混合状态
- 父节点：部分选中 → `aria-checked="mixed"` + `cm-tree__node--indeterminate`

**Select 多选**：
- 判别联合类型：单选 `value?: string`，多选 `multiple: true, value?: string[]`
- 多选保持选项顺序（非点击顺序）
- 传递 `closeOnSelect={!multiple}` 给 CMenu

**Menu closeOnSelect**：
- 新增 `closeOnSelect?: boolean`（默认 `true`）
- `closeOnSelect={false}` 时，根菜单和子菜单在选择后保持打开

### 4. 新增日期选择器、模态框和确认框 (`add-datepicker-modal-confirm`)

**CDatePicker 组件** — 日期选择器：
- ARIA：`role="combobox"` + `aria-haspopup="dialog"` + `role="dialog"` 面板
- 内置日期工具函数（无外部依赖）
- 42 单元月历网格、年月导航、min/max 范围限制
- 提取 `DatePickerPanel` 和 `DateCell` 内部组件控制认知复杂度

**CModal 组件** — 模态窗口：
- Portal 到 `document.body`，容器即 `.cm-modal` 根元素
- ESC 栈注册（模块级 `escStack` 数组）
- 遮罩层使用 `<button>` 元素（jsx-a11y 合规）
- SSR 安全：`typeof document !== 'undefined'` 守卫
- `theme?: string`（匹配现有代码约定，非 `ThemeId`）

**CConfirm 组件** — 确认对话框：
- 纯函数组件，~120 LOC，组合 CModal
- 统一取消路径：ESC/遮罩/关闭按钮 → `handleCancel` → `onCancel` → `onClose`
- 命令式 `confirm()` API：
  - 每次调用创建新的 `document.createElement('div')` + `createRoot`
  - `setTimeout(0)` 延迟卸载避免 React 18 警告
  - `settled` 布尔值防止双重 resolve

## 四主题样式覆盖

所有新增组件均支持 4 个主题：
- **Default** — 暖橙/奶油色，药丸圆角
- **Win98** — 经典银/海军蓝 3D 斜面
- **WinXP** — Luna 蓝色渐变，Tahoma 12px
- **Win7** — Aero 玻璃效果，Segoe UI 12px，backdrop-filter 模糊

## 验证结果

- `yarn lint` → exit 0
- `yarn test` → 300+ 单元测试通过
- `yarn test:ui` → 109 Playwright 规范通过
- `yarn build` → 构建成功
