## ADDED Requirements

### Requirement: Register global renderer by name
`registerGlobalRenderer` SHALL register a renderer component under a string name and MUST prevent duplicate registrations for the same name.

#### Scenario: Register a renderer
- **WHEN** a renderer is registered with `name="window-title"`
- **THEN** the global registry contains a renderer entry for `window-title`

#### Scenario: Duplicate registration
- **WHEN** a renderer is registered with a `name` that already exists
- **THEN** an error is thrown and the existing renderer remains unchanged

### Requirement: GlobalRender resolves renderer by name
`GlobalRender` SHALL look up a renderer by its `name` prop and render it with the provided props. If no renderer is registered for that name, `GlobalRender` SHALL render nothing.

#### Scenario: Render registered renderer
- **WHEN** `GlobalRender` is rendered with `name="window-title"` and a renderer is registered
- **THEN** the registered renderer is rendered inside `GlobalRender`

#### Scenario: Missing renderer
- **WHEN** `GlobalRender` is rendered with `name="window-title"` and no renderer is registered
- **THEN** `GlobalRender` renders nothing

### Requirement: Theme-specific renderer resolution
`GlobalRender` SHALL prefer a theme-specific renderer when one is registered for the active theme, and SHALL fall back to the default renderer when a theme-specific renderer is not available.

#### Scenario: Theme-specific renderer exists
- **WHEN** the active theme is `winxp` and a renderer is registered for `winxp:window-title`
- **THEN** `GlobalRender` renders the `winxp` renderer

#### Scenario: Theme-specific renderer missing
- **WHEN** the active theme is `winxp`, no renderer is registered for `winxp:window-title`, and a default renderer is registered for `window-title`
- **THEN** `GlobalRender` renders the default renderer

### Requirement: Renderer props are type-safe
Each renderer registration SHALL be constrained to its declared props type, and the renderer props type MUST be exported for consumption by callers.

#### Scenario: Props type is exported
- **WHEN** a renderer is registered for `window-title`
- **THEN** a corresponding props type is exported for external usage
