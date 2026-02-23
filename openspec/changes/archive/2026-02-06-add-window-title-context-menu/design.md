## Context

The Window title bar is rendered via a global renderer (`window-title`) with theme-specific overrides. Win98/WinXP currently reuse the default title renderer without a system-style context menu. The codebase already includes a `ContextMenu` component and themed dropdown menu styles that can be reused for this behavior.

## Goals / Non-Goals

**Goals:**
- Add a right-click title-bar context menu for Win98/WinXP themes.
- Include a Close action that calls the existing `onClose` handler.
- Reuse existing `ContextMenu` rendering and menu styles.

**Non-Goals:**
- Implement full system menu (Restore/Move/Size/Minimize/Maximize).
- Change window drag or activation behavior beyond right-click handling.
- Add new menu component APIs or new dependencies.

## Decisions

- **Wrap Win98/WinXP title renderer with `ContextMenu`:**
  - *Why:* Minimizes changes and reuses a tested component with keyboard/mouse handling.
  - *Alternative:* Add context menu handling inside `Window` or `WindowTitleRenderer` for all themes, but that would affect default themes and broaden scope.

- **Menu items limited to Close:**
  - *Why:* Matches request scope and avoids implementing window state actions that are not currently exposed as APIs.
  - *Alternative:* Include more system actions, but that requires new props/behavior (minimize/maximize/restore) and increases scope.

- **Right-click handling scoped to title bar only:**
  - *Why:* Matches Win98/WinXP UX expectations without affecting window body context menus.
  - *Alternative:* Provide a generic window-level context menu, but that changes semantics for all themes.

## Risks / Trade-offs

- **Risk:** Right-click could interfere with drag activation or focus.
  - **Mitigation:** Use `ContextMenu` and prevent default on right-click; keep left-click drag logic unchanged.

- **Risk:** Menu styling might not match title-bar aesthetics on Win98/WinXP.
  - **Mitigation:** Reuse existing themed dropdown styles; adjust only if visual gaps are identified.

- **Risk:** Type mismatch between `MenuItem` types in `ContextMenu` and `WindowMenu`.
  - **Mitigation:** Use `ContextMenu`'s `MenuItem` type from `src/types/index.ts` for the context menu items.
