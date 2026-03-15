## Why

当前 `CWindow` 仅支持通过 `CWindowTitle` 拖动移动位置，不支持通过窗口边框直接调整大小。这导致窗口交互能力与桌面窗口预期不一致，也限制了后续主题层做统一视觉样式时的可用行为基础。

## What Changes

- 为 `CWindow` 增加边框拖动缩放能力，覆盖 8 个方向区域（N/S/E/W/NE/NW/SE/SW）。
- 缩放手势统一使用 `@system-ui-js/multi-drag` 的 `Drag`（不使用 `Scale`）。
- 新增可配置的边框拖动区域宽度，默认 `4px`，可选覆盖。
- 扩展 `CWindow` Props：
  - `resizable?: boolean`（默认 `true`）
  - `resizeOptions?: ...`（包含拖动区域宽度等缩放选项）
- 补充最小/最大内容尺寸限制能力，默认最小内容尺寸为 `1px`；最大尺寸按可选配置生效。
- 本次不包含视觉样式交付，仅定义行为与接口契约。

## Capabilities

### New Capabilities
- `window-border-resize`: 为窗口提供基于边框拖动的 8 向缩放行为、可配置拖动区域宽度，以及最小/最大内容尺寸约束。

### Modified Capabilities
- `window-title-composition-drag`: 在保持标题栏拖动移动能力不变的前提下，补充窗口缩放与移动共存时的行为边界（避免手势职责冲突）。

## Impact

- Affected code: `src/components/Window/Window.tsx`、`src/components/Window/WindowTitle.tsx`、主题示例入口（`src/theme/*/index.tsx`）以及窗口相关测试文件。
- API impact: `CWindow` 对外新增 `resizable` 与 `resizeOptions`，默认行为向后兼容（不传也可用）。
- Dependency impact: 继续复用现有依赖 `@system-ui-js/multi-drag`，新增 Drag 实例用于边框缩放。
- Testing impact: 需要新增/调整指针拖动测试，覆盖 8 向缩放与最小/最大尺寸边界。
