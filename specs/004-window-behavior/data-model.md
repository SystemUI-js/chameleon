# Data Model: Window 交互与菜单优化

**Feature**: 004-window-behavior
**Date**: 2026-01-23
**Status**: Draft

## 概述

本文档定义了 Window 交互与菜单优化功能的核心数据模型、实体关系和状态转换规则。

---

## 1. 核心实体

### 1.1 Window（窗口）

| 字段 | 类型 | 说明 | 默认值 | 验证规则 |
|------|------|------|----------|----------|
| id | string | 窗口唯一标识符 | 必填 | 非空字符串 |
| isActive | boolean | 窗口是否处于激活状态 | false | - |
| position | {x: number, y: number} | 窗口位置坐标 | {x: 0, y: 0} | x >= 0, y >= 0 |
| size | {width: number, height: number} | 窗口尺寸 | {width: 400, height: 300} | width >= minWidth, height >= minHeight |
| themeId | ThemeId | 当前应用的主题ID | 'win98' | 有效的 ThemeId |
| activationSource | 'pointer' \| null | 激活来源（指针点击或程序化） | null | - |

**状态转换**：
```
未激活 --[点击任意位置]--> 激活
激活 --[点击其他窗口]--> 未激活
```

### 1.2 Theme（主题）

| 字段 | 类型 | 说明 | 默认值 | 验证规则 |
|------|------|------|----------|----------|
| id | ThemeId | 主题唯一标识符 | 必填 | 非空字符串 |
| name | string | 主题显示名称 | - | 非空字符串 |
| tokens | ThemeTokens | 主题设计令牌（颜色、字体等） | - | 必填 |
| windowDefaults | WindowDefaults | 窗口默认配置 | - | - |

### 1.3 WindowDefaults（窗口默认配置）

| 字段 | 类型 | 说明 | 默认值 | 验证规则 |
|------|------|------|----------|----------|
| interactionMode | 'follow' \| 'static' | 交互模式（跟随/静态） | 'follow' | - |
| movable | boolean | 是否可移动 | true | - |
| resizable | boolean | 是否可调整大小 | true | - |
| minWidth | number | 最小宽度 | 200 | > 0 |
| minHeight | number | 最小高度 | 100 | > 0 |
| activateWholeArea | boolean | 是否支持全区域点击激活 | true | - |

### 1.4 WindowInteractionState（窗口交互状态）

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|----------|
| active | boolean | 是否正在进行交互 | false |
| type | 'move' \| 'resize' \| null | 交互类型 | null |
| direction | ResizeDirection \| null | 缩放方向（仅 resize 时） | null |

**ResizeDirection 类型**：
```typescript
type ResizeDirection =
  | 'n'   // 北（上）
  | 's'   // 南（下）
  | 'e'   // 东（右）
  | 'w'   // 西（左）
  | 'ne'  // 东北
  | 'nw'  // 西北
  | 'se'  // 东南
  | 'sw'  // 西南
```

---

## 2. 菜单系统实体

### 2.1 MenuItem（菜单项）

| 字段 | 类型 | 说明 | 默认值 | 验证规则 |
|------|------|------|----------|----------|
| id | string | 菜单项唯一标识符 | 必填 | 非空字符串 |
| label | string | 菜单项显示文本 | 必填 | 非空字符串 |
| icon | React.ReactNode | 菜单项图标 | null | - |
| onClick | (() => void) \| undefined | 点击回调函数 | undefined | - |
| disabled | boolean | 是否禁用 | false | - |
| items | MenuItem[] | 子菜单项（多级菜单） | [] | - |

### 2.2 MenuPath（菜单路径）

| 字段 | 类型 | 说明 |
|------|------|------|
| paths | string[] | 已打开菜单的 ID 数组 |

**示例**：
- `[]` - 无菜单打开
- `['file']` - File 菜单打开
- `['file', 'edit']` - File 菜单打开，且其子菜单 Edit 打开
- `['file', 'edit', 'undo']` - 三级菜单打开

**状态转换**：
```
[] --[点击 File]--> ['file']
['file'] --[点击 Edit]--> ['file', 'edit']
['file', 'edit'] --[点击外部]--> []
```

### 2.3 ContextMenuProps（右键菜单属性）

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|----------|
| triggerRef | React.RefObject<HTMLElement> | 触发元素引用 | 必填 |
| items | MenuItem[] | 菜单项列表 | [] |
| position | {x: number, y: number} \| null | 菜单位置 | null |

### 2.4 ContextMenuState（右键菜单状态）

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|----------|
| isOpen | boolean | 菜单是否打开 | false |
| position | {x: number, y: number} | 菜单位置 | {x: 0, y: 0} |

---

## 3. 拖拽预览实体（Win98 模式）

### 3.1 WindowPreview（窗口预览）

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|----------|
| position | {x: number, y: number} \| null | 预览框位置 | null |
| windowSize | {width: number, height: number} | 窗口实际尺寸 | - |

**状态转换**：
```
position: null --[开始拖拽]--> position: {x, y}
position: {x, y} --[拖拽中]--> position: {newX, newY}
position: {x, y} --[释放鼠标]--> position: null (应用位置到窗口)
```

---

## 4. 关系图

```
Theme (1) ────── (*) Window (N)
    │
    └────── WindowDefaults

MenuItem (1) ────── (*) MenuItem (N)  (多级菜单)
    │
    └───── MenuPath

Window (1) ────── (1) ContextMenu
    │
    └───── (1) WindowPreview (仅 Win98 模式)
```

---

## 5. 验证规则

### 5.1 窗口激活验证

| 场景 | 条件 | 期望结果 |
|------|------|----------|
| 点击窗口标题栏 | `!isActive` | 窗口激活 |
| 点击窗口内容区域 | `!isActive && activateWholeArea` | 窗口激活 |
| 点击窗口控制按钮 | `!isActive` | 窗口激活 |
| 点击已激活窗口 | `isActive` | 无变化 |

### 5.2 光标状态验证

| 场景 | 交互状态 | 期望光标 |
|------|----------|----------|
| 拖拽中 | `type: 'move'` | `move` |
| 拖拽中 | `type: 'resize'` | 保持 `move`（根据需求）|
| 缩放中 | `type: 'resize', direction: 'n'` | `n-resize` |
| 缩放中 | `type: 'resize', direction: 'se'` | `se-resize` |
| 无交互 | `active: false` | `default` |

### 5.3 菜单收起验证

| 场景 | MenuPath | 点击位置 | 期望结果 |
|------|----------|----------|----------|
| 点击外部 | `['file', 'edit']` | 菜单外 | `[]` |
| 点击外部 | `['file', 'edit', 'undo']` | 菜单外 | `[]` |
| 点击子菜单项 | `['file']` | 子菜单内 | `['file', 'edit']` |
| 点击菜单项 | `['file', 'edit']` | 菜单项 | 保持 `['file', 'edit']` |

### 5.4 主题切换验证

| 场景 | 切换前 | 切换主题 | 期望结果 |
|------|---------|---------|----------|
| 打开 Popover | `win98` | 切换到 `winxp` | Popover 样式更新为 `winxp` |
| 打开 Modal | `winxp` | 切换到 `win98` | Modal 样式更新为 `win98` |
| 打开 ContextMenu | `win98` | 切换到 `winxp` | ContextMenu 样式更新为 `winxp` |

---

## 6. 性能约束

| 指标 | 目标值 | 测量方法 |
|------|---------|----------|
| 窗口激活响应延迟 | < 16ms (60fps) | Performance API |
| 光标状态切换延迟 | < 10ms | 用户体验测试 |
| 主题切换延迟 | < 100ms | React DevTools Profiler |
| 菜单展开/收起延迟 | < 16ms (60fps) | Performance API |
| 拖拽预览框更新频率 | requestAnimationFrame | RAF 时间戳 |

---

## 7. 边界情况

### 7.1 窗口激活
- 在窗口未激活时右键标题栏，菜单打开不影响激活逻辑
- 快速连续拖拽/缩放切换时光标保持一致不闪烁
- 多级菜单处于展开状态时切换主题，菜单外观更新且关闭行为不受影响

### 7.2 菜单系统
- 多级菜单嵌套深度无限制，但 UI 样式约束以避免显示问题
- 菜单位置计算确保不超出视口边界
- 窗口数量无硬性限制，性能由运行环境决定

### 7.3 主题切换
- 主题切换立即更新所有已打开的组件（包括浮层）
- 无需刷新页面，样式实时更新
- CSS 变量继承确保所有层级正确应用新主题

---

## 8. 向后兼容性

| 变更 | 兼容性策略 | 破坏性变更 |
|------|-------------|-------------|
| 添加 `activateWholeArea` 配置 | 默认值为 `true`，保持现有行为 | 否 |
| 添加 `interactionState` | 内部状态，不改变公共 API | 否 |
| 将 CSS 变量提升到 `:root` | 向后兼容，所有元素都能访问 | 否 |
| 添加 `ContextMenu` 组件 | 新增组件，不影响现有 Window | 否 |
| 修改 DropMenu 收起行为 | 改善用户体验，不破坏现有 API | 否 |
