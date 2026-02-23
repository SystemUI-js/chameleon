## 1. Grid Layout Refactor (Web)

- [x] 1.1 In `src/dev/main.tsx`, keep a single canonical `cm-layer__grid` surface and remove duplicated base layout containers from the old structure
- [x] 1.2 Define nine explicit slot names (center + 8 docking regions) and keep center reserved for window content
- [x] 1.3 Remove built-in demo windows/components from the default center slot rendering path

## 2. Theme Contract Integration (Design to Implementation Bridge)

- [x] 2.1 Extend theme behavior contract (types only first) to include dock zone geometry and docking policy fields
- [x] 2.2 Define integration boundary where Window drag lifecycle consumes docking policy without theme-specific branching in core logic
- [x] 2.3 Keep `layer-popups` compatibility untouched for Modal/Popover/ContextMenu mounting

## 3. Styling and Layer Safety

- [x] 3.1 Update `src/dev/index.scss` and related styles so the 3x3 grid fills its container and does not force viewport sizing
- [x] 3.2 Verify `src/styles/global.css` layer stack semantics remain intact (`base`, `anchors`, `popups`) with no pointer-event regression
- [x] 3.3 Ensure no visual overlap from duplicate base layout wrappers after refactor

## 4. Web Acceptance (Display Correctness)

- [x] 4.1 Browser check: all nine regions render at correct positions and center area is visually isolated for windows
- [x] 4.2 Browser check: theme switch updates docking-region display/feedback according to active theme contract
- [x] 4.3 Browser check: overlays (Modal/Popover/ContextMenu) always render above grid content and are not clipped
- [x] 4.4 Browser check: drag modes (`follow` and `static`) remain behaviorally correct after docking integration

## 5. Verification & Regression Guard

- [x] 5.1 Add or update tests that assert mount-slot rendering for all required region names
- [x] 5.2 Add or update tests for docking selection priority and event callback dispatch (preview/commit/leave)
- [x] 5.3 Run lint, test, and build; record any residual risk if behavior is intentionally deferred to later phases

Residual risk note for 5.3: repository-wide `yarn lint` currently fails on many pre-existing Prettier issues in unrelated files; changed files pass targeted ESLint, while `yarn jest --config jest.config.ts`, `yarn tsc --noEmit`, and `yarn build` pass.
