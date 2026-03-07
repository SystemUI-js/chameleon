## 1. Window API and state model

- [x] 1.1 Extend `CWindowProps` with `resizable?: boolean` (default `true`) and typed `resizeOptions` in `src/components/Window/Window.tsx`.
- [x] 1.2 Define `resizeOptions` defaults: `edgeWidth=4`, `minContentWidth=1`, `minContentHeight=1`, optional `maxContentWidth/maxContentHeight`.
- [x] 1.3 Refactor `CWindow` internal state to manage both position and size atomically for resize directions that affect x/y and width/height together.

## 2. Drag-based resize interaction

- [x] 2.1 Add 8 logical resize regions (N/S/E/W/NE/NW/SE/SW) inside `CWindow` and bind each with `@system-ui-js/multi-drag` `Drag`.
- [x] 2.2 Implement direction-specific delta math for all 8 regions with anchor-preserving updates for north/west-involved directions.
- [x] 2.3 Enforce min/max content size clamping during resize; ensure defaults apply when options are omitted.
- [x] 2.4 Ensure `resizable=false` fully disables resize behavior while keeping title drag move behavior intact.

## 3. Coexistence and cleanup

- [x] 3.1 Verify and adjust `CWindowTitle`/`CWindow` interaction boundaries so title drag moves window and resize regions do not hijack title drag.
- [x] 3.2 Add lifecycle cleanup for all resize `Drag` instances to avoid leaked listeners on unmount/update.

## 4. Tests and docs

- [x] 4.1 Add/extend interaction tests for 8-direction resize outcomes (position/size assertions) and `resizable` toggle behavior.
- [x] 4.2 Add tests for `edgeWidth` default/custom behavior and min/max clamp behavior (default min = 1px, optional max caps).
- [x] 4.3 Update usage docs/examples (`README` and theme examples if needed) to document new props and behavior contracts.

## 5. Verification

- [x] 5.1 Run lint, relevant tests, and build/type checks; fix regressions caused by resize integration.
- [x] 5.2 Perform manual interaction sanity check in dev preview: title drag move, border resize, and boundary clamping all behave as specified.
