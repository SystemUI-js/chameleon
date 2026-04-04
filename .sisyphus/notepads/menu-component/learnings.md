# Learnings

## 2026-04-04 Task 4-5 repo patterns

- Component SCSS pattern is local `index.scss` with flat BEM-style class names under `src/components/<Component>/index.scss`; reference: `src/components/Button/index.scss`.
- Theme overrides belong in all three shipped theme files and are scoped under `.cm-theme--default`, `.cm-theme--win98`, `.cm-theme--winxp`; reference: `src/theme/default/styles/index.scss`, `src/theme/win98/styles/index.scss`, `src/theme/winxp/styles/index.scss`.
- Dev catalog sections use `ShowcaseSection` + snippet constants + local selection/readout state; reference: `src/dev/ComponentCatalog.tsx`.
- Playwright harness pattern uses query-param route parsing, fixture switch with explicit `fixture-error`, and `DevThemeRoot` wrapper; reference: `src/dev/playwright/commonControlsHarness.tsx` and `playwright-common-controls.html`.
- UI helper/spec pattern lives under `tests/ui`, with helper functions building themed fixture URLs and smoke tests asserting stable `data-testid` selectors; reference: `tests/ui/common-controls.helpers.ts` and `tests/ui/common-controls.smoke.spec.ts`.
- Changelog format under `### [UnReleased]` uses `- **Feature:** ...` bullets with indented detail lines; reference: `CHANGELOG.md`.
- Full release verification commands come from `package.json`: `yarn lint`, `yarn test`, `yarn test:ui`, `yarn build`; Playwright config points to `tests/ui` and Vite dev server on port 5673.

## 2026-04-04 Task 1-3 repo patterns

- Component props/types are exported from the component file itself, and function components explicitly return `React.ReactElement`; references: `src/components/Button/Button.tsx`, `src/components/Select/Select.tsx`.
- Theme handling pattern is local `resolveThemeClass(theme)` + `useTheme()` + `mergeClasses(baseClasses, resolvedTheme, className)` with class order `base → theme → className`; references: `src/components/Button/Button.tsx`, `src/components/Select/Select.tsx`, `src/components/Theme/mergeClasses.ts`.
- Barrel export pattern is `export * from './X/X'` in `src/components/index.ts`, plus package-root re-exports from `src/index.ts`.
- The repo currently has no `React.Children.only` usage; `CMenu` must introduce it for single-trigger enforcement.
- The repo currently has no reusable click-outside helper in active source; plan-aligned outside dismissal must be implemented directly, guided only by prior changelog notes about closing the full menu tree on outside click.
- Disabled behavior patterns rely on native disabled props plus `--disabled` class modifiers, and disabled interactions must not fire callbacks; references: `src/components/Radio/Radio.tsx`, `tests/Button.test.tsx`.
- Test patterns for package entry export checks, theme propagation, class merge assertions, and callback payload assertions live in `tests/Button.test.tsx` and `tests/Select.test.tsx`.
- Recursive rendering patterns are scarce; `src/components/Widget/Widget.tsx` shows `React.Children.map`/`React.cloneElement` composition, but menu recursion will need an explicit render function.
- Must preserve `id` as internal identity and keep public `key` unchanged in callback payloads.

## 2026-04-04 Task 1 CMenu scaffold implementation

- `React.Children.only()` requires `import React from 'react'` (not `import type`), because it accesses `React.Children` at runtime. Other components like Button.tsx and Select.tsx use `import type React` because they only use React for JSX transformation and type annotations, not runtime API calls.
- Empty interfaces for marker types (like `CMenuTrigger` and `MenuListItem` with no properties) violate `@typescript-eslint/no-empty-interface`. These marker interfaces were excluded from the initial implementation; future tasks can add them if needed with actual properties.
- `CMenu` uses `data-menu-state="closed"` attribute on the wrapper div to provide a deterministic default state marker suitable for future state management tasks.
- Theme resolution helper pattern `resolveThemeClass(theme)` prepends `cm-theme--` if not already present, consistent with Button/Select implementations.

## 2026-04-04 Task 1 CMenu public contract (revised)

- `CMenuTrigger` interface has `type: 'trigger'` field to satisfy non-empty interface requirement while serving as a marker type.
- `MenuListItem` interface has recursive structure: `id`, `key?`, `title`, `children?`, `trigger?`, `disabled?` - sufficient for future task tree rendering.
- `CMenuProps` includes `children: React.ReactElement` (narrowed from `React.ReactNode` for single child), `menuList?`, `root?`, `onSelect?`, plus existing `className`, `theme`, `data-testid`.
- Unused future-task parameters (`menuList`, `onSelect`) use underscore prefix rename pattern (`menuList: _menuList`) to satisfy `no-unused-vars` rule while preserving public API shape.

## 2026-04-04 Task 1 CMenu contract corrections

- `CMenuTrigger` is `export type CMenuTrigger = React.ReactElement` (type alias, not interface with a `type` field).
- `MenuListItem.trigger` is `'click' | 'hover'` (union string literal, not boolean).
- `CMenuProps.trigger` is `'click' | 'hover'` (root trigger mode, not `root?: string`).
- `CMenuProps.onSelect` is `(item: MenuListItem) => void` (receives full item, not just `id: string`).
- `CMenuProps.children` is typed as `CMenuTrigger` (the type alias).
- Removed `data-menu-root` attribute from wrapper div (no longer part of contract).

## 2026-04-04 Task 1 final contract fix

- `CMenuProps.menuList` is now required (not optional) per plan line 65: `readonly MenuListItem[]`.
- `MenuListItem.key` is now required (not optional) per plan line 66: `key` is listed alongside `id`, `title` as part of the public item shape.
- All test renders now supply `menuList` explicitly; `SAMPLE_MENU_LIST` includes required `key` field.

## 2026-04-04 Task 1 test TypeScript fix

- JSX syntax cannot test multiple children rejection because `children: CMenuTrigger` is a strict single-child type; JSX type checker rejects multiple children at compile time before runtime can test the behavior.
- Fixed by using `React.createElement` with `children` props cast to `CMenuProps` - this bypasses JSX type checking but still passes multiple runtime children to test `React.Children.only` throwing.
- Added `import React from 'react'` to enable `React.createElement` usage in tests.

## 2026-04-04 Task 3 recursive submenu + hover semantics

- Recursive submenu rendering is implemented with an explicit `renderItems(items, depth, parentTrigger)` function, passing `effectiveTrigger = item.trigger ?? parentTrigger` down each subtree.
- Open branches are tracked by `openBranchByDepth: string[]` where each depth stores exactly one open `id`; opening/toggling a branch truncates deeper levels to keep a single active path per depth.
- Parent items with `children` never call `onSelect`; only leaf items call `onSelect(item)` and then close the full tree via shared `closeAllMenus()`.
- Disabled parent items guard both click and hover-open handlers, so child menus are never exposed when parent is disabled.
- Root hover mode uses pointer semantics: trigger `onPointerEnter` opens root, and root wrapper `onPointerLeave` closes the composed trigger+popup tree immediately (no delay/tolerance).

## 2026-04-04 plan compliance follow-up

- `id` is used as internal identity (branch state + React list rendering key), while public `key` remains part of `MenuListItem` payload and must be preserved unchanged in `onSelect(item)` callbacks.

## 2026-04-04 Task 2 click lifecycle and leaf selection

- Root menu click lifecycle works best when trigger toggles `isRootOpen` and also resets `openBranchByDepth`, avoiding stale expanded branches after re-open.
- Outside-dismiss can be implemented directly with `document.mousedown` + `rootRef.contains(target)` guard; no shared helper is needed in this repo.
- Keep internal render identity on `item.id` (`<li key={item.id}>`) while preserving public callback payload shape on leaf select (`onSelect(item)` keeps `key` unchanged).
- Parent items only manage branch expansion/collapse; only non-disabled leaf items invoke `onSelect` and then close the root menu; disabled leaves remain inert.

## 2026-04-04 Task 4 retry selector fixes

- The planned stable selector contract requires both click and hover fixtures to expose the SAME selector names: `menu-demo-trigger`, `menu-demo-popup`, `menu-item-file`, `menu-item-file-new`, `menu-item-file-open`, `menu-item-view`, `menu-item-view-zoom`, `menu-selection-value`, `fixture-error`.
- Hover fixture must NOT use `menu-demo-trigger-hover` or `menu-selection-value-hover` - it should reuse the exact same stable IDs as click fixture.
- Menu.tsx data-testid generation uses `menu-item-${item.id}` (NOT `cm-menu-item-${item.id}`) to match the planned selector contract.
- Menu.tsx imports `./index.scss` to bring in structural styles.
- Theme visual overrides live in `.cm-theme--default`, `.cm-theme--win98`, `.cm-theme--winxp` blocks in each theme's `index.scss`.
- The `cm-menu__popup` div wrapper with `data-testid="menu-demo-popup"` provides the stable popup selector when the menu is open.
- `mergeClasses` signature is `(baseClasses: string[], theme?: string, className?: string) => string` - the first argument MUST be a `string[]`, not individual string arguments.
- When calling `mergeClasses` with conditional class names, wrap them in an array and filter out falsy values: `['cm-menu__item', item.disabled ? 'cm-menu__item--disabled' : undefined].filter((c): c is string => c !== undefined)`.
- Duplicate caret issue: Menu.tsx renders `<span className="cm-menu__caret">▸</span>` as a real element. Theme SCSS should NOT also add `::after { content: '▸'; }` on `.cm-menu__item-button--parent` since that causes double caret. Fixed by replacing `::after` with `.cm-menu__caret { margin-left: 8px; }` in all three theme files - keeping spacing/style on the real element.
- Favicon 404 fix: add `<link rel="icon" href="data:," />` to `playwright-menu.html` head to suppress browser default favicon request.
- Hover trigger bug: `CMenu` uses `React.cloneElement` to inject `onPointerEnter` into trigger children. But `CButton` did not accept or forward `onPointerEnter`, so the event never reached the DOM. Fixed by adding `onPointerEnter?: React.PointerEventHandler<HTMLButtonElement>` to `CButtonProps` interface and forwarding it to the underlying `<button>` element.
- SCSS state surface completeness: runtime-emitted state classes (like `cm-menu__item--disabled`, `cm-menu__item--open`) must be defined in the base component SCSS even if they have no styles, otherwise the formal styling surface is incomplete. Added empty `.cm-menu__item--disabled` and `.cm-menu__item--open` selectors to `src/components/Menu/index.scss`.

## 2026-04-04 Task 5 release-facing integration

- `CMenu` 父级菜单按钮包含可见 caret 文本（如 `Parent 1 ▸`），`getByRole(..., { name: 'Parent 1' })` 会与实际可访问名不一致；为保持回归稳定性，优先使用已约定的 `data-testid="menu-item-*"` 选择器。
- 发布验证链路以仓库脚本为准：`yarn lint`、`yarn test`、`yarn test:ui`、`yarn build`，并补充构建后 ESM 导出烟雾校验，确保 `dist/chameleon.es.js` 暴露 `CMenu`。

## 2026-04-04 Task 5 rejection repair

- 清理 QA 产物前必须先区分 tracked/untracked：仅可删除 untracked 的手工临时文件；若路径已被 Git 跟踪（tracked），必须保留或从 HEAD 精确还原，避免超范围变更。
