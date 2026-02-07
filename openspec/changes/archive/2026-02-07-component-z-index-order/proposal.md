## Why

Window title context menus and other transient overlays can be obscured by windows because z-index values are inconsistent (for example, dragging windows use very high z-index while menus default much lower). We need a system-level occlusion strategy so menus, anchor-mounted components, always-on-top windows, and normal content render in a predictable order.

## What Changes

- Define a unified layering order for priority groups: menus/popovers, anchor-mounted components (top/left/right/bottom), always-on-top windows, and other content.
- Standardize z-index tokens/variables for layers and remove scattered magic numbers.
- Ensure same-priority items stack by last active order (bring-to-front behavior).
- Align overlay portals to a consistent top-level mount layer to avoid stacking context conflicts.

## Capabilities

### New Capabilities
- `component-layering-order`: System-wide layering tiers, mount ordering, and active stacking rules for windows and overlays.

### Modified Capabilities
- `window-title-context-menu`: Require the window title context menu to render above windows and follow the new priority rules.

## Impact

- Components: ContextMenu, Popover, Modal, Window, MountProvider/MountConsumer, WindowTitleRenderer.
- Styles/themes: context-menu.scss, Popover.scss, Modal.scss, theme window styles that currently set z-index.
- Public API: new or documented CSS variables/tokens for z-index tiers.
- Tests/dev demo: update to validate overlay ordering and active stacking behavior.
