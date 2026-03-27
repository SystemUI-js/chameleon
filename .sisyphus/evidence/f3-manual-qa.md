# F3 Real Manual QA

- Plan: `systemtype-start-bar`
- Branch: `feature/screen-desktop-layout`
- Completed At: `2026-03-26T03:39:04Z`
- Overall Result: `APPROVED`

## Command Results

1. `yarn test --runInBand tests/Dock.test.tsx tests/StartBar.test.tsx tests/SystemHost.test.tsx tests/SystemShellCharacterization.test.tsx tests/ThemeScopeClassNames.test.tsx`
   - Exit Code: `0`
   - Key Output: `PASS` 5 suites, `35 passed`, completed in `2.14s`.

2. `yarn test:ui --grep "start bar|system/theme switch"`
   - Exit Code: `0`
   - Key Output: Playwright ran `3` tests on Chromium, `3 passed`, completed in `3.71s`.

3. `yarn lint`
   - Exit Code: `0`
   - Key Output: ESLint completed successfully in `4.13s`.
   - Warning: `.eslintignore` is deprecated under ESLint flat config and should move to `eslint.config.js` ignores.

4. `yarn build`
   - Exit Code: `0`
   - Key Output: Vite built successfully in `3.23s`; emitted `dist/chameleon.es.js` and `dist/chameleon.umd.cjs`.
   - Warning: Sass legacy JS API deprecation warnings were emitted during build.
   - Note: `vite:dts` reported external `.d.ts` emissions under `tests/` and config files, but build still succeeded.

5. `rg -n "CStartBar" dist/index.d.ts dist/chameleon.es.js`
   - Exit Code: `0`
   - Key Output: `dist/chameleon.es.js:5784:  pg as CStartBar,`
   - Note: Command output showed a match in `dist/chameleon.es.js`; no `dist/index.d.ts` match was printed by `rg`.

## Verdict

- All required commands exited with code `0`.
- F3 manual QA gate is `APPROVED`.

---

## 2026-03-27 Win98 Controls QA

- Branch: `feature/windows-styles`
- Completed At: `2026-03-27T05:21:59Z`
- Verdict: `APPROVE`

### Playwright Command

1. `yarn test:ui --grep "Win98 controls"`
   - Exit Code: `0`
   - Result: `9 passed (4.8s)` on Chromium
   - Spec: `tests/ui/common-controls.smoke.spec.ts`

### Manual Verification Evidence

- Overview screenshot: `.sisyphus/evidence/f3-win98-controls-overview.png`

#### Button — selector: `[data-testid="button-demo-primary"]`

- Raised bevel: `APPROVED`
  - Screenshot: `.sisyphus/evidence/f3-button-default-zoom.png`
  - Computed style: top/left `rgb(255, 255, 255)`, right/bottom `rgb(128, 128, 128)`, background `rgb(192, 192, 192)`
- Active sunken state: `APPROVED`
  - Screenshot: `.sisyphus/evidence/f3-button-active-zoom.png`
  - Computed style: top/left flipped to `rgb(128, 128, 128)`, right/bottom flipped to `rgb(255, 255, 255)`, background `rgb(179, 179, 179)`
- Focus dotted outline: `APPROVED`
  - Screenshot: `.sisyphus/evidence/f3-button-focus-zoom.png`
  - Computed style: `outline: 1px dotted rgb(0, 0, 0)`, `outline-offset: -3px`

#### Radio — selector: `[data-testid="radio-demo-fruit"] input[type="radio"]:first-of-type`

- 12px size: `APPROVED`
  - Computed box: `12 x 12`
- Checked dot: `APPROVED`
  - Screenshot: `.sisyphus/evidence/f3-radio-default-zoom.png`
  - Computed style: `background-image: radial-gradient(... rgb(0, 0, 0) ... rgb(255, 255, 255) ...)`
- Focus outline: `APPROVED`
  - Screenshot: `.sisyphus/evidence/f3-radio-focus-zoom.png`
  - Computed style: `outline: 1px dotted rgb(0, 0, 0)`, `outline-offset: 2px`

#### Select — selector: `[data-testid="select-demo-size"]`

- Field-style inset border: `APPROVED`
  - Screenshot: `.sisyphus/evidence/f3-select-default-zoom.png`
  - Computed style: top/left `rgb(128, 128, 128)`, right/bottom `rgb(255, 255, 255)`
- Win98 arrow: `APPROVED`
  - Screenshot: `.sisyphus/evidence/f3-select-default-zoom.png`
  - Computed style: `background-image` contains two black `linear-gradient(...)` arrows
- Focus inner dotted outline: `APPROVED`
  - Screenshot: `.sisyphus/evidence/f3-select-focus-zoom.png`
  - Computed style: `outline: 1px dotted rgb(0, 0, 0)`, `outline-offset: -4px`

### Notes

- No selector/state failures found during this QA pass.
- Dev harness emitted a non-blocking `favicon.ico` `404`, unrelated to control rendering or interaction states.
