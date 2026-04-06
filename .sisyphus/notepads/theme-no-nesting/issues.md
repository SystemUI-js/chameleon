# Issues

## 2026-04-03: 发现的风险与歧义

### 风险 1: ThemeShowcase 污染影响按钮样式对比

**问题**：按当前 `src/dev/ComponentCatalog.tsx:437-450` 的实现，`ThemeShowcase` 并不在 `DevThemeRoot` 内；它位于 `<main>` 中，处在前一个 `</DevThemeRoot>` 之后、包裹 `ButtonShowcase` 等示例的下一个 `<DevThemeRoot>` 之前。也就是说，`ThemeShowcase` 在主题 wrapper 外，而 `ButtonShowcase` 仍在 `DevThemeRoot` 内。

**影响**：当前需要防回归的事实不是“两个 showcase 同时在同一 theme wrapper 内”，而是保持 `ThemeShowcase` 与 `ButtonShowcase` 的现有 containment 差异：前者在 `DevThemeRoot` 外，后者在 `DevThemeRoot` 内。

**建议**：继续用 DOM 结构断言锁定隔离边界，不要把风险描述成当前仍存在的同层包裹问题。

### 风险 2: `component-catalog` 根节点位置

**问题**：`src/dev/ComponentCatalog.tsx:429-451` 的 `<div data-testid="component-catalog">` 是外层 catalog 根节点，它包住了 header 对应的 `DevThemeRoot`、`<main>`、`ThemeShowcase`，以及包裹 `ButtonShowcase` 等 section 的另一个 `DevThemeRoot`。也就是说，catalog root 包裹 `DevThemeRoot`，而不是处在它里面。

**影响**：需要关注的真实结构是 `ComponentCatalog` → catalog root div → `<main>` → `ThemeShowcase` + `DevThemeRoot`，而不是建议移动 `ThemeShowcase`；`ThemeShowcase` 当前已经渲染在 `DevThemeRoot` 外部。

**建议**：风险说明应直接引用 `ComponentCatalog`、`DevThemeRoot`、`ThemeShowcase` 和 catalog root div 的当前包含关系，避免基于错误层级提出迁移建议。

### 歧义 1: `catalog-theme-switch` 是否需要保留

**发现**：`src/dev/ComponentCatalog.tsx:64` 有 `<div data-testid="catalog-theme-switch">`，但这个 theme switcher 是用来控制 DevThemeRoot 的主题。

**问题**：ThemeShowcase 隔离后，theme switcher 是否还应该保留在 catalog 头部？

**澄清**：根据 plan 任务 5，只隔离 Theme showcase，不改变 theme switcher 行为。

### 歧义 2: ShowcaseCodeDisclosure 的 sectionId 生成规则

**发现**：`src/dev/ShowcaseCodeDisclosure.tsx:10` 用 `${sectionId}-code-region` 生成 id。

**问题**：如果 sectionId 包含 `catalog-section-` 前缀，生成的 id 会是 `#catalog-section-theme-code-region`。

**建议**：确保红灯测试使用正确的完整 id，不要手动拼接。

### 缺口确认

**测试缺口**：
- `tests/ComponentCatalog.test.tsx` 缺少 Theme section 不在 `theme-root` 内的断言
- `tests/ComponentCatalog.test.tsx` 缺少 Button section 仍在 `theme-root` 内的断言（作为对比基准）

**Playwright 缺口**：
- `tests/ui/component-catalog-code.spec.ts` 只测试 Theme 区块代码面板可展开/收起，未验证 snippet 文案不包含 "Inner wins"

## 2026-01-17 探索发现的风险与歧义

> 注：以下为早期探索阶段的发现，部分问题可能已在后续任务中解决。记录于此供参考。

### 风险 1：空白 provider 边界容易漏检
- **描述**：`Theme name="   "` 经 `normalizeTheme(name)` 后变成 `undefined`，如果嵌套判定写成 `context.theme !== undefined` 会漏掉空白 provider 作为"有效外层"的情况
- **影响**：任务 3 实现时必须用 `hasThemeProvider` 布尔标记，不能只用 `theme !== undefined`
- **状态**：计划已明确，Plan 明确要求增加布尔标记

### 风险 2：Widget 组件的 class context 消费方式不同
- **描述**：`Widget.tsx` 使用 `contextType = ThemeContext` + `this.context.theme` 直接读取，未通过 `useTheme()` hook
- **影响**：Widget 的 `getTheme()` 方法（行 248-256）有自己的 `normalizeTheme` 逻辑，与 `useTheme.ts` 分离
- **状态**：Widget 不在任务范围，但若任务 3 实现时需注意不要破坏 Widget 的 theme 读取路径

### 风险 3：ComponentCatalog 中的嵌套示例是活代码
- **描述**：`ComponentCatalog.tsx` 行 133-137 的嵌套示例 `<Theme name="cm-theme--win98"><Theme name="cm-theme--winxp">` 在 dev server 运行时实际渲染
- **影响**：任务 5 修改结构前，dev server 中 Theme showcase 实际展示嵌套行为
- **状态**：任务 4/5 会处理，不影响任务 1-3

### 歧义 1：三层嵌套的"最近 provider"语义
- **描述**：当前行为是 innermost wins，三层时最内层生效
- **疑问**：实现拒绝后，无论内层具体是哪一层，只要检测到父 context 已有 provider 就应抛错
- **结论**：统一抛错，不区分深度

### 歧义 2：空白 provider 包裹空白 provider
- **描述**：`Theme name="   "><Theme name="  ">` 场景下两个都 normalized 为 undefined
- **疑问**：这种情况下 context.theme 始终是 undefined，hasThemeProvider 如何检测？
- **结论**：第一个 Theme 渲染时 `hasThemeProvider: false`，渲染后 context 变成 `{ theme: undefined, hasThemeProvider: true }`；第二个 Theme 读取到 `hasThemeProvider: true` 即抛错，无需检查 theme 值

### 歧义 3：错误消息格式
- **描述**：计划要求稳定短语 `Nested Theme is not supported`
- **疑问**：是否需要区分不同嵌套场景的错误消息？
- **结论**：统一使用同一短语，便于测试断言匹配
