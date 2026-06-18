# Chameleon Sisyphus Workspace Migration

## Why

The `.sisyphus/` directory contained multiple active and completed development plans for the Chameleon React component library. This archive preserves all work tracking, decisions, learnings, and evidence from the Sisyphus workflow for historical reference and future onboarding.

## What Changes

This archive captures the following completed and in-progress changes:

### Completed Changes

| Change                                      | Status    | Summary                                                                                                                                                 |
| ------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chameleon-pure-component-library-refactor` | COMPLETED | Repositioned Chameleon from desktop-shell library to pure component library, removed WindowManager/Screen/SystemHost, rebuilt demo as component catalog |
| `theme-no-nesting`                          | COMPLETED | Changed Theme to reject nested providers with stable error "Nested Theme is not supported", isolated Theme demo from outer provider                     |
| `theme-demo-usage`                          | COMPLETED | Added standalone Theme showcase in component catalog explaining wrapper usage and explicit theme prop override                                          |
| `demo-code-display`                         | COMPLETED | Added collapsible code blocks to each dev catalog Showcase section                                                                                      |
| `scrollarea-scrollbar`                      | COMPLETED | Added internal custom scrollbar system with dual-axis support, button stepping, and thumb drag                                                          |
| `window-drag-resize-preview`                | COMPLETED | Added move/resize outline preview mode with release-on-commit semantics                                                                                 |
| `menu-component`                            | COMPLETED | Added CMenu with recursive submenu, click/hover triggers, and leaf selection                                                                            |
| `cicon-components`                          | COMPLETED | Added CIcon and CIconContainer with container-managed state, single-icon drag, and long-press context menu                                              |

### In-Progress Changes

| Change                        | Status      | Summary                                                                            |
| ----------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `window-title-action-buttons` | NOT STARTED | Extend CWindowTitle with actionButton slot and actionButtonPosition prop           |
| `cbutton-group-separator`     | NOT STARTED | Add CButtonGroup wrapper and CButtonSeparator component for grouped button styling |

## Capabilities

- Pure component library with themeable components (Button, Radio, Select, Window, Dock, StartBar, Grid, ScrollArea, Menu, Icon)
- Three shipped themes: default, win98, winxp
- Component catalog with interactive demos and code snippets
- Jest + React Testing Library unit tests
- Playwright UI automation tests
- TypeScript strict mode

## Impact

This migration captures all Sisyphus workflow artifacts including:

- 10 plan documents with task breakdowns
- 30+ notepad entries with decisions, issues, problems, and learnings
- 100+ evidence files from QA verification
- 2 completed draft documents
- Historical archive from 2026-03-29

---

## Project Context

**Library**: @sysui/chameleon
**Type**: React 18 + TypeScript Component Library
**Build**: Vite + UMD/ES modules
**Testing**: Jest + React Testing Library + Playwright

### Key Decisions (Summary)

1. **Theme No Nesting**: Theme provider now throws `Nested Theme is not supported` for any nested provider; use explicit `theme` prop for local override
2. **ScrollArea Scrollbar**: Internal scrollbar components are prop-driven, owned by ScrollArea parent; no public export
3. **Window Outline Preview**: `moveBehavior` and `resizeBehavior` props accept `'live' | 'outline'`; outline mode shows dashed preview frame on drag
4. **CMenu**: Single trigger child via `React.Children.only`, recursive `menuList` rendering, `onSelect` fires for leaves only
5. **CIcon Container**: Container-managed active state and position; single-icon drag via `@system-ui-js/multi-drag`; long-press context menu on touch

### Architecture Notes

- Components use CSS className strings (no CSS-in-JS)
- Theme classes follow pattern `cm-theme--{name}`
- Component classes follow pattern `cm-{component}` with BEM modifiers `cm-{component}--{modifier}`
- Class merge order: `base → theme → className`
- State ownership: Parent owns measurement/state, children render from props
