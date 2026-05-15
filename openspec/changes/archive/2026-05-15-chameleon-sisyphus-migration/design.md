# Chameleon Design Decisions

## Context

Chameleon is a pure React component library providing themeable UI components. The library was refactored from a desktop-shell flavored library to focus solely on reusable components with pure theme support.

### Theme System

- **Three themes**: `default`, `win98`, `winxp`
- **Theme class format**: `.cm-theme--{name}` (e.g., `.cm-theme--win98`)
- **Theme wrapper**: `Theme` component renders both context provider AND DOM wrapper div
- **Nesting policy**: Nested Theme providers are explicitly rejected with `throw new Error('Nested Theme is not supported')`
- **Local override**: Use component's explicit `theme` prop to override provider theme

### Component Architecture

| Pattern | Description |
|---------|-------------|
| Props | TypeScript interfaces with explicit optional props |
| Theme | `resolveThemeClass(theme)` + `useTheme()` + `mergeClasses(base, theme, className)` |
| Class order | `base → theme → className` |
| State ownership | Parent owns measurement/state; children render from props |
| SCSS | Local `index.scss` per component; theme overrides in `src/theme/*/styles/index.scss` |
| Test IDs | Stable `data-testid` selectors for automation |
| Export | Barrel via `src/components/index.ts` + explicit re-export in `src/index.ts` |

---

## Decisions

### Theme: No Nested Providers

**Decision**: Theme component rejects any nested provider at runtime.

**Choice**: Throw `new Error('Nested Theme is not supported')` for any nested Theme provider.

**Alternatives considered**:
- Silent outer-wins behavior (rejected - caused confusion)
- Warning console output (rejected - not actionable)

**Why**: Nested providers created unpredictable theme resolution. The explicit error forces developers to use the intended pattern: single provider + explicit `theme` prop for local override.

---

### ScrollArea: Internal Scrollbar Architecture

**Decision**: Custom scrollbar is implemented as internal components under ScrollArea directory, not exported publicly.

**Choice**: ScrollArea owns all measurement and scroll state; internal scrollbar components render purely from props and emit interaction callbacks.

**Key design points**:
- Axis state shape: `{ id, viewportSize, contentSize, scrollOffset, maxScrollOffset, scrollable, thumbSize, thumbOffset }`
- Metric sync triggers: mount, viewport resize, content resize, scroll event, prop changes
- Visibility modes: `auto | always | hidden`
- Gutter size: 20px (matching compact button minimum)
- Native scrollbars hidden via CSS, functionality preserved

**Why**: Keeping scrollbar internal avoids public API surface expansion while enabling full control over the scroll experience.

---

### Window: Outline Preview Mode

**Decision**: `moveBehavior` and `resizeBehavior` are independent props with `'live' | 'outline'` options.

**Choice**: In outline mode, drag updates a preview frame (dashed border) while the real frame stays at committed position; release commits the preview to real frame.

**Key design points**:
- Preview DOM: `data-testid="window-preview-frame"`
- Preview ownership: Widget layer owns preview/comitted state
- Cancel/unmount: Preview cleared without committing
- Default: `'live'` (existing behavior unchanged)

**Why**: Outline mode provides visual feedback during drag without committing intermediate positions, improving perceived performance.

---

### CMenu: Container State Management

**Decision**: CMenu uses single trigger child via `React.Children.only`, recursive menu data via `menuList`, and fires `onSelect` for leaf items only.

**Key design points**:
- `MenuListItem`: `{ id, key, title, children?, trigger?, disabled? }`
- `trigger`: `'click' | 'hover'` per item (inherits from parent)
- Branch tracking: `openBranchByDepth: string[]` maintains single open path per depth
- Outside click dismisses full tree

**Why**: Single trigger enforcement prevents accidental multi-trigger usage; leaf-only selection simplifies callback handling.

---

### CIcon: Container-Managed Icon System

**Decision**: CIconContainer manages active state and positions; individual CIcon instances render from props and emit callbacks.

**Key design points**:
- Position: Container-relative absolute positioning via `position: absolute` + `left/top`
- Drag: `@system-ui-js/multi-drag` per icon slot
- Long-press: 500ms / 6px threshold for touch context menu
- Effective trigger: `item.trigger ?? config.trigger`

**Why**: Container manages state to coordinate multiple icons; individual icons remain stateless receivers.

---

## Risks / Trade-offs

### Theme Nesting Rejection

**Risk**: Existing code using nested Theme providers will break.

**Mitigation**: Error message is stable and actionable; migration path is explicit `theme` prop override.

### ScrollArea Internal State

**Risk**: Internal scrollbar state coupling to ScrollArea may cause maintenance burden.

**Mitigation**: Clear ownership contract documented; prop-driven interface allows future extraction if needed.

### Window Outline Preview

**Risk**: Preview state adds complexity to Widget geometry layer.

**Mitigation**: Preview ownership unified in Widget; move and resize follow same pattern.

---

## Migration Notes

### From Desktop Shell to Pure Component Library

The original Chameleon included WindowManager, Screen, SystemHost abstractions. These were removed:

- Deleted: `WindowManager`, `Screen`, `ScreenManager`, `SystemHost`
- Preserved: `CWindow`, `CWindowTitle`, `CWindowBody`, `CGrid`, `CDock`, `CStartBar`, `CWidget`
- Themes: Simplified to pure `.cm-theme--{name}` without system coupling

### Test Infrastructure

- Jest unit tests: `tests/*.test.tsx`
- Playwright UI tests: `tests/ui/*.spec.ts`
- Harness pattern: `src/dev/playwright/*.tsx` + `playwright-*.html`
- Test IDs: Stable `data-testid` selectors for all interactive elements
