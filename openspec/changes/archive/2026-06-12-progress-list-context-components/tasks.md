# 任务清单

## 计划 1：progress-list-context-components（13/13 完成）

### 实现任务
- [x] T1: 创建 MenuTree 共享菜单渲染器（从 Menu.tsx 提取）
- [x] T2: 提取 IconContainer useLongPress 共享 hook
- [x] T3: 创建 CProgress 组件（bar/circle/ring 变体）
- [x] T4: 扩展 CList 布局（direction/wrap/gap）
- [x] T5: 创建 CContextMenu 组件
- [x] T6: 四主题 SCSS 样式覆盖
- [x] T7: Playwright 覆盖 — CList 布局
- [x] T8: Playwright 覆盖 — CContextMenu
- [x] T9: ComponentCatalog 集成（ProgressShowcase、CListLayoutShowcase、CContextMenuShowcase）

### 验证任务
- [x] F1: 计划合规审查 — APPROVE
- [x] F2: 代码质量审查 — APPROVE
- [x] F3: 真实浏览器 QA — APPROVE
- [x] F4: 范围保真度审查 — APPROVE

## 计划 2：component-enhancements（8/8 完成）

- [x] T1: OpenSpec 合约创建
- [x] T2: CLoading Demo 展示
- [x] T3: CSplitArea lockCurrent/lock 实现
- [x] T4: CInput 建议下拉 + 防抖
- [x] T5: CSlider 步进验证（仅验证）
- [x] T6: ComponentCatalog 集成
- [x] T7: Playwright UI 冒烟覆盖
- [x] T8: 最终质量门 + 范围审查

## 计划 3：style-component-fixes（7/7 完成）

- [x] F1: Modal 窗口居中修复
- [x] F2: Confirm 内容高度修复（height: 0）
- [x] F3: DatePicker/TimePicker 外部点击关闭
- [x] F4: Checkbox 半选状态（indeterminate）
- [x] F5: Tree 父节点半选
- [x] F6: Select 多选支持
- [x] F7: Menu closeOnSelect

### 验证任务
- [x] Modal 默认高度修复（F3 Issue 1 BLOCKER）
- [x] 四主题样式覆盖验证

## 计划 4：add-datepicker-modal-confirm（11/11 完成）

### 实现任务
- [x] T1: CDatePicker 组件（ARIA combobox/dialog、42 单元网格、min/max）
- [x] T2: CModal 组件（portal、ESC 栈、遮罩、SSR 安全）
- [x] T3: CConfirm 组件（组合 CModal、命令式 confirm() API）
- [x] T4: 四主题 SCSS 样式覆盖
- [x] T5: 公共导出（src/components/index.ts + src/index.ts）

### 验证任务
- [x] V1: 计划合规审查
- [x] V2: 代码质量审查
- [x] V3: 真实浏览器 QA
- [x] V4: 范围保真度审查

## 统计

| 计划 | 任务数 | 完成数 | 状态 |
|------|--------|--------|------|
| progress-list-context-components | 13 | 13 | ✅ 全部完成 |
| component-enhancements | 8 | 8 | ✅ 全部完成 |
| style-component-fixes | 7 | 7 | ✅ 全部完成 |
| add-datepicker-modal-confirm | 11 | 11 | ✅ 全部完成 |
| **总计** | **39** | **39** | ✅ |

## 关键文件变更

### 新增组件
- `src/components/CProgress/` — 进度条组件
- `src/components/CContextMenu/` — 右键菜单包装器
- `src/components/DatePicker/` — 日期选择器
- `src/components/Modal/` — 模态窗口
- `src/components/Confirm/` — 确认对话框
- `src/components/shared/useLongPress.ts` — 长按 hook

### 修改组件
- `src/components/Menu/Menu.tsx` — 提取 MenuTree、新增 closeOnSelect
- `src/components/Menu/MenuTree.tsx` — 共享菜单渲染器
- `src/components/Checkbox/Checkbox.tsx` — 新增 indeterminate
- `src/components/Tree/CTree.tsx` — 消费 Checkbox indeterminate
- `src/components/Select/CSelect.tsx` — 新增多选模式
- `src/components/Input/CInput.tsx` — 新增建议下拉
- `src/components/CSplitArea/CSplitArea.tsx` — 新增 lock/lockCurrent
- `src/components/List/CList.tsx` — 新增 direction/wrap/gap
- `src/components/CWidget/Widget.tsx` — 未修改（通过 SCSS !important 覆盖内联样式）

### 主题文件
- `src/theme/default/styles/index.scss`
- `src/theme/win98/styles/index.scss`
- `src/theme/winxp/styles/index.scss`
- `src/theme/win7/styles/index.scss`

### 测试文件
- 20+ 单元测试文件
- 8+ Playwright UI 测试规范
