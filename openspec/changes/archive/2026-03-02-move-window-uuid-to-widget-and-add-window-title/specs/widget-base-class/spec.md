## ADDED Requirements

### Requirement: CWidget MUST provide stable instance uuid identity
`CWidget` MUST initialize and expose a stable `uuid` identity for each widget instance so subclasses inherit a consistent instance identifier without duplicating identity logic.

#### Scenario: Derived window reads inherited uuid
- **WHEN** a `CWindow` instance is created as a subclass of `CWidget`
- **THEN** the instance has an accessible `uuid` that originates from `CWidget`

#### Scenario: Widget identity remains stable after render updates
- **WHEN** a `CWidget` subclass re-renders without remounting
- **THEN** its `uuid` value remains unchanged for that instance lifecycle
