Chameleon

一个使用 TypeScript + Vite + React 构建的 React 组件库，集成 ESLint、Prettier 与 Jest。

**Chameleon 是一个纯组件库，提供可主题化的 UI 组件。** 主题以 CSS 变量形式应用，不依赖系统导向 API。

快速开始

- 安装依赖：yarn
- 本地开发：yarn dev（打开浏览器访问提示地址）
- 代码检查与格式化：yarn lint / yarn lint:fix / yarn format
- 运行测试：yarn test
- 构建组件库：yarn build（产物输出到 dist/）

目录结构

```
./
├── src/
│   ├── components/    # 组件源码
│   ├── types/         # 类型声明
│   ├── theme/          # 主题定义与 CSS 变量
│   ├── dev/            # Vite 开发预览入口
│   └── index.ts        # 库导出入口
├── tests/             # 测试文件
├── dist/               # 构建产物 (自动生成)
└── .github/workflows/  # CI/CD
```

发布与使用

- 作为库发布后，以 `@system-ui-js/chameleon` 安装并在代码中导入组件使用。

```bash
yarn add @system-ui-js/chameleon
```

```tsx
import { CButton, CRadio, CRadioGroup, CSelect } from '@system-ui-js/chameleon';

const sizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
] as const;

export function Demo() {
  return (
    <>
      <CButton>Default</CButton>
      <CButton variant="primary">Primary</CButton>

      <CRadioGroup name="fruit" defaultValue="apple">
        <CRadio value="apple">Apple</CRadio>
        <CRadio value="orange">Orange</CRadio>
      </CRadioGroup>

      <CSelect options={sizeOptions} placeholder="Select a size" />
    </>
  );
}
```

## Theming

Chameleon 通过 `Theme` 组件和组件的 `theme` prop 提供主题化能力。

### Theme 组件

从包入口导入 `Theme`，使用 `name` 属性指定主题（接受完整 className）：

```tsx
import { Theme } from '@system-ui-js/chameleon';

<Theme name="cm-theme--win98">
  <CButton>Themed Button</CButton>
</Theme>
```

`Theme` 组件会提供主题 Context，并渲染一个带对应 className 的 wrapper DOM。

`Theme` 不支持嵌套。若只需为单个组件覆盖主题，使用该组件的 `theme` prop。

### 组件 theme prop

组件支持 `theme?: string` prop，接受完整 className：

```tsx
import { CButton } from '@system-ui-js/chameleon';

<CButton theme="cm-theme--win98">Win98 Button</CButton>
```

### 主题定义

库默认导出三套主题定义：

- `defaultThemeDefinition` → `className: 'cm-theme--default'`
- `win98ThemeDefinition` → `className: 'cm-theme--win98'`
- `winXpThemeDefinition` → `className: 'cm-theme--winxp'`

## Window Component

`CWindow` 是一个可拖拽、可缩放的独立窗口组件，不依赖任何系统管理器。

`CWindow` 不会隐式注入标题栏，使用时需要显式组合 `CWindowTitle`。

```tsx
import { CWindow, CWindowTitle } from '@system-ui-js/chameleon';

<CWindow x={24} y={24} width={320} height={220}>
  <CWindowTitle>My Window</CWindowTitle>
  <div>Window body</div>
</CWindow>;
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
