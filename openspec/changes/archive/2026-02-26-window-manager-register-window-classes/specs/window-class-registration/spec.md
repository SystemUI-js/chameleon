## ADDED Requirements

### Requirement: Manager MUST register window classes from children
`CWindowManager` MUST inspect `props.children` and register child component classes that are `CWindow` or subclasses of `CWindow`.

#### Scenario: Register direct CWindow child class
- **WHEN** `CWindowManager` receives children that include a `CWindow` class component
- **THEN** the manager registers that class into its internal window registry

#### Scenario: Register CWindow subclass child class
- **WHEN** `CWindowManager` receives children that include a class component whose prototype chain extends `CWindow`
- **THEN** the manager registers that subclass into its internal window registry

### Requirement: Manager MUST expose addWindow API for runtime registration
`CWindowManager` MUST provide an `addWindow` API that accepts a `CWindow` class constructor (including subclasses) and registers it for rendering.

#### Scenario: addWindow registers valid constructor
- **WHEN** a caller invokes `addWindow` with a constructor that is `CWindow` or a subclass of `CWindow`
- **THEN** the constructor is added to the internal window registry

#### Scenario: addWindow rejects invalid constructor
- **WHEN** a caller invokes `addWindow` with a non-`CWindow` constructor
- **THEN** the manager MUST NOT register that constructor

### Requirement: Manager MUST avoid duplicate class registrations
`CWindowManager` MUST avoid duplicate registrations for the same window class constructor reference, regardless of whether registration comes from `children`, `addWindow`, or both.

#### Scenario: Duplicate from children and addWindow
- **WHEN** the same window constructor is discovered in `children` and later passed to `addWindow`
- **THEN** the registry contains only one entry for that constructor

### Requirement: Manager MUST render from registered window classes
`CWindowManager` MUST render window output from its internal registered window class collection so that manager-owned registration affects render results.

#### Scenario: Render includes windows from registry
- **WHEN** at least one valid window class is registered in the manager
- **THEN** `render` output includes the corresponding window render result for each unique registered class

#### Scenario: Render excludes invalid classes
- **WHEN** non-`CWindow` classes are encountered in inputs
- **THEN** those classes are excluded from manager-owned render output
