## Context

当前 Window 的 move/resize 逻辑基于 Pointer Events + pointer capture，Splitter 基于 document mousemove。两者实现风格不一致，维护成本高，且需要支持多输入设备与一致的拖拽语义。引入 @system-ui-js/multi-drag 后，需要把拖拽事件流替换为该库的 Drag 实例，同时保持现有 API 与 interactionMode 行为不变。

## Goals / Non-Goals

**Goals:**
- Window/Modal/Splitter 使用 @system-ui-js/multi-drag 统一拖拽驱动。
- Window 的 8 方向边缘 resize 继续使用 Drag 适配，不使用 Scale。
- 通过 setPoseOnEnd 保持 interactionMode 的 static/follow 行为与现状一致。
- 保持现有 Window/Modal/Splitter 对外 Props 与测试语义不变。

**Non-Goals:**
- 不引入新的交互能力（旋转/缩放等）
- 不改变现有样式体系与主题系统
- 不重构非拖拽相关逻辑

## Decisions

- **使用 Drag + 自定义 setPose/getPose**：multi-drag 默认通过 style 操作位姿，但 Window/Modal 依赖内部 state 与受控 props。将通过 options 的 `getPose`/`setPose`/`setPoseOnEnd` 映射到现有 state 更新与回调，避免直接写 style 引起状态不一致。
- **interactionMode 映射**：
  - `follow`：使用 `setPose` 实时更新 state。
  - `static`：移动/resize 期间使用 `setPose` 仅更新预览态（previewPos 或临时 size/pos），在 End 时通过 `setPoseOnEnd` 应用最终值。
- **8 方向 resize 仍基于 Drag**：为每个 resize handle 创建 Drag 实例，使用自定义 `getPose` 获取当前 size/pos，并在 `setPose` 中按方向计算新的 size/pos。
- **实例生命周期**：在 React `useEffect` 中创建 Drag 实例，依赖变更时 destroy，防止事件泄漏。

## Risks / Trade-offs

- **Drag 默认位姿与组件状态不一致** → 统一使用自定义 `getPose`/`setPose` 避免直接改 DOM style。
- **多实例开销（8 个 resize handle）** → 只在 `resizable` 为 true 时创建；依赖变化时销毁。
- **interactionMode 行为回归** → 在 tests 中覆盖 static/follow 模式的 move/resize 结果。

## Migration Plan

- 添加依赖 @system-ui-js/multi-drag。
- 替换 Window/Modal/Splitter 的拖拽实现，保持 API 不变。
- 更新/补充现有拖拽相关测试。
- 若出现回归，可回滚到原 Pointer Events 实现（保留同一 API）。

## Open Questions

- 是否需要开启 `passive` 模式以减少主线程阻塞？（默认 false，暂不启用）
