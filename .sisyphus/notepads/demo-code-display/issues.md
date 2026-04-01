## 2026-04-01 F3 手工 QA

- REJECT：`src/dev/ShowcaseCodeDisclosure.tsx` 渲染的 `button` / `pre` / `code` 未挂载 `.cm-catalog__code-toggle`、`.cm-catalog__code-region`、`.cm-catalog__code-block`，而 `src/dev/styles/catalog.scss` 已定义对应样式，导致视觉验收项“代码块样式一致、切换按钮样式符合 catalog 设计”无法成立。
- 其余核查项基本满足：7 个 Showcase 均传入 `code`，切换文本与独立状态存在；`aria-expanded`、`aria-controls` 和 `*-code-region` ID 已接通；现有 Jest/Playwright 证据显示 129 个单测与 40 个 UI 测试通过，但测试未覆盖样式类接线缺失这一问题。

## 2026-04-01 F4 Scope Fidelity

- 未发现新的 scope guardrail 违规；当前问题仍集中在 F3 记录的样式类接线缺失（属于视觉验收风险，不属于本次 F4 的范围越界项）。
