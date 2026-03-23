# add-cdock issues

## 2026-03-22 t1 implementation
- No blockers during T1. The only issue encountered was a `useImportType` style warning on the initial `React` import in `src/components/Dock/Dock.tsx`, resolved by switching to a type-only import.

## 2026-03-22 t3 implementation
- No blockers during T3. `openspec` did not contain an `add-cdock` change entry, so execution followed the read-only plan file `.sisyphus/plans/add-cdock.md` as the authoritative task source.
- SCSS LSP diagnostics are unavailable in the current environment because no `.scss` language server is configured; TypeScript files still reported zero diagnostics, and behavior was verified with Jest plus build output.

## 2026-03-22 t4 implementation
- No blockers during T4. The only scope-sensitive point was preserving the existing T1-T3 style merge path while adding state sync strictly for controlled `position` and `height` changes.

## 2026-03-22 t5 implementation
- No blockers during T5. The only caution point was that `CWidget.renderFrame()` spreads `options.style` after its own absolute layout, so Dock had to strip reserved edge keys from caller style before reapplying computed edge fields and `position: 'absolute'`.

## 2026-03-22 t6 implementation
- No blockers during T6. The only scope guard was to expose `CDock` strictly through `src/components/index.ts` and verify package-entry visibility from `../src` without touching `src/index.ts` or changing Dock runtime behavior.

## 2026-03-22 t7 verification
- No Dock blockers during T7. Focused Dock tests, lint, full Jest, and build all passed, so the task stayed verification-only and required no source-file fix.
- Build still reports the inherited Sass legacy API deprecation warnings and `vite:dts` outside-emitted notices, but they did not block T7 and remain out of Dock-only scope.

## 2026-03-22 f2-f4 corrective fix
- Final-wave review found a real public-API leak: `src/components/index.ts` exported `A`, which flowed through `src/index.ts`. The fix was limited to removing that stray export; no Dock runtime or root-entry changes were needed.
