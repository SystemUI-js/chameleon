## Why

Current dev layout mixes demo windows and layout scaffolding, which makes it hard to reuse the desktop layer for real window management. A dedicated 3x3 mount grid provides a clear, slot-based layout for top/left/center/right/bottom/desktop areas without hardcoding demo content.

For this change, acceptance is primarily judged by web rendering correctness: region placement, non-overlapping layout surfaces, and overlay layering behavior in browser runtime.

## What Changes

- Replace the existing base layout content with a single 3x3 MountProvider grid that exposes the desktop center plus eight surrounding docking regions.
- Remove the current demo windows/components from the center area in dev entry, leaving the grid slots for consumers to mount into.
- Adjust the root layer sizing so it is no longer forced to full-screen; allow the container to size naturally while keeping the layer stack behavior.
- Preserve overlay compatibility on web (`Modal`, `Popover`, `ContextMenu`) by keeping popup-layer semantics intact.
- Define docking display behavior as theme-driven contract (zone geometry + docking policy/events), while keeping core window drag lifecycle stable.

## Capabilities

### New Capabilities
- `grid-mount-layout`: Provide a nine-region MountProvider layout for web with explicit center + eight docking regions and theme-driven docking display behavior.

### Modified Capabilities
- (none)

## Impact

- `src/dev/main.tsx`: update layout composition and remove demo window content in the center area.
- `src/dev/index.scss` and `src/styles/global.css`: ensure grid and layer styles support the new slot-based layout without full-screen constraints.
- MountProvider usage patterns and any consumers that rely on the dev layout.
- Web acceptance workflow: browser checks for region visibility, overlap-free rendering, and overlay z-order correctness.
