## MODIFIED Requirements

### Requirement: Dev entrypoint MUST switch themes via constants
The development entrypoint MUST select which theme component to mount using code-level constants, MUST NOT hardcode direct mounting of only `Win98Theme`, and MUST use a single default theme constant when no explicit theme selection is provided.

#### Scenario: Constant selects Win98 theme
- **WHEN** the active theme constant is set to `win98`
- **THEN** the entrypoint mounts `Win98Theme`

#### Scenario: Constant selects WinXp theme
- **WHEN** the active theme constant is set to `winxp`
- **THEN** the entrypoint mounts `WinXpTheme`

#### Scenario: Constant selects Default theme
- **WHEN** the active theme constant is set to `default`
- **THEN** the entrypoint mounts `DefaultTheme`

#### Scenario: No explicit theme uses default constant
- **WHEN** `DevThemeRoot` is rendered without an `activeTheme` argument
- **THEN** the mounted theme is determined by the shared default theme constant

### Requirement: Default dev theme MUST be WinXp and come from one source of truth
The system MUST define `default` as the default development theme, and development entrypoints MUST derive that default from the shared theme-switch module instead of redefining fallback values in each entrypoint.

#### Scenario: Default theme resolves to Default
- **WHEN** the shared default theme constant is evaluated
- **THEN** its value is `default`

#### Scenario: Entrypoint inherits default from theme switcher
- **WHEN** `main.tsx` renders `DevThemeRoot` without passing `activeTheme`
- **THEN** runtime behavior uses the same default theme constant exported by the theme-switch module

### Requirement: Test suite MUST verify default theme rendering path
The test suite MUST include a case that renders `DevThemeRoot` without `activeTheme` and verifies that the default `DefaultTheme` branch is rendered.

#### Scenario: No activeTheme renders Default branch
- **WHEN** a test renders `<DevThemeRoot />` without an `activeTheme` prop
- **THEN** `DefaultTheme` markers are present and non-default theme markers are absent

### Requirement: System MUST provide WinXpTheme as selectable theme
The system MUST provide `WinXpTheme` and `DefaultTheme` as selectable themes that can be mounted by the development entrypoint using the same theme-switching mechanism as `Win98Theme`.

#### Scenario: WinXpTheme is available for selection
- **WHEN** theme options are evaluated by the theme switch component
- **THEN** `WinXpTheme` appears as a valid mount target

#### Scenario: DefaultTheme is available for selection
- **WHEN** theme options are evaluated by the theme switch component
- **THEN** `DefaultTheme` appears as a valid mount target
