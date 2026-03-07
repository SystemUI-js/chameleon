## Context

当前开发入口主题切换由 `src/dev/themeSwitcher.tsx` 提供常量与映射，`DevThemeRoot` 在未显式传入 `activeTheme` 时使用共享默认主题。现有能力中默认值契约曾围绕 `winxp`，但本次 proposal 已将目标调整为：新增 `Default` 主题并将其作为默认展示，同时保持默认来源单一、入口行为一致、测试可回归验证。

## Goals / Non-Goals

**Goals:**
- 在现有常量驱动主题切换机制中引入 `Default` 主题分支，并与 `win98`、`winxp` 具有同等可选性。
- 将默认主题契约统一为 `Default`，且默认值仍只由 `themeSwitcher` 模块单点定义。
- 保证 `main.tsx` 等入口通过 `DevThemeRoot` 继承默认行为，不出现重复默认定义。
- 通过测试固定“无参时渲染 Default 分支”与“显式传参分支不回退”的行为。

**Non-Goals:**
- 不引入主题持久化（localStorage / URL / 全局状态）或运行时配置系统。
- 不重构现有 `win98`、`winxp` 主题内部实现细节。
- 不改变组件库公共 API 与发布方式。

## Decisions

1. **新增 `DefaultTheme` 并纳入同一主题映射表**
   - 决策：在 `src/theme/default/` 下提供 `DefaultTheme` 组件，并在 `themeSwitcher` 的 `DEV_THEME` 与 `DEV_THEME_COMPONENTS` 中添加 `default` 键。
   - 原因：延续既有“常量 → 组件映射”模式，最小化接入成本并保持可测试性。
   - 备选方案：复用 `winxp` 作为别名不新增组件。未采用原因：无法满足“增加一个叫 Default 的主题”这一显式需求，语义不清晰。

2. **默认契约从 `winxp` 迁移到 `default`，并保持单一来源**
   - 决策：`DEFAULT_DEV_THEME` 固定指向 `DEV_THEME.default`，`DevThemeRoot` 默认参数继续引用该常量。
   - 原因：保留单点真相，防止入口分散定义默认值导致漂移。
   - 备选方案：在 `main.tsx` 或其他入口二次兜底默认值。未采用原因：会引入多源默认，增加维护风险。

3. **规格与测试同时收敛到新默认契约**
   - 决策：在 `dev-theme-selection` 能力中更新默认主题 requirement，并在 `tests/DevThemeSelection.test.tsx` 覆盖 Default 默认分支与三主题映射行为。
   - 原因：仅改实现不足以防回归，必须由 spec + test 双重约束固定行为。
   - 备选方案：仅更新文档说明。未采用原因：缺乏自动化验证。

## Risks / Trade-offs

- **[Risk] 新增 Default 分支后，旧测试断言仍绑定 winxp 默认值** → **Mitigation**：同步更新默认路径断言，并保留 win98/winxp 显式传参断言避免误改。
- **[Risk] 主题导出不完整导致外部/开发入口无法引用 DefaultTheme** → **Mitigation**：在 `src/index.ts` 增加导出并通过类型检查、测试验证引用链路。
- **[Trade-off] 引入第三个主题分支会增加维护面** → **Mitigation**：复用现有主题装配模式（CScreen 在主题内声明、WindowManager 组合一致），避免新增独立机制。

## Migration Plan

1. 在主题目录新增 `DefaultTheme` 实现并接入导出。
2. 更新 `themeSwitcher` 常量集合、映射与默认常量。
3. 更新 `dev-theme-selection` delta spec，使默认契约与新增主题要求一致。
4. 调整/新增测试，覆盖默认分支与显式分支。
5. 运行 lint/test/build 验证后再进入 tasks 分解执行。

## Open Questions

- `DefaultTheme` 的视觉基线是否采用“中性风格”还是先复用现有主题骨架（后续可在实现阶段确认，不影响当前工件顺序）。
