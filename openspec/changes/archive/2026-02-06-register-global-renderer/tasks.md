## 1. Global Renderer Registry

- [x] 1.1 Add global renderer registry module with name uniqueness checks and subscribe/get snapshot helpers
- [x] 1.2 Implement `registerGlobalRenderer`/`unregisterGlobalRenderer` with typed overloads and exported props types

## 2. GlobalRender Component

- [x] 2.1 Implement `GlobalRender` component that resolves renderer by name and renders props
- [x] 2.2 Add theme-aware lookup (prefer `<themeId>:<name>` fallback to default name)

## 3. Window Title Renderer

- [x] 3.1 Introduce `WindowTitleRenderer` props type and default renderer implementation
- [x] 3.2 Update `Window` to render title bar via `GlobalRender name="window-title"`
- [x] 3.3 Add Win98/WinXP theme-specific title renderers and register them

## 4. Types, Exports, Tests

- [x] 4.1 Export new APIs/types from `src/components/index.ts` and `src/index.ts`
- [x] 4.2 Add tests for registry behavior, theme-specific resolution, and Window title rendering
- [x] 4.3 Run lint/test/build to verify no regressions
