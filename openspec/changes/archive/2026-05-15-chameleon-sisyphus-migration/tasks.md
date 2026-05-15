# Tasks Summary

## Completed Plans

### chameleon-pure-component-library-refactor (COMPLETED)

- [x] 1. Reset public API surface to pure component-library exports
- [x] 2. Refactor theme contract to pure themes without system roots
- [x] 3. Remove manager and screen abstractions while preserving standalone components
- [x] 4. Rebuild dev demo as a themeable component catalog
- [x] 5. Refactor Playwright harnesses and UI tests to pure-theme standalone fixtures
- [x] 6. Rewrite Jest coverage around standalone components and breaking API removal
- [x] 7. Update docs and project knowledge to match the new component-library definition
- [x] 8. Clean dependencies, CI expectations, and release verification around the new model

---

### theme-no-nesting (COMPLETED)

- [x] 1. 以 TDD 重写 Theme 嵌套契约测试
- [x] 2. 补强 Theme 支持路径与空白 provider 回归保护
- [x] 3. 在 Theme provider 中实现统一的嵌套守卫
- [x] 4. 为 Theme showcase 隔离补齐红灯测试
- [x] 5. 重构 Demo 结构并移除嵌套示例文案
- [x] 6. 同步 README 的 Theme 契约说明

---

### theme-demo-usage (COMPLETED)

- [x] 1. 扩充 ComponentCatalog 测试以锁定 Theme section 契约
- [x] 2. 在 ComponentCatalog 中实现独立 Theme showcase
- [x] 3. 补齐 catalog code disclosure 的 UI 自动化覆盖

---

### demo-code-display (COMPLETED)

- [x] 1. Create dev-only disclosure primitive
- [x] 2. Integrate disclosure into `ShowcaseSection`
- [x] 3. Wire explicit snippets for Button, RadioGroup, and Select
- [x] 4. Wire explicit snippets for Window, Dock, StartBar, and Grid
- [x] 5. Add Playwright coverage for catalog code disclosure
- [x] 6. Run full validation and capture evidence

---

### scrollarea-scrollbar (COMPLETED)

- [x] 1. Lock ScrollArea API and DOM contract
- [x] 2. Build metric sync engine and axis math
- [x] 3. Add ScrollArea Playwright harness and helpers
- [x] 4. Restructure ScrollArea layout and hide native scrollbars
- [x] 5. Implement vertical custom scrollbar with button stepping and drag
- [x] 6. Implement horizontal custom scrollbar with button stepping and drag
- [x] 7. Add dual-axis corner, theme styling, and interaction edge cleanup
- [x] 8. Update demos and run full ScrollArea regression suite

---

### window-drag-resize-preview (COMPLETED)

- [x] 1. Freeze public API and preview-state contract
- [x] 2. Render a non-interactive outline preview frame and theme hooks
- [x] 3. Implement outline move behavior with release-only commit
- [x] 4. Implement outline resize behavior with constrained preview rect
- [x] 5. Wire demo fixtures and preview-aware test helpers
- [x] 6. Complete automated regression coverage and ship gate

---

### menu-component (COMPLETED)

- [x] 1. Define the CMenu public contract and export surface
- [x] 2. Implement root click-trigger lifecycle and leaf selection flow
- [x] 3. Implement recursive submenu rendering and hover semantics
- [x] 4. Add menu styling plus deterministic dev and Playwright surfaces
- [x] 5. Finalize release-facing integration, changelog, and full regression

---

### cicon-components (COMPLETED)

- [x] 1. 定义共享契约与 Icon 目录骨架
- [x] 2. 实现 CIcon 渲染表面与主题样式
- [x] 3. 实现 CIcon 的 active / open / contextmenu 触发语义
- [x] 4. 实现 CIconContainer 的默认值合并与状态托管
- [x] 5. 集成 multi-drag、触摸长按与卸载清理保护
- [x] 6. 接入导出、Catalog 展示与全链路验证

---

## In-Progress Plans

### window-title-action-buttons (NOT STARTED)

- [ ] 1. 锁定 `WindowTitle` 新 API 与组件级契约
- [ ] 2. 实现标题栏 controls DOM、位置切换与拖动隔离
- [ ] 3. 为 `default`、`win98`、`winxp` 三套主题补齐左右 controls 布局
- [ ] 4. 更新 catalog Window demo：三按钮 no-op 动作区 + 左右切换
- [ ] 5. 扩展 Playwright harness 与独立 UI spec 覆盖左右位置和 no-op 点击
- [ ] 6. 执行 TDD 回归、清理重复并固定最终验证命令

---

### cbutton-group-separator (NOT STARTED)

- [ ] 1. Define `CButtonGroup` / `CButtonSeparator` public contracts and export surface
- [ ] 2. Implement grouped child classification and button position markers
- [ ] 3. Implement group-level `variant` / `disabled` inheritance for direct buttons
- [ ] 4. Implement `CButtonSeparator` orientation logic and group-aware propagation
- [ ] 5. Add grouped-button and separator theme styling across all shipped themes
- [ ] 6. Integrate catalog, common-controls harness, and UI regression coverage

---

## Verification Commands

```bash
# Unit tests
yarn test

# UI tests
yarn test:ui

# Lint
yarn lint

# Build
yarn build

# Full regression
yarn lint && yarn test && yarn test:ui && yarn build
```
