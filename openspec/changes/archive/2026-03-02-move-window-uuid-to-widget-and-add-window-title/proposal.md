## Why

`CWindow` currently owns its own `uuid`, which duplicates identity concerns that belong to the shared widget base class. At the same time, there is no reusable title-bar base component that users can compose into windows, which blocks a clean way to implement draggable window headers across themes.

## What Changes

- Move widget identity ownership by placing `uuid` on `CWidget` instead of `CWindow`.
- Add a new base component `CWindowTitle` with no default content and no implicit mounting in `CWindow`.
- Define composition behavior so consumers explicitly place `CWindowTitle` when needed.
- Add draggable title-bar behavior using `@system-ui-js/multi-drag`, where dragging `CWindowTitle` moves its owning `CWindow`.
- Validate this behavior in the Win98 theme by inheriting and implementing a basic title bar.

## Capabilities

### New Capabilities
- `window-title-composition-drag`: Introduce a composable `CWindowTitle` base component that can be attached by users and acts as the drag handle for moving the parent window.

### Modified Capabilities
- `widget-base-class`: Update base widget requirements so `CWidget` provides stable `uuid` identity for subclasses (including `CWindow`).

## Impact

- Affected code: `src/components/Widget/Widget.tsx`, `src/components/Window/Window.tsx`, new window title component files, and Win98 theme window/title implementation.
- API/usage impact: `CWindow` no longer defines `uuid` directly; consumers gain explicit composition with `CWindowTitle` instead of relying on implicit title rendering.
- Dependencies: integrates draggable behavior through existing dependency `@system-ui-js/multi-drag`.
- Testing: requires Win98 theme behavior verification for title drag moving the parent window.
