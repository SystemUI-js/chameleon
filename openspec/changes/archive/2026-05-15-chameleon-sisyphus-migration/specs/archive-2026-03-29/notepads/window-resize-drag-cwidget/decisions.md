- 2026-03-28: 保留 `renderFrame()` 作为唯一 positioned frame 渲染入口，只把状态所有权与受控同步上移到 `CWidget`，避免改动 `window-frame` / `widget-frame` DOM 契约。

- 2026-03-28: 通过 getResizeHandleTestId() 把 resize DOM/test contract 留给子类覆写，基类保持通用 resize 语义，同时保留 CWindow 既有浏览器与单测可观察行为。

- 2026-03-28: `CWidget` 新增从 move position 到 frame patch 的组合钩子（`getFrameMovePatch()` / `applyFrameMovePosition()`），保持标题拖动只更新 `x/y`，不与 resize 的 `width/height` 写入路径耦合。
