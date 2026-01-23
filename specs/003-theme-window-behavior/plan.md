# Implementation Plan: Theme & Window Behavior Refinements

**Branch**: `003-theme-window-behavior` | **Date**: 2026-01-23 | **Spec**: /home/zhangxiao/frontend/SysUI/chameleon/specs/003-theme-window-behavior/spec.md
**Input**: Feature specification from `/specs/003-theme-window-behavior/spec.md`

## Summary

Update the default theme to `default`, restore window resize/drag interactions with correct cursor and activation behavior (including `onActive`), align SubMenu/Modal visuals with the active theme, and introduce theme-defined behavior differences (e.g., drag mode) and default props for theme-scoped components.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18.2
**Primary Dependencies**: Vite 5, Sass, Jest, React Testing Library
**Storage**: N/A (component library)
**Testing**: Jest + React Testing Library
**Target Platform**: Web browsers (React component library + demo)
**Project Type**: single (component library)
**Performance Goals**: Theme switch updates visible styles within 1s (SC-004); drag/resize remains responsive (no perceived lag)
**Constraints**: Strict TS/ESLint/Prettier gates; no `any` or TS suppression; CSS className-based styling (no CSS-in-JS)
**Scale/Scope**: Theme system + Window/Modal/SubMenu components; demo behavior only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Code quality gate: strict TS + lint/format/build must pass
- Testing gate: behavior/API changes include tests; no test deletion to pass
- UX consistency gate: theme tokens + component interaction patterns maintained
- Performance gate: measurable goals defined for perf-sensitive changes
- Maintainability gate: clear module boundaries and justified complexity

**Post-Phase 1 re-check**: PASS (no violations identified in plan artifacts)

## Project Structure

### Documentation (this feature)

```text
specs/003-theme-window-behavior/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/          # Window, Modal, SubMenu, etc.
├── theme/               # Theme definitions and ThemeContext
├── dev/                 # Demo entry
└── index.ts             # Library exports

tests/                   # Jest + RTL tests
```

**Structure Decision**: Single project component library; feature work stays under `src/components` and `src/theme`, with tests in `tests/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
