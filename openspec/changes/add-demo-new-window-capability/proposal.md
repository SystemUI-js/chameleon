## Why

The current demo does not show how to create windows dynamically, which makes it hard to validate basic desktop-like interaction flows. We need a minimal, explicit example now so contributors can quickly verify window creation behavior in development.

## What Changes

- Add a demo interaction for creating windows at runtime via a dedicated "New Window" button.
- Render each newly created window with a visible title bar and simple placeholder body text.
- Keep the initial scope intentionally minimal (no advanced window lifecycle management yet) to establish a clear baseline behavior.

## Capabilities

### New Capabilities

- `demo-window-creation`: Define and demonstrate user-triggered runtime window creation in the demo, including required visible title bar and basic content.

### Modified Capabilities

- None.

## Impact

- Affected code: demo entry/layout files under `src/dev/` and related component wiring for demo-level state.
- Affected behavior: development preview interaction flow for opening additional windows.
- APIs/dependencies: no public API changes and no new external dependencies expected.
