# Component API Contract: ContextMenu

**Component**: `ContextMenu`
**Package**: `@sysui/chameleon`
**Version**: 0.1.0

## 概述

ContextMenu 是一个通用的右键菜单组件，继承自 DropMenu，用于在用户右键点击时显示上下文菜单。组件通过 React Portal 挂载到 `document.body`，确保菜单在正确的 z-index 层级上显示。

---

## Props（属性）

| Prop | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `triggerRef` | `React.RefObject<HTMLElement>` | 必填 | 触发右键菜单的元素引用 |
| `items` | `MenuItem[]` | `[]` | 菜单项列表，支持多级嵌套 |
| `children` | `React.ReactNode` | `undefined` | 触发元素（如标题栏） |
| `className` | `string` | `undefined` | 附加的 CSS 类名 |
| `position` | `{x: number, y: number} \| null` | `null` | 初始菜单位置（由 onContextMenu 事件自动计算） |

### MenuItem 类型

| Prop | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `id` | `string` | 必填 | 菜单项唯一标识符 |
| `label` | `string` | 必填 | 菜单项显示文本 |
| `icon` | `React.ReactNode` | `undefined` | 菜单项图标（可选） |
| `onClick` | `() => void` | `undefined` | 点击菜单项时的回调 |
| `disabled` | `boolean` | `false` | 是否禁用菜单项 |
| `items` | `MenuItem[]` | `undefined` | 子菜单项（支持多级菜单） |

---

## Events（事件）

| Event | 类型 | 触发时机 | 说明 |
|--------|------|-----------|------|
| `onContextMenu` | `React.MouseEventHandler<HTMLElement>` | 用户右键点击触发元素时 | 阻止浏览器默认右键菜单并打开 ContextMenu |
| `onClose` | `() => void` | 菜单关闭时 | 点击外部区域或选择菜单项后 |

---

## Behavior（行为）

### 触发机制

| 场景 | 行为 |
|--------|------|
| 右键点击触发元素 | 显示菜单，阻止浏览器默认右键菜单 |
| 菜单已打开 | 点击外部区域关闭菜单 |
| 点击菜单项 | 执行 `onClick` 回调并关闭菜单 |
| 多级菜单 | 支持无限级嵌套，子菜单向右展开 |

### 定位行为

| 场景 | 行为 |
|--------|------|
| 正常位置 | 在鼠标右键位置显示菜单 |
| 超出右边界 | 菜单位移到左侧以避免超出视口 |
| 超出下边界 | 菜单位移到上方以避免超出视口 |
| 超出左/上边界 | 保持在视口边界内 |

### 主题继承

| 场景 | 行为 |
|--------|------|
| 挂载到 `document.body` | 通过 CSS 变量从 `:root` 继承主题 |
| 主题切换 | 菜单样式实时更新，无需重新打开 |

---

## Accessibility（无障碍）

| 属性 | 值 | 说明 |
|--------|-----|------|
| `role` | `menu` | 菜单角色 |
| `aria-label` | `contextmenu` | 上下文菜单标签 |
| `aria-orientation` | `vertical` | 垂直方向 |
| `aria-disabled` | `disabled`（菜单项） | 禁用状态 |
| `role` | `menuitem`（菜单项） | 菜单项角色 |

---

## Examples（示例）

### 基本用法

```tsx
import { Window, ContextMenu } from '@sysui/chameleon'

function App() {
  const titleBarRef = useRef<HTMLDivElement>(null)
  const [isWindowOpen, setIsWindowOpen] = useState(true)

  return (
    <ContextMenu
      triggerRef={titleBarRef}
      items={[
        { id: 'close', label: '关闭窗口', onClick: () => setIsWindowOpen(false) },
        { id: 'minimize', label: '最小化', onClick: () => {} },
      ]}
    >
      <div ref={titleBarRef}>
        <Window title="我的窗口" onClose={() => setIsWindowOpen(false)}>
          <div>窗口内容</div>
        </Window>
      </div>
    </ContextMenu>
  )
}
```

### 多级菜单

```tsx
import { ContextMenu } from '@sysui/chameleon'

function App() {
  return (
    <ContextMenu
      triggerRef={triggerRef}
      items={[
        {
          id: 'file',
          label: '文件',
          items: [
            { id: 'new', label: '新建文件', onClick: () => {} },
            {
              id: 'recent',
              label: '最近文件',
              items: [
                { id: 'doc1', label: '文档1.txt', onClick: () => {} },
                { id: 'doc2', label: '文档2.txt', onClick: () => {} },
              ]
            },
            { id: 'open', label: '打开文件', onClick: () => {} },
          ]
        },
        { id: 'edit', label: '编辑', items: [...] }
      ]}
    >
      <div ref={triggerRef}>右键点击这里</div>
    </ContextMenu>
  )
}
```

### 带图标的菜单项

```tsx
import { ContextMenu } from '@sysui/chameleon'
import { FiX, FiMinimize2, FiMaximize2 } from 'react-icons/fi'

function App() {
  return (
    <ContextMenu
      triggerRef={triggerRef}
      items={[
        {
          id: 'close',
          label: '关闭窗口',
          icon: <FiX />,
          onClick: () => setIsWindowOpen(false)
        },
        {
          id: 'minimize',
          label: '最小化',
          icon: <FiMinimize2 />,
          onClick: () => {}
        },
      ]}
    >
      <div ref={triggerRef}>窗口标题栏</div>
    </ContextMenu>
  )
}
```

### 禁用菜单项

```tsx
<ContextMenu
  triggerRef={triggerRef}
  items={[
    { id: 'save', label: '保存', onClick: () => {} },
    { id: 'saveAs', label: '另存为', disabled: true },  // 禁用
    { id: 'delete', label: '删除', onClick: () => {} },
  ]}
>
  <div ref={triggerRef}>文件内容</div>
</ContextMenu>
```

---

## Implementation Notes（实现注意事项）

1. **右键事件处理**：
   - 在触发元素上监听 `onContextMenu` 事件
   - 调用 `e.preventDefault()` 阻止浏览器默认右键菜单
   - 调用 `e.stopPropagation()` 防止事件冒泡

2. **菜单位置计算**：
   - 初始位置：`{x: e.clientX, y: e.clientY}`
   - 边界检测：`x = Math.min(e.clientX, window.innerWidth - menuWidth)`
   - 边界检测：`y = Math.min(e.clientY, window.innerHeight - menuHeight)`

3. **Portal 挂载**：
   - 使用 `createPortal(content, document.body)` 挂载到 body
   - 通过 Popover 组件处理定位和外部点击关闭
   - CSS 变量从 `:root` 继承，确保主题一致

4. **DropMenu 继承**：
   - 复用 DropDownMenu 的结构和样式
   - 支持多级菜单的嵌套和键盘导航
   - 通过 MenuContext 管理菜单路径

5. **z-index 管理**：
   - 使用 CSS 变量 `var(--cm-z-index-menu, 1000)` 确保正确层叠
   - 比 Modal 略高，比其他弹出层优先

---

## Version History

| Version | Date | Changes |
|---------|-------|---------|
| 0.1.0 | 2026-01-23 | 初始版本，定义 ContextMenu 组件 API |
