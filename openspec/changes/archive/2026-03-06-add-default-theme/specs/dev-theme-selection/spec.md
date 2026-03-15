## MODIFIED Requirements

### Requirement: Dev entrypoint MUST switch themes via constants
The development entrypoint MUST select which theme component to mount using code-level constants, MUST NOT hardcode direct mounting of only `Win98Theme`, and MUST use a single default theme constant when no explicit theme selection is provided.

#### Scenario: Constant selects Win98 theme
- **WHEN** the active theme constant is set to `win98`
- **THEN** the entrypoint mounts `Win98Theme`

#### Scenario: Constant selects WinXp theme
- **WHEN** the active theme constant is set to `winxp`
- **THEN** the entrypoint mounts `WinXpTheme`

#### Scenario: No explicit theme uses default constant
- **WHEN** `DevThemeRoot` is rendered without an `activeTheme` argument
- **THEN** the mounted theme is determined by the shared default theme constant

## ADDED Requirements

### Requirement: Default dev theme MUST be WinXp and come from one source of truth
The system MUST define `winxp` as the default development theme, and development entrypoints MUST derive that default from the shared theme-switch module instead of redefining fallback values in each entrypoint.

#### Scenario: Default theme resolves to WinXp
- **WHEN** the shared default theme constant is evaluated
- **THEN** its value is `winxp`

#### Scenario: Entrypoint inherits default from theme switcher
- **WHEN** `main.tsx` renders `DevThemeRoot` without passing `activeTheme`
- **THEN** runtime behavior uses the same default theme constant exported by the theme-switch module

### Requirement: Test suite MUST verify default theme rendering path
The test suite MUST include a case that renders `DevThemeRoot` without `activeTheme` and verifies that the default `WinXpTheme` branch is rendered.

#### Scenario: No activeTheme renders WinXp branch
- **WHEN** a test renders `<DevThemeRoot />` without an `activeTheme` prop
- **THEN** `WinXpTheme` markers are present and `Win98Theme` markers are absent
