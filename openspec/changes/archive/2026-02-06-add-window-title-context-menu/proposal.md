## Why

Win98/WinXP themed windows currently lack a title-bar right-click system menu, which is a core part of the expected desktop UX. Adding a minimal context menu with a Close action improves parity and discoverability without changing core window behaviors.

## What Changes

- Add a title-bar right-click context menu for Win98/WinXP windows.
- The menu includes a Close action that triggers the existing window close handler.
- Reuse existing context menu rendering and theme menu styling.

## Capabilities

### New Capabilities
- `window-title-context-menu`: Right-clicking the window title bar shows a system-style menu with a Close action for Win98/WinXP themes.

### Modified Capabilities
- (none)

## Impact

- `src/components/WindowTitleRenderer.tsx` for title-bar rendering hooks.
- `src/components/ContextMenu.tsx` and menu styles for menu rendering.
- Win98/WinXP theme styles for consistent menu appearance.
- Tests around window title bar interactions.
