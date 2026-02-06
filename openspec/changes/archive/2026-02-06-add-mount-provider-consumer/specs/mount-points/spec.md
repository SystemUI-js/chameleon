## ADDED Requirements

### Requirement: MountProvider registers a unique mount point
MountProvider SHALL register itself into a global registry by its `name` when mounted, and SHALL unregister on unmount. Duplicate names MUST throw an error and MUST NOT replace the existing registration.

#### Scenario: Register and unregister a mount point
- **WHEN** a MountProvider with `name="top"` mounts
- **THEN** the global registry contains a mount point entry for `top`
- **WHEN** that MountProvider unmounts
- **THEN** the global registry no longer contains `top`

#### Scenario: Duplicate registration
- **WHEN** a MountProvider mounts with a `name` already registered
- **THEN** an error is thrown and the registry remains unchanged

### Requirement: MountConsumer renders into a named MountProvider
MountConsumer SHALL render its wrapped content into the MountProvider whose `name` matches its own `name` prop.

#### Scenario: Render into a named mount point
- **WHEN** a MountConsumer with `name="top"` is mounted and a MountProvider named `top` exists
- **THEN** the consumer content is rendered inside that MountProvider

#### Scenario: Missing mount point
- **WHEN** a MountConsumer mounts and no MountProvider with the same `name` exists
- **THEN** the consumer renders nothing

### Requirement: MountConsumer supports multiple consumers per mount point
A single MountProvider SHALL allow multiple MountConsumers to render into it when no exclusion applies.

#### Scenario: Multiple consumers render together
- **WHEN** two MountConsumers with the same `name` are mounted and `exclude` is false for both
- **THEN** both consumers are rendered in the MountProvider

### Requirement: MountConsumer exclusion and priority
MountConsumer SHALL support `exclude` and `priority` props. If any consumer with `exclude=true` is present for a mount point, only the consumer with the highest priority SHALL render. If priorities are equal, the earlier-registered consumer SHALL render.

#### Scenario: Exclusion chooses highest priority
- **WHEN** two MountConsumers with `exclude=true` and priorities 1 and 5 target the same mount point
- **THEN** only the consumer with priority 5 is rendered

#### Scenario: Exclusion tie-breaker
- **WHEN** two MountConsumers with `exclude=true` and equal priority target the same mount point
- **THEN** the one registered first is rendered

### Requirement: Demo layout provides five mount points and themed start menu placement
The demo layout SHALL define mount points for `top`, `bottom`, `left`, `right`, and `center`. The start menu SHALL mount to `top` for the default theme and to `bottom` for Win98 and WinXP themes.

#### Scenario: Default theme start menu position
- **WHEN** the active theme is `default`
- **THEN** the start menu is mounted into the `top` mount point

#### Scenario: Win98/WinXP start menu position
- **WHEN** the active theme is `win98` or `winxp`
- **THEN** the start menu is mounted into the `bottom` mount point
