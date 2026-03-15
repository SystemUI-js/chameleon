## ADDED Requirements

### Requirement: System MUST provide CWidget as the widget base class
The system MUST introduce `CWidget` under `src/components/Widget` as a reusable base class for window-like components.

#### Scenario: CWidget is available in Widget module
- **WHEN** developers inspect the Widget component module
- **THEN** a class named `CWidget` exists as the base widget abstraction

### Requirement: CWidget MUST expose position and size props
`CWidget` MUST define props for position and size, including `x`, `y`, `width`, and `height`, so derived components can consume a consistent layout contract.

#### Scenario: Derived component reads base layout props
- **WHEN** a component extends `CWidget`
- **THEN** it can receive and use `x`, `y`, `width`, and `height` from the base props contract

### Requirement: CWidget MUST render a base frame container
`CWidget` MUST render a base outer frame container that serves as the visual shell for derived components.

#### Scenario: CWidget produces frame output
- **WHEN** `CWidget` is rendered with valid props
- **THEN** output includes a base frame container element

### Requirement: CWindow MUST inherit from CWidget
`CWindow` MUST extend `CWidget` instead of extending `React.Component` directly.

#### Scenario: Window class follows widget inheritance chain
- **WHEN** class inheritance is inspected for `CWindow`
- **THEN** `CWindow` is a subclass of `CWidget`
