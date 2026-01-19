# Research: Menu Dropdown

## Decision 1: Use existing Popover and DropDownMenu primitives for dropdown rendering
- **Decision**: Base dropdown rendering on existing `Popover` and `DropDownMenu` components to align with current library patterns.
- **Rationale**: The repo already provides Popover positioning/trigger behavior and DropDownMenu item rendering, minimizing new patterns and ensuring visual consistency.
- **Alternatives considered**: Implement a new dropdown layer from scratch; extend WindowMenu directly for positioning.

## Decision 2: Menu interaction patterns follow current Popover click trigger default
- **Decision**: Preserve click-trigger behavior for opening menus (no hover-only default).
- **Rationale**: Aligns with existing `Popover` defaults and the clarified spec requirement (click-only open) for consistent interaction.
- **Alternatives considered**: Hover-only trigger; dual hover+click trigger.

## Decision 3: Multi-level menus implemented as nested menu data structure
- **Decision**: Represent menus as nested items with optional child arrays.
- **Rationale**: Matches spec requirements for 3+ levels and allows recursive rendering and keyboard traversal without expanding public API surface unnecessarily.
- **Alternatives considered**: Flat list with explicit level metadata; separate components per depth.
