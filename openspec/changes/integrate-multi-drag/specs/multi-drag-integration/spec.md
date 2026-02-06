## ADDED Requirements

### Requirement: Use multi-drag for Window move and resize
The system MUST implement Window move and resize interactions using @system-ui-js/multi-drag Drag instances, replacing the previous pointer event handlers while preserving behavior.

#### Scenario: Window move uses multi-drag
- **WHEN** the user drags the Window title bar
- **THEN** the move interaction is driven by multi-drag and updates position according to existing rules

### Requirement: Preserve interactionMode behavior
The system MUST map interactionMode to multi-drag pose updates such that `follow` updates are continuous and `static` updates apply on end while showing a preview.

#### Scenario: Follow mode updates continuously
- **WHEN** interactionMode is `follow` and the user drags a Window
- **THEN** the Window position/size updates continuously during the drag

#### Scenario: Static mode updates on end
- **WHEN** interactionMode is `static` and the user drags a Window
- **THEN** the preview updates during the drag and the final position/size applies on end

### Requirement: Resize via edge and corner handles
The system MUST continue to support 8-direction resize via Drag-based handles (n, s, e, w, ne, nw, se, sw) without using Scale.

#### Scenario: Corner resize updates size and position
- **WHEN** the user drags a corner resize handle
- **THEN** the Window size updates and position adjusts according to the drag direction

### Requirement: Splitter uses multi-drag Drag
The system MUST implement Splitter dragging via multi-drag Drag instances while preserving existing resize deltas and keyboard behavior.

#### Scenario: Splitter drag updates delta
- **WHEN** the user drags the Splitter
- **THEN** the onResize callback receives the same delta semantics as before

### Requirement: Modal inherits Window behavior
The system MUST keep Modal drag/resize behavior consistent with Window, inheriting the multi-drag implementation and APIs.

#### Scenario: Modal drag works as Window
- **WHEN** a Modal is rendered with movable/resizable options
- **THEN** it follows the same move/resize behavior as Window
