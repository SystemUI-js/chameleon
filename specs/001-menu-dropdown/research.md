# Research: Menu Dropdown

## Decision 1: Use existing Popover and DropDownMenu primitives for dropdown rendering
- **Decision**: Base dropdown rendering on existing `Popover` and `DropDownMenu` components to align with current library patterns.
- **Rationale**: The repo already provides Popover positioning/trigger behavior and DropDownMenu item rendering, minimizing new patterns and ensuring visual consistency.
- **Alternatives considered**: Implement a new dropdown layer from scratch; extend WindowMenu directly for positioning.

## Decision 2: Menu interaction patterns follow click-only trigger
- **Decision**: Preserve click-trigger behavior for opening menus (no hover-only default).
- **Rationale**: Aligns with existing `Popover` defaults and the clarified spec requirement (click-only open) for consistent interaction.
- **Alternatives considered**: Hover-only trigger; dual hover+click trigger.

## Decision 3: Multi-level menus use nested data structure
- **Decision**: Represent menus as nested items with optional child arrays.
- **Rationale**: Matches spec requirements for 3+ levels and allows recursive rendering and keyboard traversal without expanding public API surface unnecessarily.
- **Alternatives considered**: Flat list with explicit level metadata; separate components per depth.

## Decision 4: Keyboard interaction follows WAI-ARIA APG menu patterns
- **Decision**: Adopt ARIA Authoring Practices menu/menubar guidance for ArrowRight/ArrowLeft/Escape/Enter behavior and focus return to parent on close; support configurable focus behavior on open/close (parent vs firstChild).
- **Rationale**: APG is the authoritative accessibility guidance; aligns with spec keyboard rules and ensures predictable behavior for assistive tech users.
- **Alternatives considered**: Custom key bindings; hover-based submenu open; non-ARIA focus rules.
- **Sources**: <https://www.w3.org/WAI/ARIA/apg/patterns/menubar/> , <https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/>

## Decision 5: Focus management uses roving tabindex
- **Decision**: Use roving tabindex to manage which menuitem is focusable while moving DOM focus between items.
- **Rationale**: Matches existing component patterns (tabIndex usage) and is simpler than aria-activedescendant for a lightweight component library.
- **Alternatives considered**: aria-activedescendant with container focus.
- **Sources**: <https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/>

## Decision 6: Performance gate uses deterministic timing in tests
- **Decision**: Verify <200ms open latency using deterministic mocks (e.g., `performance.now()` mock) in Jest + React Testing Library.
- **Rationale**: CI environments are noisy; mocked timing is stable and aligns with spec requirement for automated timing checks.
- **Alternatives considered**: Real-time measurement with `performance.now()`; sleep-based timing assertions (flaky).
- **Sources**: <https://jestjs.io/docs/timer-mocks> , <https://testing-library.com/docs/user-event/options/#advancetimers>
