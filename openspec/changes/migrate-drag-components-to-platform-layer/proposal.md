## Why

虽然仓库已经把新的拖拽能力抽到 `src/react-native-multi-drag/`，但现有 `WindowTitle`、`Widget`、`IconContainer`、`CSplitArea`、`CSlider` 仍直接书写 `div`/`span`、直接读取 DOM 布局、直接承接浏览器事件。这让 `src/components/` 继续固化为 web-only 实现，不利于后续把 legacy web 能力进一步收缩到平台层，也阻碍这些交互模型向 React Native 优先的目录边界迁移。

## What Changes

- 新增一层受控的 web 平台抽象，把原生 DOM 标签、元素测量与 web 宿主细节收敛到独立目录，而不是散落在组件实现里。
- 将 `WindowTitle`、`Widget`、`IconContainer`、`CSplitArea`、`CSlider` 五个拖拽相关组件改为依赖平台抽象层，而不是直接渲染原生 DOM 标签。
- 保持这五个组件的当前公共行为、样式类名、测试契约与 legacy web 能力定位不变，本次不把它们改写成 React Native 组件。
- **BREAKING**：明确这五个组件在源码层属于“legacy web UI + 平台适配”结构，不再允许在组件文件内继续扩散新的原生 DOM 宿主细节。

## Capabilities

### New Capabilities

- `drag-components-platform-layer`: 定义拖拽相关 legacy web 组件如何通过受控平台抽象层消费宿主节点、布局测量与基础渲染原语，而不是在组件实现中直接耦合原生 DOM 标签。

### Modified Capabilities

- `csplitarea-component`: 保持 `CSplitArea` 的公共布局与拖拽行为不变，但要求其分割区域与分割线宿主渲染经由平台抽象层承接。
- `cwidget-active-state`: 保持 `CWidget` 的激活态、预览态与缩放行为不变，但要求 widget frame 与 resize handles 的宿主渲染经由平台抽象层承接。

## Impact

- 影响 `src/components/Window/WindowTitle.tsx`
- 影响 `src/components/Widget/Widget.tsx`
- 影响 `src/components/Icon/IconContainer.tsx`
- 影响 `src/components/CSplitArea/CSplitArea.tsx`
- 影响 `src/components/CSlider/CSlider.tsx`
- 新增 `src/platform/web/` 下的平台抽象文件
- 影响测试：需要验证现有行为在抽象层改造后仍保持兼容
