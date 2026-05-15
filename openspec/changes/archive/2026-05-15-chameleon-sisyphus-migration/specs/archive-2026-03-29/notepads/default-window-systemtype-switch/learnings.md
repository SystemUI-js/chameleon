# Task 5 Learnings: System Switch Behavior Tests

## What was done

Extended `tests/SystemTypeSwitch.test.tsx` and `tests/SystemHost.test.tsx` with comprehensive tests for:

1. Complete default→windows→default cycle with attribute verification
2. StartBar appearance after switching to windows
3. UUID changes proving remount
4. Invalid systemType/theme combination rejection

## Key findings

### Valid theme matrix (from registry.ts)

- `windows` system → `win98` or `winxp` only
- `default` system → `default` only

### Invalid combinations that must be rejected

- `windows` + `default` theme → throws
- `default` + `win98` theme → throws
- `default` + `winxp` theme → throws

### Test patterns

- Use `assertValidSystemThemeSelection()` from `src/system/registry` to test rejection
- Verify `data-system-type` and `data-theme` attributes on `screen-root`
- StartBar appears via `screen.getByTestId('windows-start-bar')` and vanishes via `screen.queryByTestId()`
- UUID change via `content.getAttribute('data-window-uuid')` proves remount

### Files modified

- `tests/SystemTypeSwitch.test.tsx`: +2 new describe blocks (system switch cycle + boundary assertions)
- `tests/SystemHost.test.tsx`: +1 new describe block (boundary assertions)

### Test results

- 19 tests pass (all SystemTypeSwitch + SystemHost)

## Task 6 Learnings: Real UI system switch coverage

### New UI coverage pattern

- 在 `tests/ui/default-window-system-switch.spec.ts` 使用 `gotoWindowSelection(page, { systemType: 'default', theme: 'default' })` 作为真实入口，避免直接 URL 注入。
- 用 `page.getByLabel('切换系统')` + `selectOption('windows')` 驱动真实下拉交互，覆盖 title bar 控件链路。
- 切换后同时断言 `page` URL（`systemType=windows`、`theme=win98`）与 `screen-root` 数据属性，确保路由与渲染状态同步。

### Stable assertions for this flow

- `windows-start-bar` 在切换后 `toBeVisible()`，切换前 `toHaveCount(0)`。
- `default-window-body` 在切换前 `toBeVisible()`，切换后 `toHaveCount(0)`，可稳定证明默认系统窗口已卸载。

### Validation execution note

- `yarn test:ui` 在当前环境首次执行出现 `ERR_CONNECTION_REFUSED`，补充显式 `yarn dev` 启动后重跑通过；其余 lint / jest / build 均通过。

## 2026-03-26 F2 Review Learnings

### Title bar class composition

- `CWindowTitle` 的 `className` 是“替换”而不是“追加”语义，传 modifier 类时必须保留基础类，或者由组件内部负责 class merge。
- 这类 `--modifier` 命名应沿用现有模式：像 `src/components/Button/Button.tsx:26` / `src/components/Button/Button.tsx:29` 一样保留 base class，再叠加 modifier，避免样式和选择器约束一起失效。

### Nested preview root lifecycle

- `src/dev/main.tsx` 这种通过 DOM 查询再 `createRoot()` 挂载子预览的模式，遇到宿主节点随 system remount 替换时，必须把挂载逻辑绑到 owner state 变化上，并显式处理旧 root 的卸载。
- 仅把 `DevSystemRoot` 改成 stateful owner 不够；凡是依附于 `default-window-body` / `windows-window-body` 的附加预览都要随切换重挂载。

## 2026-03-26 F3 Real UI QA Learnings

### End-to-end behavior observed in live preview

- `default/default` 页面上的 `切换系统` combobox 可被 `getByRole('combobox', { name: '切换系统' })` 稳定命中，说明无障碍命名链路成立。
- 通过真实下拉选择 `Windows` 后，URL、`screen-root` 的 `data-system-type` / `data-theme`、`windows-start-bar`、`default-window-body` 卸载和 `data-window-uuid` remount 都符合计划预期。

### Critical product gap

- 回切入口只存在于 `src/system/default/DefaultSystem.tsx`。一旦进入 `windows` 系统，页面上不再存在可见的 `切换系统` combobox，无法通过真实 UI 完成 `windows -> default`。
- 现有 `tests/ui/default-window-system-switch.spec.ts` 只覆盖单向切换，因此即便 spec 通过，也不足以证明 F3 所要求的完整往返体验。
