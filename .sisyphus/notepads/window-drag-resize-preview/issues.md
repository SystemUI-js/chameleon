
- `@system-ui-js/multi-drag` README 与源码存在偏差：源码可确认 `setPoseOnEnd` 用于 release-only commit，但未见可靠 `destroy()` 清理 API；实现时需要以仓库内现有 `setDisabled()` / cleanup 模式和实际源码能力为准。
- `pointercancel` 在 multi-drag 中与 `End` 语义靠近，未暴露单独 cancel hook；后续 outline cleanup 需要谨慎验证 cancel/unmount 行为。
- `CWidget` 的 state 类型若直接收窄为必含 frame+preview，会让继承它的 `Dock` / `StartBar` 在 `tsc --noEmit` 下失配；后续扩展 geometry state 时要保持对子类 state 的兼容面。
- `Widget.tsx` 第 38 行存在冗余类型别名 `WidgetPreviewRect = WidgetFrameState`（sonarjs/redundant-type-aliases），第 173 行存在 `void props`（sonarjs/void-use），均为 pre-existing 问题，本任务未引入。
- `WindowTitle` 若在 outline 模式下自行持有 preview rect，会与 `Widget` 的 committed/preview 双轨状态冲突；本次实现通过 callback 回到 `Widget` 统一生成/清理 preview，避免 ownership 漂移。
- `Widget.handleResizeEnd()` 中从 `pending` 回退到 `pose.position` 二次计算时，需要显式收窄 `nextRect` 的 undefined 类型；否则 TypeScript 不会接受 `areFrameStatesEqual()` / `setState()` 的参数类型。
- Task 6 ship gate 期间，`yarn lint` 实际被 `Widget.tsx` 中两处既有 lint 问题阻塞；为完成 gate，本次顺手修复为等价类型表达与 `_props` 命名，不涉及行为变化。
- `lsp_diagnostics` 仍对 `tests/CWindowTitleComposition.test.tsx` 报告 biome import sorting information 级提示，但无 error/warning，且不影响 `yarn test -- CWindowTitleComposition.test.tsx` 与 `yarn build` 通过。
