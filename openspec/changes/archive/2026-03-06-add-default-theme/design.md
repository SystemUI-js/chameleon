## Context

当前开发入口通过 `DevThemeRoot` 和 `ACTIVE_THEME` 常量完成主题选择，默认值现为 `winxp`，但该默认行为尚未在规范层明确为必须行为。`proposal.md` 已将本次变更定义为对 `dev-theme-selection` 能力的修改：未显式指定主题时必须使用统一默认主题，并确保默认来源一致。现有实现与测试主要覆盖“按传入主题渲染分支”，对“默认主题契约”缺少显式约束。

## Goals / Non-Goals

**Goals:**
- 在 `dev-theme-selection` 规范与实现中明确“默认主题”为 `winxp`。
- 保持默认值单一来源（`themeSwitcher.tsx`）并让 `main.tsx` 通过 `DevThemeRoot` 继承该默认行为。
- 增加针对“未传 activeTheme 时默认渲染 winxp”的测试，避免回归。

**Non-Goals:**
- 不引入运行时可配置主题存储（如 localStorage、URL 参数或全局状态）。
- 不扩展主题集合或修改 `Theme` 数据结构。
- 不改动生产组件库对外 API，仅调整开发入口主题选择约束。

## Decisions

1. **默认主题常量继续定义在 `src/dev/themeSwitcher.tsx` 并显式命名为默认契约来源**
   - 决策：沿用 `ACTIVE_THEME` 作为默认主题单一来源，并在 spec/测试层显式约束其默认语义。
   - 原因：当前 `DevThemeRoot` 的默认参数已直接绑定 `ACTIVE_THEME`，这是最小改动且最清晰的约束点。
   - 备选方案：将默认值下沉到 `main.tsx` 传参。未采用原因：会形成双重默认来源，增加漂移风险。

2. **默认主题策略选定为 `winxp`，并通过测试固定行为**
   - 决策：将“未提供 `activeTheme` 时渲染 `WinXpTheme`”作为规范与测试断言。
   - 原因：当前实现已使用 `winxp`，将其升格为明确契约可保证新环境行为一致。
   - 备选方案：改为 `win98` 或保持“未定义默认”。未采用原因：前者会引入不必要行为变更，后者无法解决一致性问题。

3. **测试层补充默认路径验证，而非仅验证映射与显式分支**
   - 决策：在 `tests/DevThemeSelection.test.tsx` 新增/调整用例，覆盖 `<DevThemeRoot />` 无参渲染默认分支。
   - 原因：现有测试已覆盖显式传参分支，缺失默认路径是本次回归风险主要来源。
   - 备选方案：只在文档声明默认行为。未采用原因：无自动化校验，难以防回归。

## Risks / Trade-offs

- **[Risk] 默认主题被后续改动悄然切换** → **Mitigation**：通过默认渲染测试和 spec requirement 双重约束，变更默认值必须同步更新两者。
- **[Risk] 开发入口未来出现多处主题默认定义** → **Mitigation**：设计上坚持 `themeSwitcher.tsx` 为唯一默认来源，其他入口只调用 `DevThemeRoot`。
- **[Trade-off] 将默认主题固化为契约降低灵活性** → **Mitigation**：后续若需可配置主题，在新 change 中显式引入配置机制并更新能力定义。
