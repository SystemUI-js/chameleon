## ADDED Requirements

### Requirement: System MUST provide composable CWindowTitle base component
The system MUST provide a `CWindowTitle` base component that can be imported and composed by consumers, and the base component MUST remain content-agnostic so consumers can provide their own title content.

#### Scenario: Consumer composes CWindowTitle with custom content
- **WHEN** a consumer renders `CWindowTitle` inside their own window composition
- **THEN** the component accepts and renders consumer-provided title content

### Requirement: CWindow MUST NOT implicitly mount CWindowTitle
`CWindow` MUST NOT auto-render or inject `CWindowTitle` by default; title composition MUST be explicit at usage sites.

#### Scenario: Window renders without title when title is not composed
- **WHEN** a consumer renders `CWindow` without including `CWindowTitle`
- **THEN** no title-bar UI from `CWindowTitle` is rendered implicitly

### Requirement: Dragging CWindowTitle MUST move its owning CWindow
When `CWindowTitle` is used as a drag handle, dragging interactions handled through `@system-ui-js/multi-drag` MUST update the owning `CWindow` position so the whole window moves with the title drag gesture.

#### Scenario: Title drag updates parent window coordinates
- **WHEN** a drag interaction starts from `CWindowTitle` and pointer movement occurs
- **THEN** the owning `CWindow` position updates according to drag delta and window content moves together

### Requirement: Win98 theme MUST provide a concrete window title implementation
The Win98 theme MUST provide a concrete title-bar implementation that inherits from `CWindowTitle` and demonstrates at least a basic title area suitable for drag interaction validation.

#### Scenario: Win98 theme exposes a basic draggable title bar
- **WHEN** Win98 theme window is rendered with its title implementation
- **THEN** the title area is visibly present and can act as the drag handle for moving the window
