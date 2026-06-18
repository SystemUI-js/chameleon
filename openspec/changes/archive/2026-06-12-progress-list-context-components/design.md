# 详细设计

## 架构决策

### 1. CProgress — conic-gradient 实现

Circle/ring 变体使用 CSS `conic-gradient` 而非 SVG，保持与 CSS-in-JS 无关的纯 CSS 方案。

```
conic-gradient(
  var(--cm-cprogress-status-color) calc(var(--cm-cprogress-pct) * 1%),
  var(--cm-cprogress-track-color) 0
)
```

### 2. CContextMenu — MenuTree 复用

CContextMenu 直接使用 `MenuTree` 组件渲染菜单项，不渲染 `CMenu`。这样避免了嵌套 CMenu 带来的状态管理冲突（ESC 栈、外部点击监听器重复注册）。

```
CContextMenu
  ├── cloneElement(children) — 注入 onContextMenu/onPointerDown/onKeyDown
  └── createPortal(<MenuTree items={...} />, document.body)
```

### 3. CModal — Portal 容器即根元素

Portal 容器元素就是 `.cm-modal` 根元素（无内部包装 div）。通过 `useState<HTMLDivElement | null>` + effect 创建容器，确保首次渲染后触发重渲染挂载 portal。

```
CModal
  ├── useState(container) → effect 创建 div → 触发重渲染
  ├── createPortal(<ModalTitleBar /> + <ModalBody />, container)
  └── ContainerAttrsSync (useLayoutEffect 同步 class/role/aria)
```

### 4. CConfirm — 命令式 API 设计

每次 `confirm()` 调用创建独立的容器和 React root：
- `document.createElement('div')` + `createRoot(container)`
- `ImperativeConfirmHost` 内部管理 `open` state
- 关闭时：`setOpen(false)` → CModal cleanup → `setTimeout(0)` → `root.unmount()` + `container.remove()`

### 5. CWidget 内联样式覆盖策略

`CWidget.renderFrame` 始终输出 `position: absolute; left: x; top: y; width; height` 内联样式。Modal 和 Confirm 通过 SCSS `!important` 覆盖这些内联样式：

```scss
.cm-modal .cm-window-frame,
.cm-confirm .cm-window-frame {
    position: static !important;
    left: auto !important;
    top: auto !important;
    height: auto !important;
}
```

这是唯一能覆盖 `Widget.tsx:836-844` 内联样式的方式（不允许修改 Widget 代码）。

### 6. Select 多选 — 判别联合类型

```typescript
type CSelectProps = CSelectBaseProps & (
  | { multiple?: false; value?: string; defaultValue?: string; onChange?: (value: string) => void }
  | { multiple: true; value?: string[]; defaultValue?: string[]; onChange?: (values: string[]) => void }
);
```

多选保持选项顺序（通过 `options.filter(...)` 重建数组），而非点击顺序。

### 7. Checkbox indeterminate — 受控 DOM 属性

```typescript
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  if (inputRef.current) inputRef.current.indeterminate = indeterminate ?? false;
}, [indeterminate]);
```

`indeterminate` 是纯视觉标志，不影响 `checked` 状态。`onChange` 仍返回 `boolean`。

## 关键实现模式

### 外部点击关闭（DatePicker/TimePicker/Menu）

```typescript
const rootRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (!isOpen) return;
  const handler = (e: MouseEvent) => {
    if (!(e.target instanceof Node)) return;
    if (!rootRef.current?.contains(e.target)) setOpenState(false);
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, [isOpen]);
```

使用 `mousedown` 而非 `click` 以避免 blur/focus 竞态条件。

### ESC 栈（CModal）

```typescript
// 模块级
const escStack: (() => void)[] = [];

// 每个 Modal 实例
useEffect(() => {
  if (!open) return;
  const handler = () => onCloseRef.current?.();
  escStack.push(handler);
  if (escStack.length === 1) {
    document.addEventListener('keydown', handleKeyDown);
  }
  return () => {
    const idx = escStack.indexOf(handler);
    if (idx !== -1) escStack.splice(idx, 1);
    if (escStack.length === 0) {
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
}, [open]);
```

### useLongPress 共享 hook

```typescript
// src/components/shared/useLongPress.ts
export const createLongPressController = () => {
  // pointer 生命周期管理
  // TOUCH_LONG_PRESS_DELAY_MS = 500
  // TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX = 6
  // SYNTHETIC_CONTEXT_MENU_SUPPRESSION_MS = 1000
};

export const useLongPress = (options) => {
  // 单元素 hook 版本
};
```

## 测试策略

### 单元测试（Jest + React Testing Library）

- SCSS 合约测试：通过 `readFileSync` 断言 SCSS 源文件内容（jsdom + identity-obj-proxy 无法计算布局）
- DOM 结构测试：验证类名、ARIA 属性、事件处理
- 受控/非受控状态测试
- SSR 安全测试：`delete globalThis.document` 验证 `confirm()` 返回 false

### UI 测试（Playwright）

- 几何/可见性断言：`boundingBox().height > 60px` 等
- 用户交互：点击、键盘导航、拖拽
- 主题切换验证
- 截图对比

### 关键教训

1. **jsdom 盲点**：`getComputedStyle` 在 identity-obj-proxy 下返回空值，SCSS 合约测试只能断言源文件内容
2. **CWidget 内联样式陷阱**：Modal/Confirm 必须覆盖所有 5 个内联属性（position/left/top/width/height），不能只覆盖部分
3. **默认值采样偏差**：组件目录 Demo 使用显式 `height={200}`，隐藏了默认 `height: 0` 的 bug
4. **React 18 卸载警告**：`root.unmount()` 必须在 `setTimeout(0)` 中调用
