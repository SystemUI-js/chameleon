# Demo Code Display for Component Catalog

## TL;DR
> **Summary**: Add one collapsible code block to each dev catalog Showcase in `src/dev/ComponentCatalog.tsx`, implemented as a dev-only disclosure primitive with explicit colocated snippet strings and no public API changes.
> **Deliverables**:
> - Dev-only `ShowcaseCodeDisclosure` primitive under `src/dev/`
> - `ShowcaseSection` integration with one code toggle per Showcase
> - Explicit snippet strings for all seven Showcase sections
> - Jest + Playwright coverage for disclosure behavior
> - Lint/build/test verification evidence
> **Effort**: Short
> **Parallel**: YES - 1 parallel wave
> **Critical Path**: Task 1 → Task 2 → (Task 3 + Task 4) → Task 5 → Task 6

## Context
### Original Request
Add code display to every Demo example.

### Interview Summary
- Scope unit is **one code block per Showcase**, not one block per button/variant.
- Interaction is **collapsible show/hide code**, default collapsed.
- Verification mode is **tests-after**.
- Unspecified enhancements default to **no syntax highlighting, no copy button, no source auto-extraction**.

### Metis Review (gaps addressed)
- Keep the feature strictly inside `src/dev/` and tests; do not change `src/index.ts` public exports.
- Use a dedicated dev-only disclosure primitive instead of duplicating toggle logic in every Showcase.
- Use explicit snippet strings colocated with each Showcase; do not attempt JSX/source auto-generation.
- Use native disclosure semantics (`button`, `aria-expanded`, `aria-controls`, stable region id).
- Use representative snippets that match each Showcase’s demonstrated API/behavior while omitting non-essential catalog layout wrappers.

## Work Objectives
### Core Objective
Make every Showcase section in the dev catalog expose a collapsible code view that reveals a representative TSX snippet for that Showcase, without affecting library runtime behavior or package exports.

### Deliverables
- `src/dev/ShowcaseCodeDisclosure.tsx` dev-only disclosure component.
- `src/dev/ComponentCatalog.tsx` updated to accept and render per-Showcase code snippets.
- `src/dev/styles/catalog.scss` updated with code toggle and code block styles.
- `tests/ShowcaseCodeDisclosure.test.tsx` for disclosure semantics and literal code rendering.
- `tests/ComponentCatalog.test.tsx` for catalog-level toggle presence and independence.
- `tests/ui/component-catalog-code.spec.ts` for browser-level catalog interaction.

### Definition of Done (verifiable conditions with commands)
- `yarn test --runInBand tests/ShowcaseCodeDisclosure.test.tsx` exits `0`.
- `yarn test --runInBand tests/ComponentCatalog.test.tsx` exits `0`.
- `yarn test:ui tests/ui/component-catalog-code.spec.ts` exits `0`.
- `yarn lint` exits `0`.
- `yarn build` exits `0`.
- `src/index.ts` still exports only library/runtime entries from `src/components` and `src/theme`.

### Must Have
- One code toggle per Showcase section.
- Default collapsed state.
- Button label toggles between `Show code` and `Hide code`.
- Stable disclosure wiring via `aria-expanded` + `aria-controls`.
- Stable controlled region id derived from section `testId` as `${testId}-code-region`.
- Explicit snippet strings colocated with each Showcase definition.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No syntax-highlighting dependency.
- No copy-to-clipboard button.
- No preview/code tabs.
- No build-time JSX/source extraction.
- No changes under `src/components/` unless required by unrelated pre-existing breakage.
- No changes to `src/index.ts`, package exports, or library runtime API.
- No catalog redesign beyond disclosure UI and code block styling.

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: `tests-after` with Jest + React Testing Library + Playwright.
- QA policy: Every task includes happy-path and failure/edge validation.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> This feature is intentionally narrow. Parallelism starts only after the disclosure seam is integrated because `src/dev/ComponentCatalog.tsx` is the shared bottleneck.

Wave 1: Task 1-2 (dev-only disclosure primitive + catalog seam)

Wave 2: Task 3-4 (first-column snippets and second-column snippets in parallel)

Wave 3: Task 5-6 (browser coverage and full validation)

### Dependency Matrix (full, all tasks)
- Task 1: no blockers
- Task 2: blocked by Task 1
- Task 3: blocked by Task 2
- Task 4: blocked by Task 2
- Task 5: blocked by Task 3 and Task 4
- Task 6: blocked by Task 5

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 2 tasks → `visual-engineering`, `quick`
- Wave 2 → 2 tasks → `visual-engineering`, `visual-engineering`
- Wave 3 → 2 tasks → `quick`, `quick`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Create dev-only disclosure primitive

  **What to do**: Add `src/dev/ShowcaseCodeDisclosure.tsx` with props `sectionId: string` and `code: string`. The component must own `isOpen` state, render a native `button` with label `Show code` / `Hide code`, compute `const regionId = `${sectionId}-code-region``, set `aria-expanded` and `aria-controls`, and render a controlled region with `id={regionId}` and `hidden={!isOpen}` containing `<pre><code>{code}</code></pre>`. Add `tests/ShowcaseCodeDisclosure.test.tsx` covering collapsed-by-default behavior, open/close behavior, `aria-controls` wiring, and literal rendering of angle-bracket code content.
  **Must NOT do**: Do not export this component from `src/index.ts`. Do not add syntax highlighting, copy buttons, tabs, or any dependency for formatting.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: React disclosure UI + semantics + dev-only component creation.
  - Skills: `[]` — No special skill needed.
  - Omitted: `openspec-apply-change` — Not relevant; this is a direct repo task, not OpenSpec artifact execution.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: Task 2 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/ComponentCatalog.tsx:32` — Current section prop shape and place where `testId` is already defined.
  - Pattern: `src/dev/ComponentCatalog.tsx:38` — Existing `ShowcaseSection` markup pattern to keep visual structure aligned.
  - Test: `tests/Button.test.tsx:1` — RTL import/style pattern used in this repo.
  - API/Type: `jest.config.ts:3` — Jest is already configured for TSX + jsdom.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/ShowcaseCodeDisclosure.test.tsx` exits `0`.
  - [ ] Disclosure starts with `aria-expanded="false"` and region hidden.
  - [ ] One click changes button label to `Hide code`, sets `aria-expanded="true"`, and reveals the code region.
  - [ ] A second click restores the collapsed state.
  - [ ] Code text such as `<CButton>Primary</CButton>` is rendered as text inside `<code>`, not as a live button.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Direct disclosure happy path
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ShowcaseCodeDisclosure.test.tsx`
    Expected: Test asserts the toggle is a native button, starts collapsed, expands on first click, and collapses on second click.
    Evidence: .sisyphus/evidence/task-1-showcase-code-disclosure-jest.txt

  Scenario: Literal code rendering edge case
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ShowcaseCodeDisclosure.test.tsx`
    Expected: Test asserts literal angle-bracket source is present in the code region and no nested interactive element is created from that source string.
    Evidence: .sisyphus/evidence/task-1-showcase-code-disclosure-edge.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `src/dev/ShowcaseCodeDisclosure.tsx`, `tests/ShowcaseCodeDisclosure.test.tsx`

- [x] 2. Integrate disclosure into `ShowcaseSection`

  **What to do**: Extend `ShowcaseSectionProps` in `src/dev/ComponentCatalog.tsx` with `readonly code?: string`. Import `ShowcaseCodeDisclosure` and render it after `.cm-catalog__section-content` only when `code` is provided. Add catalog-scoped styles in `src/dev/styles/catalog.scss` for `.cm-catalog__code-toggle`, `.cm-catalog__code-region`, and `.cm-catalog__code-block`, keeping the styling consistent with existing catalog borders, spacing, and theme variables. Create `tests/ComponentCatalog.test.tsx` with a baseline render using `ComponentCatalog`, `DEV_THEME.default`, and a no-op `onThemeChange`, then verify the Button section exposes a `Show code` button and the Window section remains collapsed until interacted with.
  **Must NOT do**: Do not move the disclosure component into `src/components/`. Do not add extra global styles. Do not change existing section `data-testid` values.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: Shared catalog seam + SCSS integration.
  - Skills: `[]` — No special skill needed.
  - Omitted: `github-triage` — Irrelevant to source changes.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: Task 3, Task 4 | Blocked By: Task 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/ComponentCatalog.tsx:38` — Existing `ShowcaseSection` wrapper to extend.
  - Pattern: `src/dev/ComponentCatalog.tsx:228` — `ComponentCatalog` render entry for catalog-level tests.
  - Pattern: `src/dev/styles/catalog.scss:65` — Existing section card styling that the new code block must visually match.
  - API/Type: `src/dev/themeSwitcher.tsx:7` — `DEV_THEME.default` for deterministic catalog tests.
  - Pattern: `src/dev/main.tsx:6` — Shows how `ComponentCatalog` is instantiated in dev.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/ComponentCatalog.test.tsx` exits `0`.
  - [ ] Button Showcase exposes exactly one `Show code` button within `data-testid="catalog-section-button"`.
  - [ ] Window Showcase region remains hidden before interaction.
  - [ ] Catalog styles compile successfully with the new code-block classes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Catalog seam happy path
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ComponentCatalog.test.tsx`
    Expected: Test renders `ComponentCatalog` with `DEV_THEME.default`, finds the Button section toggle by role/name, and confirms the region wiring is present.
    Evidence: .sisyphus/evidence/task-2-component-catalog-jest.txt

  Scenario: Section independence edge case
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ComponentCatalog.test.tsx`
    Expected: Test confirms the Window section code region remains hidden before its own toggle is clicked even if the Button section is rendered with a toggle.
    Evidence: .sisyphus/evidence/task-2-component-catalog-edge.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `src/dev/ComponentCatalog.tsx`, `src/dev/styles/catalog.scss`, `tests/ComponentCatalog.test.tsx`

- [x] 3. Wire explicit snippets for Button, RadioGroup, and Select

  **What to do**: Add snippet constants immediately above `ButtonShowcase`, `RadioGroupShowcase`, and `SelectShowcase` in `src/dev/ComponentCatalog.tsx`. Each snippet must be a readable multiline TSX string using `.trim()` and must include the interaction/state shown in the live Showcase (`buttonClicks`, `selectedFruit`, `selectedSize`) while omitting the outer `ShowcaseSection` wrapper. Pass the matching snippet to each `ShowcaseSection` via the new `code` prop. Extend `tests/ComponentCatalog.test.tsx` to verify the first-column sections each expose a toggle and that expanding Button does not auto-expand RadioGroup or Select.
  **Must NOT do**: Do not centralize snippets in a separate registry file. Do not include non-essential catalog-only wrappers like outer columns or page layout divs.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: Demo-specific TSX snippet design and wiring.
  - Skills: `[]` — No special skill needed.
  - Omitted: `openspec-explore` — Discovery is already complete.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: Task 5 | Blocked By: Task 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/ComponentCatalog.tsx:74` — Button Showcase live behavior to mirror in snippet text.
  - Pattern: `src/dev/ComponentCatalog.tsx:103` — RadioGroup Showcase state and disabled variant.
  - Pattern: `src/dev/ComponentCatalog.tsx:133` — Select Showcase state and disabled variant.
  - Pattern: `src/dev/ComponentCatalog.tsx:79` — Current stack/row composition; use only if truly needed inside snippet.
  - Test: `tests/ComponentCatalog.test.tsx:1` — Extend this file rather than creating multiple overlapping catalog tests.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/ComponentCatalog.test.tsx` exits `0`.
  - [ ] Expanding Button reveals a code region containing `const [buttonClicks, setButtonClicks] = React.useState(0);` and `<CButton variant="primary"`.
  - [ ] RadioGroup and Select each expose a `Show code` toggle in their own section.
  - [ ] Expanding Button leaves RadioGroup and Select regions hidden until explicitly opened.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: First-column snippet happy path
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ComponentCatalog.test.tsx`
    Expected: Test expands the Button section and confirms stateful snippet text and primary-button markup are visible.
    Evidence: .sisyphus/evidence/task-3-first-column-jest.txt

  Scenario: Cross-section independence edge case
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ComponentCatalog.test.tsx`
    Expected: Test confirms RadioGroup and Select code regions remain hidden when only Button is expanded.
    Evidence: .sisyphus/evidence/task-3-first-column-edge.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `src/dev/ComponentCatalog.tsx`, `tests/ComponentCatalog.test.tsx`

- [x] 4. Wire explicit snippets for Window, Dock, StartBar, and Grid

  **What to do**: Add snippet constants immediately above `WindowShowcase`, `DockShowcase`, `StartBarShowcase`, and `GridShowcase` in `src/dev/ComponentCatalog.tsx`. Use representative TSX strings that show the exact component API currently demonstrated, including `CWindowTitle`, `CWindowBody`, `CDock position="top"`, `CStartBar`, and the `CGrid`/`CGridItem` composition. Pass those strings to the matching `ShowcaseSection` instances. Extend `tests/ComponentCatalog.test.tsx` to verify the second-column sections expose toggles and that expanding Window reveals the expected `CWindow` snippet while Grid remains collapsed until clicked.
  **Must NOT do**: Do not include unrelated catalog stage wrappers unless needed to explain the component API. Do not alter the live stage layout or existing component props.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: More complex multi-line example composition and layout-sensitive sections.
  - Skills: `[]` — No special skill needed.
  - Omitted: `work-with-pr` — Planning does not assume PR workflow.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: Task 5 | Blocked By: Task 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/dev/ComponentCatalog.tsx:153` — Window Showcase API and content copy.
  - Pattern: `src/dev/ComponentCatalog.tsx:169` — Dock Showcase API.
  - Pattern: `src/dev/ComponentCatalog.tsx:182` — StartBar Showcase API.
  - Pattern: `src/dev/ComponentCatalog.tsx:195` — Grid Showcase composition and item layout.
  - Pattern: `src/dev/styles/catalog.scss:114` — Stage styling that must remain unaffected.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test --runInBand tests/ComponentCatalog.test.tsx` exits `0`.
  - [ ] Expanding Window reveals a code region containing `<CWindow x={24} y={24} width={320} height={200}>`.
  - [ ] Dock, StartBar, and Grid each expose a `Show code` toggle in their own section.
  - [ ] Expanding Window leaves Grid hidden until its own toggle is clicked.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Second-column snippet happy path
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ComponentCatalog.test.tsx`
    Expected: Test expands the Window section and confirms the `CWindow` snippet appears while the live stage content still renders.
    Evidence: .sisyphus/evidence/task-4-second-column-jest.txt

  Scenario: Independent collapse edge case
    Tool: Bash
    Steps: Run `yarn test --runInBand tests/ComponentCatalog.test.tsx`
    Expected: Test confirms Grid remains collapsed before its own toggle is clicked, even after Window has been expanded.
    Evidence: .sisyphus/evidence/task-4-second-column-edge.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `src/dev/ComponentCatalog.tsx`, `tests/ComponentCatalog.test.tsx`

- [x] 5. Add Playwright coverage for catalog code disclosure

  **What to do**: Add `tests/ui/component-catalog-code.spec.ts` that loads the dev catalog root page (`/`), targets the Button Showcase via `data-testid="catalog-section-button"`, clicks the `Show code` button, verifies the controlled region becomes visible and contains representative snippet text, then clicks `Hide code` and verifies the region is hidden again. Add one independence assertion proving another section such as Window remains collapsed before interaction.
  **Must NOT do**: Do not create a new Playwright harness route for this feature; use the existing dev catalog root rendered by `src/dev/main.tsx`. Do not rely on screenshots as the primary assertion.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: Focused browser smoke coverage using existing Playwright setup.
  - Skills: `[]` — No special skill needed.
  - Omitted: `pre-publish-review` — Overkill for a scoped demo feature.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Task 6 | Blocked By: Task 3, Task 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `playwright.config.ts:9` — Base URL and browser behavior for UI tests.
  - Pattern: `src/dev/main.tsx:6` — Confirms the dev root page renders `ComponentCatalog` directly.
  - Pattern: `tests/ui/window.smoke.spec.ts:4` — Existing Playwright assertion style.
  - API/Type: `src/dev/ComponentCatalog.tsx:78` — Button section `data-testid` anchor.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn test:ui tests/ui/component-catalog-code.spec.ts` exits `0`.
  - [ ] Browser test expands Button code, verifies the region is visible, and then collapses it successfully.
  - [ ] Browser test verifies Window section remains collapsed before its own toggle is clicked.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Browser disclosure happy path
    Tool: Bash
    Steps: Run `yarn test:ui tests/ui/component-catalog-code.spec.ts`
    Expected: Playwright loads `/`, clicks the Button section toggle, sees the code region, then clicks again and confirms the region is hidden.
    Evidence: .sisyphus/evidence/task-5-catalog-playwright.txt

  Scenario: Cross-section browser edge case
    Tool: Bash
    Steps: Run `yarn test:ui tests/ui/component-catalog-code.spec.ts`
    Expected: Playwright confirms the Window section code region is hidden before Window interaction, even after Button has been toggled.
    Evidence: .sisyphus/evidence/task-5-catalog-playwright-edge.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `tests/ui/component-catalog-code.spec.ts`

- [x] 6. Run full validation and capture evidence

  **What to do**: Run the full repo validations in CI order: `yarn lint`, `yarn test`, `yarn test:ui`, `yarn build`. Save command outputs or concise pass/fail evidence under `.sisyphus/evidence/`. During review, explicitly confirm `src/index.ts` still exports only library entries and that `vite.config.ts` still builds from `src/index.ts`, proving the new dev-only disclosure code is not part of the public surface.
  **Must NOT do**: Do not modify CI workflow files. Do not “fix” unrelated test or lint issues beyond this feature’s blast radius.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: Validation orchestration and evidence capture.
  - Skills: `[]` — No special skill needed.
  - Omitted: `openspec-verify-change` — This repo task already has direct verification commands.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Final Verification Wave | Blocked By: Task 5

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `package.json:21` — Canonical repo commands.
  - Pattern: `.github/workflows/ci-pr.yml:36` — CI order: lint → unit tests → Playwright → build.
  - Guardrail: `src/index.ts:1` — Public entrypoint must remain unchanged in scope.
  - Guardrail: `vite.config.ts:25` — Library build entry remains `src/index.ts`.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn lint` exits `0`.
  - [ ] `yarn test` exits `0`.
  - [ ] `yarn test:ui` exits `0`.
  - [ ] `yarn build` exits `0`.
  - [ ] Evidence files exist for all six tasks under `.sisyphus/evidence/`.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Full validation happy path
    Tool: Bash
    Steps: Run `yarn lint && yarn test && yarn test:ui && yarn build`
    Expected: All commands exit `0` in sequence and evidence files are written for the run.
    Evidence: .sisyphus/evidence/task-6-full-validation.txt

  Scenario: Public-surface isolation edge case
    Tool: Bash
    Steps: Run `yarn build` and inspect the unchanged public entry references at `src/index.ts` and `vite.config.ts`
    Expected: Build succeeds and no dev-only file is exported or used as the library entry.
    Evidence: .sisyphus/evidence/task-6-public-surface-check.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `.sisyphus/evidence/*`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit `okay` before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle (REJECT → FIXED)
- [x] F2. Code Quality Review — unspecified-high (REJECT → FIXED)
- [x] F3. Real Manual QA — unspecified-high (+ Playwright if UI) (REJECT → FIXED)
- [x] F4. Scope Fidelity Check — deep (APPROVE)

## Commit Strategy
- Default execution mode for this request is **no commit unless the user explicitly asks for it**.
- If commits are requested during execution, use these atomic slices:
  - `test(dev-catalog): add disclosure unit coverage`
  - `feat(dev-catalog): add per-showcase code disclosure`
  - `test(dev-catalog): cover catalog code toggle in browser`
- Do not mix unrelated cleanup into those commits.

## Success Criteria
- Every Showcase in `src/dev/ComponentCatalog.tsx` exposes exactly one collapsed-by-default code toggle.
- Expanding one Showcase does not implicitly expand another Showcase.
- Snippets are explicit, local to their Showcase definitions, and readable without catalog wrapper noise.
- No public package exports or runtime library behavior changes.
- Jest, Playwright, lint, and build all pass.
