# Quickstart Guide: Window 交互与菜单优化

**Feature**: 004-window-behavior
**Date**: 2026-01-23
**Version**: 0.1.0

## 概述

本指南提供了 Window 交互与菜单优化功能的快速开始指南，包括窗口全区域激活、光标管理、Win98 预览框、主题系统优化、右键菜单实现和多级菜单收起行为的实现方法。

---

## 前置条件

### 环境要求

- Node.js >= 18
- React 18.2.0
- TypeScript 5.6
- Vite 5
- Yarn 包管理器

### 依赖安装

```bash
# 安装项目依赖
yarn install

# 启动开发服务器
yarn dev

# 运行测试
yarn test

# 构建组件库
yarn build
```

---

## 1. Window 全区域点击激活

### 1.1 启用全区域激活

**目标**：点击窗口任意可见位置（包括标题栏和内容区域）都能激活窗口

**实现步骤**：

1. **配置主题**（`src/theme/types.ts` 和 `src/theme/win98/index.ts`）：

```typescript
// src/theme/types.ts
export interface WindowDefaults {
  readonly interactionMode?: WindowDragMode
  readonly movable?: boolean
  readonly resizable?: boolean
  readonly minWidth?: number
  readonly minHeight?: number
  readonly activateWholeArea?: boolean  // 新增配置项
}

// src/theme/win98/index.ts
behavior: {
  windowDragMode: 'static',
  windowDefaults: {
    interactionMode: 'static',
    movable: true,
    resizable: false,
    minWidth: 200,
    minHeight: 100,
    activateWholeArea: true  // 启用全区域点击激活
  }
}
```

2. **修改 Window 组件**（`src/components/Window.tsx`）：

```typescript
// 添加配置读取
const { windowDefaults } = useThemeBehavior()
const activateWholeArea = windowDefaults.activateWholeArea ?? true

// 在根元素添加 onClick 处理器（约 420 行）
<div
  ref={setMergedRef}
  className={cls}
  style={combinedStyle}
  onClick={(e) => {
    if (!activateWholeArea) return

    // 排除控制按钮区域
    if ((e.target as HTMLElement).closest('.cm-window__controls')) return

    // 触发激活回调
    if (!isActive) {
      activationSourceRef.current = 'pointer'
      onActiveRef.current?.()
    }
  }}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onPointerCancel={handlePointerUp}
  {...rest}
>
```

3. **测试验证**：

```bash
# 运行开发服务器
yarn dev

# 打开浏览器访问 http://localhost:5673
# 验证：
# - 点击窗口内容区域，窗口应该激活
# - 点击标题栏，窗口应该激活
# - 点击控制按钮，窗口不应该激活
```

---

## 2. 光标状态管理优化

### 2.1 添加独立的缩放状态

**目标**：区分拖拽和缩放，确保缩放时显示正确的方向光标

**实现步骤**：

1. **扩展状态管理**（`src/components/Window.tsx`）：

```typescript
// 添加独立的交互状态
const [interactionState, setInteractionState] = useState<{
  active: boolean
  type: 'move' | 'resize' | null
  direction: ResizeDirection | null
}>({ active: false, type: null, direction: null })
```

2. **修改指针按下处理**（第 204-254 行）：

```typescript
const handlePointerDown = (
  e: PointerEvent<Element>,
  type: 'move' | 'resize',
  direction: ResizeDirection | null = null
) => {
  // ...

  // 设置交互状态
  setInteractionState({
    active: true,
    type: type,
    direction: direction
  })

  // 如果不是拖拽，不触发激活
  if (type !== 'move' || !isActive) {
    // 不触发激活逻辑
  } else {
    activationSourceRef.current = 'pointer'
    onActiveRef.current?.()
  }

  // ...
}
```

3. **修改 CSS 样式**（`src/components/Window.scss`）：

```scss
// 移除强制光标覆盖（第 86 行）
.cm-window.isDragging {
  // * {
  //   cursor: move !important;  // 移除此行
  // }

  // 保持 cursor: move 仅针对拖拽
  cursor: move;
}
```

4. **可选：使用 document.body.style.cursor**（类似 Splitter）：

```typescript
// 在 handlePointerDown 中添加
if (type === 'resize' && direction) {
  document.body.style.cursor = `${direction}-resize`;
} else if (type === 'move') {
  document.body.style.cursor = 'move';
}

// 在 handlePointerUp 中重置
document.body.style.cursor = '';
```

---

## 3. Win98 虚线预览框

### 3.1 启用静态拖拽模式

**目标**：在 Win98 主题下，移动窗口时显示虚线预览框

**实现步骤**：

1. **扩展主题配置**（`src/theme/win98/index.ts`）：

```typescript
behavior: {
  windowDragMode: 'static',  // 已经存在
  windowDefaults: {
    interactionMode: 'static',  // 已经存在
    movable: true,
    resizable: false,
    minWidth: 200,
    minHeight: 100
  }
}
```

2. **修改 Window 组件**（`src/components/Window.tsx`）：

```typescript
// 添加预览框状态
const [previewPos, setPreviewPos] = useState<{x: number, y: number} | null>(null)

// 在 handlePointerMove 中处理静态模式（第 256-351 行）
const handlePointerMove = (e: PointerEvent<Element>) => {
  if (!isDragging || !interactionState.active) return

  const { x, y } = calculateNewPosition(e)

  if (mode === 'follow') {
    setPos(x, y)  // 实时移动
  } else if (mode === 'static') {
    setPreviewPos({x, y})  // 仅更新预览框
  }
}

// 在 handlePointerUp 中应用预览框位置（第 353-392 行）
const handlePointerUp = (e: PointerEvent<Element>) => {
  if (mode === 'static' && previewPos) {
    setPos(previewPos.x, previewPos.y)  // 应用预览框位置到窗口
    setPreviewPos(null)
  }

  setIsDragging(false)
  setInteractionState({ active: false, type: null, direction: null })
}
```

3. **添加预览框组件**（`src/components/Window.tsx`）：

```tsx
// 在返回 JSX 中添加预览框
return (
  <>
    <div
      ref={setMergedRef}
      className={cls}
      style={combinedStyle}
      {...rest}
    >
      {/* 窗口内容 */}
    </div>

    {/* Win98 静态模式的预览框 */}
    {mode === 'static' && isDragging && previewPos && (
      <div
        className='cm-window-preview'
        style={{
          position: 'fixed',
          left: previewPos.x,
          top: previewPos.y,
          width: windowSize.width,
          height: windowSize.height,
          border: '2px dashed var(--cm-color-border-strong)',
          pointerEvents: 'none',
          zIndex: 10000,
          backgroundColor: 'transparent'
        }}
      />
    )}
  </>
)
```

4. **添加预览框样式**（`src/components/Window.scss` 或新建 `src/components/WindowPreview.scss`）：

```scss
.cm-window-preview {
  box-shadow: 0 0 4px var(--cm-color-border-dark);
  border-radius: var(--cm-radius-sm);
}
```

---

## 4. 主题系统优化

### 4.1 修复浮层组件主题继承

**目标**：确保 Popover、Modal、ContextMenu 等浮层组件能正确继承主题样式

**实现步骤**：

1. **修改 ThemeContext**（`src/theme/ThemeContext.tsx`）：

```typescript
// 将 CSS 变量设置到 document.documentElement（第 31-40 行）
useLayoutEffect(() => {
  const el = document.documentElement  // 改为 documentElement，而非 rootRef

  const vars = themeToCSSVars(theme)

  Object.entries(vars).forEach(([name, value]) => {
    el.style.setProperty(name, value)
  })

  el.dataset.cmTheme = theme.id
}, [theme])
```

2. **完善基础样式**（`src/components/Popover.scss`）：

```scss
.cm-popover {
  // 将硬编码的颜色值替换为 CSS 变量
  background-color: var(--cm-color-surface, white);  // 添加默认值
  border: 1px solid var(--cm-color-border, #ccc);
  box-shadow: var(--cm-shadow-popup, 2px 2px 4px rgba(0,0,0,0.3));
}
```

3. **补全主题样式**（`src/theme/winxp/popover.scss`）：

```scss
.cm-theme-root[data-cm-theme='winxp'] .cm-popover {
  // 添加 WinXP 主题的 Popover 样式
  background-color: var(--cm-components-popover-bg, #F5F3E5);
  border-color: var(--cm-components-popover-border, #D4C4B8);
}
```

---

## 5. 右键菜单实现

### 5.1 创建 ContextMenu 组件

**目标**：提供通用的右键菜单能力，继承自 DropMenu

**实现步骤**：

1. **创建组件文件**（`src/components/ContextMenu.tsx`）：

```typescript
import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { DropDownMenu, type MenuItem } from './DropDownMenu'
import { Popover } from './Popover'

export interface ContextMenuProps {
  triggerRef: React.RefObject<HTMLElement>
  items: MenuItem[]
  children?: React.ReactNode
  className?: string
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  triggerRef,
  items,
  children,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{x: number, y: number}>({x: 0, y: 0})
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()  // 阻止浏览器默认右键菜单
    e.stopPropagation()

    // 计算菜单位置，避免超出视口边界
    const menuWidth = 200
    const menuHeight = items.length * 32

    const x = Math.min(e.clientX, window.innerWidth - menuWidth)
    const y = Math.min(e.clientY, window.innerHeight - menuHeight)

    setPosition({x, y})
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        onContextMenu={handleContextMenu}
      >
        {children}
      </div>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          className={`cm-context-menu ${className || ''}`}
        >
          <Popover
            open={isOpen}
            onClose={handleClose}
            position={{top: position.y, left: position.x}}
          >
            <DropDownMenu items={items} />
          </Popover>
        </div>,
        document.body
      )}
    </>
  )
}
```

2. **添加组件样式**（`src/styles/context-menu.scss`）：

```scss
.cm-context-menu {
  z-index: var(--cm-z-index-menu, 1000);
  position: fixed;

  .cm-popover {
    box-shadow: var(--cm-shadow-popup, 2px 2px 4px rgba(0,0,0,0.2));
  }
}
```

3. **导出组件**（`src/index.ts`）：

```typescript
export * from './components/ContextMenu'
```

4. **在 Window 中使用**（`src/components/Window.tsx`）：

```typescript
import { ContextMenu, type MenuItem } from './ContextMenu'

// Window 组件中使用
const [isWindowOpen, setIsWindowOpen] = useState(true)
const titleBarRef = useRef<HTMLDivElement>(null)

return (
  <ContextMenu
    triggerRef={titleBarRef}
    items={[
      { id: 'close', label: '关闭窗口', onClick: () => setIsWindowOpen(false) },
      { id: 'minimize', label: '最小化', onClick: () => {} },
      { id: 'maximize', label: '最大化', onClick: () => {} },
    ]}
  >
    <Window
      isActive={isWindowOpen}
      onActive={() => setIsWindowOpen(true)}
      title="示例窗口"
    >
      <div>窗口内容</div>
    </Window>
  </ContextMenu>
)
```

---

## 6. 多级菜单收起优化

### 6.1 实现全局点击关闭

**目标**：点击菜单以外区域时关闭所有菜单层级

**实现步骤**：

1. **修改 WindowMenu 组件**（`src/components/WindowMenu.tsx`）：

```typescript
import { useEffect } from 'react'

useEffect(() => {
  if (openPath.length === 0) return

  const handleClickOutside = (e: MouseEvent) => {
    // 检查点击是否在任何打开的菜单内部
    const isInsideMenu = Array.from(
      document.querySelectorAll('.cm-dropdown-menu, .cm-window-menu')
    ).some((el) => el.contains(e.target as Node))

    if (!isInsideMenu) {
      closeAll()  // 关闭所有层级
    }
  }

  document.addEventListener('mousedown', handleClickOutside)

  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [openPath, closeAll])
```

2. **测试验证**：

```bash
# 运行测试
yarn test

# 验证场景：
# - 单级菜单：点击外部能正常关闭
# - 二级菜单：点击外部能同时关闭两层
# - 三级菜单：点击外部能同时关闭三层
# - 菜单内部点击：点击子菜单项时保持父菜单打开
```

---

## 7. 验证和测试

### 7.1 运行测试套件

```bash
# 运行所有测试
yarn test

# 监听模式运行测试
yarn test:watch
```

### 7.2 检查代码质量

```bash
# ESLint 检查
yarn lint

# Prettier 格式化
yarn format

# ESLint 自动修复
yarn lint:fix
```

### 7.3 构建验证

```bash
# 构建组件库
yarn build

# 检查构建产物
ls -la dist/
```

---

## 8. 常见问题

### Q1: 为什么浮层组件主题不生效？

**A**: 确保已将 CSS 变量设置到 `document.documentElement.style`，而不仅仅是 `rootRef` 上。检查 `src/theme/ThemeContext.tsx` 的实现。

### Q2: 为什么右键菜单不显示？

**A**: 确保 `triggerRef` 已正确绑定到触发元素，并且 `onContextMenu` 事件没有被阻止。检查浏览器的开发者控制台是否有错误。

### Q3: 为什么多级菜单只关闭最后一级？

**A**: 确保 WindowMenu 组件中添加了全局点击监听，使用 `closeAll()` 方法关闭所有层级，而不是仅更新 `openPath.slice(0, level)`。

### Q4: 如何自定义右键菜单样式？

**A**: 通过 CSS 变量和主题文件自定义。在 `src/theme/{theme}/context-menu.scss` 中添加主题特定的样式。

### Q5: Win98 预览框不显示？

**A**: 确保：
1. 主题配置中 `interactionMode: 'static'`
2. Window 组件的 `mode` prop 接收到了主题配置
3. `previewPos` 状态在拖拽时正确更新
4. 预览框元素的 `pointerEvents: 'none'` 设置正确

---

## 9. 下一步

完成所有实现后：

1. **更新文档**：更新 API 文档和使用示例
2. **添加更多测试**：覆盖所有边缘情况和用户场景
3. **性能优化**：使用 React DevTools Profiler 验证性能指标
4. **发布版本**：更新版本号并发布到 npm

---

## 10. 资源链接

- [React 文档 - createPortal](https://react.dev/reference/react-dom/createPortal)
- [Radix UI - ContextMenu](https://www.radix-ui.com/primitives/docs/primitives/context-menu)
- [React 测试库](https://testing-library.com/docs/react-testing-library/intro)
- [MDN - Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
