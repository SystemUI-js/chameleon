# F3 Automated UI QA Replay

## Scope

- Plan target: `F3. Automated UI QA Replay — unspecified-high (+ playwright)`
- Reviewed specs: `tests/ui/window.move.spec.ts`, `tests/ui/window.resize.spec.ts`, `tests/ui/window.resize-guards.spec.ts`, `tests/ui/system-theme-switch.spec.ts`
- Helper basis: `tests/ui/window.helpers.ts`

## Commands Run

1. Confirmed no old root-theme assumptions remain in UI specs:

   ```bash
   rg -n "DevThemeRoot|resolveDevThemeComponent|theme-root|activeTheme|root component" tests/ui/*
   ```

   Result: no matches.

2. Focused switch-flow smoke replay:

   ```bash
   yarn test:ui --grep "window can be dragged|window can be resized from all edges|minimum content size clamp|respects maximum content size clamps|preserves dragged metrics on same-system theme switch|reboots to default boot layout on cross-system switch"
   ```

   Result: command executed cleanly, but only the two system/theme switch tests matched this grep pattern because the drag/resize spec titles use different names.

3. Full targeted replay of the required UI flows:

   ```bash
   yarn test:ui tests/ui/window.move.spec.ts tests/ui/window.resize.spec.ts tests/ui/window.resize-guards.spec.ts tests/ui/system-theme-switch.spec.ts
   ```

   Result: `15 passed (9.3s)`.

## Flow Outcomes

- **Same-system theme switch**: PASS
  - Start: `windows/win98`
  - Switch: `windows/winxp`
  - Confirmed `screen-root` updates to `data-system-type="windows"`, `data-theme="winxp"`, and `cm-theme--winxp`
  - Confirmed runtime window content remains the Win98 session payload
  - Confirmed frame metrics stay exactly `{ x: 60, y: 68, width: 320, height: 220 }`
  - Confirmed `data-window-uuid` is preserved across the switch

- **Cross-system reboot**: PASS
  - Start: `windows/winxp`
  - Switch: `default/default`
  - Confirmed `screen-root` updates to `cm-system--default cm-theme--default`
  - Confirmed runtime payload reboots to the default window content
  - Confirmed frame metrics reset to boot layout `{ x: 32, y: 28, width: 332, height: 228 }`
  - Confirmed `data-window-uuid` changes after the switch

- **Existing drag flows**: PASS
  - `title drag moves window from (10,20) to (30,60)` passed
  - `window content drag is a no-op` passed, confirming non-title drags still do not move the frame

- **Existing resize flows**: PASS
  - All 8 resize handles in `tests/ui/window.resize.spec.ts` passed: `e`, `w`, `n`, `s`, `ne`, `nw`, `se`, `sw`
  - Edge-specific expected metrics remained exact for every direction

- **Existing resize guard flows**: PASS
  - `drag-only` fixture hides resize handles while title dragging still moves the frame
  - `min-clamp` fixture clamps east/south shrink to `1px`
  - `max-clamp` fixture clamps east growth and preserves north-west anchor behavior

## Environment Notes

- Observed only a harmless Yarn warning: `warning ../../../package.json: No license field`
- No localhost boot, proxy, favicon, or harness readiness issues affected the replay

## Verdict

VERDICT: APPROVE

---

## 2026-03-26 Real UI QA Re-run

### Scope

- Task target: `F3. Real Manual QA`
- Required flow: start dev server, open `default/default`, operate `切换系统` combobox, verify URL/DOM/start-bar outcomes, and verify switching back works

### Commands Run

1. Start local preview and confirm harness route responds:

   ```bash
   yarn dev --host 127.0.0.1 > /tmp/chameleon-dev.log 2>&1 &
   curl -I "http://127.0.0.1:5673/playwright-window.html?systemType=default&theme=default"
   ```

   Result: `HTTP/1.1 200 OK`.

2. Run the existing focused UI spec as a forward-path baseline:

   ```bash
   yarn test:ui tests/ui/default-window-system-switch.spec.ts
   ```

   Result: `1 passed (1.4s)`.

3. Execute a real Playwright interaction probe against the live preview:

   ```bash
   node --input-type=module -e "import { chromium, expect } from '@playwright/test'; /* real interaction probe */"
   ```

   Result summary:

   ```json
   {
     "initialUrl": "http://127.0.0.1:5673/playwright-window.html?systemType=default&theme=default",
     "initialSystemType": "default",
     "initialTheme": "default",
     "afterWindowsUrl": "http://127.0.0.1:5673/playwright-window.html?systemType=windows&theme=win98",
     "afterWindowsSystemType": "windows",
     "afterWindowsTheme": "win98",
     "afterWindowsStartBarVisible": true,
     "afterWindowsDefaultBodyCount": 0,
     "afterWindowsWindowsBodyVisible": true,
     "defaultToWindowsRemounted": true,
     "switchBackComboboxCount": 0,
     "switchBackPossibleViaVisibleUI": false,
     "verdict": "REJECT"
   }
   ```

### Flow Outcomes

- **Accessible combobox**: PASS
  - `getByRole('combobox', { name: '切换系统' })` resolves on `default/default`

- **Default → Windows**: PASS
  - URL updates to `systemType=windows&theme=win98`
  - `screen-root` updates to `data-system-type="windows"` and `data-theme="win98"`
  - `windows-start-bar` becomes visible
  - `default-window-body` disappears
  - `windows-window-body` becomes visible
  - `data-window-uuid` changes, confirming remount

- **Windows → Default via real UI**: FAIL
  - After switching to Windows, the page exposes **no visible `切换系统` combobox** (`count = 0`)
  - Because the forward transition uses `history.replaceState`, browser back navigation is not a substitute for a visible reverse interaction
  - The required end-to-end “switch back works” flow therefore cannot be completed through the actual UI

### Specific Issue

- Blocking issue: `src/system/default/DefaultSystem.tsx` renders the `切换系统` control only inside the default system shell. Once the app switches to `windows`, the reverse control is gone, so the feature is one-way in real interaction.
- Coverage gap: `tests/ui/default-window-system-switch.spec.ts` proves only the forward path and does not catch the missing reverse-flow behavior.

### Verdict

VERDICT: REJECT
