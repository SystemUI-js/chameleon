## ADDED Requirements

### Requirement: CWindow MUST support eight-direction border resizing
The system MUST allow `CWindow` to be resized by dragging 8 border regions: north, south, east, west, northeast, northwest, southeast, and southwest.

#### Scenario: Dragging east border increases width
- **WHEN** a user drags the east border region to the right
- **THEN** the window width MUST increase according to horizontal drag delta

#### Scenario: Dragging northwest border updates position and size
- **WHEN** a user drags the northwest border region
- **THEN** the window x/y position and width/height MUST update together according to drag delta and direction semantics

### Requirement: CWindow resizing MUST use multi-drag Drag API
The system MUST implement resize interactions via `@system-ui-js/multi-drag` `Drag` and MUST NOT depend on `Scale` for this behavior.

#### Scenario: Resize handle binding uses Drag
- **WHEN** resize interaction handlers are initialized
- **THEN** each active resize region MUST be bound through `new Drag(...)` semantics

### Requirement: CWindow MUST expose resizable and resizeOptions props
`CWindow` MUST expose a `resizable` prop and a `resizeOptions` prop for resize behavior configuration.

#### Scenario: Resizable defaults to enabled
- **WHEN** a consumer renders `CWindow` without passing `resizable`
- **THEN** resize behavior MUST be enabled by default

#### Scenario: Resize can be disabled
- **WHEN** a consumer renders `CWindow` with `resizable=false`
- **THEN** dragging any resize region MUST NOT change window size or position

### Requirement: Resize region width MUST be configurable
`resizeOptions` MUST support configuring border drag region width, with a default of `4px` when not provided.

#### Scenario: Default edge width is applied
- **WHEN** `resizeOptions.edgeWidth` is omitted
- **THEN** the effective resize region width MUST be treated as `4px`

#### Scenario: Custom edge width is applied
- **WHEN** `resizeOptions.edgeWidth` is provided by the consumer
- **THEN** resize region detection MUST use the provided width

### Requirement: CWindow MUST enforce min and max content size constraints
Resize behavior MUST enforce minimum and optional maximum content dimensions via `resizeOptions`. The default minimum content width and height MUST each be `1px`.

#### Scenario: Width cannot shrink below default minimum
- **WHEN** a user drags a left or right resize region to shrink width past zero and no minimum is configured
- **THEN** effective content width MUST be clamped to `1px`

#### Scenario: Height cannot shrink below default minimum
- **WHEN** a user drags a top or bottom resize region to shrink height past zero and no minimum is configured
- **THEN** effective content height MUST be clamped to `1px`

#### Scenario: Max constraints cap growth when configured
- **WHEN** `resizeOptions.maxContentWidth` or `resizeOptions.maxContentHeight` is configured and user drags beyond those limits
- **THEN** resulting content size MUST be clamped to configured maximum values
