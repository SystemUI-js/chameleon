## Why

在 interactionMode 为 static 时，拖动窗口显示的虚线外框尺寸与实际窗口尺寸不一致，导致用户在拖拽时预期的窗口大小与最终结果出现偏差。需要修复该行为以保持拖拽视觉反馈与真实尺寸一致。

## What Changes

- 修正 static 模式下拖动/缩放时的虚线外框尺寸计算，使其与窗口最终尺寸一致。
- 统一交互模式差异对拖拽视觉反馈的影响，避免 static 与 follow 模式产生不一致的外框表现。

## Capabilities

### New Capabilities
- `static-interaction-outline-sizing`: 规范 static 模式下拖拽/缩放外框的尺寸与窗口最终尺寸一致的行为。

### Modified Capabilities
- 

## Impact

- 受影响组件：`src/components/Window.tsx` 与 `src/components/Window.scss`
- 可能涉及拖拽库交互逻辑（`@system-ui-js/multi-drag`）的尺寸同步方式
- 相关测试：`tests/Window.test.tsx` 中的 static 模式拖拽/缩放行为
