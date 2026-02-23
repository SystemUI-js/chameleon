## ADDED Requirements

### Requirement: Provide a 3x3 mount grid with named slots
The web dev layout SHALL expose a single 3x3 MountProvider grid with named slots for center and eight docking regions.

#### Scenario: Consumer mounts content into a named slot
- **WHEN** a MountConsumer renders with a slot name that exists in the 3x3 grid
- **THEN** the content is rendered inside the corresponding grid cell

#### Scenario: Web page renders all nine regions correctly
- **WHEN** the dev layout page is opened in a browser
- **THEN** the center region is visually distinct from the surrounding eight docking regions
- **AND** no region is visually overlapped by duplicate base layout containers

### Requirement: Desktop center slot is dedicated to window management
The center slot of the 3x3 grid SHALL be reserved for desktop window management content and MUST be empty by default in the dev layout.

#### Scenario: Dev layout renders without embedded demo windows
- **WHEN** the dev entry renders the grid layout
- **THEN** the center slot contains no built-in demo windows or controls

### Requirement: Layout sizing follows container constraints
The layer root SHALL size according to its container and MUST NOT force full-screen sizing in the dev layout.

#### Scenario: Layout is embedded in a sized container
- **WHEN** the dev layout is rendered inside a container with explicit dimensions
- **THEN** the layer root matches the container size and preserves the layer stack behavior

### Requirement: Overlay rendering remains correct on web
Popup-style components SHALL continue to render above the grid layout in web runtime.

#### Scenario: Modal and popover stay above grid content
- **WHEN** Modal, Popover, or ContextMenu is triggered on the dev page
- **THEN** the overlay renders above grid-mounted content without being clipped by grid regions

### Requirement: Theme-defined docking contract drives display behavior
The docking region geometry and docking event strategy SHALL be defined by theme behavior contract, and web rendering SHALL follow that contract.

#### Scenario: Switching theme updates docking display behavior
- **WHEN** the active theme changes to one with different docking zone definitions
- **THEN** docking region display and interaction feedback update according to the new theme contract
- **AND** core window drag lifecycle remains functional (`follow` and `static` semantics preserved)
