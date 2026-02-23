## Context

The current dev entry (`src/dev/main.tsx`) mixes a demo window gallery with the layout scaffolding. A 3x3 MountProvider grid already exists in styles and partially in markup, but the center area is filled with demo content, and the root layer is forced to full-screen sizing. This makes it difficult to reuse the layout for real desktop window management or for consumers to mount their own content into predictable slots.

This change now evolves from "dev layout cleanup" to a clearer architecture direction: keep a single grid surface as the layout plane, with a center window area and eight docking regions around it. Docking geometry and docking events are theme-driven to maximize flexibility while avoiding stacked layout overlap.

## Goals / Non-Goals

**Goals:**
- Establish a single, slot-based 3x3 MountProvider grid that exposes named regions for top/left/center/right/bottom and a dedicated desktop center slot.
- Remove demo windows/components from the dev layout so the slots are empty and ready for consumer-managed mounting.
- Allow the layer root to size naturally (no forced 100vw/100vh), while preserving the existing layer stack behavior and z-index ordering.
- Make docking behavior configurable by theme (zone geometry + event strategy) without coupling core Window internals to specific themes.

**Non-Goals:**
- Redesigning the MountProvider/MountConsumer API or registry behavior.
- Introducing new styling systems or CSS-in-JS patterns.
- Changing popup/anchor/always-top layering semantics or z-index tokens.
- Implementing production docking behavior in this change set; this document only defines architecture and contracts.

## Decisions

- **Keep the grid contract in dev entry, not the core components** → The change is about dev layout scaffolding, so updates stay within `src/dev` and existing layer styles; component APIs remain stable.
- **Define explicit slot names for a 3x3 layout** → Use consistent, descriptive names (e.g., `layout-top`, `layout-left`, `layout-center`, `layout-right`, `layout-bottom`, plus any required corners) so consumers can target mounts predictably.
- **Remove embedded demo windows from the center slot** → The center slot becomes the desktop window management area; demo content should be opt-in, not baked into the layout.
- **Relax root sizing constraints** → Replace `100vw/100vh` with container-based sizing to allow embedding while keeping layer absolute positioning.
- **Keep popup layer independent from docking grid** → `layer-popups` remains a dedicated top layer for Modal/Popover/ContextMenu so overlay semantics and z-index behavior stay stable.
- **Theme owns docking policy, Window owns interaction lifecycle** → Themes define zones and docking callbacks; Window keeps pointer lifecycle and final position updates.

## Architecture Boundaries

### Ownership model

- **Theme behavior** owns:
  - Dock zone definitions (which region is dockable, spans, priority, enable/disable).
  - Docking policy (threshold, preview-vs-release behavior).
  - Docking event callbacks (preview/commit/leave) as declarative hooks.
- **Window/core behavior** owns:
  - Pointer drag lifecycle (`onMoveStart`, moving, `onMoveEnd`).
  - Position/size state transitions and existing follow/static semantics.
  - Rendering and z-index ordering within base layer.
- **Layer system** owns:
  - Cross-cutting overlay layering (`base`, `anchors`, `popups`) and pointer-event boundaries.

### Hard constraints from current codebase

- Mount slot names must be globally unique (registry throws on duplicate slot names).
- `layer-popups` mount point must remain available for popup components.
- Existing z-index token semantics must stay compatible.
- Existing window drag mode semantics (`follow` / `static`) must not regress.

## Minimal Contract (Proposed)

```ts
type DockZoneId =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

type DockZoneDef = {
  readonly id: DockZoneId;
  readonly gridColumnStart: number;
  readonly gridColumnEnd: number;
  readonly gridRowStart: number;
  readonly gridRowEnd: number;
  readonly enabled?: boolean;
  readonly priority?: number;
};

type DockPolicy = {
  readonly thresholdPx: number;
  readonly mode: 'follow' | 'release';
};

type DockPreviewPayload = {
  readonly zoneId: DockZoneId | null;
};

type DockCommitPayload = {
  readonly zoneId: DockZoneId;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type DockEventHandlers = {
  readonly onDockPreview?: (payload: DockPreviewPayload) => void;
  readonly onDockCommit?: (payload: DockCommitPayload) => void;
  readonly onDockLeave?: () => void;
};
```

### Contract intent

- **Simple geometry contract**: grid line indices avoid coupling to DOM details.
- **Stable event surface**: theme can customize behavior without mutating Window internals.
- **Explicit conflict resolution**: `priority` prevents ambiguous zone selection.

## Migration Plan (Design-level)

1. Remove duplicated base layout content after the new grid provider and keep one canonical grid surface.
2. Keep `layer-popups` and existing layer stack classes unchanged.
3. Introduce theme-level docking config shape in behavior (contract only in this phase).
4. Wire docking lifecycle at integration boundary (not inside theme implementation details).
5. Validate slot naming and mount uniqueness through registry constraints.

## Failure Modes and Mitigations

1. **Zone overlap ambiguity**
   - Mitigation: require deterministic `priority` and tie-break rules.
2. **Duplicate mount slot names**
   - Mitigation: enforce naming convention and preflight slot map.
3. **Popup regressions**
   - Mitigation: preserve `layer-popups` provider and existing popup mount behavior.
4. **Drag-mode behavior drift**
   - Mitigation: docking policy mode maps explicitly onto existing follow/static lifecycle.
5. **Theme-event overreach**
   - Mitigation: events are declarative callbacks only; no direct global listener mutation.
6. **Performance jitter during drag**
   - Mitigation: lightweight nearest-zone calculation and throttled update path.
7. **Unclear center ownership**
   - Mitigation: reserve center for window content; all docking applies to surrounding eight zones.
8. **Testability gaps**
   - Mitigation: test zone selection, event firing, and final rect commit independently.

## Risks / Trade-offs

- **Slot naming ambiguity** → If names are unclear or inconsistent, consumers may mount content incorrectly. → Mitigation: document slot names in the spec and keep them stable.
- **Layout regressions in dev preview** → Removing demo windows may reduce immediate visual feedback. → Mitigation: provide optional demo mounts in separate examples, not in the base layout.
- **Container sizing changes** → Removing full-screen sizing could reveal assumptions in existing styles. → Mitigation: verify dev preview and ensure layer styles still fill the container.
- **Theme complexity growth** → Theme behavior might become too heavy if logic and layout are mixed. → Mitigation: keep theme contract declarative, keep lifecycle in core.
