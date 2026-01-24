# Component API Contract: Window

**Component**: `Window`
**Package**: `@sysui/chameleon`
**Version**: 0.1.0

## 概述

Window 组件提供可拖拽、可缩放的窗口容器，支持主题化的外观和交互模式。此 API Contract 描述了 004-window-behavior 功能的 API 变更。

---

## Props（属性）

| Prop | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `isActive` | `boolean` | `false` | 窗口是否处于激活状态（由父组件管理） |
| `onActive` | `() => void` | `undefined` | 窗口激活时触发的回调 |
| `interactionMode` | `'follow' \| 'static'` | `'follow'` | 交互模式：`'follow'` 实时移动，`'static'` 虚线预览框 |
| `className` | `string` | `undefined` | 附加的 CSS 类名 |
| `style` | `React.CSSProperties` | `undefined` | 附加的内联样式 |
| `children` | `React.ReactNode` | `undefined` | 窗口内容 |
| `onClose` | `() => void` | `undefined` | 关闭窗口时的回调（如关闭按钮） |
| `title` | `string` | `undefined` | 窗口标题（可选） |

### 新增/变更的 Props

| Prop | 变更类型 | 说明 |
|------|-----------|------|
| `activateWholeArea` | 新增 | 是否支持全区域点击激活（默认 `true`） |

---

## Events（事件）

| Event | 类型 | 触发时机 | 说明 |
|--------|------|-----------|------|
| `onActive` | `() => void` | 窗口变为激活状态时 | 点击窗口任意可见位置时触发 |
| `onClose` | `() => void` | 窗口关闭时 | 点击关闭按钮或调用关闭 API 时 |

---

## Behavior（行为）

### 激活行为

| 场景 | 行为 | 配置 |
|--------|------|------|
| 点击标题栏 | 激活窗口 | 总是 |
| 点击内容区域 | 激活窗口 | 仅当 `activateWholeArea: true` |
| 点击控制按钮 | 不激活窗口 | 总是 |
| 点击调整大小手柄 | 不激活窗口 | 总是 |

### 交互模式

| 模式 | 拖拽行为 | 缩放行为 |
|------|----------|----------|
| `'follow'` | 实时移动窗口 | 实时调整窗口大小 |
| `'static'` (Win98) | 显示虚线预览框，拖拽结束才应用新位置 | 标准缩放行为 |

### 光标行为

| 交互状态 | 期望光标 | 实现方式 |
|-----------|---------|----------|
| 拖拽中 | `move` 或 `default`（根据主题） | CSS cursor 或 `document.body.style.cursor` |
| 缩放中 | `n-resize`、`s-resize` 等 | 根据缩放方向设置对应光标 |
| 悬停在边框 | 对应方向的 resize 光标 | CSS hover 伪类 |
| 无交互 | `default` | 默认光标 |

---

## Accessibility（无障碍）

| 属性 | 值 | 说明 |
|--------|-----|------|
| `role` | `dialog` | 对话框角色 |
| `aria-modal` | `false` | 非模态对话框 |
| `aria-label` | `{title}` | 窗口标题（如果提供） |

---

## Examples（示例）

### 基本用法

```tsx
import { Window, ThemeProvider, useTheme } from '@sysui/chameleon'

function App() {
  const { theme, setTheme } = useTheme()

  return (
    <ThemeProvider theme={theme}>
      <Window
        isActive={isActive}
        onActive={() => setIsActive(true)}
        onClose={() => setIsActive(false)}
        title="示例窗口"
      >
        <div>窗口内容</div>
      </Window>
    </ThemeProvider>
  )
}
```

### Win98 主题 + 静态拖拽模式

```tsx
import { Window, win98 } from '@sysui/chameleon'

function Win98Window() {
  return (
    <ThemeProvider theme={win98}>
      <Window
        interactionMode="static"  // 启用虚线预览框
        title="Win98 风格窗口"
      >
        <div>拖拽时显示虚线预览框</div>
      </Window>
    </ThemeProvider>
  )
}
```

### 全区域点击激活

```tsx
// 默认启用，无需额外配置
<Window
  isActive={isActive}
  onActive={() => setIsActive(true)}
  activateWholeArea={true}  // 或通过主题配置
>
  <div>点击任意位置激活</div>
</Window>
```

---

## Implementation Notes（实现注意事项）

1. **全区域激活**：
   - 在根元素添加 `onClick` 处理器
   - 排除 `.cm-window__controls` 区域的点击
   - 使用主题配置 `activateWholeArea` 控制是否启用

2. **光标管理**：
   - 添加独立的 `interactionState` 状态，包含 `type` 和 `direction`
   - 移除 `cursor: move !important` 的强制覆盖
   - 使用 CSS 类或 `document.body.style.cursor` 控制光标

3. **Win98 静态模式**：
   - 添加 `previewPos` 状态跟踪预览框位置
   - 拖拽时渲染独立的预览框元素
   - 拖拽结束时将预览框位置应用到窗口

4. **主题继承**：
   - CSS 变量设置到 `document.documentElement.style`
   - 确保浮层组件能访问主题变量

---

## Version History

| Version | Date | Changes |
|---------|-------|---------|
| 0.1.0 | 2026-01-23 | 初始版本，定义 Window 组件 API 变更 |
