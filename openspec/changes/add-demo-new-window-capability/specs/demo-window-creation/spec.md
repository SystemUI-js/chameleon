## ADDED Requirements

### Requirement: Demo exposes a new window creation action
The demo layout SHALL provide a visible and user-invokable control for creating a new window during runtime.

#### Scenario: User creates a window from the demo control
- **WHEN** the user activates the "New Window" control in the demo layout
- **THEN** the demo adds exactly one new window instance to the rendered scene

### Requirement: Newly created windows include title bar and placeholder content
Each window created by the demo action MUST render with a visible title bar and non-empty placeholder text content.

#### Scenario: Created window renders required minimal content
- **WHEN** a new window is created by the demo action
- **THEN** the window shows a title in its title bar
- **THEN** the window body includes placeholder text content

### Requirement: Sequential creations remain distinguishable
The demo SHALL make consecutively created windows distinguishable so repeated creation can be verified visually.

#### Scenario: Multiple created windows can be differentiated
- **WHEN** the user creates multiple windows in sequence
- **THEN** each created window has a distinguishable identity cue (for example, an incremented title)
