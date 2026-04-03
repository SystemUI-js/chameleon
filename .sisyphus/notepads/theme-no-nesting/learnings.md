# Learnings

## 2026-04-03: Task 2 - Theme Support Path Boundary Regression

### 完成的操作

**文件修改**：`tests/Theme.test.tsx`
- **新增了**边界测试 `it('blank outer provider still counts as a provider node for nesting boundary')`
- **位置**：在 "does not inject a theme for empty provider values" 之后
- **意图**：验证空白外层 `Theme name="   "` 仍算有效 provider 节点，显式 theme prop 优先于空白 provider

### 测试结果

**Theme.test.tsx**：
```
Tests: 4 failed (nested rejection), 8 passed (support paths), 12 total
✓ blank outer provider still counts as a provider node for nesting boundary (NEW)
```

**Button.test.tsx**：✓ 9/9 通过
**PublicThemeMatrix.test.tsx**：✓ 12/12 通过

### 复核结论

- `Button.test.tsx` 的 `describe('theme prop')`（行 68-119）已完整覆盖显式 prop override provider 语义，无需修改
- `PublicThemeMatrix.test.tsx` 的覆盖（行 84-100）已完整覆盖 CRadioGroup/CRadio override 场景，无需修改

### 阻塞状态

Theme.test.tsx 整体失败是因为任务 1 添加了 4 个嵌套拒绝测试，但 Theme.tsx 尚未实现嵌套拒绝功能（任务 3 负责）。任务 2 新增的支持路径测试本身通过。

### 验证命令

```bash
yarn test -- Theme.test.tsx        # 红灯：4 失败（嵌套拒绝待实现），8 通过
yarn test -- Button.test.tsx       # 绿：9/9
yarn test -- PublicThemeMatrix.test.tsx  # 绿：12/12
```

## 2026-04-03: F2 - Code Quality Review

- `src/components/Theme/Theme.tsx` 的 guard 维持了最小改动面：只在 provider context 增加 `hasThemeProvider`，没有改动 `useTheme()` 的 explicit prop 优先级；空白 provider 仍通过布尔标记参与嵌套判定。
- `tests/Theme.test.tsx` 对五个嵌套拒绝场景、空白 provider 边界、显式 prop 优先和无 provider 路径都有直接断言，能覆盖这次语义变更的主要回归面。
- `src/dev/ComponentCatalog.tsx` 将 `ThemeShowcase` 放到 `DevThemeRoot` 外，同时保留其余 section 在 `theme-root` 内；`tests/ComponentCatalog.test.tsx` 用正反两个结构断言锁定了这个边界。
- README 与 demo 文案都已同步为“Theme 不支持嵌套，组件 `theme` prop 可做单点覆盖”，未发现旧的 nearest/inner wins 残留。
- 复核验证通过：`yarn test -- --silent --runInBand`、`yarn lint`、`yarn build`、`yarn test:ui --grep "Theme showcase"` 全绿；LSP 对目标文件无错误，仅有 import 排序 information 提示。

## 2026-04-03: F2 - Code Quality Review (second-pass verdict)

- `src/components/Theme/Theme.tsx:31-37` 正确使用 `hasThemeProvider` 而不是 `theme !== undefined` 做嵌套判定，因此空白外层 provider (`name="   "`) 仍会阻止内层 `Theme`，这与计划中的边界约束一致。
- `src/components/Theme/useTheme.ts:16-22` 保住了 explicit prop 优先级：先返回 `normalizeTheme(theme)`，只有显式 prop 为空时才回退到 context；`tests/Theme.test.tsx:37-45` 与 `:121-129` 也直接锁定了该语义。
- `src/dev/ComponentCatalog.tsx:374-390` 虽然成功把 `ThemeShowcase` 移出 `DevThemeRoot`，但也把 `catalog-section-theme` 放到了 `<main>` 之外。这样做通过了当前隔离测试，却让页面主内容被拆成 `<main>` 内的网格和 `<main>` 外的独立 section，偏离了计划里“在 main 内先渲染 ThemeShowcase，再渲染受主题控制网格”的推荐最小结构。
- `tests/ComponentCatalog.test.tsx:203-223` 只验证了 `theme-root` 包含/不包含关系，没有回归保护去锁定 `catalog-section-theme` 仍属于主内容区，因此上述结构退化目前可以在测试全绿的情况下溜过。
- `tests/ui/component-catalog-code.spec.ts:34-66` 只覆盖代码折叠与文案去残留，未覆盖 Theme 区块是否仍在主内容流中；因此 UI 测试对这类结构性回归没有防线。
- 结论：Theme provider 行为和文案对齐可以批准，但以“高标准代码质量审查”衡量，demo 隔离结构仍存在隐藏质量问题，整体 verdict 应为 `REJECT`，直到 `ThemeShowcase` 回到 `<main>` 主内容区域并补上对应回归保护。

## 2026-04-03: F2 reassessment - ThemeShowcase outside main

- 复读 task 5 计划后，`main` 内先放 `ThemeShowcase` 再放 `DevThemeRoot` 网格是“推荐结构”，不是单独写进 acceptance criteria 的硬性契约；可执行验收只有 `Theme` 区块脱离 `theme-root`、UI code panel 继续通过、`yarn build` 通过（`.sisyphus/plans/theme-no-nesting.md:261-280`）。
- 当前实现 `src/dev/ComponentCatalog.tsx:367-390` 仍保持了 `component-catalog` 根节点不变，且成功让 `ThemeShowcase` 成为 `DevThemeRoot` 的 sibling；这直接满足“隔离 Theme showcase、不要重排其他 showcase 布局”的目标，没有证据表明它破坏了功能或既有测试约束。
- 当前测试 `tests/ComponentCatalog.test.tsx:203-223` 只把“Theme section 不在 theme-root 内、Button section 仍在 theme-root 内”当成公开不变量；测试并未把“Theme section 必须位于 main 内”定义为契约，因此不能把该点当作实现违约。
- 在本次限定范围内，没有读到具体的 correctness、maintainability、accessibility failure mode：`ThemeShowcase` 在 `<main>` 外本身不会重新引入主题污染，也没有与现有 test id、交互或计划验收冲突。
- 修订结论：这更像非阻塞的结构建议/plan 推荐实现差异，而不是本 change 的代码质量 blocker；F2 不应仅凭此点维持 `REJECT`。

## 2026-04-03: Task 1 - Theme Nested Contract Red Test

### 完成的操作

**文件修改**：`tests/Theme.test.tsx`
- **移除了**行 47-57 的旧测试 `it('uses the nearest nested provider theme')`
- **新增了**嵌套拒绝测试块 `describe('nested Theme rejection')`，包含 4 个测试：
  1. `rejects directly nested Theme` - 直接嵌套
  2. `rejects nested Theme with different names` - 异名嵌套
  3. `rejects nested Theme with the same name` - 同名嵌套
  4. `rejects three-level deep nested Theme` - 三层深度嵌套
- **保留了**所有支持路径测试（7 个通过）：
  - 单层 provider happy path
  - 显式 theme prop 优先
  - 空白 provider 不注入 theme
  - 无 provider 返回 undefined
  - mergeClasses 两个测试

### 测试结果（红灯）

```
Tests: 4 failed, 7 passed, 11 total
```

**失败原因**：`Theme.tsx` 尚未实现嵌套防护逻辑，所以嵌套测试正确地失败（Received function did not throw）
**预期**：任务 3 实现嵌套 guard 后，这些测试应通过

### 验证命令

```bash
yarn test -- Theme.test.tsx  # 红灯状态：4 失败（嵌套拒绝），7 通过（支持路径）
```

## 2026-04-03: F3 手工 QA 结论

### 页面实测

- 使用 Vite dev 页面 `http://127.0.0.1:5674/` 做了真实浏览器交互验证（5673 被占用后自动切到 5674）
- `theme-root` **包含** `catalog-section-button`，**不包含** `catalog-section-theme`
- Theme 区块 prose 明确说明：嵌套 `Theme` 不受支持，单组件覆盖应使用 `theme` prop，且显式 `theme` prop 优先级更高
- Theme 代码面板可正常 `Show code` / `Hide code` 切换，snippet 包含单层 `<Theme name="cm-theme--win98">` wrapper 示例和 `<CButton theme="cm-theme--default">Explicit prop overrides</CButton>` 示例
- 页面与代码面板均未发现禁用措辞：`Inner wins`、`nearest nested provider wins`、`nearest (innermost) provider wins`

### 额外验证

- 真实切换 dev theme 后，`theme-root` 外层 wrapper class 会从 `cm-theme--default` 正常切换到 `cm-theme--win98` / `cm-theme--winxp`
- 浏览器控制台无 task-caused 错误；本次未观察到已知 `favicon.ico` 404
- README Theming 段落与页面说明一致：都强调 `Theme` 不支持嵌套，并引导到组件 `theme` prop

### 命令结果

```bash
yarn test -- ComponentCatalog.test.tsx Theme.test.tsx
yarn test:ui --grep "Theme showcase|Button showcase"
yarn build
```

- Jest: 通过
- Playwright UI: 2/2 通过
- Build: 成功（存在 Dart Sass legacy-js-api deprecation warning，但未阻塞构建）

### QA 判定

- `APPROVE`

### 证据文件

- `.sisyphus/evidence/task-1-theme-contract-red.log` - 完整测试输出

## 2026-04-03: Theme Showcase 隔离探索

### 污染根源定位

**问题**：`ThemeShowcase` 位于 `ComponentCatalog` 内部，而 `ComponentCatalog` 被 `<DevThemeRoot>` 包裹，导致 Theme 展示区被外层主题污染。

**证据链**：
1. `src/dev/ComponentCatalog.tsx:378-402` — `ComponentCatalog` 整体被 `<DevThemeRoot theme={theme}>` 包裹
2. `src/dev/ComponentCatalog.tsx:389` — `ThemeShowcase` 在 `DevThemeRoot` 内部渲染
3. `src/dev/themeSwitcher.tsx:37-47` — `DevThemeRoot` 用传入 theme 渲染 `<Theme name={themeDefinition.className}>` wrapper
4. `src/dev/ComponentCatalog.tsx:162-173` — ThemeShowcase 内部想展示嵌套主题示例，但被外层 Theme 覆盖

**技术细节**：
- `DevThemeRoot` 返回 `<Theme name={...}><div data-testid="theme-root">{children}</div></Theme>`
- 当外层 theme 是 `default`，ThemeShowcase 内部的 `<Theme name="cm-theme--win98">` 会因"最近 provider 生效"规则被外层 `default` 覆盖

### 稳定约束（test id / 可访问名称，必须保留）

| 约束 | 文件位置 | 用途 |
|------|----------|------|
| `theme-root` | `themeSwitcher.tsx:45` | DevThemeRoot 的 DOM 容器 testid |
| `catalog-section-theme` | `ComponentCatalog.tsx:147` | Theme showcase section testid |
| `catalog-section-button` | `ComponentCatalog.tsx:101` | Button showcase section testid（对比基准） |
| `#catalog-section-theme-code-region` | `ShowcaseCodeDisclosure.tsx:10` 生成 | Theme 代码区域 id |
| `#catalog-section-button-code-region` | `ShowcaseCodeDisclosure.tsx:10` 生成 | Button 代码区域 id |
| `Show code` / `Hide code` | `ShowcaseCodeDisclosure.tsx:21` | 代码折叠按钮名称 |
| `aria-expanded` | `ShowcaseCodeDisclosure.tsx:17` | 按钮状态属性 |

### 需要移除的 snippet/文案残留

1. **`src/dev/ComponentCatalog.tsx:167`** — `<CButton>Inner wins</CButton>`
2. **`src/dev/ComponentCatalog.tsx:162-173`** — 嵌套 Theme 示例的整个 `<div aria-hidden="true">` 块
3. **`src/dev/ComponentCatalog.tsx:132-137`** — THEME_SNIPPET 中的嵌套 provider 示例注释
4. **`src/dev/ComponentCatalog.tsx:154-155`** — "nearest (innermost) provider wins" 文案
5. **`tests/Theme.test.tsx:47`** — `it('uses the nearest nested provider theme')` 测试描述

### 测试文件清单

**单元测试 (Jest + RTL)**：
- `tests/ComponentCatalog.test.tsx` (196 lines) — 现有 code toggle 测试，无 Theme 隔离断言
- `tests/Theme.test.tsx` (90 lines) — 包含即将删除的"nested provider wins"语义测试
- `tests/ui/component-catalog-code.spec.ts` (62 lines) — Playwright Theme 区块交互测试

**缺口**：`tests/ComponentCatalog.test.tsx` 需要新增两个红灯测试：
- Theme section 不在 `theme-root` 内
- Button section 仍在 `theme-root` 内

### 验证命令

```bash
# 单元测试
yarn test -- ComponentCatalog.test.tsx

# Playwright UI 测试
yarn test:ui --grep "Theme showcase"
```

## 2026-01-17 穷尽式代码库探索发现

### 核心文件清单

#### 实现文件
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Theme/Theme.tsx`
  - 行 3-5: `ThemeContextValue` 当前仅含 `theme: string | undefined`
  - 行 12: `ThemeContext = React.createContext<ThemeContextValue>({ theme: undefined })`
  - 行 14-22: `normalizeTheme()` 将空白字符串转换为 `undefined`
  - 行 24-34: `Theme` 组件渲染函数，无嵌套检测

- `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Theme/useTheme.ts`
  - 行 14-22: `useTheme(theme?: string)` 实现显式 prop 优先逻辑
  - 行 18-20: `if (explicitTheme !== undefined) return explicitTheme` 明确优先
  - 行 22: 回退到 `context.theme`

#### 测试文件
- `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Theme.test.tsx`
  - **行 47-57: 必须替换** — `it('uses the nearest nested provider theme')` 旧契约断言
  - **行 59-67: 必须保留** — `it('does not inject a theme for empty provider values')` 空白 provider 边界
  - **行 69-73: 必须保留** — `it('returns undefined when no explicit theme or provider exists')` 无 provider 边界
  - 行 37-45: `it('uses explicit theme prop before provider theme')` 显式 prop 优先 → 必须保留

- `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Button.test.tsx`
  - 行 68-119: `describe('theme prop')` 整体必须保留，不能修改

- `/Users/zhangxiao/frontend/SysUI/chameleon/tests/PublicThemeMatrix.test.tsx`
  - 行 39-151: `describe('public component theme matrix')` 整体必须保留

#### 消费 Theme 的组件（回归保护目标）
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Button/Button.tsx` — 行 37: `useTheme(theme)`
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Select/Select.tsx` — 行 48: `useTheme(theme)`
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Radio/RadioGroup.tsx` — 行 48: `useTheme(theme)`
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Radio/Radio.tsx` — 行 32: `useTheme(theme)`
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Widget/Widget.tsx` — 行 93: `contextType = ThemeContext`，行 248-256: `getTheme()`

#### Demo 文件
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/dev/ComponentCatalog.tsx`
  - 行 126-143: `THEME_SNIPPET` 包含嵌套示例与 "Inner wins" 文案 → 任务 5 需删除
  - 行 162-173: `ThemeShowcase` 渲染在 `DevThemeRoot` 内 → 任务 5 需隔离

### 行为矩阵（当前行为 → 期望行为）

| 场景 | 当前行为 | 期望行为 | 所在文件/行 |
|------|----------|----------|-------------|
| 直接嵌套 (`Theme > Theme`) | Inner wins (data-theme="winxp") | 抛出 `Nested Theme is not supported` | Theme.test.tsx:47-57 **必须替换** |
| 同名嵌套 | Inner wins | 抛出 `Nested Theme is not supported` | Theme.test.tsx:47-57 |
| 异名嵌套 | Inner wins | 抛出 `Nested Theme is not supported` | Theme.test.tsx:47-57 |
| 三层嵌套 | Innermost wins | 抛出 `Nested Theme is not supported` | Theme.test.tsx:47-57 |
| 空白外层 provider (`Theme name="   "`) | 无 theme 注入 (normalizeTheme 返回 undefined) | 空白外层仍算 provider，内层 Theme 仍抛错 | Theme.test.tsx:59-67 **必须新增测试** |
| 显式 prop override | explicit theme wins | 保持不变 | Theme.test.tsx:37-45 **必须保留** |
| 无 provider | undefined | 保持 undefined | Theme.test.tsx:69-73 **必须保留** |
| 单层 provider | theme 正常传递 | 保持正常 | Theme.test.tsx:27-35 **必须保留** |

### 关键实现约束

1. **嵌套判定不能只靠 `theme !== undefined`**
   - 原因：`Theme name="   "` 经 `normalizeTheme()` 后 `theme` 为 `undefined`，但仍然是有效的 provider
   - 解决：需在 `ThemeContextValue` 中增加 `hasThemeProvider: boolean` 标记
   - 默认值：`{ theme: undefined, hasThemeProvider: false }`
   - 渲染时：先读取父 context，若 `hasThemeProvider === true` 则抛错

2. **`normalizeTheme` 位置**
   - `Theme.tsx:14-22` — Theme 组件内使用
   - `useTheme.ts:4-12` — 消费者 hook 内使用
   - 两者逻辑完全相同，需同步维护

3. **`useTheme` 显式 prop 优先级不能改**
   - 当前顺序：explicit → context
   - 任务 3 改动只影响 Theme provider 嵌套检测，不改变 useTheme 消费逻辑

### 验证命令
```bash
yarn test -- Theme.test.tsx        # 验证嵌套拒绝 + 支持路径
yarn test -- Button.test.tsx       # 验证组件 theme prop 覆盖
yarn test -- PublicThemeMatrix.test.tsx  # 验证公开组件主题矩阵
```

## 2026-04-03: Task 4 - Theme Showcase 隔离红灯测试

### 完成的操作

**文件修改**：
- `tests/ComponentCatalog.test.tsx` — 新增 `describe('Theme showcase isolation boundary')`，包含 3 个测试
- `tests/ui/component-catalog-code.spec.ts` — Theme showcase 测试新增去嵌套文案断言

**Jest 新增测试**：
1. `theme-root exists` — 确认 theme-root 存在
2. `catalog-section-theme is NOT inside theme-root (isolation boundary)` — **红灯** ❌
3. `catalog-section-button IS still inside theme-root (reference baseline)` — 基准线 ✓

**Playwright 新增断言**：
- Theme code region 不包含 `Inner wins`
- Theme code region 不包含 `nearest nested provider wins`

### 测试结果

**Jest**：
```
Tests: 1 failed, 16 passed, 17 total
● catalog-section-theme is NOT inside theme-root (isolation boundary)
  expect(element).not.toContainElement(element)
  <div data-testid="theme-root" /> contains: <section data-testid="catalog-section-theme" />
```
红灯确认：`catalog-section-theme` 当前错误地位于 `theme-root` 内。

**Playwright**：`yarn test:ui --grep "Theme showcase"` → ✓ 通过

### 关键发现

- `catalog-section-theme` 和 `catalog-section-button` 都在 `theme-root` 内，因为 `ComponentCatalog` 整体被 `DevThemeRoot` 包裹（ComponentCatalog.tsx:378）
- 红灯测试精确定位了隔离缺口：ThemeShowcase 需要在 DevThemeRoot 外部渲染
- 任务 5 将通过结构重构使红灯转绿

### 验证命令

```bash
yarn test -- ComponentCatalog.test.tsx  # 红灯状态：1 失败（Theme 隔离），16 通过
yarn test:ui --grep "Theme showcase"    # 应通过（code toggle + 去嵌套文案）
```

## 2026-04-03: Task 2 Fix Iteration - Blank Provider Nesting Rejection

### 问题

任务 2 第一次提交只有 "blank outer provider still counts as a provider node for nesting boundary"，该测试只验证显式 `theme` prop 覆盖空白 provider，但**没有验证空白外层 provider 拒绝内层 Theme**。

### 修复操作

**文件修改**：`tests/Theme.test.tsx`
- **新增了** `it('rejects nested Theme even when outer provider has blank name')` 到 `nested Theme rejection` 块内
- **位置**：`nested Theme rejection` describe 块的第 5 个测试
- **断言**：`expect(() => render(<Theme name="   "><Theme name="win98"><ThemeProbe /></Theme></Theme>)).toThrow('Nested Theme is not supported')`

### 测试结果（修复后）

**Theme.test.tsx**：
```
Tests: 5 failed (nested rejection), 8 passed (support paths), 13 total
  nested Theme rejection
    ✕ rejects directly nested Theme
    ✕ rejects nested Theme with different names
    ✕ rejects nested Theme with the same name
    ✕ rejects three-level deep nested Theme
    ✕ rejects nested Theme even when outer provider has blank name (NEW - correctly red)
  support paths (8 passing)
    ✓ exports Theme from package entry
    ✓ provides theme from provider
    ✓ uses explicit theme prop before provider theme
    ✓ does not inject a theme for empty provider values
    ✓ blank outer provider still counts as a provider node for nesting boundary
    ✓ returns undefined when no explicit theme or provider exists
```

**Button.test.tsx**：✓ 9/9 通过
**PublicThemeMatrix.test.tsx**：✓ 12/12 通过

### 关键区分

- 支持路径测试（非嵌套拒绝）：空白外层 + 显式 prop → prop wins（当前通过）
- 嵌套拒绝红灯测试：空白外层 + 内层 Theme → 抛错（当前失败，等待任务 3 实现）

### 验证命令

```bash
yarn test -- Theme.test.tsx        # 红灯：5 失败（嵌套拒绝），8 通过（支持路径）
yarn test -- Button.test.tsx       # 绿：9/9
yarn test -- PublicThemeMatrix.test.tsx  # 绿：12/12
```

## 2026-04-03: Task 3 - Theme Nested Guard Implementation

### 完成的操作

**文件修改**：`src/components/Theme/Theme.tsx`

1. **新增 `hasThemeProvider: boolean` 到 `ThemeContextValue`**（行 3-6）
   ```typescript
   export interface ThemeContextValue {
     theme: string | undefined;
     hasThemeProvider: boolean;
   }
   ```

2. **更新默认 context 为 `{ theme: undefined, hasThemeProvider: false }`**（行 13-16）
   ```typescript
   export const ThemeContext = React.createContext<ThemeContextValue>({
     theme: undefined,
     hasThemeProvider: false,
   });
   ```

3. **实现嵌套守卫检测**（行 28-33）
   ```typescript
   export function Theme({ name, children }: ThemeProps): React.ReactElement {
     const parentContext = React.useContext(ThemeContext);

     if (parentContext.hasThemeProvider) {
       throw new Error('Nested Theme is not supported');
     }
     // ...
   }
   ```

4. **Provider value 始终写入 `hasThemeProvider: true`**（行 35-38）
   ```typescript
   const contextValue = React.useMemo<ThemeContextValue>(
     () => ({ theme: normalizeTheme(name), hasThemeProvider: true }),
     [name],
   );
   ```

### 关键实现约束

- 嵌套判定使用 `hasThemeProvider: boolean` 而非 `theme !== undefined`，因为空白字符串经 `normalizeTheme()` 后为 `undefined` 但仍是有效 provider
- 空白外层 `Theme name="   "` 的 `hasThemeProvider === true`，能正确拒绝内层 Theme
- `useTheme.ts` 未修改，显式 prop precedence 语义保持不变

### 测试结果（绿）

```
Theme.test.tsx
  ✓ exports Theme from package entry
  ✓ provides theme from provider
  ✓ uses explicit theme prop before provider theme
  ✓ does not inject a theme for empty provider values
  ✓ blank outer provider still counts as a provider node for nesting boundary

## 2026-04-03: F3 Real Manual QA - Final Wave Independent Verification

### 手工执行步骤

1. 打开本地 dev 页面 `http://127.0.0.1:5674/`
2. 定位 `Theme` 区块与 `Button` 区块，核对页面结构与文案
3. 打开 `Theme` 区块的 `Show code`，确认代码区域展开，再点击 `Hide code` 确认可关闭
4. 检查 `Theme` snippet 是否只展示单层 `<Theme name="cm-theme--win98">` 与显式 `theme` prop override
5. 检查页面 prose 与 snippet 中是否残留 `Inner wins`、`nearest nested provider wins` 或等价嵌套成功措辞
6. 切换顶部 dev theme 选择器 `default → win98 → winxp`，确认全局 wrapper class 仅作用于 `theme-root` 一侧，同时 `Button` section 仍位于该 wrapper 内
7. 读取浏览器 console messages，确认交互后无 task-caused 运行时错误

### 实测结论

- `catalog-section-theme` 不在 `theme-root` 内；`catalog-section-button` 仍在 `theme-root` 内，基准行为保留
- `Theme` 区块 prose 明确写明：嵌套 `<Theme>` 不受支持；单组件覆盖应使用 `theme` prop；显式 `theme` prop 优先于 provider
- `Theme` 代码面板可正常展开/收起，`aria-expanded` 在打开时为 `true`，关闭后回到 `false`
- 展开的代码片段只包含单层 provider 示例和 `<CButton theme="cm-theme--default">Explicit prop overrides</CButton>`
- 页面文案与代码片段均未观察到 `Inner wins`、`nearest nested provider wins`、`nearest (innermost) provider wins` 或其他嵌套成功表达
- 顶部 theme 切换器把 `theme-root` 的父级 wrapper class 从 `cm-theme--default` 切到 `cm-theme--win98` / `cm-theme--winxp`；Theme showcase 继续独立存在于该 wrapper 外侧

### Console / Runtime

- 仅观察到 `GET /favicon.ico 404` 控制台错误
- 未观察到本任务交互导致的组件报错、未捕获异常或 hydration/runtime warning

### QA 判定

- `APPROVE`
  ✓ returns undefined when no explicit theme or provider exists
  nested Theme rejection
    ✓ rejects directly nested Theme
    ✓ rejects nested Theme with different names
    ✓ rejects nested Theme with the same name
    ✓ rejects three-level deep nested Theme
    ✓ rejects nested Theme even when outer provider has blank name
  mergeClasses
    ✓ merges classes in order and removes duplicates
    ✓ returns base classes when theme and className are absent

Tests: 13 passed, 13 total
```

**Button.test.tsx**：✓ 9/9 通过
**PublicThemeMatrix.test.tsx**：✓ 12/12 通过
**yarn lint**：✓ 通过

### 验证命令

```bash
yarn test -- Theme.test.tsx        # 绿：13/13
yarn test -- Button.test.tsx       # 绿：9/9
yarn test -- PublicThemeMatrix.test.tsx  # 绿：12/12
yarn lint                          # 通过
```

## 2026-04-03: Task 5 - ThemeShowcase 隔离实现

### 完成的操作

**文件修改**：`src/dev/ComponentCatalog.tsx`

1. **重构 ComponentCatalog 结构**
   - 将 `ThemeShowcase` 移到 `DevThemeRoot` 外部
   - 结构变化：`component-catalog` → `DevThemeRoot`（含 header 和 grid）→ `ThemeShowcase`（独立在外）

2. **更新 `THEME_SNIPPET`**
   - 移除了嵌套 Theme 示例（`Nearest nested provider wins`）
   - 保留了单层 Theme wrapper 示例和 explicit prop override 示例

3. **更新 `ThemeShowcase` prose 和 live demo**
   - 移除了 "nearest (innermost) provider wins" 文案
   - 新增 "Nested Theme is not supported" 说明
   - 移除了 live demo 中的 `<Theme><Theme>...</Theme></Theme>` 示例
   - 保留了单层 Theme wrapper 和 explicit prop override 示例

### 关键结构变化

**Before**（ComponentCatalog.tsx:373-404）:
```jsx
<DevThemeRoot theme={theme}>
  <div data-testid="component-catalog">
    <header>...</header>
    <main>
      <div className="cm-catalog__grid">
        <ThemeShowcase /> {/* 问题：嵌套 Theme 会触发 guard */}
        <ButtonShowcase />
        ...
      </div>
    </main>
  </div>
</DevThemeRoot>
```

**After**:
```jsx
<div data-testid="component-catalog">
  <DevThemeRoot theme={theme}>
    <header>...</header>
    <main>
      <div className="cm-catalog__grid">
        <ButtonShowcase />
        <RadioGroupShowcase />
        <SelectShowcase />
        ...
      </div>
    </main>
  </DevThemeRoot>
  <ThemeShowcase /> {/* 隔离在 DevThemeRoot 外部 */}
</div>
```

### 测试结果（绿）

```
yarn test -- ComponentCatalog.test.tsx  # 17/17 通过
yarn test:ui --grep "Theme showcase"    # 1/1 通过
yarn lint                               # 通过
yarn build                              # 通过
```

**全量测试**：`yarn test` → 12 test suites, 140 tests passed

### 关键约束遵守情况

| 约束 | 状态 |
|------|------|
| `theme-root` 存在 | ✓ 仍在 header/main 外层 |
| `catalog-section-theme` 不在 `theme-root` 内 | ✓ |
| `catalog-section-button` 仍在 `theme-root` 内 | ✓ |
| 无嵌套 Theme live demo | ✓ |
| snippet 无 "Inner wins" / "nearest nested provider wins" | ✓ |
| `themeSwitcher.tsx` 未修改 | ✓ |

### 验证命令

```bash
yarn test -- ComponentCatalog.test.tsx  # 绿：17/17
yarn test:ui --grep "Theme showcase"    # 绿：1/1
yarn lint                               # 通过
yarn build                              # 通过
```

## 2026-04-03: Task 6 - README Theme 契约同步

### 完成的操作

**文件修改**：`README.md`
- 在 `### Theme 组件` 段落末尾（行 82）新增：`Theme 不支持嵌套。若只需为单个组件覆盖主题，使用该组件的 `theme` prop。`
- 保留了单层 Theme wrapper 示例（行 75-78）
- 保留了组件 `theme` prop 示例（行 88-92）
- 保留了主题定义段落（行 94-100）

### 对齐验证

- ComponentCatalog.tsx 的 THEME_SNIPPET（行 126-136）与 README 示例完全一致
- ComponentCatalog.tsx 的 prose 文案（行 147-149）与 README 的契约声明一致
- grep 验证：README 中不包含 "nearest provider wins" / "nested provider wins" / "Inner wins"

### 测试结果（绿）

```
grep "nearest provider wins|nested provider wins|Inner wins" README.md  # No matches found
yarn build  # 绿：✓ built in 2.15s
```

### 关键约束遵守情况

| 约束 | 状态 |
|------|------|
| 只修改 README.md | ✓ |
| 明确写出 Theme 不支持嵌套 | ✓ 行 82 |
| 增加局部覆盖迁移说明（组件 theme prop） | ✓ 行 82 |
| 保留单层 wrapper 示例 | ✓ 行 75-78 |
| 保留组件 theme prop 示例 | ✓ 行 88-92 |
| 不残留 nearest/nested provider wins 语义 | ✓ grep 验证通过 |
| append 到 notepad（不覆盖） | ✓ |

## 2026-04-03: F1 Plan Compliance Audit

- Verdict: APPROVE
- Plan compliance confirmed against `.sisyphus/plans/theme-no-nesting.md` top-level tasks 1-6.
- `src/components/Theme/Theme.tsx` now rejects any nested provider via `hasThemeProvider` and stable error text `Nested Theme is not supported`.
- `src/components/Theme/useTheme.ts` still gives explicit `theme` prop priority over provider, and `tests/Theme.test.tsx` preserves that regression coverage.
- `src/dev/ComponentCatalog.tsx` renders `ThemeShowcase` outside `DevThemeRoot`, while `theme-root` still wraps the other showcase grid.
- `README.md` and Theme demo copy both state that Theme nesting is unsupported and recommend component `theme` prop for local override.
- Verification signals passed: `yarn test -- --silent --runInBand`, `yarn lint`, `yarn build`, `yarn test:ui --grep "Theme showcase"`.
- Residual banned wording search only matched negative Playwright assertions guarding against regressions; no user-facing/demo wording remains.

## 2026-04-03: F4 Scope Fidelity Check（deep）

- Verdict: APPROVE
- Scope-required items are all present with direct evidence:
  - Theme guard: `src/components/Theme/Theme.tsx` uses `hasThemeProvider` and throws `Nested Theme is not supported` on nested providers.
  - Regression tests: `tests/Theme.test.tsx` covers direct/different/same/deep/blank-outer nesting rejection and keeps explicit `theme` override path.
  - Demo isolation: `src/dev/ComponentCatalog.tsx` renders `ThemeShowcase` outside `DevThemeRoot`; `tests/ComponentCatalog.test.tsx` asserts `catalog-section-theme` is not under `theme-root` while `catalog-section-button` remains under it.
  - README wording: `README.md` states Theme nesting is unsupported and directs local override to component `theme` prop.
- Scope-boundary checks passed:
  - No Theme public API redesign observed (`src/index.ts`, `src/components/Theme/index.ts` exports remain stable).
  - No unrelated component theming rewrites detected in required evidence paths.
  - Residual nested-success wording is absent from src/README; only negative assertions remain in `tests/ui/component-catalog-code.spec.ts`.
- Validation executed:
  - `yarn test -- Theme.test.tsx` → PASS (13/13)
  - `yarn test -- PublicThemeMatrix.test.tsx` → PASS (12/12)
  - `yarn test -- ComponentCatalog.test.tsx` → PASS (17/17)
  - `yarn test:ui --grep "Theme showcase"` → PASS (1/1)
  - `yarn build` → PASS
- LSP diagnostics on touched files: no errors (only import-order info hints in test/catalog files)

## 2026-04-03: Public Theme Contract Synthesis（repo truth）

- Contract summary（after change）:
  - `Theme` provider is single-layer only: nested `<Theme>` is explicitly rejected at runtime.
    - Evidence: `src/components/Theme/Theme.tsx:31-33` checks parent context and throws `Nested Theme is not supported`.
    - Evidence: `tests/Theme.test.tsx:47-109` covers direct/different-name/same-name/deep/blank-outer nested rejection.
  - Explicit component `theme` prop remains the local override path and has higher priority than provider context.
    - Evidence: `src/components/Theme/useTheme.ts:18-22` returns explicit normalized theme first, otherwise falls back to context theme.
    - Evidence: `tests/Theme.test.tsx:37-45` asserts explicit prop wins over provider.
    - Evidence: `src/dev/ComponentCatalog.tsx:132-135,152-153` demo snippet/copy states explicit prop overrides provider and takes precedence.
  - Blank provider name does not inject a theme value but still counts as a provider boundary for nesting prohibition.
    - Evidence: `src/components/Theme/Theme.tsx:35-37` always sets `hasThemeProvider: true` for provider node, while `theme` is normalized.
    - Evidence: `tests/Theme.test.tsx:98-107,111-119,121-129` verifies blank outer provider still blocks nested provider and explicit prop path still works.
  - `Theme` renders wrapper DOM with className from `name`, while context value is normalized.
    - Evidence: `src/components/Theme/Theme.tsx:36,42` (`context.theme` uses `normalizeTheme(name)`, wrapper uses raw `name`).

- README/demo/test alignment check:
  - README states “Theme 不支持嵌套” and points local override to component `theme` prop.
    - Evidence: `README.md:82-92`.
  - Demo copy and code snippet state the same contract (no nesting support + explicit prop override).
    - Evidence: `src/dev/ComponentCatalog.tsx:126-136,147-153`.
  - Demo isolation keeps Theme section outside global dev theme wrapper, preventing accidental provider nesting semantics confusion.
    - Evidence: `tests/ComponentCatalog.test.tsx:203-223` (`catalog-section-theme` not inside `theme-root`, `catalog-section-button` still inside).
  - UI test guards against legacy nested-provider wording in Theme snippet.
    - Evidence: `tests/ui/component-catalog-code.spec.ts:56-59` negative assertions for `Inner wins` and `nearest nested provider wins`.

- Mismatch assessment:
  - No contract mismatch found among implementation, Theme-related tests, README, and demo copy for the target scope (nesting rule + explicit `theme` precedence).

## 2026-04-03: Theme Showcase Isolation Boundary Mapping

### Render Tree Structure

**File**: `src/dev/ComponentCatalog.tsx:362-393`

```
ComponentCatalog
└── <div data-testid="component-catalog">      (line 367)
    ├── <DevThemeRoot theme={theme}>          (line 368)
    │   └── <Theme name={themeDefinition.className}>  (themeSwitcher.tsx:44)
    │       └── <div data-testid="theme-root">        (themeSwitcher.tsx:45)
    │           ├── <header>                             (line 369-372)
    │           │   └── ThemeSwitcher
    │           └── <main>                               (line 374-388)
    │               └── cm-catalog__grid
    │                   ├── ButtonShowcase               (line 377) ← INSIDE theme-root
    │                   ├── RadioGroupShowcase           (line 378) ← INSIDE theme-root
    │                   ├── SelectShowcase               (line 379) ← INSIDE theme-root
    │                   ├── WindowShowcase               (line 382) ← INSIDE theme-root
    │                   ├── DockShowcase                 (line 383) ← INSIDE theme-root
    │                   ├── StartBarShowcase             (line 384) ← INSIDE theme-root
    │                   └── GridShowcase                 (line 385) ← INSIDE theme-root
    ├── </DevThemeRoot>                                  (line 389)
    └── <ThemeShowcase />                               (line 390) ← OUTSIDE theme-root
```

### Key Test-ID Regions

| testId | Location | Inside `theme-root`? | Locked by |
|--------|----------|---------------------|-----------|
| `theme-root` | `themeSwitcher.tsx:45` | N/A (container) | `ComponentCatalog.test.tsx:198-201` |
| `catalog-section-theme` | `ComponentCatalog.tsx:140` | **NO** | `ComponentCatalog.test.tsx:203-212` |
| `catalog-section-button` | `ComponentCatalog.tsx:101` | **YES** | `ComponentCatalog.test.tsx:214-223` |

### Evidence: Tests That Lock the Boundary

**1. `tests/ComponentCatalog.test.tsx:197-224`** — `describe('Theme showcase isolation boundary')`

```typescript
it('theme-root exists', () => {                        // line 198-201
  render(...);
  expect(screen.getByTestId('theme-root')).toBeInTheDocument();
});

it('catalog-section-theme is NOT inside theme-root (isolation boundary)', () => { // line 203-212
  render(...);
  const themeRoot = screen.getByTestId('theme-root');
  const themeSection = screen.getByTestId('catalog-section-theme');
  expect(themeRoot).not.toContainElement(themeSection);  // ← RED LINE: Theme outside
});

it('catalog-section-button IS still inside theme-root (reference baseline)', () => { // line 214-223
  render(...);
  const themeRoot = screen.getByTestId('theme-root');
  const buttonSection = screen.getByTestId('catalog-section-button');
  expect(themeRoot).toContainElement(buttonSection);      // ← GREEN LINE: Button inside
});
```

**2. `tests/ui/component-catalog-code.spec.ts:34-66`** — Playwright Theme showcase UI test

- Verifies Theme code region shows `cm-theme--win98` (line 54)
- Guards against residual nesting hint text (lines 57-58):
  - `not.toContainText('Inner wins')`
  - `not.toContainText('nearest nested provider wins')`

### Implementation vs Plan Intent Verification

| Plan Intent | Implementation | Evidence |
|-------------|-----------------|----------|
| header unchanged | header stays inside `DevThemeRoot` | `ComponentCatalog.tsx:369-372` |
| Theme showcase rendered before `DevThemeRoot` | `ThemeShowcase` at line 390, after `</DevThemeRoot>` | `ComponentCatalog.tsx:389-390` |
| Remaining showcase grid rendered inside `theme-root` | All other showcases inside `main > cm-catalog__grid` | `ComponentCatalog.tsx:374-388` |
| `theme-root` testid stable | `data-testid="theme-root"` unchanged | `themeSwitcher.tsx:45` |
| `catalog-section-theme` testid stable | `data-testid="catalog-section-theme"` unchanged | `ComponentCatalog.tsx:140` |
| `catalog-section-button` testid stable | `data-testid="catalog-section-button"` unchanged | `ComponentCatalog.tsx:101` |

### Plan Compliance Verdict

**APPROVE** — The implementation matches the plan intent exactly:

1. **Structure**: `ThemeShowcase` is rendered AFTER `DevThemeRoot` closes (line 390), making it a sibling of `DevThemeRoot` under `component-catalog`, not a child
2. **Isolation**: `catalog-section-theme` is confirmed OUTSIDE `theme-root` via `not.toContainElement` assertion (ComponentCatalog.test.tsx:211)
3. **Baseline**: `catalog-section-button` is confirmed INSIDE `theme-root` via `toContainElement` assertion (ComponentCatalog.test.tsx:222)
4. **All 17 tests pass**: `yarn test -- ComponentCatalog.test.tsx` → 17 passed

## 2026-04-03: F5 - Forbidden Wording Verification (Final)

### Search Scope
Exhaustively searched all source, test, demo, and doc files for forbidden phrases implying nested Theme support or "nearest provider wins" semantics.

### Forbidden Phrases Searched
- `nearest` / `innermost` / `inner wins` / `Inner wins`
- `nested provider` / `provider wins`
- `support nesting` / `allow nesting` / `nesting support`
- `Nested Theme is not supported` (error message - correct)

### Findings

**Zero forbidden wording in source, demo, or doc files.**

Only occurrences are legitimate:
| File | Line | Type | Status |
|------|------|------|--------|
| `src/components/Theme/Theme.tsx` | 32 | Guard implementation (`throw new Error('Nested Theme is not supported')`) | ✓ CORRECT |
| `tests/Theme.test.tsx` | 57,69,81,95,107 | Test assertions expecting guard to throw | ✓ CORRECT |
| `tests/ui/component-catalog-code.spec.ts` | 57-58 | **Negative regression guards** (`not.toContainText`) asserting forbidden wording does NOT appear | ✓ CORRECT |
| `src/dev/ComponentCatalog.tsx` | 147-149 | Prose stating nesting is NOT supported | ✓ CORRECT |

### Additional Verification
- `ast_grep_search` for nested Theme JSX patterns in `src/`: **No matches**
- `THEME_SNIPPET` (ComponentCatalog.tsx:126-136): Contains only single-level Theme wrapper examples, no nesting
- README.md:82 states "Theme 不支持嵌套" (Theme does not support nesting)
- grep `support.*nest|allow.*nest|nest.*support`: **No matches**

### Conclusion
All forbidden copy implying nested-success semantics has been eliminated. The only "Nested Theme is not supported" strings are:
1. The runtime guard that enforces the no-nesting contract
2. Tests asserting the guard fires correctly
3. Negative UI regression guards ensuring the old wording never reappears in demo snippets

## 2026-04-03: F4 Scope Fidelity Check — deep（plan-locked rerun）

### Verdict

- `APPROVE`

### Required scope evidence（against `.sisyphus/plans/theme-no-nesting.md`）

1. **Nested-provider rejection contract is implemented**
   - `src/components/Theme/Theme.tsx:31-33` — nested provider path throws `new Error('Nested Theme is not supported')`
   - `src/components/Theme/Theme.tsx:35-37` — provider always sets `hasThemeProvider: true`, preserving blank-outer-provider boundary handling
   - `tests/Theme.test.tsx:47-109` — direct/different-name/same-name/deep/blank-outer nested rejection scenarios all assert the stable error phrase

2. **Explicit `theme` prop precedence is preserved**
   - `src/components/Theme/useTheme.ts:18-22` — explicit normalized `theme` returns before context fallback
   - `tests/Theme.test.tsx:37-45` — explicit prop overrides provider test remains
   - `tests/PublicThemeMatrix.test.tsx:84-100` — provider + explicit override coexistence still covered (group override + child inheritance)

3. **Theme showcase is isolated from `DevThemeRoot`**
   - `src/dev/ComponentCatalog.tsx:368-390` — `DevThemeRoot` wraps header/main grid only; `ThemeShowcase` rendered outside as sibling
   - `src/dev/themeSwitcher.tsx:44-46` — `theme-root` boundary remains in `DevThemeRoot`
   - `tests/ComponentCatalog.test.tsx:203-223` — asserts `catalog-section-theme` is outside `theme-root`, while `catalog-section-button` remains inside

4. **README + demo wording aligned to no-nesting contract**
   - `README.md:82` — explicit statement: `Theme` does not support nesting
   - `src/dev/ComponentCatalog.tsx:147-153` — demo prose says nested Theme unsupported and explicit `theme` prop takes precedence
   - `src/dev/ComponentCatalog.tsx:126-136` — snippet shows only single-level wrapper + explicit prop override example (no nested success semantics)

### No-scope-creep evidence

1. **No Theme API redesign / export surface expansion**
   - `src/index.ts:1-6` — public exports remain the same shape
   - `src/components/Theme/index.ts:1-4` — Theme module exports unchanged in structure

2. **No broad theming refactor across unrelated components**
   - `grep hasThemeProvider` only matches `src/components/Theme/Theme.tsx:5,15,31,36` (localized guard implementation)
   - `tests/PublicThemeMatrix.test.tsx:39-151` remains regression coverage; no evidence of unrelated component theming behavior rewrite in audited scope files

3. **No residual nested-success wording in user-facing/demo/docs scope**
   - repo grep for `nearest nested provider wins|nearest provider wins|Inner wins|innermost provider wins` finds only negative assertions in `tests/ui/component-catalog-code.spec.ts:57-58`
   - no positive nested-success wording in `README.md` or `src/dev/ComponentCatalog.tsx`

### Concerns

- None. Within audited plan scope, no missing required item and no confirmed scope creep.


## 2026-04-03: F1 Plan Compliance Audit（oracle reread）

- Verdict: APPROVE
- Plan reread against `.sisyphus/plans/theme-no-nesting.md` confirms tasks 1-6, Must Have, Must NOT Have, and Definition of Done stay aligned with current implementation.
- `src/components/Theme/Theme.tsx:31-37` rejects any nested provider with stable text `Nested Theme is not supported`, while keeping normalized context + raw wrapper class behavior.
- `src/components/Theme/useTheme.ts:14-22` still preserves explicit component `theme` prop precedence over provider context.
- `tests/Theme.test.tsx:47-129` covers direct/different/same/deep/blank-outer nesting rejection plus explicit override and blank-provider support paths.
- `src/dev/ComponentCatalog.tsx:138-165,367-390` keeps Theme showcase copy on “不支持嵌套 / explicit prop override” and renders `ThemeShowcase` outside `DevThemeRoot`.
- `tests/ComponentCatalog.test.tsx:197-223` locks `catalog-section-theme` outside `theme-root` while `catalog-section-button` remains inside.
- `tests/ui/component-catalog-code.spec.ts:52-59` guards Theme snippet visibility and forbids residual `Inner wins` / `nearest nested provider wins` wording.
- `README.md:80-92` matches the demo contract: single-layer Theme only, local override via component `theme` prop.
- Existing notepad verification evidence still covers DoD command pass: `yarn test -- Theme.test.tsx`, `yarn test -- PublicThemeMatrix.test.tsx`, `yarn test -- ComponentCatalog.test.tsx`, `yarn test:ui --grep "Theme showcase"`, `yarn lint`, `yarn build`.
