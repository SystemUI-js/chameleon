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

```text
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

- 作为库发布后，以 `@system-ui-js/chameleon` 安装并按入口职责导入。

```bash
yarn add @system-ui-js/chameleon
```

## React Native 优先入口

React Native 多拖拽能力通过显式入口提供：

```tsx
import {
  createReactNativeMultiDrag,
  useReactNativeMultiDrag,
} from '@system-ui-js/chameleon/react-native-multi-drag';

const drag = createReactNativeMultiDrag({
  initialTargets: [{ targetId: 'card-1', layout: { x: 0, y: 0, width: 120, height: 48 } }],
});

drag.adapter.beginGesture({
  pointerId: 1,
  point: { x: 12, y: 20 },
  timestamp: Date.now(),
  targetId: 'card-1',
});
```

- 公开契约只暴露会话、位移、布局测量、元数据与结束结果
- 不依赖 `HTMLElement`、`DOMRect`、`PointerEvent`、`document`、`window`
- 适合由 React Native responder / gesture handler / 自定义手势层做输入适配

## 根入口与 legacy web 过渡面

根入口现在面向：

- 纯主题定义：`defaultThemeDefinition`、`win98ThemeDefinition`、`winXpThemeDefinition`
- legacy web 过渡导出：`legacyWeb`

```tsx
import { legacyWeb } from '@system-ui-js/chameleon';
// 或显式使用子路径：@system-ui-js/chameleon/legacy-web

const { CButton, CSelect, Theme } = legacyWeb;
```

> 兼容性说明：根入口不再直接导出 `CButton`、`Theme`、`CWindow` 等 web-only 组件。浏览器组件请通过 `@system-ui-js/chameleon/legacy-web` 或 `legacyWeb.*` 使用；新的 React Native 能力请始终通过 `@system-ui-js/chameleon/react-native-multi-drag` 导入。

## Theming

Chameleon 通过 `Theme` 组件和组件的 `theme` prop 提供主题化能力。

> `Theme` 组件属于 legacy web 能力；纯主题 definition 仍可从根入口直接导入。

### Theme 组件

从 legacy web 入口导入 `Theme`，使用 `name` 属性指定主题（接受完整 className）：

```tsx
import { legacyWeb } from '@system-ui-js/chameleon';

const { CButton, Theme } = legacyWeb;

<Theme name="cm-theme--win98">
  <CButton>Themed Button</CButton>
</Theme>;
```

`Theme` 组件会提供主题 Context，并渲染一个带对应 className 的 wrapper DOM。

`Theme` 不支持嵌套。若只需为单个组件覆盖主题，使用该组件的 `theme` prop。

### 组件 theme prop

组件支持 `theme?: string` prop，接受完整 className：

```tsx
import { legacyWeb } from '@system-ui-js/chameleon';

const { CButton } = legacyWeb;

<CButton theme="cm-theme--win98">Win98 Button</CButton>;
```

### 主题定义

库默认导出三套兼容旧系统 API 的主题定义：

- `defaultThemeDefinition` → `systemType: 'default'`, `className: 'cm-theme--default'`
- `win98ThemeDefinition` → `systemType: 'windows'`, `className: 'cm-theme--win98'`
- `winXpThemeDefinition` → `systemType: 'windows'`, `className: 'cm-theme--winxp'`

如果你需要不带 `systemType` 的纯主题定义，也可以使用：

- `pureDefaultThemeDefinition`
- `pureWin98ThemeDefinition`
- `pureWinXpThemeDefinition`

## Breaking change / migration

- React Native 拖拽能力改为显式入口：`@system-ui-js/chameleon/react-native-multi-drag`
- 根入口不再被视为默认 web 组件库入口，也不再直接导出 web-only 组件名；这些能力属于 legacy 过渡范围
- 推荐将面向浏览器的导入逐步迁移到 `@system-ui-js/chameleon/legacy-web` 或 `legacyWeb.*`
- 旧的 `@system-ui-js/multi-drag` 依赖已移除，仓库内部 web 拖拽适配改为基于 `@system-ui-js/multi-drag-core`

## Window Component

`CWindow` 是一个可拖拽、可缩放的独立窗口组件，不依赖任何系统管理器。

> `CWindow` / `CWindowTitle` 属于 legacy web 过渡能力。

`CWindow` 不会隐式注入标题栏，使用时需要显式组合 `CWindowTitle`。

```tsx
import { CWindow, CWindowTitle } from '@system-ui-js/chameleon/legacy-web';

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
