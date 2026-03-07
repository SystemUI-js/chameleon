## Context

当前窗口交互由两部分组成：`CWindow` 负责绝对定位与尺寸渲染，`CWindowTitle` 使用 `@system-ui-js/multi-drag` 的 `Drag` 驱动窗口移动。现有能力缺少边框拖动缩放，且外部 API 无法配置缩放热区宽度与尺寸边界。该变更要求在不引入样式方案的前提下补齐行为能力，并保持与现有标题栏拖动能力兼容。

## Goals / Non-Goals

**Goals:**
- 为 `CWindow` 增加 8 向边框缩放（N/S/E/W/NE/NW/SE/SW）。
- 缩放实现统一基于 `Drag`，不引入 `Scale`。
- 新增 `resizable`（默认 `true`）与 `resizeOptions`（含 `edgeWidth` 默认 `4px`）。
- 支持最小/最大内容尺寸限制；默认最小内容尺寸 `1px`。
- 与标题栏拖动移动能力共存，不互相抢占手势职责。

**Non-Goals:**
- 不交付视觉样式（如光标、可视边框、主题美化）。
- 不引入窗口管理器层级（z-index/focus）新行为。
- 不修改 `@system-ui-js/multi-drag` 依赖本身。

## Decisions

1. **缩放手势绑定在 `CWindow` 内部 8 个逻辑热区元素上**
   - **Rationale:** 现有 `CWindowTitle` 已证明 `Drag` + `getPose/setPose` 在本项目可行；将缩放封装在 `CWindow` 内可避免向主题层泄漏复杂手势细节。
   - **Alternative considered:** 将缩放放到独立 `CWindowResizeHandle` 组件。该方案可复用但会增加组合复杂度，本次优先最小改动。

2. **窗口尺寸状态由 `CWindow` 统一管理为位置+尺寸四元组**
   - **Rationale:** 左/上方向缩放会同时改变坐标与尺寸，必须在同一状态源中原子更新，避免视觉抖动。
   - **Alternative considered:** 尺寸仅依赖 DOM `getBoundingClientRect`。该方案难以可靠处理 clamp 后锚点稳定问题。

3. **`resizeOptions` 采用可选配置 + 安全默认值**
   - `edgeWidth`: 默认 `4`
   - `minContentWidth/minContentHeight`: 默认 `1`
   - `maxContentWidth/maxContentHeight`: 默认不限制
   - **Rationale:** 与现有 props 可选/兜底风格一致，保持向后兼容。

4. **方向计算采用“锚点保持”规则**
   - 对 `W/N/NW/NE/SW` 等改变左/上边的方向，先按 delta 计算原始尺寸，再 clamp，最后根据固定边反推新坐标。
   - **Rationale:** 避免触达 min/max 时窗口边界跳变。
   - **Alternative considered:** clamp 前直接改坐标。会导致达到边界时右/下边漂移。

5. **标题拖动与边框缩放职责分离**
   - 标题区域仅负责移动；8 个边框热区仅负责缩放。
   - **Rationale:** 保持交互可预测，减少 pointer 竞争。

## Risks / Trade-offs

- **[Risk] 指针事件竞争导致移动/缩放串扰** → **Mitigation**: 明确热区层级与事件绑定归属，测试覆盖“拖标题不缩放、拖边框不移动”。
- **[Risk] 极限尺寸下出现负值或闪烁** → **Mitigation**: 对宽高统一 clamp（含默认最小 1px），并使用锚点保持公式。
- **[Risk] 多主题示例行为不一致** → **Mitigation**: 在 `CWindow` 层实现通用逻辑，主题只负责内容组合。
- **[Trade-off] 无样式阶段调试可见性较弱** → **Mitigation**: 使用 data-testid 与交互测试覆盖热区行为，后续样式阶段再增强可视化。

## Migration Plan

1. 扩展 `CWindow` 对外 props（带默认值）并保持旧用法零改动可运行。
2. 在内部增加 8 向热区与 Drag 绑定逻辑，完成位置/尺寸状态统一更新。
3. 增加/更新测试：方向缩放、边界 clamp、与标题拖动互不干扰。
4. 更新文档示例，说明 `resizable` 与 `resizeOptions`。
5. 若回滚，移除新增 props 与热区逻辑即可恢复为仅标题拖动版本。

## Open Questions

- 当前版本是否需要暴露“最小/最大值非法输入（<=0）”的显式报错，还是静默归一化到安全值。
- 后续样式阶段是否要将 8 个热区映射为明确 cursor（`n-resize` 等）并统一到主题 token。
