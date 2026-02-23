## ADDED Requirements

### Requirement: Start menu supports discrete height levels
The system SHALL represent start menu height as a discrete level with only two legal values: `1x` and `2x`.

#### Scenario: Menu opens at a legal discrete level
- **WHEN** the user opens the start menu in Win98 or WinXP theme
- **THEN** the menu height level MUST be either `1x` or `2x`

#### Scenario: Illegal level is rejected
- **WHEN** a non-supported level is provided by internal state update or interaction result
- **THEN** the system MUST normalize to the nearest legal level (`1x` or `2x`)

### Requirement: Drag resize is constrained to vertical bottom-edge interaction
The system SHALL allow start menu height resizing only via bottom-edge drag interaction and MUST NOT expose freeform width or corner resizing for this capability.

#### Scenario: Bottom-edge drag can request level change
- **WHEN** the user drags the start menu bottom edge vertically
- **THEN** the system MUST evaluate whether the target height should be `1x` or `2x`

#### Scenario: Non-bottom resize interaction is ignored
- **WHEN** the user attempts left, right, top, or corner resize interaction on the start menu
- **THEN** the system MUST keep the current discrete height level unchanged

### Requirement: Height selection uses deterministic snap behavior
The system SHALL apply deterministic snapping from drag movement to one of the two discrete levels during interaction and on interaction end.

#### Scenario: Drag movement snaps to a deterministic target
- **WHEN** drag distance crosses the configured threshold between levels
- **THEN** the target level MUST switch deterministically to the corresponding level

#### Scenario: Drag end finalizes to legal snapped level
- **WHEN** the user releases pointer after dragging
- **THEN** the final height level MUST be persisted as `1x` or `2x` and MUST NOT remain as a transient pixel value

### Requirement: Theme behavior remains consistent across Win98 and WinXP
The system SHALL provide the same discrete-height behavior contract for Win98 and WinXP themes while allowing each theme to use its own visual styling and level-to-pixel mapping.

#### Scenario: Shared behavior contract across themes
- **WHEN** the same drag pattern is performed in Win98 and WinXP
- **THEN** both themes MUST produce equivalent level semantics (`1x`/`2x`) and snap rules

#### Scenario: Theme-specific visuals do not alter capability scope
- **WHEN** theme style tokens differ (colors, borders, shadows, etc.)
- **THEN** visual differences MUST NOT introduce additional height levels or freeform resizing

### Requirement: Discrete resize behavior is testable and observable
The system SHALL expose behavior that can be validated by automated tests for level transitions, threshold boundaries, and invalid interaction paths.

#### Scenario: Boundary transition is verifiable
- **WHEN** a test simulates drag just below and just above the switch threshold
- **THEN** the resulting level MUST stay at current level below threshold and switch level above threshold

#### Scenario: Invalid path is verifiable
- **WHEN** a test simulates unsupported resize direction
- **THEN** the resulting level MUST remain unchanged
