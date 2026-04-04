# CMenu Component

## TL;DR
> **Summary**: Add a new `CMenu` function component to the component library with a single trigger child, `click` / `hover` root trigger modes, recursive `menuList` rendering, and leaf-only selection callbacks.
> **Deliverables**:
> - Public `CMenu` component and `MenuListItem` type
> - Recursive nested menu rendering with inherited submenu trigger behavior
> - Theme-aware styles for default / win98 / winxp
> - Package exports, dev preview/harness, Jest tests, and Playwright UI coverage
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 → 2 → 3 → 4 → 5

## Context
### Original Request
Add a Menu component with these constraints:
- `children` is the trigger element and must be a single child only
- root prop `trigger` supports `click` and `hover`
- popup items come from a `menuList` object array
- define a TypeScript type named `MenuListItem`
- `MenuListItem` must include at least `id`, `key`, `title`, `children`, `trigger`

### Interview Summary
- Public component name is `CMenu`
- First release is the basic version only: open/close behavior, nested data rendering, and basic dismissal
- Built-in `onSelect(item)` is required
- Test strategy is tests-after using existing Jest + Playwright infrastructure
- Default assumptions applied during planning:
  - `children` supports arbitrary recursive nesting
  - `MenuListItem.trigger` controls submenu expansion mode when `children` exists; if omitted, it inherits the root `trigger`
  - `onSelect(item)` fires for leaf items only
  - `id` is the stable internal identity and default React key source; `key` remains part of the public payload contract
  - `disabled` items are not selectable; disabled parents do not open submenus
  - hover mode opens on pointer enter and closes when leaving the full menu tree, with no delay/tolerance in v1

### Metis Review (gaps addressed)
- Closed ambiguity around recursive depth by explicitly requiring recursive rendering from day one
- Closed ambiguity around `onSelect` by limiting it to selectable leaf nodes only
- Closed ambiguity around `id` / `key` by assigning canonical internal identity to `id` and preserving `key` as business payload
- Added guardrail that disabled parent items must not open submenus
- Added guardrail that hover mode should avoid hover-intent delays or collision handling in v1

## Work Objectives
### Core Objective
Ship a reusable `CMenu` component that follows existing Chameleon component patterns and supports single-trigger popup menus with nested submenu data.

### Deliverables
- `src/components/Menu/` implementation following existing component directory conventions
- Public `MenuListItem` and `CMenuProps` exports
- Recursive menu item rendering with click and hover trigger behavior
- Theme-aware styles for all shipped themes
- Dev preview and Playwright harness entry for deterministic UI verification
- Jest and Playwright regression coverage

### Definition of Done (verifiable conditions with commands)
- `yarn lint` passes without warnings requiring source edits
- `yarn test --runInBand tests/Menu.test.tsx` passes for the new component coverage
- `yarn test` passes for full Jest suite
- `yarn test:ui` passes including new menu UI scenarios
- `yarn build` succeeds and exports `CMenu` from package entry

### Must Have
- Exactly one trigger child enforced at runtime
- Root `trigger` prop union limited to `click | hover`
- `menuList` typed as readonly recursive `MenuListItem[]`
- `MenuListItem` includes `id`, `key`, `title`, `children`, `trigger`, and `disabled`
- Nested submenu rendering with inherited trigger behavior
- Leaf-only `onSelect(item)` callback
- Outside-dismiss behavior for click mode
- Menu tree dismiss behavior for hover mode
- Public export wiring from both `src/components/index.ts` and `src/index.ts`

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No keyboard navigation implementation
- No advanced ARIA roving-tabindex or focus-trap work
- No portal system, viewport collision detection, or context-menu mode
- No multiple-trigger-child support
- No `any` types
- No CSS-in-JS or inline style-only solution
- No hidden business semantics for `key`; preserve it as data payload only

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after using Jest + React Testing Library plus Playwright
- QA policy: Every task includes agent-executed happy-path and failure-path scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: 1) public API and export surface, 2) root trigger lifecycle, 3) recursive submenu rendering

Wave 2: 4) theme styles, 5) dev preview and verification integration

### Dependency Matrix (full, all tasks)
| Task | Depends On | Unblocks |
|---|---|---|
| 1 | none | 2, 3, 4, 5 |
| 2 | 1 | 4, 5 |
| 3 | 1 | 4, 5 |
| 4 | 1, 2, 3 | 5 |
| 5 | 1, 2, 3, 4 | F1-F4 |

### Agent Dispatch Summary (wave → task count → categories)
| Wave | Task Count | Recommended Categories |
|---|---:|---|
| Wave 1 | 3 | quick, unspecified-low, visual-engineering |
| Wave 2 | 2 | visual-engineering, unspecified-low |
| Final | 4 | oracle, unspecified-high, deep |

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Define the `CMenu` public contract and export surface

  **What to do**: Create `src/components/Menu/Menu.tsx` as a function component that exports `CMenu`, `CMenuTrigger`, `MenuListItem`, and `CMenuProps`. Make `children` a single `React.ReactElement` trigger only, enforce it with `React.Children.only`, normalize theme input with the same helper pattern used by existing function components, and add the initial menu root wrapper structure with a deterministic closed default state. Update `src/components/index.ts` and `src/index.ts` so `CMenu` is available from both the component barrel and the package root. Add `tests/Menu.test.tsx` contract coverage for package export, class merging order, theme propagation, and multi-child rejection.
  **Must NOT do**: Do not introduce a portal, context-menu API, keyboard navigation, `any`, or a second public component name such as `Menu`.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: bounded public API work with straightforward barrel updates
  - Skills: `[]` — no special skill required beyond repo-local patterns
  - Omitted: [`frontend-ui-ux`] — visual design is not the primary concern in this task

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 2, 3, 4, 5 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Button/Button.tsx:1-55` — function component pattern using `useTheme`, `resolveThemeClass`, `mergeClasses`, and local `index.scss`
  - Pattern: `src/components/Select/Select.tsx:1-89` — exported option/interface definitions colocated with the component
  - Pattern: `src/components/index.ts:1-12` — component barrel file format (`export * from './X/X'`)
  - Pattern: `src/index.ts:1-6` — package-root export strategy; add `CMenu` to both wildcard and named exports
  - API/Type: `src/components/Theme/useTheme.ts:1-23` — explicit theme prop precedence over context theme
  - API/Type: `src/components/Theme/mergeClasses.ts:1-19` — class ordering rules `base → theme → className`
  - Test: `tests/Button.test.tsx:6-121` — package export, theme, and class merge test structure
  - Test: `tests/Select.test.tsx:12-165` — prop contract and controlled/uncontrolled assertion style

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="exports CMenu from package entry|applies theme class|rejects multiple trigger children"` passes
  - [ ] `yarn lint` passes after adding `src/components/Menu/Menu.tsx`, `tests/Menu.test.tsx`, and barrel updates
  - [ ] `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="exports CMenu from package entry"` confirms the package barrel exposes `CMenu`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Public export and single-child contract
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="exports CMenu from package entry|renders with a single trigger child"`
    Expected: Jest reports all matching tests passing and no React runtime error is thrown for the single-child path
    Evidence: .sisyphus/evidence/task-1-menu-contract.txt

  Scenario: Multi-child trigger rejection
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="rejects multiple trigger children"`
    Expected: Jest passes a test that asserts deterministic rejection for multiple trigger children
    Evidence: .sisyphus/evidence/task-1-menu-contract-error.txt
  ```

  **Commit**: NO | Message: `feat(menu): scaffold public CMenu API` | Files: `src/components/Menu/Menu.tsx`, `src/components/index.ts`, `src/index.ts`, `tests/Menu.test.tsx`

- [ ] 2. Implement root click-trigger lifecycle and leaf selection flow

  **What to do**: Extend `CMenu` to render the root popup from `menuList` in `click` mode, toggle it from the single trigger child, dismiss it on outside click, and close it after a successful leaf selection. Add `onSelect(item)` support for leaf items only, keep parent items non-selecting, and ensure disabled leaf items neither select nor close the menu. Use `id` as the stable internal identity and preserve `key` in the callback payload unchanged.
  **Must NOT do**: Do not add hover semantics here, do not fire `onSelect` for items with `children`, and do not keep the menu open after a valid leaf click.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: medium interaction logic with local state and event listeners
  - Skills: `[]` — existing React test patterns are sufficient
  - Omitted: [`playwright`] — browser automation is unnecessary until the harness exists

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 5 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Button/Button.tsx:27-55` — pass-through trigger event pattern and theme-aware class merging
  - Pattern: `tests/Button.test.tsx:50-66` — disabled interaction expectations using `fireEvent.click`
  - Pattern: `tests/Select.test.tsx:54-104` — callback payload assertions and controlled-state test structure
  - Test infra: `jest.config.ts:3-24` — Jest roots and file placement; new tests belong under `tests/`
  - Historical behavior note: `CHANGELOG.md:81-84` — prior menu work closed the full menu tree on outside click; use this as the v1 dismissal rule

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="click trigger opens and closes root menu|outside click closes the menu|leaf selection emits payload and closes"` passes
  - [ ] `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="disabled leaf does not select or close"` passes

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Click-mode open/select/close
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="click trigger opens and closes root menu|leaf selection emits payload and closes"`
    Expected: Jest confirms trigger click opens the popup, clicking a leaf item calls `onSelect(item)`, and the popup is removed after selection
    Evidence: .sisyphus/evidence/task-2-menu-click.txt

  Scenario: Disabled leaf remains inert
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="disabled leaf does not select or close"`
    Expected: Jest confirms disabled leaf items do not invoke `onSelect` and do not change root open state
    Evidence: .sisyphus/evidence/task-2-menu-click-error.txt
  ```

  **Commit**: NO | Message: `feat(menu): add click trigger lifecycle` | Files: `src/components/Menu/Menu.tsx`, `tests/Menu.test.tsx`

- [ ] 3. Implement recursive submenu rendering and hover semantics

  **What to do**: Add recursive rendering for arbitrary `children` depth, track one open branch per depth using `id`, and compute an effective trigger per submenu item (`item.trigger ?? parentTrigger`). In `hover` mode, open the root menu on trigger enter and close the entire menu tree when pointer leaves the composed trigger+popup region. For parent items with children, open submenus on their effective trigger, never call `onSelect`, and block submenu opening when `disabled` is true. For nested leaves, call `onSelect(item)` and close the full tree.
  **Must NOT do**: Do not add hover-intent delays, viewport collision logic, keyboard navigation, or selection events for parent nodes.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: stateful recursive interaction logic with multiple edge cases
  - Skills: `[]` — no external library research is required
  - Omitted: [`frontend-ui-ux`] — behavior correctness matters more than visual polish here

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 5 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Select/Select.tsx:57-89` — compact local event handlers and rendered collection mapping
  - Pattern: `tests/Select.test.tsx:69-104` — controlled/uncontrolled interaction assertions and payload validation
  - Test infra: `tests/Button.test.tsx:50-66` — disabled-state expectation style
  - Historical behavior note: `CHANGELOG.md:52-58` — older menu implementation had submenu dismissal and nested levels; use it only as a guardrail, not as a mandate for keyboard behavior in v1
  - Historical behavior note: `CHANGELOG.md:81-84` — closing the entire menu hierarchy on outside interaction is consistent with prior work and should be preserved

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="renders nested submenu trees recursively|inherited trigger opens submenu|explicit item trigger overrides parent trigger"` passes
  - [ ] `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="hover trigger opens and leaving menu tree closes|disabled parent does not open submenu|nested leaf selection closes full tree"` passes

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Recursive submenu behavior
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="renders nested submenu trees recursively|nested leaf selection closes full tree"`
    Expected: Jest confirms arbitrary nested `children` are rendered recursively, only one active branch per depth is maintained, and selecting a nested leaf collapses the full tree
    Evidence: .sisyphus/evidence/task-3-menu-tree.txt

  Scenario: Hover and disabled-parent edge cases
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/Menu.test.tsx --testNamePattern="hover trigger opens and leaving menu tree closes|disabled parent does not open submenu"`
    Expected: Jest confirms hover mode opens on pointer entry, closes on leaving the tree, and disabled parent items never expose child menus
    Evidence: .sisyphus/evidence/task-3-menu-tree-error.txt
  ```

  **Commit**: NO | Message: `feat(menu): add recursive submenu behavior` | Files: `src/components/Menu/Menu.tsx`, `tests/Menu.test.tsx`

- [ ] 4. Add menu styling plus deterministic dev and Playwright surfaces

  **What to do**: Create `src/components/Menu/index.scss` with the full base class set for the menu tree (`cm-menu`, `cm-menu__trigger`, `cm-menu__popup`, `cm-menu__list`, `cm-menu__item`, `cm-menu__item--disabled`, `cm-menu__item--open`, `cm-menu__submenu`, `cm-menu__caret`, etc.). Keep base layout structural in component SCSS and add theme-specific visual overrides in `src/theme/default/styles/index.scss`, `src/theme/win98/styles/index.scss`, and `src/theme/winxp/styles/index.scss`. Extend the local dev catalog with a `CMenu` showcase showing click and hover examples plus current selection text. Add a dedicated Playwright harness at `src/dev/playwright/menuHarness.tsx` with a matching root HTML entry `playwright-menu.html`, and fix its fixtures around stable data-testid selectors: `menu-demo-trigger`, `menu-demo-popup`, `menu-item-file`, `menu-item-file-new`, `menu-item-file-open`, `menu-item-view`, `menu-item-view-zoom`, `menu-selection-value`, and `fixture-error`.
  **Must NOT do**: Do not introduce inline style positioning hacks that bypass SCSS, do not reuse common-controls selectors, and do not add viewport collision handling or portal rendering.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: styling, catalog presentation, and deterministic UI harness work are tightly coupled
  - Skills: [`frontend-ui-ux`] — useful for translating menu states into clean component-library styling without over-designing
  - Omitted: [`playwright`] — harness files and selectors are created here, but the repo-wide verification pass is reserved for Task 5

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 5 | Blocked By: 1, 2, 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/ComponentCatalog.tsx:35-55` — showcase section wrapper and code disclosure pattern
  - Pattern: `src/dev/ComponentCatalog.tsx:98-125` — interactive demo state readout pattern for component catalog sections
  - Pattern: `src/dev/commonControlsPreview.tsx:10-96` — stable interactive preview structure with test IDs and selection state text
  - Pattern: `src/dev/playwright/commonControlsHarness.tsx:24-152` — query-parameter-driven Playwright harness structure and fixture switching
  - Pattern: `playwright-common-controls.html` — standalone Vite HTML entry for Playwright harnesses
  - Test: `tests/ui/common-controls.helpers.ts:4-108` — helper conventions for route construction and harness readiness waits
  - Test: `tests/ui/common-controls.smoke.spec.ts:9-312` — Playwright expectation style, computed-style assertions, and data-testid-driven selectors
  - Theme files: `src/theme/default/styles/index.scss`, `src/theme/win98/styles/index.scss`, `src/theme/winxp/styles/index.scss` — menu visuals must be added to all shipped themes, not default only

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test:ui --grep "menu"` passes once the dedicated menu spec is added
  - [ ] `yarn lint` passes after adding SCSS, catalog, harness, and UI test files
  - [ ] The Playwright harness exposes the planned selectors and renders both click and hover fixtures without `fixture-error`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Click fixture renders styled menu and selection output
    Tool: Bash
    Steps: Run `yarn test:ui --grep "menu click"`
    Expected: Playwright verifies the menu popup becomes visible from `menu-demo-trigger`, root items render with expected selectors, and selecting `menu-item-file-open` updates `menu-selection-value`
    Evidence: .sisyphus/evidence/task-4-menu-ui.txt

  Scenario: Unknown fixture fails explicitly
    Tool: Bash
    Steps: Run the menu Playwright helper/spec path that loads an invalid `fixture` query value and asserts `fixture-error`
    Expected: Playwright confirms invalid menu harness routes render `fixture-error` instead of silently falling back
    Evidence: .sisyphus/evidence/task-4-menu-ui-error.txt
  ```

  **Commit**: NO | Message: `feat(menu): add menu styles and harnesses` | Files: `src/components/Menu/index.scss`, `src/theme/default/styles/index.scss`, `src/theme/win98/styles/index.scss`, `src/theme/winxp/styles/index.scss`, `src/dev/ComponentCatalog.tsx`, `src/dev/playwright/menuHarness.tsx`, `playwright-menu.html`, `tests/ui/menu.helpers.ts`, `tests/ui/menu.spec.ts`

- [ ] 5. Finalize release-facing integration, changelog, and full regression

  **What to do**: Update `CHANGELOG.md` under `### [UnReleased]` with a `Feature` entry for `CMenu`, summarizing root trigger modes, recursive menu data, and new test coverage. Ensure the final `tests/Menu.test.tsx` and `tests/ui/menu.spec.ts` coverage aligns exactly with the shipped behavior and public export surface. Run the full repo verification sequence (`lint`, `test`, `test:ui`, `build`) and add a post-build package-entry smoke check that confirms `CMenu` exists in the generated ESM bundle.
  **Must NOT do**: Do not edit release version numbers, do not add speculative future keyboard/a11y notes to the changelog, and do not leave the feature only partially wired in package entry.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: release-surface integration plus repo-wide regression execution
  - Skills: `[]` — this is straightforward repository integration work
  - Omitted: [`git-master`] — no git operation is required unless the user later asks for a commit

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: F1, F2, F3, F4 | Blocked By: 1, 2, 3, 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `CHANGELOG.md:1-84` — unreleased feature entries use `- **Feature:** ...` bullets with indented detail lines
  - Script contract: `package.json:21-31` — available verification commands are `yarn lint`, `yarn test`, `yarn test:ui`, and `yarn build`
  - Export surface: `src/index.ts:1-6` and `src/components/index.ts:1-12` — final public surface must remain consistent with barrel strategy
  - Test infra: `playwright.config.ts:3-28` — Playwright runs against the Vite dev server and should keep using `tests/ui`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn lint && yarn test && yarn test:ui && yarn build` completes successfully
  - [ ] `node -e "import('./dist/chameleon.es.js').then((m)=>{ if (!('CMenu' in m)) throw new Error('Missing built CMenu export'); })"` succeeds after build
  - [ ] `grep -n "CMenu" CHANGELOG.md` returns the new unreleased feature entry

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Full repository regression with built export check
    Tool: Bash
    Steps: Run `yarn lint && yarn test && yarn test:ui && yarn build && node -e "import('./dist/chameleon.es.js').then((m)=>{ if (!('CMenu' in m)) throw new Error('Missing built CMenu export'); })"`
    Expected: All repo checks pass and the built ESM bundle exposes `CMenu`
    Evidence: .sisyphus/evidence/task-5-menu-regression.txt

  Scenario: Changelog entry exists under UnReleased
    Tool: Bash
    Steps: Run `grep -n "CMenu" CHANGELOG.md`
    Expected: Output includes the new unreleased feature bullet for `CMenu` and no release-version edits are introduced
    Evidence: .sisyphus/evidence/task-5-menu-regression-error.txt
  ```

  **Commit**: YES | Message: `feat(menu): add recursive CMenu component` | Files: `src/components/Menu/*`, `src/components/index.ts`, `src/index.ts`, `src/theme/*/styles/index.scss`, `src/dev/ComponentCatalog.tsx`, `src/dev/playwright/menuHarness.tsx`, `playwright-menu.html`, `tests/Menu.test.tsx`, `tests/ui/menu.*`, `CHANGELOG.md`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Preferred implementation flow: one feature commit after all five tasks pass verification
- Commit message: `feat(menu): add recursive CMenu component`

## Success Criteria
- Consumers can import `CMenu` from `../src` package entry and from component entry without deep-linking internal paths
- `CMenu` accepts a single trigger child and rejects multi-child usage deterministically
- `click` and `hover` root trigger modes behave as planned, including nested submenu inheritance
- Leaf selection returns the original `MenuListItem` payload and closes the full open menu tree
- Disabled items never select, and disabled parents never open
- Theme classes and component class names compose using existing library ordering rules
- Jest and Playwright coverage protect both happy paths and regression edges
