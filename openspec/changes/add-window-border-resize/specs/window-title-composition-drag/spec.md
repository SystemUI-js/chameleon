## MODIFIED Requirements

### Requirement: Dragging CWindowTitle MUST move its owning CWindow
When `CWindowTitle` is used as a drag handle, dragging interactions handled through `@system-ui-js/multi-drag` MUST update the owning `CWindow` position so the whole window moves with the title drag gesture. This behavior MUST remain valid after border-resize capability is added.

#### Scenario: Title drag updates parent window coordinates
- **WHEN** a drag interaction starts from `CWindowTitle` and pointer movement occurs
- **THEN** the owning `CWindow` position updates according to drag delta and window content moves together

#### Scenario: Resize regions do not hijack title drag behavior
- **WHEN** a user starts dragging from the `CWindowTitle` area rather than any resize border region
- **THEN** the interaction MUST be treated as window move, and MUST NOT trigger resize semantics
