## 1. Demo Entry and State Setup

- [x] 1.1 In `src/dev/GridMountLayout.tsx`, add local state to manage a runtime-created window list and a stable incremental identifier for new windows
- [x] 1.2 Add a typed window item model for demo-only rendering (id, title, initial position, and placeholder body text)

## 2. New Window Action and Rendering

- [x] 2.1 Add a visible "New Window" trigger in the existing demo control area and wire it to append exactly one window item per activation
- [x] 2.2 Render created items using the existing `Window` component so each new window shows a title bar and non-empty placeholder body content
- [x] 2.3 Apply deterministic offset positioning for sequentially created windows so repeated creations are visually distinguishable

## 3. Behavior Validation and Regression Guard

- [x] 3.1 Add or update tests under `tests/` to verify the new-window action creates one window per click and that title/body requirements are satisfied
- [x] 3.2 Add or update tests to verify multiple created windows remain distinguishable (for example, incremented title identity)
- [x] 3.3 Run `yarn lint`, `yarn test`, and `yarn build`, and document any pre-existing unrelated failures if they block full green verification

Residual verification notes for 3.3:
- `yarn lint` fails due widespread pre-existing Prettier formatting violations in unrelated files.
- `yarn test` fails as-invoked because the repo contains both `jest.config.js` and `jest.config.ts`; running with explicit config (`yarn jest --config jest.config.ts`) passes.
- `yarn build` passes.
