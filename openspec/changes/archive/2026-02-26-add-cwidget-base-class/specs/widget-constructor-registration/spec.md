## ADDED Requirements

### Requirement: Manager MUST validate constructors against CWidget hierarchy
`CWindowManager` MUST treat constructors as valid only when they are `CWidget` or subclasses of `CWidget`.

#### Scenario: Accept direct CWidget constructor
- **WHEN** manager receives a constructor equal to `CWidget`
- **THEN** it is considered valid for registration

#### Scenario: Accept CWidget subclass constructor
- **WHEN** manager receives a constructor whose prototype chain extends `CWidget`
- **THEN** it is considered valid for registration

#### Scenario: Reject non-CWidget constructor
- **WHEN** manager receives a constructor outside the `CWidget` inheritance chain
- **THEN** it is rejected and MUST NOT be registered

### Requirement: Manager MUST keep existing registration semantics after base migration
After switching the constructor baseline from `CWindow` to `CWidget`, `CWindowManager` MUST preserve runtime semantics for registration and rendering.

#### Scenario: addWindow still registers valid constructors
- **WHEN** `addWindow` is called with a valid `CWidget`-hierarchy constructor
- **THEN** manager adds it to the internal registry

#### Scenario: Duplicate constructors are still deduplicated
- **WHEN** the same valid constructor is discovered from children and then passed into `addWindow`
- **THEN** manager keeps exactly one registry entry for that constructor

#### Scenario: Render output excludes invalid constructors
- **WHEN** manager input contains constructors not in `CWidget` hierarchy
- **THEN** manager-owned render output excludes those constructors

### Requirement: CWindow MUST remain valid after baseline migration
Because `CWindow` is a `CWidget` subclass, `CWindowManager` MUST continue to accept and register `CWindow` and `CWindow` subclasses.

#### Scenario: Existing CWindow child registration remains valid
- **WHEN** children include `CWindow`
- **THEN** manager registers and renders it as a valid constructor

#### Scenario: Existing CWindow subclass registration remains valid
- **WHEN** children or `addWindow` provide a subclass of `CWindow`
- **THEN** manager registers and renders it as a valid constructor
