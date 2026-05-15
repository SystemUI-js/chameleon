- 2026-03-28: `CWidget` 现在用 `WidgetFrameState` 统一持有 `x/y/width/height`，`renderFrame()` 默认从基类 state 取定位尺寸，子类无需重复维护交互 frame state。
- 2026-03-28: 标题拖动与 resize 都可复用 `CWidget` 的 `getDragPose()` 与 `handleFrameMove()`，`CWindowTitle` 注入链路无需再依赖 `CWindow` 自有 frame state。

- 2026-03-28: CWidget 现统一持有 8 方向 resize 的 option 归一化、几何热区、Drag 生命周期与尺寸夹取逻辑，子类只需覆写 handle 的测试契约（如 window-resize-${dir}）。

- 2026-03-28: 标题栏拖动组合继续由 `CWindowTitle` 暴露 `onWindowMove/getWindowPose` 公共 props，但注入来源应固定收敛到 `CWidget.getFrameMoveHandleProps()`；`CWindow` 只负责声明哪些子元素（含子类）是 move handle。
- 2026-03-28: 标题拖动的卸载安全可用"pointerdown 后立即 unmount，再派发 document pointermove/pointerup"做回归，确认 Drag teardown 后不会抛错或残留 frame 更新。
- 2026-03-28: Task 4 验证完成 - CWindowManager 的 `isManagedConstructor(candidate, CWidget)` 原型链检查对 `CWindow` 及其子类仍然有效，因为 `CWindow extends CWidget` 保持了正确的原型继承链。WindowManager 测试全部通过（8/8）。
- 2026-03-28: `data-window-uuid` 保留在 `window-content` div 上（Window.tsx:56），未因 CWidget 迁移而改变。
- 2026-03-28: DefaultTheme 测试通过（1/1）- frame 有 `cm-window-frame`，content 有 `cm-window`，title 有 `cm-window__title-bar--with-controls`，拖动功能正常。Theme 类名层级未受 CWidget 迁移影响。
- 2026-03-28: Task 5 验证完成 - 所有 15 个 Playwright window specs 通过（window.smoke × 2, window.move × 2, window.resize × 8, window.resize-guards × 3），Selectors（window-frame, window-content, window-title, window-resize-*）保持稳定，未因 CWidget 迁移而改变。
- 2026-03-28: F1 合规审计结论：Task 1-5 的窗口拖拽/缩放交付与证据链完整匹配计划；`CWidget` 为 frame state 与 resize lifecycle 唯一所有者，`CWindow` 仅保留窗口组合与契约覆写。
- 2026-03-28: 全量质量门中 `yarn test --runInBand` 通过，但 `yarn playwright test` 存在 2 个 Win98 common-controls 失败（边框色、focus outline offset），与 window-resize-drag-cwidget 交付无直接耦合，需单独跟进。
- 2026-03-28: F4 Scope Fidelity 审计通过：Window/Widget 路径未引入 hooks/context，`src/index.ts` 无新增导出，`window-frame/window-content/window-title/window-resize-*` 与 `data-window-uuid` 保持稳定，`@system-ui-js/multi-drag` 依赖与导入均未替换。
- 2026-03-28: F2 代码质量复核确认 `CWindow` 仅消费 `CWidget.getFrameState()` 渲染 frame，不再声明或镜像 `x/y/width/height`；frame ownership 继续单点收敛在 `CWidget`。
- 2026-03-28: F2 复核确认卸载清理完整：`CWidget.cleanupResizeDrags()` 会同时停用 Drag、移除 pointerdown 监听并清空缓存，`CWindowTitle.componentWillUnmount()` 会 `setDisabled()` 且借助 `isDragActive` 阻断卸载后的 pose 回写。
- 2026-03-28: F2 质量门禁结果：lint、定向 Jest、定向 Playwright、build 均以成功结束；Playwright 首轮曾出现瞬时 `ERR_CONNECTION_REFUSED`，二次执行后 15/15 全绿。build 仍打印既有 `src/components/Screen/Grid.tsx:31 TS2533` 诊断，但命令退出码为 0。

- 2026-03-28: F3 Real Manual QA 验证完成 - preview server 启动于 port 5673，13 个 Playwright window tests 全部通过（window.move × 2, window.resize × 8, window.resize-guards × 3）。
  - Default drag: title 拖动 (20,40) → 验证 frame 移动到 (30, 60, 240, 160) ✓
  - Default resize-se: SE resize (20,10) → 验证 metrics 变为 (10, 20, 260, 170) ✓
  - Drag-only fixture: 验证 resizable=false 时无 resize handles ✓
  - Min-clamp fixture: 验证 east/south shrink clamp 到 (30, 30, 1, 1) ✓
  - Max-clamp fixture: 验证 east grow + NW anchor clamp 到 (50, 50, 150, 110) ✓
  - Screenshot 证据: f3-manual-qa-default.png, f3-manual-qa-guards-*.png (4 个 fixtures)
