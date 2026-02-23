## 1. Preparation

- [x] 1.1 Review Window title renderer and existing ContextMenu API usage
- [x] 1.2 Identify Win98/WinXP theme hooks for renderer overrides

## 2. Core Implementation

- [x] 2.1 Add title-bar ContextMenu wrapper for Win98 renderer with Close item
- [x] 2.2 Add title-bar ContextMenu wrapper for WinXP renderer with Close item
- [x] 2.3 Ensure right-click handling does not interfere with drag/activation

## 3. Tests & Validation

- [x] 3.1 Add tests for title-bar context menu open on Win98/WinXP
- [x] 3.2 Add tests for Close action invoking onClose handler
- [x] 3.3 Add tests ensuring non Win98/WinXP themes do not show the menu
