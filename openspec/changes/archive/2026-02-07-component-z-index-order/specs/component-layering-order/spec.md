## ADDED Requirements

### Requirement: Layering priority groups are explicitly ordered
The system SHALL define four layering priority groups with the following order (highest to lowest):
1) menus/popovers and other transient overlays
2) anchor-mounted components (top/left/right/bottom mount points)
3) always-on-top windows
4) other content

#### Scenario: System resolves cross-group ordering
- **WHEN** a menu and an always-on-top window are both visible
- **THEN** the menu is rendered above the always-on-top window

#### Scenario: Anchor components stay above always-on-top windows
- **WHEN** a left/right/top/bottom anchored component and an always-on-top window are both visible
- **THEN** the anchored component is rendered above the always-on-top window

### Requirement: Same-priority items use last-active stacking
The system SHALL render items within the same priority group based on last-active order.

#### Scenario: Most recently activated window is on top
- **WHEN** two windows in the same priority group become active in sequence
- **THEN** the most recently active window is rendered above the previously active window

#### Scenario: Most recently opened overlay is on top
- **WHEN** two overlays in the same priority group are opened in sequence
- **THEN** the most recently opened overlay is rendered above the earlier overlay

### Requirement: Overlays use a consistent top-level mount layer
The system SHALL mount overlays (menus, popovers, context menus, modal overlays) into a consistent top-level mount layer to avoid stacking-context conflicts.

#### Scenario: Context menu mounts to top-level overlay layer
- **WHEN** a context menu is opened
- **THEN** it is rendered within the top-level overlay mount layer

#### Scenario: Popover mounts to top-level overlay layer
- **WHEN** a popover is opened
- **THEN** it is rendered within the top-level overlay mount layer

### Requirement: Z-index values are defined via tokens
The system SHALL expose z-index values for each priority group via configurable tokens.

#### Scenario: Components reference z-index tokens
- **WHEN** a component in a priority group renders
- **THEN** its z-index is derived from the corresponding token, not a hard-coded number
