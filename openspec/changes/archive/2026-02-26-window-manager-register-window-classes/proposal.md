## Why

`CWindowManager` currently only renders `props.children` and has no explicit window registration flow. We need a deterministic way to collect window classes (including subclasses of `CWindow`) from `children` and runtime calls so the manager can own a consistent render source.

## What Changes

- Add window-class registration behavior to `CWindowManager` for class constructors discovered in `props.children` when they are `CWindow` or subclasses of `CWindow`.
- Add a manager API (`addWindow`) to register `CWindow` entries programmatically.
- Introduce an internal private registry/list on `CWindowManager` to store registered window classes/entries with clear naming and single responsibility.
- Update `CWindowManager` rendering behavior to render windows from the internal registry in addition to normal child rendering flow where applicable.

## Capabilities

### New Capabilities
- `window-class-registration`: Register and render `CWindow` classes (and subclasses) through `children` discovery and explicit manager API calls.

### Modified Capabilities
- None.

## Impact

- Affected code: `src/components/Window/WindowManager.tsx`, and potentially `src/components/Window/Window.tsx` type contracts if needed.
- API impact: `CWindowManager` gains/clarifies `addWindow` behavior and managed render semantics.
- Dependencies: no new external dependencies expected.
- Systems: window composition behavior for themes/usages that embed `CWindowManager`.
