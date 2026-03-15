## ADDED Requirements

### Requirement: Screen manager MUST register screen classes from children
`CScreenManager` MUST inspect `props.children` and register child component classes that are `CScreen` or subclasses of `CScreen`.

#### Scenario: Register direct CScreen child class
- **WHEN** `CScreenManager` receives children that include a `CScreen` class component
- **THEN** the manager registers that class into its internal screen registry

#### Scenario: Register CScreen subclass child class
- **WHEN** `CScreenManager` receives children that include a class component whose prototype chain extends `CScreen`
- **THEN** the manager registers that subclass into its internal screen registry

### Requirement: Screen manager MUST expose addScreen API for runtime registration
`CScreenManager` MUST provide an `addScreen` API that accepts a `CScreen` class constructor (including subclasses) and registers it for rendering.

#### Scenario: addScreen registers valid constructor
- **WHEN** a caller invokes `addScreen` with a constructor that is `CScreen` or a subclass of `CScreen`
- **THEN** the constructor is added to the internal screen registry

#### Scenario: addScreen rejects invalid constructor
- **WHEN** a caller invokes `addScreen` with a non-`CScreen` constructor
- **THEN** the manager MUST NOT register that constructor

### Requirement: Screen manager MUST avoid duplicate class registrations
`CScreenManager` MUST avoid duplicate registrations for the same screen class constructor reference, regardless of whether registration comes from `children`, `addScreen`, or both.

#### Scenario: Duplicate from children and addScreen
- **WHEN** the same screen constructor is discovered in `children` and later passed to `addScreen`
- **THEN** the registry contains only one entry for that constructor

### Requirement: Screen manager MUST render from registered screen classes
`CScreenManager` MUST render screen output from its internal registered screen class collection so that manager-owned registration affects render results.

#### Scenario: Render includes screens from registry
- **WHEN** at least one valid screen class is registered in the manager
- **THEN** render output includes the corresponding screen render result for each unique registered class

#### Scenario: Render excludes invalid classes
- **WHEN** non-`CScreen` classes are encountered in inputs
- **THEN** those classes are excluded from manager-owned render output
