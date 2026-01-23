# Research: Window 交互与菜单优化

**Feature**: 004-window-behavior
**Date**: 2026-01-23
**Status**: Complete

## 概述

本文档记录了针对 Window 组件交互优化和菜单功能增强的技术研究结果，涵盖窗口激活、光标管理、Win98 预览框、主题系统优化、右键菜单实现和多级菜单收起行为。

---

## 1. Window 全区域激活

### 决策
采用**根元素 onClick 激活 + 主题配置**相结合的方案。

### 决策依据
1. **当前实现分析**：
   - Window 组件（`src/components/Window.tsx` 第 429-431 行）仅在标题栏 (`cm-window__title-bar`) 绑定了 `onPointerDown` 事件
   - 激活逻辑（第 204-218 行）只在 `type === 'move'` 时触发激活
   - 点击内容区域（`cm-window__body`）不会触发窗口激活

2. **用户需求**：
   - spec.md FR-001 要求：点击窗口任意可见位置（包括标题栏和内容区域）都能激活窗口

3. **技术考量**：
   - Popover 和 Modal 等组件展示了点击外部关闭的实现模式
   - `onClick` 事件适合全区域触发，覆盖所有子元素

### 推荐方案
1. 在 `src/theme/types.ts` 的 `WindowDefaults` 接口添加 `activateWholeArea?: boolean` 配置项
2. 在 `src/theme/win98/index.ts` 和 `src/theme/winxp/index.ts` 的 `windowDefaults` 中添加 `activateWholeArea: true`
3. 在 `src/components/Window.tsx` 的根 div 元素添加 `onClick` 处理器，根据配置决定是否启用全区域激活
4. 排除控制按钮区域的点击（`.cm-window__controls`）

### 替代方案考虑
- **仅在 body 元素添加激活**：不影响现有逻辑，但仅覆盖内容区域
- **仅通过主题配置控制**：灵活性高，但需要更多配置代码

---

## 2. 光标状态管理

### 决策
采用**添加独立缩放状态 + 移除强制光标覆盖**的方案。

### 决策依据
1. **问题根源**：
   - Window 组件（`src/components/Window.tsx` 第 107 行）只有单一 `isDragging` 状态
   - Window.scss（第 86 行）使用 `cursor: move !important` 强制所有子元素使用 move 光标
   - 缩放操作没有独立的 CSS 类，无法区分拖拽和缩放

2. **光标不一致的表现**：
   - 拖拽时光标显示为 `move`
   - 缩放时光标被强制为 `move`，而非预期的 `n-resize`、`s-resize` 等
   - 光标在 resize 和 move 之间切换导致闪烁

3. **对比分析**：
   - Splitter 组件（`src/components/Splitter.tsx` 第 40-45 行）直接使用 `document.body.style.cursor` 设置光标
   - 为不同方向设置不同光标，更符合预期行为

### 推荐方案
1. **添加独立缩放状态**：
   ```tsx
   const [interactionState, setInteractionState] = useState<{
     active: boolean
     type: 'move' | 'resize' | null
     direction: ResizeDirection | null
   }>({ active: false, type: null, direction: null })
   ```

2. **移除强制光标覆盖**：
   - 删除或修改 Window.scss 第 86 行的 `.cm-window.isDragging * { cursor: move !important; }`

3. **使用 document.body.style.cursor**（可选，类似 Splitter）：
   ```tsx
   if (type === 'resize' && direction) {
     document.body.style.cursor = `${direction}-resize`;
   } else if (type === 'move') {
     document.body.style.cursor = 'move';
   }
   ```

### 替代方案考虑
- **仅修改 CSS 优先级**：提高缩放手柄的 cursor 优先级，但 `!important` 限制较大
- **保留强制覆盖但区分类型**：添加 `isResizing` CSS 类，代码复杂度增加

---

## 3. Win98 虚线预览框

### 决策
采用**项目已有 static 模式 + 拖拽预览框组件**的方案。

### 决策依据
1. **项目已有架构支持**：
   - Win98 主题（`src/theme/win98/index.ts` 第 104-114 行）已预留 `interactionMode: 'static'` 配置
   - Window 组件（`src/components/Window.tsx` 第 331-334 行）已支持 `mode === 'follow'` 分支

2. **React 拖拽预览框最佳实践**：
   - 使用独立的预览元素（虚线框）替代实时移动窗口
   - 预览框使用 `border-style: dashed` 或 `outline: 2px dashed` 实现
   - 拖拽结束时才更新窗口实际位置

3. **性能优化**：
   - 预览框使用 `position: fixed` 或 `absolute`，避免频繁 DOM 操作
   - 使用 `requestAnimationFrame` 优化拖拽过程中的位置更新

### 推荐方案
1. **扩展 Window 组件支持 static 模式**：
   ```tsx
   if (mode === 'follow') {
     setPos(newPos)  // 实时移动
   } else if (mode === 'static') {
     setPreviewPos(newPos)  // 仅更新预览框位置
   }
   ```

2. **实现预览框组件**：
   ```tsx
   {mode === 'static' && isDragging && (
     <div
       className='cm-window-preview'
       style={{
         position: 'fixed',
         left: previewPos.x,
         top: previewPos.y,
         width: windowSize.width,
         height: windowSize.height,
         border: '2px dashed var(--cm-color-border-strong)',
         pointerEvents: 'none'
       }}
     />
   )}
   ```

3. **拖拽结束时更新位置**：
   ```tsx
   handlePointerUp={() => {
     if (mode === 'static' && previewPos) {
       setPos(previewPos)  // 应用预览框位置到窗口
       setPreviewPos(null)
     }
     setIsDragging(false)
   }}
   ```

### 替代方案考虑
- **实时移动 + 视觉反馈**：保持实时移动，但添加拖拽时的半透明效果
- **SVG 预览框**：使用 SVG 元素绘制预览框，性能更好但实现复杂度高

---

## 4. 主题系统优化

### 决策
采用**将 CSS 变量提升到 `:root`**的方案（推荐）。

### 决策依据
1. **当前问题根源**：
   - ThemeContext（`src/theme/ThemeContext.tsx` 第 31-40 行）将 CSS 变量通过 `el.style.setProperty(name, value)` 设置到 `cm-theme-root` div 上（内联样式）
   - Popover 和 Modal 使用 `createPortal(..., document.body)` 将浮层挂载到 body 根节点
   - 浮层组件脱离了 `cm-theme-root` 子树，无法继承 CSS 变量
   - 主题样式选择器 `.cm-theme-root[data-cm-theme='{theme}']` 无法匹配到浮层元素

2. **影响范围**：
   - Popover - 挂载到 body，受影响
   - Modal - 挂载到 body，受影响
   - DropDownMenu - 依赖 Popover，间接受影响

3. **CSS 变量继承机制**：
   - CSS 变量在 DOM 树中向下继承
   - `:root` 上的 CSS 变量可被所有元素访问
   - React Portal 虽然改变 DOM 物理位置，但 JS 层面仍是父组件的子节点

### 推荐方案
1. **修改 ThemeContext，将 CSS 变量设置到 `document.documentElement`**：
   ```tsx
   // src/theme/ThemeContext.tsx
   const rootRef = useRef<HTMLDivElement>(null)

   useLayoutEffect(() => {
     const el = document.documentElement  // 改为 documentElement
     const vars = themeToCSSVars(theme)

     Object.entries(vars).forEach(([name, value]) => {
       el.style.setProperty(name, value)
     })

     el.dataset.cmTheme = theme.id
   }, [theme])
   ```

2. **完善基础样式，使用 CSS 变量**：
   - 修改 `src/components/Popover.scss`，将硬编码的 `white` 替换为 `var(--cm-color-surface, white)`
   - 为所有基础样式添加 CSS 变量使用

3. **补全主题样式定义**：
   - 为所有主题添加完整的浮层组件样式定义（如 `winxp/popover.scss`）

4. **如需支持嵌套主题，使用 `:where()`**：
   ```scss
   :where(.cm-theme-root[data-cm-theme='winxp']) .cm-popover {
     // 降低特异性，支持嵌套主题
   }
   ```

### 替代方案考虑
- **为浮层元素注入 CSS 变量**：在挂载时从 `cm-theme-root` 复制 CSS 变量，代码重复
- **修改主题样式选择器**：移除 `.cm-theme-root` 前缀，使用 `[data-cm-theme='{theme}']`，可能影响其他组件

---

## 5. 右键菜单实现

### 决策
采用**继承 DropMenu + onContextMenu 事件 + Popover 定位**的方案。

### 决策依据
1. **React 右键菜单标准实现模式**（参考 Radix UI）：
   - 使用 `onContextMenu` 事件触发菜单
   - 通过 `e.preventDefault()` 阻止浏览器默认右键菜单
   - 使用 Popover 组件处理定位和外部点击关闭
   - 支持键盘导航和焦点管理

2. **项目现有基础**：
   - DropDownMenu 组件已实现下拉菜单逻辑
   - Popover 组件提供弹出层和外部点击处理
   - 可以继承 DropMenu 的结构和样式

3. **功能需求**：
   - spec.md FR-006 要求：提供通用右键菜单能力
   - FR-007 要求：菜单中至少包含"关闭"菜单项

### 推荐方案
1. **创建 ContextMenu 组件**：
   ```tsx
   interface ContextMenuProps {
     triggerRef: React.RefObject<HTMLElement>
     items: MenuItem[]
     children?: React.ReactNode
   }

   export const ContextMenu: React.FC<ContextMenuProps> = ({
     triggerRef,
     items,
     children
   }) => {
     const [isOpen, setIsOpen] = useState(false)
     const [position, setPosition] = useState<{x: number, y: number}>({x: 0, y: 0})

     const handleContextMenu = (e: React.MouseEvent) => {
       e.preventDefault()  // 阻止浏览器默认右键菜单
       e.stopPropagation()

       // 计算菜单位置，避免超出视口边界
       const x = Math.min(e.clientX, window.innerWidth - 200)
       const y = Math.min(e.clientY, window.innerHeight - items.length * 32)
       setPosition({x, y})
       setIsOpen(true)
     }

     return (
       <>
         <div
           ref={triggerRef}
           onContextMenu={handleContextMenu}
         >
           {children}
         </div>

         {isOpen && (
           createPortal(
             <div className='cm-context-menu'>
               <Popover
                 open={isOpen}
                 onClose={() => setIsOpen(false)}
                 position={{top: position.y, left: position.x}}
               >
                 <DropDownMenu items={items} />
               </Popover>
             </div>,
             document.body
           )
         )}
       </>
     )
   }
   ```

2. **菜单项类型定义**：
   ```tsx
   export type MenuItem = {
     id: string
     label: string
     icon?: React.ReactNode
     onClick?: () => void
     disabled?: boolean
   }
   ```

3. **CSS 样式**（`src/styles/context-menu.scss`）：
   ```scss
   .cm-context-menu {
     z-index: var(--cm-z-index-menu, 1000);
     position: fixed;
     // 其他样式...
   }
   ```

4. **在 Window 组件中使用**：
   ```tsx
   <Window onActive={onActive} isActive={isActive}>
     <ContextMenu triggerRef={titleBarRef} items={[
       {id: 'close', label: '关闭', onClick: onClose}
     ]}>
       <WindowTitleBar>标题栏</WindowTitleBar>
     </ContextMenu>
   </Window>
   ```

### 替代方案考虑
- **使用第三方库**：如 `react-context-menu`，但增加依赖
- **纯 CSS 实现**：使用 `:hover` 伪类，但交互性受限

---

## 6. 多级菜单收起行为

### 决策
采用**在 WindowMenu 中添加全局点击监听 + 检测点击是否在菜单树外部**的方案。

### 决策依据
1. **当前问题分析**：
   - Popover 组件（`src/components/Popover.tsx` 第 72-96 行）独立检测外部点击
   - DropDownMenu 组件（`src/components/DropDownMenu.tsx` 第 254-260 行）只在点击外部时更新当前层级的 `openPath`
   - 场景：三级菜单 File → Edit → Undo，`openPath = ['file', 'edit']`
   - 问题：点击 Undo 外部时，只关闭 Undo 级别，File 和 Edit 仍保持打开

2. **需要的行为**：
   - spec.md FR-008 要求：点击菜单以外区域时关闭所有菜单层级
   - 用户预期：一次点击完全关闭多级菜单

3. **现有基础**：
   - WindowMenu 提供了 `MenuContext` 和 `closeAll()` 方法
   - `openPath: string[]` 跟踪打开的菜单层级

### 推荐方案
1. **在 WindowMenu 中添加全局点击监听**：
   ```tsx
   // src/components/WindowMenu.tsx
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
     return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [openPath, closeAll])
   ```

2. **保持 Popover 的外部点击监听**：
   - Popover 组件可以保留现有的外部点击监听，用于单个菜单的关闭
   - WindowMenu 的全局监听作为补充，确保所有层级关闭

3. **避免事件冲突**：
   - 菜单内部点击时，`el.contains(e.target)` 返回 `true`，不会触发 `closeAll()`
   - 菜单项点击事件（`onClick`）会触发，但事件传播被阻止

### 替代方案考虑
- **统一管理所有菜单引用**：创建全局菜单注册表，但增加复杂度
- **使用 Context API 跨组件通信**：通过 MenuContext 传递点击事件，但需要修改多个组件

---

## 总结

| 研究项 | 决策方案 | 关键点 |
|---------|-----------|---------|
| Window 全区域激活 | 根元素 onClick + 主题配置 | 灵活性高，向后兼容 |
| 光标状态管理 | 添加独立缩放状态 + 移除强制光标覆盖 | 区分拖拽和缩放，避免闪烁 |
| Win98 虚线预览框 | 项目已有 static 模式 + 预览框组件 | 利用现有架构，性能优化 |
| 主题系统优化 | 将 CSS 变量提升到 `:root` | 解决浮层组件主题继承问题 |
| 右键菜单实现 | 继承 DropMenu + onContextMenu + Popover | 复用现有组件，减少代码 |
| 多级菜单收起 | WindowMenu 全局点击监听 + 菜单树检测 | 确保一次点击关闭所有层级 |

---

## 下一步

1. 根据 research.md 中的推荐方案实施代码变更
2. 为每个变更添加测试用例
3. 运行 `yarn lint`、`yarn test`、`yarn build` 验证
4. 更新 CHANGELOG.md 的 `[UnReleased]` 部分
