## 1. Default Theme Capability

- [ ] 1.1 新增 `src/theme/default/index.tsx`，提供可挂载的 `DefaultTheme` 组件，并保持与现有主题一致的组合约束（主题内声明 `CScreen`）。
- [ ] 1.2 在主题导出链路中补充 `DefaultTheme`（至少覆盖 `src/index.ts`），确保其可被主题切换模块引用。
- [ ] 1.3 为 `DefaultTheme` 增加最小可验证标记（测试选择器或等价可观测输出），用于区分默认分支渲染结果。

## 2. Theme Switch Default Contract Migration

- [ ] 2.1 更新 `src/dev/themeSwitcher.tsx` 的 `DEV_THEME` 常量集合，新增 `default` 主题键并接入组件映射。
- [ ] 2.2 将 `DEFAULT_DEV_THEME` 从 `DEV_THEME.winxp` 迁移为 `DEV_THEME.default`，保持 `DevThemeRoot` 默认参数继续依赖该单一来源。
- [ ] 2.3 复核 `src/dev/main.tsx` 入口调用链，确保仍仅通过 `<DevThemeRoot />` 继承默认值，不重复定义 fallback。

## 3. Spec and Test Alignment

- [ ] 3.1 更新 `tests/DevThemeSelection.test.tsx`：新增/调整 `default` 分支映射断言，覆盖 `default`、`win98`、`winxp` 三分支可选性。
- [ ] 3.2 更新无参渲染断言，验证 `<DevThemeRoot />` 默认命中 `DefaultTheme`，且非默认主题标记不出现。
- [ ] 3.3 保留并复核显式传参路径测试，确保 `win98` 与 `winxp` 分支行为在默认切换后仍稳定。

## 4. Verification

- [ ] 4.1 运行与变更直接相关测试（至少 `tests/DevThemeSelection.test.tsx`）并修复失败。
- [ ] 4.2 运行 `yarn lint`、`yarn test`、`yarn build`，确认无新增质量问题。
- [ ] 4.3 对照 proposal/design/specs 做最终一致性复核，确认改动范围聚焦“新增 Default 主题 + 默认主题迁移”。
