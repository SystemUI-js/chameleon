# Refactor Theme into SystemType + Theme

## TL;DR
> **Summary**: Replace the current top-level “theme component” model with a two-layer model: `SystemType` owns layout, system-only widgets, and reboot semantics; `Theme` is CSS-only and scoped on the active `Screen`. Migrate `Win98`, `WinXP`, and `Default` into the new architecture with breaking API changes allowed.
> **Deliverables**:
> - Explicit `SystemType` / `Theme` contracts and registry
> - `Windows` and `Default` system modules with system-owned `Screen` composition
> - CSS-scoped `Win98` / `WinXP` / `Default` themes
> - Updated dev switcher, exports, Jest tests, and Playwright regression coverage
> **Effort**: Large
> **Parallel**: YES - 3 waves
> **Critical Path**: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

## Context
### Original Request
- Split the existing theme concept into `SystemType` and `Theme`.
- `SystemType` customizes layout and owns system-only components; switching `SystemType` resets open windows like a reboot while preserving shared persistent data such as file system and user data.
- `Theme` is only color/CSS under a given `SystemType`, applied by changing class names on `Screen`.
- `SystemType` component hierarchy must sit above `Screen`; the `SystemType` switcher must sit above `SystemType`.
- Existing `Window98`, `WinXP`, and related themes must be decomposed into the new model.
- Each `SystemType` has its own `Screen` subclass and may have its own `Window` subclass, but shared behavior must remain in the public base types to preserve common features like `WindowManager`.

### Interview Summary
- Migration scope is `Win98 + WinXP + Default`.
- Public API changes are allowed; do not keep a compatibility shim for old theme-root components.
- Use one `Windows` `SystemType`; model `Win98` and `WinXP` as child themes under it.
- Test strategy is characterization-first for refactor seams, then complete the implementation and run Jest + Playwright regressions.

### Metis Review (gaps addressed)
- Freeze the ownership boundary before coding: `SystemType` owns composition, layout, unique widgets, and reboot semantics; `Theme` owns CSS scope only.
- Add an early proof task to confirm `Win98` and `WinXP` can share one `Windows` DOM contract without `if (theme)` behavioral branching.
- Define the persistence contract explicitly: theme switches preserve runtime window instances and geometry within the same system; system switches destroy runtime windows/z-order/transient UI but keep shared persistent stores.
- Exclude scope creep: no multi-screen expansion, no new widget framework, no token-system redesign beyond what is required to apply theme classes, and no API compatibility layer.

## Work Objectives
### Core Objective
- Rebuild the runtime shell so `SystemType` is the unit of composition/lifecycle and `Theme` is the unit of CSS variation.

### Deliverables
- Introduce a closed, typed registry describing legal `{ systemType, theme }` pairs.
- Replace full-tree theme swapping in `src/dev/themeSwitcher.tsx:6` with a host that selects `{ systemType, theme }` and mounts the corresponding system shell.
- Add `Screen` root scoping hooks so theme classes apply at the screen boundary rather than inside window/title subclasses.
- Migrate current `Win98`, `WinXP`, and `Default` implementations to the new registry and remove old theme-root exports from `src/index.ts:1`.
- Expand Jest and Playwright coverage around theme-switch preservation and system-switch reboot semantics.

### Definition of Done (verifiable conditions with commands)
- `yarn test -- --runInBand tests/DevSystemSelection.test.tsx tests/DefaultTheme.test.tsx tests/SystemTypeThemeRegistry.test.tsx tests/ThemeSwitchPreservation.test.tsx tests/SystemTypeSwitch.test.tsx` exits `0`.
- `yarn test:ui` exits `0`.
- `yarn lint && yarn build && npm pack --dry-run` exits `0`.
- `src/dev/themeSwitcher.tsx` no longer maps theme IDs directly to full root components.
- `src/index.ts` exports the new registry/host entry points and no longer exports old `*Theme` root components.

### Must Have
- `Theme` carries only minimal metadata: `id`, `label`, `systemType`, and `className`.
- `SystemType` switch uses a remount boundary above `Screen` so runtime-open windows always reset.
- Same-system theme switch preserves window instances, geometry, focus order, and content state.
- `Windows` family shares one system-level shell; do not create theme-conditional behavior components for `Win98` vs `WinXP`.
- `Default` is treated as a standalone `default` `SystemType` with a single `default` theme, so the boundary stays explicit.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- Must NOT let `Theme` own JSX structure, system widgets, manager lifecycle, or window behavior.
- Must NOT introduce `if (theme === ...)` logic inside system-level behavior components.
- Must NOT broaden the work into new systems, multi-monitor support, or a redesign of `WindowManager` semantics beyond what the new boundary strictly requires.
- Must NOT preserve old theme-root exports or dev APIs after the cutover.
- Must NOT depend on manual visual verification; every verification step must be executable.

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: characterization-first + tests-after completion using Jest and Playwright
- QA policy: Every task includes agent-executed happy-path and failure/edge scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: `1` characterize current shell semantics; `2` define domain contracts and registry; `3` add `Screen` scoping hooks and persistence boundary contracts

Wave 2: `4` build system host and concrete system shells; `5` migrate themes to CSS-scoped definitions

Wave 3: `6` replace dev switcher and public exports; `7` update Jest contract coverage

Wave 4: `8` extend Playwright switch regressions and run release gates

### Dependency Matrix (full, all tasks)
- `1` blocks `4`, `5`, `7`, `8`
- `2` blocks `4`, `5`, `6`, `7`
- `3` blocks `4`, `5`, `7`, `8`
- `4` blocks `6`, `7`, `8`
- `5` blocks `6`, `7`, `8`
- `6` blocks `8`
- `7` blocks `8`
- `8` precedes final verification wave

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 3 tasks → `deep`, `unspecified-high`, `quick`
- Wave 2 → 2 tasks → `deep`, `visual-engineering`
- Wave 3 → 2 tasks → `unspecified-high`, `unspecified-high`
- Wave 4 → 1 task → `visual-engineering`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Freeze current shell behavior with characterization tests

  **What to do**: Add characterization tests that describe the current full-root shell composition and preserve the shared invariants that must survive the refactor. Create `tests/SystemShellCharacterization.test.tsx` covering: `DevThemeRoot` currently swaps entire root components, all current roots mount `CScreen -> CWindowManager -> CWindow`, and current `DefaultTheme` drag behavior remains intact. Also add a focused proof test that compares `Win98Theme` and `WinXpTheme` DOM structure at the `window-frame` / `window-content` / `window-title` seam so the later `Windows` unification stays evidence-based.
  **Must NOT do**: Must NOT change production code in this task beyond adding the smallest test hooks absolutely required for deterministic assertions; must NOT encode the future API into the characterization tests.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: Multi-file test design around refactor boundaries and invariants
  - Skills: `[]` — No special skill needed; existing Jest patterns are sufficient
  - Omitted: `openspec-*` — Not relevant to this repo-local refactor plan

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: `4`, `5`, `7`, `8` | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/themeSwitcher.tsx:6` — Current dev switcher maps theme IDs to full root components
  - Pattern: `src/theme/default/index.tsx:27` — `DefaultTheme` is currently a full root shell, not a CSS theme
  - Pattern: `src/theme/win98/index.tsx:16` — `Win98Theme` mounts `CScreen -> CWindowManager -> CWindow`
  - Pattern: `src/theme/winxp/index.tsx:16` — `WinXpTheme` mounts the same base seam with different title class text
  - Pattern: `tests/DevThemeSelection.test.tsx:13` — Existing selection test style and naming convention
  - Pattern: `tests/DefaultTheme.test.tsx:5` — Existing drag assertion style for class and position checks

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- --runInBand tests/DevThemeSelection.test.tsx tests/DefaultTheme.test.tsx tests/SystemShellCharacterization.test.tsx` exits `0`
  - [ ] `tests/SystemShellCharacterization.test.tsx` asserts `Win98Theme` and `WinXpTheme` share the same `window-frame` / `window-content` / `window-title` test-id structure
  - [ ] `tests/SystemShellCharacterization.test.tsx` asserts `DevThemeRoot` still swaps full roots before the refactor seam is introduced

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Current root swapping baseline
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/SystemShellCharacterization.test.tsx -t "dev root swaps full theme components"`
    Expected: Exit code 0; Jest reports 1 passed, 0 failed
    Evidence: .sisyphus/evidence/task-1-shell-characterization.txt

  Scenario: Win98 and WinXP share DOM seam
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/SystemShellCharacterization.test.tsx -t "win98 and winxp share the window seam"`
    Expected: Exit code 0; test confirms identical `data-testid` seam without theme-conditional behavior assertions
    Evidence: .sisyphus/evidence/task-1-shell-characterization-proof.txt
  ```

  **Commit**: YES | Message: `test(shell): freeze current theme composition behavior` | Files: `tests/SystemShellCharacterization.test.tsx`

- [x] 2. Introduce closed `SystemType` / `Theme` contracts and registry

  **What to do**: Create the new domain layer under `src/system/`.
  - Add `src/system/types.ts` defining `SystemTypeId = 'windows' | 'default'`, `ThemeId = 'win98' | 'winxp' | 'default'`, `ThemeDefinition`, `SystemTypeDefinition`, and `SystemThemeSelection`.
  - Add `src/system/registry.ts` with explicit constants: `SYSTEM_TYPE`, `THEME`, `SYSTEM_THEME_MATRIX`, `DEFAULT_SYSTEM_TYPE = 'default'`, `DEFAULT_THEME_BY_SYSTEM`, `resolveSystemTypeDefinition`, `resolveThemeDefinition`, and `assertValidSystemThemeSelection`.
  - Encode the legal pairs exactly as `{ windows: ['win98', 'winxp'], default: ['default'] }`.
  - Make invalid pair resolution throw a deterministic error string: `Invalid theme "{theme}" for system type "{systemType}"`.
  - Add `tests/SystemTypeThemeRegistry.test.tsx` to cover the valid matrix, defaults, and invalid-pair failure mode.
  **Must NOT do**: Must NOT create any JSX or runtime shell components in this task; must NOT keep `Theme` as a `React.ComponentType` in the registry.

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: This task freezes the architectural contract used by all downstream work
  - Skills: `[]` — Native TypeScript and Jest are enough
  - Omitted: `openspec-*` — No spec workflow artifact is needed here

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: `4`, `5`, `6`, `7` | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/themeSwitcher.tsx:6` — Existing constants are a good naming precedent for static registries
  - Pattern: `src/index.ts:1` — Public exports are currently flat and will need to pivot away from full root themes
  - Pattern: `README.md:27` — README still documents a token-style theme interface that is not reflected in current runtime code; do not mirror it blindly
  - Test: `tests/DevThemeSelection.test.tsx:14` — Existing constant-resolution assertions show the style expected for registry tests

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- --runInBand tests/SystemTypeThemeRegistry.test.tsx` exits `0`
  - [ ] `src/system/registry.ts` exports the legal matrix `{ windows: ['win98', 'winxp'], default: ['default'] }` with no extra pairs
  - [ ] Invalid combinations throw exactly `Invalid theme "{theme}" for system type "{systemType}"`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Resolve valid system-theme pairs
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/SystemTypeThemeRegistry.test.tsx -t "resolves only legal system theme pairs"`
    Expected: Exit code 0; Jest reports the valid matrix and defaults pass
    Evidence: .sisyphus/evidence/task-2-system-theme-registry.txt

  Scenario: Reject invalid pair
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/SystemTypeThemeRegistry.test.tsx -t "rejects invalid theme for system type"`
    Expected: Exit code 0; thrown error matches `Invalid theme "winxp" for system type "default"`
    Evidence: .sisyphus/evidence/task-2-system-theme-registry-error.txt
  ```

  **Commit**: YES | Message: `refactor(system): add systemtype and theme registry contracts` | Files: `src/system/types.ts`, `src/system/registry.ts`, `tests/SystemTypeThemeRegistry.test.tsx`

- [x] 3. Add `Screen` root scoping and explicit session boundaries

  **What to do**: Refactor the shared base seam so `Screen` can host both system and theme scopes without changing window behavior.
  - Update `src/components/Screen/Screen.tsx` to accept `className?: string`, `screenClassName?: string`, `systemType?: string`, and `theme?: string` props, and render a stable root DOM node wrapping `CGrid` with `data-testid="screen-root"`, `className`, `data-system-type`, and `data-theme` attributes.
  - Keep `CGrid` as the direct layout child so existing screen behavior remains stable.
  - Add `tests/ScreenScope.test.tsx` proving the root wrapper renders once, applies classes/attributes, and does not alter `CWindow` drag/resize semantics.
  - In the same task, define the reboot boundary contract in a shared test helper `tests/helpers/systemSession.fixture.tsx` that separates persistent store state from runtime window session state; do not implement the host yet.
  **Must NOT do**: Must NOT remount windows on same-system theme changes; must NOT move `WindowManager` logic into `CScreen`; must NOT introduce system-specific JSX here.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: Small but foundational change to one shared component plus focused tests
  - Skills: `[]` — Existing component patterns are enough
  - Omitted: `openspec-*` — Unnecessary for this constrained base refactor

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: `4`, `5`, `7`, `8` | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Screen/Screen.tsx:5` — Existing `CScreen` currently lacks any root scope hooks and only returns `CGrid`
  - Pattern: `src/components/Widget/Widget.tsx:24` — Base widgets already use stable `data-testid` and frame wrapper conventions
  - Pattern: `src/components/Window/Window.tsx:432` — `CWindow` relies on stable `window-frame` / `window-content` test IDs that must remain unchanged
  - Pattern: `tests/DefaultTheme.test.tsx:9` — Current drag verification shows what must remain behaviorally stable

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- --runInBand tests/ScreenScope.test.tsx tests/DefaultTheme.test.tsx` exits `0`
  - [ ] `screen-root` carries the exact `data-system-type` and `data-theme` values passed to `CScreen`
  - [ ] Existing `window-title` drag behavior still moves the frame after the `CScreen` wrapper change

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Screen root exposes scope hooks
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/ScreenScope.test.tsx -t "applies screen root classes and data attributes"`
    Expected: Exit code 0; `screen-root` exposes the configured className, `data-system-type`, and `data-theme`
    Evidence: .sisyphus/evidence/task-3-screen-scope.txt

  Scenario: Screen wrapper does not break dragging
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/ScreenScope.test.tsx -t "keeps window drag behavior intact"`
    Expected: Exit code 0; frame moves from the initial coordinates after pointer drag on `window-title`
    Evidence: .sisyphus/evidence/task-3-screen-scope-drag.txt
  ```

  **Commit**: YES | Message: `refactor(screen): add screen scope and reboot boundaries` | Files: `src/components/Screen/Screen.tsx`, `tests/ScreenScope.test.tsx`, `tests/helpers/systemSession.fixture.tsx`

- [x] 4. Build `SystemType` host and concrete system shells

  **What to do**: Implement the new runtime composition layer.
  - Add `src/system/SystemHost.tsx` as the only component allowed to choose the active system shell from the registry.
  - `SystemHost` must receive `{ systemType, theme }`, validate the pair through `assertValidSystemThemeSelection`, resolve the system definition, and mount a remount boundary keyed by `systemType` only.
  - Add `src/system/windows/WindowsScreen.tsx` and `src/system/windows/WindowsSystem.tsx`; `WindowsScreen` extends `CScreen`, applies `cm-system--windows`, and hosts the shared Windows boot layout with common `CWindowManager` + common `CWindow`/`CWindowTitle` composition.
  - Add `src/system/default/DefaultScreen.tsx` and `src/system/default/DefaultSystem.tsx`; `DefaultScreen` extends `CScreen`, applies `cm-system--default`, and mounts the default boot layout.
  - Make both system shells accept the active `ThemeDefinition` and append the theme class to the `screen-root` wrapper.
  - Keep persistent shared stores above `SystemHost`; keep runtime-open windows, z-order, and transient desktop UI inside the `systemType`-keyed subtree.
  - Add `tests/SystemHost.test.tsx` proving same-system theme changes keep the same runtime window UUID and geometry while system changes replace the runtime window subtree.
  **Must NOT do**: Must NOT introduce theme-specific behavior branches inside `WindowsSystem`; must NOT keep `DefaultTheme`/`Win98Theme`/`WinXpTheme` root classes alive as parallel shells.

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: This task creates the new lifecycle boundary and system-owned composition layer
  - Skills: `[]` — Existing code patterns are sufficient once the contract is frozen
  - Omitted: `openspec-*` — Not part of the active workflow here

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: `5`, `6`, `7`, `8` | Blocked By: `1`, `2`, `3`

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Screen/Screen.tsx:9` — Base screen class to extend for system-specific screens
  - Pattern: `src/components/Window/Window.tsx:149` — Shared window class hooks and stable UUID/test-id behavior to preserve
  - Pattern: `src/components/Window/WindowTitle.tsx:61` — Shared title rendering should remain the default for Windows-family themes
  - Pattern: `src/components/Window/WindowManager.tsx:11` — Keep window manager as shared behavior rather than forking per theme
  - Pattern: `src/theme/default/index.tsx:30` — Existing default boot layout content and coordinates
  - Pattern: `src/theme/win98/index.tsx:20` — Existing Windows-family boot layout shape and initial coordinates
  - Pattern: `src/theme/winxp/index.tsx:19` — Existing Windows-family boot layout shape and initial coordinates
  - Test: `tests/DefaultTheme.test.tsx:9` — Current drag + class assertions for boot window behavior

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- --runInBand tests/SystemHost.test.tsx` exits `0`
  - [ ] Same-system selection change (`windows/win98` → `windows/winxp`) keeps the same `data-window-uuid` on the boot window and preserves dragged frame coordinates
  - [ ] Cross-system selection change (`windows/win98` → `default/default`) changes the boot window `data-window-uuid` and rehydrates the target system’s default boot layout

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme change within Windows preserves runtime window
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/SystemHost.test.tsx -t "preserves runtime window across windows theme switches"`
    Expected: Exit code 0; boot window UUID and dragged geometry remain unchanged when switching `win98` to `winxp`
    Evidence: .sisyphus/evidence/task-4-system-host-theme-switch.txt

  Scenario: System change reboots runtime session
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/SystemHost.test.tsx -t "reboots runtime session across system switches"`
    Expected: Exit code 0; boot window UUID changes and the target system layout replaces the previous system subtree
    Evidence: .sisyphus/evidence/task-4-system-host-reboot.txt
  ```

  **Commit**: YES | Message: `refactor(shell): migrate windows and default systems` | Files: `src/system/SystemHost.tsx`, `src/system/windows/WindowsScreen.tsx`, `src/system/windows/WindowsSystem.tsx`, `src/system/default/DefaultScreen.tsx`, `src/system/default/DefaultSystem.tsx`, `tests/SystemHost.test.tsx`

- [x] 5. Convert `Win98`, `WinXP`, and `Default` into CSS-scoped themes

  **What to do**: Replace the old root-theme modules with CSS-only theme definitions and scoped styles.
  - Rewrite `src/theme/win98/index.tsx`, `src/theme/winxp/index.tsx`, and `src/theme/default/index.tsx` so each exports a `ThemeDefinition` object instead of a React root component.
  - Standardize theme class names as `cm-theme--win98`, `cm-theme--winxp`, and `cm-theme--default`.
  - Move all theme-specific styling under selectors rooted at `.cm-theme--{id}` combined with the active system class on `screen-root`, e.g. `.cm-system--windows.cm-theme--win98 .cm-window__title-bar`.
  - Delete theme-specific `WindowTitle` subclasses unless a concrete structural difference survives; keep `CWindowTitle` as the renderer for both Windows themes.
  - Replace `DefaultWindow` frame/content class overrides with theme-scoped selectors targeting the shared `.cm-window-frame`, `.cm-window`, and `.cm-window__title-bar` classes.
  - Add `tests/ThemeScopeClassNames.test.tsx` asserting the screen root receives the exact theme class and that theme switching changes classes without swapping the window subtree.
  **Must NOT do**: Must NOT leave JSX roots or boot layouts inside `src/theme/*`; must NOT add theme-specific branching to `CWindow`, `CWindowTitle`, or `CWindowManager`.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: This is mostly styling architecture and scoped-class migration
  - Skills: `[]` — Existing SCSS and class patterns are enough
  - Omitted: `openspec-*` — Not applicable

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: `6`, `7`, `8` | Blocked By: `1`, `2`, `3`, `4`

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/theme/default/index.tsx:8` — Existing default-specific frame/content classes to remove from behavior components
  - Pattern: `src/theme/default/index.tsx:18` — Existing default title class composition to migrate into scoped CSS
  - Pattern: `src/theme/win98/index.tsx:7` — Existing Win98 title subclass that should disappear if markup stays shared
  - Pattern: `src/theme/winxp/index.tsx:7` — Existing WinXP title subclass that should disappear if markup stays shared
  - Pattern: `src/components/Window/Window.tsx:149` — Shared window/content/frame classes that theme CSS must target
  - Pattern: `src/components/Window/WindowTitle.tsx:61` — Shared title-bar class source that theme CSS must style
  - Pattern: `src/components/Screen/Screen.tsx:9` — `screen-root` is the correct scope boundary for theme classes

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- --runInBand tests/ThemeScopeClassNames.test.tsx tests/SystemHost.test.tsx` exits `0`
  - [ ] `src/theme/win98/index.tsx`, `src/theme/winxp/index.tsx`, and `src/theme/default/index.tsx` export metadata objects, not `React.Component` roots
  - [ ] Switching `windows/win98` to `windows/winxp` changes only the screen theme class and leaves the boot window UUID unchanged

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme class scopes the active screen
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/ThemeScopeClassNames.test.tsx -t "applies the active theme class to screen root"`
    Expected: Exit code 0; `screen-root` has `cm-theme--win98`, `cm-theme--winxp`, or `cm-theme--default` exactly as selected
    Evidence: .sisyphus/evidence/task-5-theme-scope.txt

  Scenario: Theme switch does not replace window subtree
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/ThemeScopeClassNames.test.tsx -t "does not remount runtime windows on same system theme change"`
    Expected: Exit code 0; boot window UUID is stable while the theme class changes
    Evidence: .sisyphus/evidence/task-5-theme-scope-stability.txt
  ```

  **Commit**: YES | Message: `refactor(theme): convert win98 winxp default to scoped theme definitions` | Files: `src/theme/win98/index.tsx`, `src/theme/winxp/index.tsx`, `src/theme/default/index.tsx`, theme style files, `tests/ThemeScopeClassNames.test.tsx`

- [x] 6. Replace dev switcher and public exports with `{ systemType, theme }`

  **What to do**: Cut over the developer-facing entry points to the new model.
  - Rewrite `src/dev/themeSwitcher.tsx` so it exports `DEV_SYSTEM_TYPE`, `DEV_THEME`, `DEFAULT_DEV_SELECTION`, `resolveDevSystemDefinition`, `resolveDevThemeDefinition`, and a new `DevSystemRoot` component.
  - `DevSystemRoot` must accept `{ systemType?, theme? }`, validate the selection, and render `SystemHost`.
  - Update `src/dev/main.tsx` to supply the default selection through `DevSystemRoot`.
  - Update `src/index.ts` to export `src/system/types`, `src/system/registry`, `src/system/SystemHost`, and the CSS-only theme definitions; remove exports of old `DefaultTheme`, `Win98Theme`, and `WinXpTheme` root components.
  - Rename `tests/DevThemeSelection.test.tsx` to `tests/DevSystemSelection.test.tsx` and update the assertions to the new constants, selection defaults, and invalid-pair behavior.
  **Must NOT do**: Must NOT keep both `DevThemeRoot` and `DevSystemRoot`; must NOT re-export removed root theme components from `src/index.ts`.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: Cross-cutting public entry-point migration with tests and exports
  - Skills: `[]` — No special skill required
  - Omitted: `openspec-*` — No artifact workflow needed

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: `7`, `8` | Blocked By: `2`, `4`, `5`

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/themeSwitcher.tsx:6` — Current constant layout and resolver naming style
  - Pattern: `src/index.ts:1` — Current public export surface to replace
  - Pattern: `tests/DevThemeSelection.test.tsx:13` — Existing resolver/default-selection test style
  - Pattern: `package.json:21` — Build/test scripts that must keep passing after export changes

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- --runInBand tests/DevSystemSelection.test.tsx` exits `0`
  - [ ] `src/dev/themeSwitcher.tsx` no longer exports `DevThemeRoot`, `DEFAULT_DEV_THEME`, or theme-to-root component maps
  - [ ] `src/index.ts` no longer exports `DefaultTheme`, `Win98Theme`, or `WinXpTheme`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Default dev selection resolves to default/default
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/DevSystemSelection.test.tsx -t "uses default system and theme selection"`
    Expected: Exit code 0; resolver returns `default` system and `default` theme for omitted props
    Evidence: .sisyphus/evidence/task-6-dev-selection.txt

  Scenario: Invalid dev selection is rejected
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/DevSystemSelection.test.tsx -t "rejects invalid theme for chosen system"`
    Expected: Exit code 0; invalid pair throws `Invalid theme "winxp" for system type "default"`
    Evidence: .sisyphus/evidence/task-6-dev-selection-error.txt
  ```

  **Commit**: YES | Message: `refactor(dev): switch dev host and exports to system theme pairs` | Files: `src/dev/themeSwitcher.tsx`, `src/dev/main.tsx`, `src/index.ts`, `tests/DevSystemSelection.test.tsx`

- [x] 7. Add Jest coverage for theme preservation and system reboot semantics

  **What to do**: Replace old theme-root tests with contract tests centered on the new lifecycle model.
  - Add `tests/SystemTypeSwitch.test.tsx` covering shared-persistent-data preservation across system switches using a deterministic payload like `persistent-note-123`.
  - Add `tests/ThemeSwitchPreservation.test.tsx` covering same-system theme changes preserving boot window UUID, dragged geometry, and focused content state.
  - Update `tests/DefaultTheme.test.tsx` to stop rendering removed `DefaultTheme` roots and instead render the new `DefaultSystem`/`SystemHost` path while preserving the class and drag assertions that still matter.
  - Remove or rewrite obsolete tests that assert the existence of `DefaultTheme`, `Win98Theme`, or `WinXpTheme` root components.
  - Ensure all new tests use the shared `screen-root`, `window-frame`, `window-title`, and `window-content` selectors rather than implementation-specific component names.
  **Must NOT do**: Must NOT keep tests coupled to deleted root component class names; must NOT weaken assertions from behavior to snapshot-only checks.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: High-signal contract testing around state preservation and reboot behavior
  - Skills: `[]` — Existing Jest setup is sufficient
  - Omitted: `openspec-*` — Not needed

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: `8` | Blocked By: `1`, `2`, `3`, `4`, `5`, `6`

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/DefaultTheme.test.tsx:6` — Existing behavioral assertions to preserve after swapping the render root
  - Pattern: `tests/DevThemeSelection.test.tsx:30` — Current branch-render assertions to replace with selection-contract assertions
  - Pattern: `src/components/Window/Window.tsx:434` — `data-window-uuid` on `window-content` is the stable runtime identity hook
  - Pattern: `src/components/Window/WindowTitle.tsx:65` — `window-title` remains the correct drag target
  - Pattern: `src/components/Screen/Screen.tsx:9` — `screen-root` is the new scope and assertion boundary

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test -- --runInBand tests/SystemTypeSwitch.test.tsx tests/ThemeSwitchPreservation.test.tsx tests/DefaultTheme.test.tsx tests/DevSystemSelection.test.tsx` exits `0`
  - [ ] Same-system theme switch keeps `persistent-note-123`, dragged frame coordinates, and runtime boot window UUID unchanged
  - [ ] Cross-system switch keeps `persistent-note-123` but resets runtime boot window UUID and target-system window coordinates to boot defaults

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Theme switch preserves runtime and content state
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/ThemeSwitchPreservation.test.tsx -t "preserves runtime state within a system"`
    Expected: Exit code 0; UUID, geometry, and `persistent-note-123` stay unchanged when switching `windows/win98` to `windows/winxp`
    Evidence: .sisyphus/evidence/task-7-theme-preservation.txt

  Scenario: System switch reboots runtime while keeping persistent data
    Tool: Bash
    Steps: Run `yarn test -- --runInBand tests/SystemTypeSwitch.test.tsx -t "reboots runtime state across systems"`
    Expected: Exit code 0; target boot layout resets and `persistent-note-123` remains available after switching `windows/winxp` to `default/default`
    Evidence: .sisyphus/evidence/task-7-system-reboot.txt
  ```

  **Commit**: YES | Message: `test(system): cover theme preservation and system reboot semantics` | Files: `tests/SystemTypeSwitch.test.tsx`, `tests/ThemeSwitchPreservation.test.tsx`, updated Jest tests

- [x] 8. Extend Playwright switch regressions and run release gates

  **What to do**: Add UI-level regression coverage for the new selection semantics, then run the full release gate.
  - Add `tests/ui/system-theme-switch.spec.ts` with two flows:
    - same-system theme change from `windows/win98` to `windows/winxp` preserves the dragged boot window position and visible content
    - cross-system change from `windows/winxp` to `default/default` resets the runtime boot window position and replaces the boot content
  - Update or extend the Playwright fixture entry so it can accept both `systemType` and `theme` query params while keeping the existing `default` fixture behavior for current drag/resize specs.
  - Reuse existing helpers from `tests/ui/window.helpers.ts` for frame metrics and add helper(s) only if needed for switch controls.
  - Run the release gate in this exact order: `yarn lint`, `yarn test`, `yarn test:ui`, `yarn build`, `npm pack --dry-run`.
  - Save command outputs and any failing-report artifacts to `.sisyphus/evidence/`.
  **Must NOT do**: Must NOT replace existing drag/resize specs with switch-only tests; must NOT add manual-only QA steps.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: UI-level switching behavior and Playwright evidence collection
  - Skills: `[]` — Existing Playwright helpers are enough
  - Omitted: `openspec-*` — Not relevant

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: none | Blocked By: `1`, `3`, `4`, `5`, `6`, `7`

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/ui/window.helpers.ts:26` — Existing query-param fixture loading and stable selectors
  - Pattern: `tests/ui/window.smoke.spec.ts:4` — Baseline visibility + metrics assertion style
  - Pattern: `tests/ui/window.move.spec.ts:4` — Drag flow and metric assertions to preserve
  - Pattern: `tests/ui/window.resize.spec.ts:107` — Spec organization and helper reuse style
  - Pattern: `playwright.config.ts:3` — Existing Playwright config and dev-server contract
  - Pattern: `.github/workflows/ci-pr.yml:36` — CI gate order to mirror locally in this task
  - Script: `package.json:21` — Canonical script names for `lint`, `test`, `test:ui`, and `build`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test:ui --grep "system/theme switch"` exits `0`
  - [ ] `yarn lint && yarn test && yarn test:ui && yarn build && npm pack --dry-run` exits `0`
  - [ ] `tests/ui/system-theme-switch.spec.ts` verifies same-system theme switching preserves dragged frame metrics and cross-system switching resets them to target defaults

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Same-system UI switch preserves dragged window metrics
    Tool: Playwright
    Steps: Open the system/theme fixture with `systemType=windows&theme=win98`; drag `[data-testid="window-title"]` by `(20,40)`; switch to `windows/winxp`; read `[data-testid="window-frame"]` metrics
    Expected: Frame metrics remain at the dragged coordinates and the root `screen-root` theme class changes to `cm-theme--winxp`
    Evidence: .sisyphus/evidence/task-8-ui-theme-switch.txt

  Scenario: Cross-system UI switch reboots boot layout
    Tool: Playwright
    Steps: Open the system/theme fixture with `systemType=windows&theme=winxp`; drag `[data-testid="window-title"]`; switch to `default/default`; read `[data-testid="window-frame"]` metrics and boot content test ID
    Expected: Frame metrics reset to the `Default` boot coordinates and the visible boot content changes from Windows content to default content
    Evidence: .sisyphus/evidence/task-8-ui-system-switch.txt
  ```

  **Commit**: YES | Message: `test(ui): extend switch regression coverage and validate release gates` | Files: `tests/ui/system-theme-switch.spec.ts`, updated fixture entry/tests, `.sisyphus/evidence/*`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle

  **Tool**: `oracle`
  **Steps**: Review the finished diff against `.sisyphus/plans/systemtype-theme-refactor.md`; check every task’s contract, exclusions, and acceptance criteria against the implementation.
  **Expected**: Oracle returns explicit approval that the delivered structure matches the planned `SystemType` / `Theme` split with no theme-owned behavior regressions.
  **Evidence**: `.sisyphus/evidence/f1-plan-compliance.md`

- [x] F2. Code Quality Review — unspecified-high

  **Tool**: `unspecified-high`
  **Steps**: Review changed files for type safety, dead abstractions, theme/system boundary violations, and accidental API leftovers from the old root-theme model.
  **Expected**: Reviewer approves with zero unresolved high-severity findings and zero lingering exports of removed root-theme components.
  **Evidence**: `.sisyphus/evidence/f2-code-quality.md`

- [x] F3. Automated UI QA Replay — unspecified-high (+ playwright)

  **Tool**: `unspecified-high` + `Playwright`
  **Steps**: Re-run the exact UI switch, drag, and resize flows defined in `tests/ui/window*.spec.ts` and `tests/ui/system-theme-switch.spec.ts`; confirm both same-system preservation and cross-system reboot behavior using the scripted selectors and query params.
  **Expected**: All scripted UI regressions pass with no manual-only verification step and no screenshot-only approval.
  **Evidence**: `.sisyphus/evidence/f3-ui-qa.md`

- [x] F4. Scope Fidelity Check — deep

  **Tool**: `deep`
  **Steps**: Compare final changed files against plan scope; verify no work spilled into new system types, multi-screen support, compatibility shims, or token redesign outside the planned CSS scoping work.
  **Expected**: Reviewer approves that the implementation stayed inside scope and did not silently add out-of-plan features.
  **Evidence**: `.sisyphus/evidence/f4-scope-fidelity.md`

## Commit Strategy
- `test(shell): freeze current theme composition behavior`
- `refactor(system): add systemtype and theme registry contracts`
- `refactor(screen): add screen scope and reboot boundaries`
- `refactor(shell): migrate windows and default systems`
- `refactor(dev): switch dev host and public exports to system/theme pairs`
- `test(system): cover theme preservation and system reboot semantics`
- `test(ui): extend switch regression coverage and validate release gates`

## Success Criteria
- The runtime shell is selected by `{ systemType, theme }`, not by swapping full theme-root components.
- Within the same `SystemType`, theme switching only changes screen-level classes and leaves runtime windows intact.
- Across `SystemType` changes, runtime windows remount from the target system’s boot layout while persistent shared data remains available.
- `Win98` and `WinXP` are implemented as themes under one `Windows` system shell with no theme-based behavior branching.
- `Default` is isolated as its own system shell and theme pair.
- Jest, Playwright, lint, build, and pack all pass under the new structure.
