## Context

The current dev preview (`src/dev/main.tsx`) mounts `GridMountLayout`, which already demonstrates theme switching, popover, modal, and taskbar behavior, but does not demonstrate dynamic `Window` creation. The proposal requires a minimal demo path where users can click a button to create a new window that has a title bar and placeholder content.

This change is scoped to dev/demo behavior only and should reuse existing primitives (`Window`, `Button`, and current layout layering) without introducing new dependencies or public API changes.

## Goals / Non-Goals

**Goals:**
- Add a clear "New Window" action in the dev layout that appends a window instance at runtime.
- Ensure each new window renders with an explicit title and simple body text.
- Keep implementation simple, deterministic, and easy to verify manually in `yarn dev`.

**Non-Goals:**
- Full window manager features (persist/restore layout, minimize registry, complex focus orchestration).
- New exported APIs from the component library.
- Changing docking algorithms or theme contracts.

## Decisions

1. **Create windows from local React state inside `GridMountLayout`**
   - **Decision**: Manage a `windows` array in `src/dev/GridMountLayout.tsx` and append items on button click.
   - **Why**: The requirement is demo-only interaction; colocated state is the least complex and most readable approach.
   - **Alternatives considered**:
     - Global store/context: rejected as unnecessary complexity for a local demo.
     - Imperative DOM mounting: rejected because it bypasses React state flow and is harder to maintain.

2. **Render created windows with the existing `Window` component**
   - **Decision**: Reuse `Window` rather than building ad-hoc panel markup.
   - **Why**: `Window` already provides title bar behavior and visual consistency with theme defaults.
   - **Alternatives considered**:
     - Custom div-based mock window: rejected because it would not validate actual window component behavior.

3. **Use a simple incremental identity and offset positioning strategy**
   - **Decision**: Assign each new window an incrementing id and offset initial position to avoid exact overlap.
   - **Why**: Keeps behavior predictable while making repeated creations visually confirmable.
   - **Alternatives considered**:
     - Random positioning: rejected due to non-determinism and weaker reproducibility.
     - Fixed identical position: rejected because users may think only one window exists.

4. **Keep content intentionally minimal**
   - **Decision**: Use a short placeholder text body and stable title format (e.g., `Demo Window #N`).
   - **Why**: Meets acceptance criteria while avoiding scope creep into content design.
   - **Alternatives considered**:
     - Rich content/actions inside each window: deferred to later enhancements.

## Risks / Trade-offs

- **[Risk] Many windows may clutter the demo view** → **Mitigation**: keep default window size modest and offset positions so each new window remains discoverable.
- **[Risk] Interaction with existing demo layers may be visually noisy** → **Mitigation**: mount windows within current base layer conventions and avoid changing layering contracts.
- **[Trade-off] Simple local state does not model production-grade window lifecycle** → **Mitigation**: document this as intentional demo baseline and defer advanced lifecycle to future changes.

## Migration Plan

- No data migration needed.
- Rollout is immediate in dev preview after code merge.
- Rollback is straightforward by removing the demo-only state and button/window render block.

## Open Questions

- Should the taskbar eventually show one entry per dynamically created demo window, or remain unchanged for this minimal iteration?
- Should a close action be included in the same change, or deferred to a follow-up capability focused on window lifecycle controls?
