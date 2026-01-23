# Research: Theme & Window Behavior Refinements

## Decision: Theme-driven default props for behavior

- **Decision**: Add a theme-level behavior config entry (e.g., `theme.components.window` or `theme.behavior.windowDefaults`) that supplies default props such as `interactionMode`, `movable`, `resizable` for Window-like components.
- **Rationale**: Large React component libraries centralize default props in the theme to provide global behavioral defaults while allowing component props to override them. This keeps behavior consistent across the system and avoids ad-hoc defaults.
- **Alternatives considered**:
  - Hardcode defaults inside each component (less flexible, inconsistent across theme scopes).
  - Separate context flag per component (more boilerplate; harder to version with theme changes).

**Sources**:
- MUI theme components `defaultProps`: [MUI theme components defaultProps](https://github.com/mui/material-ui/blob/master/docs/data/material/customization/theme-components/theme-components.md)
- MUI example defaultProps usage: [MUI example defaultProps usage](https://github.com/mui/material-ui/blob/7a32c455273a4c669c9d21915f7939ae37e51aa4/docs/data/material/customization/theme-components/DefaultProps.tsx)

## Decision: Theme-scoped overrides for behavior & visuals

- **Decision**: Apply behavior defaults through ThemeProvider scope (theme object), and apply visual overrides through theme-specific SCSS using CSS variables under `.cm-theme-root[data-cm-theme='...']`.
- **Rationale**: This matches the project’s existing token-to-CSS-variable pipeline and keeps behavior configuration co-located with theme selection. Libraries like Ant Design support nested provider themes for scoped behavior/visual overrides.
- **Alternatives considered**:
  - Global CSS overrides without theme scoping (breaks multi-theme support).
  - Runtime style injection in components (conflicts with project’s no CSS-in-JS rule).

**Sources**:
- Ant Design theme provider (ConfigProvider) and per-component overrides: [Ant Design theme provider (ConfigProvider)](https://github.com/ant-design/ant-design/blob/master/docs/react/customize-theme.en-US.md)
- Ant Design component-level theme override example: [Ant Design component-level theme override example](https://context7.com/ant-design/ant-design/llms.txt)

## Decision: Window drag interaction modes remain `static` vs `follow`

- **Decision**: Keep the two interaction modes already present (`static` vs `follow`) and surface them via theme-driven defaults (Win98 → `static`, WinXP → `follow`).
- **Rationale**: The Window component already supports both modes; using theme defaults keeps behavior consistent without changing core algorithms. This directly satisfies FR-009/FR-010.
- **Alternatives considered**:
  - Introduce a new drag mode type (adds complexity and new tests).
  - Keep behavior hardcoded per theme class (harder to maintain and test).

**Sources**:
- Internal implementation: [src/components/Window.tsx](src/components/Window.tsx) (InteractionMode `'static' | 'follow'`)

## Decision: SubMenu and Modal theme alignment via theme overrides

- **Decision**: Align SubMenu (DropDownMenu) and Modal styles via theme-specific SCSS overrides using CSS variables, ensuring consistency with Window tokens.
- **Rationale**: Current base styles are hardcoded; the project already provides theme override files for menus and modal. Extending these aligns with the existing theming architecture and avoids CSS-in-JS.
- **Alternatives considered**:
  - Move all styles into component-level inline styles (disallowed by project rules).
  - Add theme-aware logic in components (unnecessary given CSS variable system).

**Sources**:
- Existing theme overrides for menus and modal: `/home/zhangxiao/frontend/SysUI/chameleon/src/theme/win98/drop-down-menu.scss`, `/home/zhangxiao/frontend/SysUI/chameleon/src/theme/win98/modal.scss`
