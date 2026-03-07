Chameleon

一个使用 TypeScript + Vite + React 构建的 React 组件库脚手架，集成了 ESLint、Prettier 与 Jest。

快速开始

- 安装依赖：yarn
- 本地开发：yarn dev（打开浏览器访问提示地址）
- 代码检查与格式化：yarn lint / yarn lint:fix / yarn format
- 运行测试：yarn test
- 构建组件库：yarn build（产物输出到 dist/）

目录结构（部分）

- src/components/Button.tsx：示例组件
- src/index.ts：库入口导出
- tests/Button.test.tsx：示例单测
- index.html + src/dev/main.tsx：Vite 预览入口
- vite.config.ts / tsconfig.json / jest.config.ts / jest.setup.ts：相关配置
- .eslintrc.cjs / .prettierrc.json：代码规范
- CHANGELOG.md：版本记录

发布与使用

- 作为库发布后，以 @sysui/chameleon 安装并在代码中导入组件使用。

## How to create a theme

主题必须完整实现 `Theme` 接口，包含 `tokens` 和 `components`，并且所有字段必填。Theme 会被展平成 CSS 变量，命名规则是 `--cm-{category}-{token}`。

### 1. Define ThemeId
```ts
// src/theme/types.ts
export type ThemeId = 'win98' | 'winxp' | 'macos' | 'material'
```

### 2. Implement Theme
```ts
import { Theme } from './types'

export const winxp: Theme = {
  id: 'winxp',
  name: 'Windows XP',
  tokens: {
    color: {
      surface: '#ECE9D8',
      surfaceRaised: '#F5F3E5',
      text: '#1E1E1E',
      textMuted: '#6B6B6B',
      textInvert: '#FFFFFF',
      border: '#8B8B7A',
      borderStrong: '#4F4F4F',
      borderLight: '#FFFFFF',
      borderLightest: '#FFFFFF',
      borderDark: '#6F6F5F',
      borderDarkest: '#3F3F3A',
      focusRing: '#3D7BD9',
      selectionBg: '#316AC5',
      selectionText: '#FFFFFF'
    },
    typography: {
      fontFamily: "'Tahoma', 'Segoe UI', sans-serif",
      fontSize: '12px',
      lineHeight: '1.2',
      fontWeight: 400
    },
    spacing: {
      xs: '2px',
      sm: '4px',
      md: '8px',
      lg: '16px',
      xl: '24px'
    },
    shadow: {
      insetBevel: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #A0A0A0',
      outsetBevel: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #7A7A7A',
      popup: '2px 2px 4px rgba(0,0,0,0.3)'
    },
    radius: {
      sm: '2px',
      md: '3px',
      lg: '5px',
      round: '9999px'
    }
  },
  components: {
    button: {
      face: '#ECE9D8',
      faceHover: '#F3F0E1',
      faceActive: '#DAD6C9',
      text: '#1E1E1E',
      borderLight: '#FFFFFF',
      borderDark: '#7A7A7A',
      borderDarker: '#4F4F4F',
      focusRing: '#3D7BD9'
    },
    window: {
      frame: '#ECE9D8',
      titleBarBg: '#316AC5',
      titleBarText: '#FFFFFF',
      titleBarBgInactive: '#7A96DF',
      titleBarTextInactive: '#E6E6E6'
    }
  }
}
```

### 3. Register theme
```ts
// src/theme/ThemeContext.tsx
const base = {
  win98,
  winxp,
  macos: win98,
  material: win98
}
```

### 4. Export theme
```ts
// src/index.ts
export * from './theme/winxp'
```

### 5. Use tokens in CSS
```css
border-radius: var(--cm-radius-md);
```

## Window composition

`CWindow` 不会隐式注入标题栏，使用时需要显式组合 `CWindowTitle`。

```tsx
import { CWindow, CWindowTitle } from '@system-ui-js/chameleon'

<CWindow x={24} y={24} width={320} height={220}>
  <CWindowTitle>My Window</CWindowTitle>
  <div>Window body</div>
</CWindow>
```

拖动 `CWindowTitle` 会移动所属 `CWindow`，内容区域不会触发窗口移动。

### Border resize

`CWindow` 默认支持 8 方向边框缩放（N/S/E/W/NE/NW/SE/SW），可通过 `resizable` 与 `resizeOptions` 配置：

```tsx
<CWindow
  x={24}
  y={24}
  width={320}
  height={220}
  resizable
  resizeOptions={{
    edgeWidth: 4,
    minContentWidth: 1,
    minContentHeight: 1,
    maxContentWidth: 640,
    maxContentHeight: 480,
  }}
>
  <CWindowTitle>Resizable Window</CWindowTitle>
  <div>Window body</div>
</CWindow>
```

- `resizable`：是否启用边框缩放，默认 `true`
- `resizeOptions.edgeWidth`：边框拖动热区宽度，默认 `4`
- `resizeOptions.minContentWidth/minContentHeight`：最小内容尺寸，默认 `1`
- `resizeOptions.maxContentWidth/maxContentHeight`：可选最大内容尺寸
