# Issues

## 2026-04-04 Code Quality Review

- `src/components/Icon/IconContainer.tsx:418-449` 在触摸长按路径里手工构造 contextmenu 事件对象，并通过 `as unknown as React.MouseEvent<HTMLButtonElement>` 强转后传给 `onContextMenu`。这破坏了 `src/components/Icon/Icon.tsx:22` 的公开回调契约：类型上承诺完整 `React.MouseEvent`，运行时却只提供最小子集。消费者若访问 `clientX`、`button`、修饰键等常见字段，会在长按路径得到错误或缺失值。
- 现有测试覆盖了长按“触发一次”和拖拽/卸载清理，但没有断言长按传给 `onContextMenu` 的事件形状与正常右键路径保持一致，因此这类 API 回归会假绿通过。相关测试文件：`tests/Icon.test.tsx`、`tests/IconContainer.test.tsx`、`tests/ui/icon-container.interactions.spec.ts`。


## Plan Compliance Audit (2026-04-04)
- REJECT: `CIcon`/`CIconContainer` 未落实计划要求的绝对坐标定位。`src/components/Icon/index.scss` 将 `.cm-icon` 设为 `position: relative`，`.cm-icon-container` 设为 `display: flex`；`src/components/Icon/Icon.tsx` 仅写入 `left/top`，因此坐标不是以 container 内容区左上角为基准的绝对定位实现。
- REJECT: 计划 task 6 的全链路验证要求“no lint regressions remain”未满足。执行 `yarn test --runInBand --runTestsByPath tests/Icon.test.tsx tests/IconContainer.test.tsx && yarn test:ui tests/ui/icon-container.interactions.spec.ts && yarn lint && yarn build` 时，`yarn lint` 在 `src/components/Icon/IconContainer.tsx:192` 报出 `react-hooks/exhaustive-deps` warning。


## Plan Compliance Audit Retry (2026-04-05)
- APPROVE: `src/components/Icon/Icon.tsx:61-66` now sets `position: 'absolute'` together with `left/top` when `position` is provided, and `src/components/Icon/index.scss:22-27` makes `.cm-icon-container` a positioned ancestor (`position: relative`), so icon coordinates now match the plan's container-relative absolute positioning intent.
- APPROVE: Re-ran `yarn test --runInBand --runTestsByPath tests/Icon.test.tsx tests/IconContainer.test.tsx && yarn test:ui tests/ui/icon-container.interactions.spec.ts && yarn lint && yarn build`; Jest, Playwright, lint, and build all pass on the current tree. The prior `react-hooks/exhaustive-deps` warning is gone after `src/components/Icon/IconContainer.tsx:187-198` switched cleanup to a captured `recordsSnapshot`.
