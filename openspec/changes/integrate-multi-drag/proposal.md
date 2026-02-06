## Why

当前 Window/Modal/Splitter 的拖拽与缩放行为分别由指针事件与 mouse 事件实现，逻辑分散且复用性弱。引入 @system-ui-js/multi-drag 统一拖拽基础能力，降低维护成本并提升多指/多输入设备兼容性。

## What Changes

- 使用 @system-ui-js/multi-drag 替换 Window 的拖拽与 resize 事件驱动实现，保持交互与 API 行为不变。
- 使用 multi-drag 的 setPoseOnEnd 优化现有 interactionMode（static/follow）效果，确保表现一致。
- 使用 @system-ui-js/multi-drag 替换 Splitter 的 mousemove 监听实现。
- Modal 继续继承 Window 行为并通过新实现保持一致。
- 新增依赖 @system-ui-js/multi-drag。

## Capabilities

### New Capabilities
- `multi-drag-integration`: 使用 @system-ui-js/multi-drag 统一 Window/Modal/Splitter 拖拽与 resize 行为，并保持现有交互语义不变。

### Modified Capabilities
- (none)

## Impact

- 组件：`src/components/Window.tsx`, `src/components/Modal.tsx`, `src/components/Splitter.tsx`
- 样式：`src/components/Window.scss`
- 测试：`tests/Window.test.tsx`, `tests/Modal.test.tsx`
- 依赖：`package.json` 增加 `@system-ui-js/multi-drag`
