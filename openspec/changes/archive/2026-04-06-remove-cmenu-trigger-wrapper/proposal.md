## Why

`CMenu` 目前会在触发元素外额外渲染一层 `.cm-menu__trigger` 包裹节点，即使 click / hover 触发语义实际已经通过 `cloneElement` 直接注入到 `children`。这让生成的 DOM 结构比组件语义更重，也可能给依赖精简 DOM 或自定义布局的使用方带来额外约束，因此需要明确支持“由 children 直接充当根触发器”的能力。

## What Changes

- 移除 `CMenu` 根触发器外层的 `.cm-menu__trigger` 包裹节点，让传入的 `children` 直接作为 `.cm-menu` 的子节点渲染。
- 保持现有根菜单触发方式不变：根级 `click` / `hover` 打开逻辑仍由 `CMenu` 注入到 `children` 上。
- 保持现有无障碍语义不变：`aria-haspopup`、`aria-expanded`、`aria-controls` 继续由组件注入到触发元素。
- **BREAKING**：不再保证存在 `.cm-menu__trigger` 这个中间 DOM 节点；依赖该 class 或 DOM 层级进行样式覆盖、选择器定位的使用方需要调整。

## Capabilities

### New Capabilities
- `cmenu-direct-child-trigger`: 定义 `CMenu` 根触发器以传入的 `children` 元素直接承载触发交互与 ARIA 语义，而不引入额外 wrapper DOM。

### Modified Capabilities
- None.

## Impact

- 受影响代码：`src/components/Menu/Menu.tsx`、`src/components/Menu/index.scss`，以及相关测试与开发示例。
- 受影响 API / DOM 契约：`CMenu` 的公开 props 预期保持不变，但渲染出的 DOM 结构会减少一层 wrapper。
- 兼容性影响：外部若使用 `.cm-menu__trigger` 做样式覆盖、自动化选择器或 DOM 遍历，需要迁移到新的结构。
