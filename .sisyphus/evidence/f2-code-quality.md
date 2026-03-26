# F2 Code Quality Review

## Verdict

REJECT

## Scope Reviewed

- `src/dev/themeSwitcher.tsx`
- `src/system/SystemHost.tsx`
- `src/system/default/DefaultSystem.tsx`
- `src/dev/main.tsx`
- `src/dev/playwright/windowHarness.tsx`
- `src/theme/default/styles/index.scss`
- `src/components/Select/Select.tsx`
- `src/system/registry.ts`
- `tests/SystemTypeSwitch.test.tsx`
- `tests/SystemHost.test.tsx`
- `tests/DefaultTheme.test.tsx`
- `tests/ui/default-window-system-switch.spec.ts`

## Checks Run

1. `grep` for `\bany\b|as any|@ts-ignore` across all touched TS/TSX files
2. `lsp_diagnostics` on reviewed TS/TSX files
3. `yarn lint`
4. `./node_modules/.bin/tsc --noEmit`
5. `yarn build`
6. Manual source review against existing component/style patterns

## What Passed

- No `any`, `as any`, or `@ts-ignore` usage was found in the reviewed TS/TSX files.
- `lsp_diagnostics` found no errors; only non-blocking import-order info appeared on some files.
- `yarn lint` passed.
- `./node_modules/.bin/tsc --noEmit` passed.
- `yarn build` passed. Output included existing Sass legacy API deprecation warnings only.
- `CSelect` adding an `id` prop is type-safe and improves label association in `src/components/Select/Select.tsx:10` and `src/components/Select/Select.tsx:54`.
- The UI test uses accessible querying via `page.getByLabel('切换系统')` in `tests/ui/default-window-system-switch.spec.ts:9`.

## Blocking Issues

1. Default title bar dropped its base class, causing a real style and layout regression.
   - `CWindowTitle` does not merge classes; passing `className` replaces the default `cm-window__title-bar` class in `src/components/Window/WindowTitle.tsx:66`.
   - `DefaultSystem` now passes only `cm-window__title-bar--with-controls` in `src/system/default/DefaultSystem.tsx:59`.
   - The actual title-bar visuals live on `.cm-window__title-bar` in `src/theme/default/styles/index.scss:25`, so the default window title bar no longer receives its base padding, gradient background, typography, or drag cursor.
   - The body/content rule `.cm-window > :not(.cm-window__title-bar)` now matches the title bar and applies content padding/background to it in `src/theme/default/styles/index.scss:67`.
   - This is inconsistent with existing class composition patterns that keep the base class and add a modifier, e.g. button classes in `src/components/Button/Button.tsx:26` and `src/components/Button/Button.tsx:29`.
   - The regression is masked by changing the test expectation to the modifier-only class in `tests/DefaultTheme.test.tsx:18`, instead of preserving the base-class contract.

2. The dev preview no longer remounts `CommonControlsPreview` after runtime system switches.
   - `mountCommonControlsPreview()` finds the first body host and creates a nested React root exactly once in `src/dev/main.tsx:11` and `src/dev/main.tsx:15`.
   - Runtime system switching now happens through local state in `src/dev/main.tsx:27`.
   - After the system shell remounts, the original host (`default-window-body` or `windows-window-body`) is replaced, but no effect reruns `mountCommonControlsPreview()` after selection changes in `src/dev/main.tsx:35` and `src/dev/main.tsx:48`.
   - Result: the dev entry can switch shells, but the common-controls preview is likely left mounted on a detached node while the new window body stays empty. This is a functional regression in the main preview flow.

## Non-Blocking Notes

- `DefaultSystem` reaches into the dev layer by importing `resolveDevSelectionForSystemType` from `src/dev/themeSwitcher.tsx:7`, while `src/dev/themeSwitcher.tsx:1` already depends on `src/system/SystemHost.tsx`, which depends back on `src/system/default/DefaultSystem.tsx:2`. This creates a dev↔system cycle and is worth removing even if it does not fail immediately.
- `handleSelectionChange` uses an unchecked cast from `string` to `SystemTypeDefinition['id']` in `src/system/default/DefaultSystem.tsx:46`. It works with current option sources, but it weakens the otherwise strict typing story.
- Using a `fieldset` without a `legend` in `src/system/default/DefaultSystem.tsx:64` is not a blocker because the select is correctly labeled, but a plain `div` would better match the actual semantics here.

## Evidence References

- `src/components/Window/WindowTitle.tsx:66`
- `src/system/default/DefaultSystem.tsx:46`
- `src/system/default/DefaultSystem.tsx:59`
- `src/system/default/DefaultSystem.tsx:64`
- `src/dev/main.tsx:11`
- `src/dev/main.tsx:15`
- `src/dev/main.tsx:27`
- `src/dev/main.tsx:35`
- `src/dev/main.tsx:48`
- `src/dev/themeSwitcher.tsx:1`
- `src/dev/themeSwitcher.tsx:7`
- `src/theme/default/styles/index.scss:25`
- `src/theme/default/styles/index.scss:43`
- `src/theme/default/styles/index.scss:67`
- `src/components/Button/Button.tsx:26`
- `src/components/Button/Button.tsx:29`
- `src/components/Select/Select.tsx:10`
- `src/components/Select/Select.tsx:54`
- `tests/DefaultTheme.test.tsx:18`
- `tests/ui/default-window-system-switch.spec.ts:9`
