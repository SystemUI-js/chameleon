## 2026-04-01 F4 Scope Fidelity

- `ShowcaseCodeDisclosure` 保持 dev-only（`src/dev/`），通过 `sectionId` 生成稳定的 `*-code-region`，并用 `aria-expanded` + `aria-controls` 建立可访问性披露关系。
- `ComponentCatalog` 的 7 个 Showcase（Button/RadioGroup/Select/Window/Dock/StartBar/Grid）均显式传入独立 snippet 字符串，满足“每节一个 toggle + 默认折叠 + 显式代码源”范围要求。
- 公共发布面未扩散：`src/index.ts` 仅导出组件库条目，Vite 仍从 `src/index.ts` 构建，dev 逻辑未进入 package exports。
