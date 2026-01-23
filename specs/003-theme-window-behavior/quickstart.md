# Quickstart: Theme & Window Behavior Refinements

## Goal

Apply the refined theme defaults and window interaction behaviors, ensure SubMenu/Modal visual consistency with themes, and add theme-driven behavior configuration.

## Local Setup

```bash
yarn
yarn dev
```

## Key Files

- `src/theme/ThemeContext.tsx` — default theme selection
- `src/theme/types.ts` — theme token structure (extend for behavior defaults)
- `src/components/Window.tsx` — drag/resize/activation logic
- `src/components/Modal.tsx` + `src/components/Modal.scss` — modal base styles
- `src/components/DropDownMenu.tsx` + `src/components/DropDownMenu.scss` — submenu rendering
- `src/theme/win98/*` / `src/theme/winxp/*` / `src/theme/default/*` — theme overrides
- `tests/Window.test.tsx`, `tests/Modal.test.tsx` — existing interaction tests

## Expected Changes

1. Default theme uses `default` instead of `win98`.
2. Window supports `onActive` and activation on title-bar click without duplicate firing.
3. Drag cursor matches expected move state.
4. Resize works in demo.
5. SubMenu and Modal styles align with active theme.
6. Theme defines behavior differences for drag mode (Win98 static vs WinXP follow).

## Tests

```bash
yarn lint
yarn test
yarn build
```
