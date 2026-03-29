# F2 Code Quality Review

## Verdict

REJECT

## Scope Reviewed

- `src/dev/themeSwitcher.tsx`
- `src/system/SystemHost.tsx`
- `src/system/default/DefaultSystem.tsx`
- `src/dev/main.tsx`
- `src/dev/playwright/windowHarness.tsx`
- `src/theme/default/styles/index.scss`
- `src/components/Select/Select.tsx`
- `src/system/registry.ts`
- `tests/SystemTypeSwitch.test.tsx`
- `tests/SystemHost.test.tsx`
- `tests/DefaultTheme.test.tsx`
- `tests/ui/default-window-system-switch.spec.ts`

## Checks Run

1. `grep` for `\bany\b|as any|@ts-ignore` across all touched TS/TSX files
2. `lsp_diagnostics` on reviewed TS/TSX files
3. `yarn lint`
4. `./node_modules/.bin/tsc --noEmit`
5. `yarn build`
6. Manual source review against existing component/style patterns

## What Passed

- No `any`, `as any`, or `@ts-ignore` usage was found in the reviewed TS/TSX files.
- `lsp_diagnostics` found no errors; only non-blocking import-order info appeared on some files.
- `yarn lint` passed.
- `./node_modules/.bin/tsc --noEmit` passed.
- `yarn build` passed. Output included existing Sass legacy API deprecation warnings only.
- `CSelect` adding an `id` prop is type-safe and improves label association in `src/components/Select/Select.tsx:10` and `src/components/Select/Select.tsx:54`.
- The UI test uses accessible querying via `page.getByLabel('切换系统')` in `tests/ui/default-window-system-switch.spec.ts:9`.

## Blocking Issues

1. Default title bar dropped its base class, causing a real style and layout regression.
   - `CWindowTitle` does not merge classes; passing `className` replaces the default `cm-window__title-bar` class in `src/components/Window/WindowTitle.tsx:66`.
   - `DefaultSystem` now passes only `cm-window__title-bar--with-controls` in `src/system/default/DefaultSystem.tsx:59`.
   - The actual title-bar visuals live on `.cm-window__title-bar` in `src/theme/default/styles/index.scss:25`, so the default window title bar no longer receives its base padding, gradient background, typography, or drag cursor.
   - The body/content rule `.cm-window > :not(.cm-window__title-bar)` now matches the title bar and applies content padding/background to it in `src/theme/default/styles/index.scss:67`.
   - This is inconsistent with existing class composition patterns that keep the base class and add a modifier, e.g. button classes in `src/components/Button/Button.tsx:26` and `src/components/Button/Button.tsx:29`.
   - The regression is masked by changing the test expectation to the modifier-only class in `tests/DefaultTheme.test.tsx:18`, instead of preserving the base-class contract.

2. The dev preview no longer remounts `CommonControlsPreview` after runtime system switches.
   - `mountCommonControlsPreview()` finds the first body host and creates a nested React root exactly once in `src/dev/main.tsx:11` and `src/dev/main.tsx:15`.
   - Runtime system switching now happens through local state in `src/dev/main.tsx:27`.
   - After the system shell remounts, the original host (`default-window-body` or `windows-window-body`) is replaced, but no effect reruns `mountCommonControlsPreview()` after selection changes in `src/dev/main.tsx:35` and `src/dev/main.tsx:48`.
   - Result: the dev entry can switch shells, but the common-controls preview is likely left mounted on a detached node while the new window body stays empty. This is a functional regression in the main preview flow.

## Non-Blocking Notes

- `DefaultSystem` reaches into the dev layer by importing `resolveDevSelectionForSystemType` from `src/dev/themeSwitcher.tsx:7`, while `src/dev/themeSwitcher.tsx:1` already depends on `src/system/SystemHost.tsx`, which depends back on `src/system/default/DefaultSystem.tsx:2`. This creates a dev↔system cycle and is worth removing even if it does not fail immediately.
- `handleSelectionChange` uses an unchecked cast from `string` to `SystemTypeDefinition['id']` in `src/system/default/DefaultSystem.tsx:46`. It works with current option sources, but it weakens the otherwise strict typing story.
- Using a `fieldset` without a `legend` in `src/system/default/DefaultSystem.tsx:64` is not a blocker because the select is correctly labeled, but a plain `div` would better match the actual semantics here.

## Evidence References

- `src/components/Window/WindowTitle.tsx:66`
- `src/system/default/DefaultSystem.tsx:46`
- `src/system/default/DefaultSystem.tsx:59`
- `src/system/default/DefaultSystem.tsx:64`
- `src/dev/main.tsx:11`
- `src/dev/main.tsx:15`
- `src/dev/main.tsx:27`
- `src/dev/main.tsx:35`
- `src/dev/main.tsx:48`
- `src/dev/themeSwitcher.tsx:1`
- `src/dev/themeSwitcher.tsx:7`
- `src/theme/default/styles/index.scss:25`
- `src/theme/default/styles/index.scss:43`
- `src/theme/default/styles/index.scss:67`
- `src/components/Button/Button.tsx:26`
- `src/components/Button/Button.tsx:29`
- `src/components/Select/Select.tsx:10`
- `src/components/Select/Select.tsx:54`
- `tests/DefaultTheme.test.tsx:18`
- `tests/ui/default-window-system-switch.spec.ts:9`

---

## Addendum — 2026-03-27 Win98 stylesheet audit

### Scope Reviewed

- `src/theme/win98/styles/index.scss`
- `src/components/Window/Window.tsx` (for selector-target validation only)

### Verdict

REJECT

### Assessment

1. **CSS 可维护性**
   - 大部分规则按组件块分组，且统一挂在 `.cm-system--windows.cm-theme--win98` 根作用域下，整体结构是清晰的（`src/theme/win98/styles/index.scss:1`，`src/theme/win98/styles/index.scss:11`，`src/theme/win98/styles/index.scss:65`，`src/theme/win98/styles/index.scss:121`，`src/theme/win98/styles/index.scss:166`，`src/theme/win98/styles/index.scss:214`）。
   - 但 `.cm-window > :not(.cm-window__title-bar)` 把“窗口正文”语义编码成了 DOM 位置 + 取反选择器，后续维护者很难一眼看出真正的样式承载节点，也不利于组件结构演进（`src/theme/win98/styles/index.scss:7`）。

2. **Selector safety**
   - **需要修复**：`.cm-window > :not(.cm-window__title-bar)` 过于宽泛且脆弱。
   - `CWindow` 会把组合后的 children 直接渲染为 `.cm-window` 的直接子节点（`src/components/Window/Window.tsx:434`-`src/components/Window/Window.tsx:440`）。这意味着只要不是标题栏的直接子节点，都会被当成“正文区域”自动吃到背景色；如果未来增加额外的直接子节点（例如状态条、工具条、附加容器），会被误伤。
   - 这个选择器同时依赖当前 DOM 层级；一旦窗口内容外面多包一层显式容器，现有规则就会失效或命中错误节点。

3. **Cross-theme bleed**
   - 未发现明显跨主题泄漏。所有规则都嵌套在 `.cm-system--windows.cm-theme--win98` 下，正常情况下不会漂移到 `default` 或 `winxp` 主题（`src/theme/win98/styles/index.scss:1`）。
   - 当前风险不是“跨主题泄漏”，而是 Win98 主题内部对 `.cm-window` 任意直接子节点的误命中。

4. **Browser-dependent hacks**
   - 未发现浏览器专属 hack。文件使用的是标准 `appearance: none`、渐变背景、`:focus-visible`/`:focus` 等常规 CSS 能力，没有 vendor-specific hack、星号 hack、下划线 hack 或 UA 定向分支（`src/theme/win98/styles/index.scss:137`，`src/theme/win98/styles/index.scss:173`-`src/theme/win98/styles/index.scss:185`）。

### Must-Fix Issues

1. 将 `.cm-window > :not(.cm-window__title-bar)` 替换为显式内容钩子（例如 `.cm-window__body` / `.cm-window__content`），并在窗口渲染结构中稳定提供该节点；不要再用 `:not(...)` + 直接子代关系表达窗口正文。

### Evidence References

- `src/theme/win98/styles/index.scss:1`
- `src/theme/win98/styles/index.scss:7`
- `src/theme/win98/styles/index.scss:11`
- `src/theme/win98/styles/index.scss:65`
- `src/theme/win98/styles/index.scss:121`
- `src/theme/win98/styles/index.scss:166`
- `src/theme/win98/styles/index.scss:214`
- `src/components/Window/Window.tsx:434`
- `src/components/Window/Window.tsx:440`
