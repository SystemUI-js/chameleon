- 2026-03-28: `yarn build` 虽然完成产物输出，但 `vite:dts` 仍报告既有类型问题：`src/components/Dock/Dock.tsx`、`src/components/StartBar/StartBar.tsx` 的 `state` 与 `CWidget` 新 state 泛型不兼容，另有 `src/components/Screen/Grid.tsx` 空值检查告警；本任务按约束未修改这些文件。

- 2026-03-28: 本次迁移后定向 Jest 与 Playwright resize 用例全部通过；yarn build 仍输出既有 vite:dts 诊断：src/components/Screen/Grid.tsx:31 可能为 null/undefined，未在本任务范围内处理。

- 2026-03-28: Task 3 验证期间 `yarn build` 仍打印既有 `vite:dts` 诊断 `src/components/Screen/Grid.tsx:31 TS2533`，但构建命令以 0 退出并产出 dist；本任务未触及该文件。
- 2026-03-28: Task 5 验证完成 - Playwright window specs 全部通过（15/15），无新增问题。现有的 `vite:dts` 诊断（Grid.tsx:31 null check）为既有技术债务，未在本次任务范围内。
