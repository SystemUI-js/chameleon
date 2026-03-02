# dev-theme-selection Specification

## Purpose
TBD - created by archiving change refactor-screen-manager-theme-switch. Update Purpose after archive.

## Requirements
### Requirement: Dev entrypoint MUST switch themes via constants
The development entrypoint MUST select which theme component to mount using code-level constants, and MUST NOT hardcode direct mounting of only `Win98Theme`.

#### Scenario: Constant selects Win98 theme
- **WHEN** the active theme constant is set to `win98`
- **THEN** the entrypoint mounts `Win98Theme`

#### Scenario: Constant selects WinXp theme
- **WHEN** the active theme constant is set to `winxp`
- **THEN** the entrypoint mounts `WinXpTheme`

### Requirement: System MUST provide WinXpTheme as selectable theme
The system MUST provide a `WinXpTheme` component that can be selected by the development entrypoint using the same theme-switching mechanism as `Win98Theme`.

#### Scenario: WinXpTheme is available for selection
- **WHEN** theme options are evaluated by the theme switch component
- **THEN** `WinXpTheme` appears as a valid mount target

### Requirement: Theme composition MUST keep CScreen declared inside theme
Theme components MUST declare `CScreen` within the theme component tree, and theme switching MUST preserve that composition constraint.

#### Scenario: Selected theme owns its screen declaration
- **WHEN** a theme component is mounted by the entrypoint switcher
- **THEN** the mounted theme's component tree contains its own `CScreen` declaration

### Requirement: Test suite MUST remove residual theme-context tests without implementation support
The test suite MUST remove or replace residual tests that assert unsupported ThemeContext behavior when no corresponding production implementation exists.

#### Scenario: Residual context test cleanup
- **WHEN** a theme-related test depends on non-existent `ThemeProvider` or `useTheme` APIs
- **THEN** that test is removed or replaced with tests aligned to constant-based theme switching behavior
