# F3 Real Manual QA Retest

Environment: Playwright Chromium against Vite dev preview at http://localhost:5673/ with viewport 1024x768 for CModal centering.
Note: `src/dev/ComponentCatalog.tsx` exists, but exact issue fixtures were mounted inline in the real browser via the Vite dev server because several requested states are not present in the catalog. `yarn build` generated dist artifacts but reported existing declaration-type errors in CTable, ComponentCatalog CTimePicker handler, and Widget.test; JS/CSS artifacts were still emitted for fallback use.

## Issue 1 (CModal): FAIL
- Evidence: `.omo/evidence/f3-issue1-cmodal.png`
- Observation: Measured .cm-window at x=332.0, y=384.0, width=360.0, height=0.0; expected center x=332.0, y=384.0 (dx=0.0, dy=0.0), fully inside viewport=true, Playwright visible=false.
- Console: clean

## Issue 2 (CConfirm): PASS
- Evidence: `.omo/evidence/f3-issue2-cconfirm-declarative.png`, `.omo/evidence/f3-issue2-cconfirm-imperative.png`
- Observation: Declarative body height=56.0 text="Test?" with OK/Cancel visible=true/true; imperative body height=56.0 text="Test?" with OK/Cancel visible=true/true.
- Console: clean

## Issue 3 (CDatePicker / CTimePicker): PASS
- Evidence: `.omo/evidence/f3-issue3-cdatepicker-before.png`, `.omo/evidence/f3-issue3-cdatepicker-after.png`, `.omo/evidence/f3-issue3-ctimepicker-before.png`, `.omo/evidence/f3-issue3-ctimepicker-after.png`
- Observation: Date panel visibility true -> false after body click at (10,10); Time panel visibility true -> false.
- Console: clean

## Issue 4 (CCheckbox): PASS
- Evidence: `.omo/evidence/f3-issue4-ccheckbox.png`
- Observation: Native checkbox indeterminate=true, checked=false; label classes="cm-checkbox cm-checkbox--indeterminate", screenshot shows the mixed state next to “Mixed”.
- Console: clean

## Issue 5 (CTree): PASS
- Evidence: `.omo/evidence/f3-issue5-ctree.png`
- Observation: Parent aria-checked="mixed", native indeterminate=true; Child A checked=true, Child B checked=false.
- Console: clean

## Issue 6 (CSelect): PASS
- Evidence: `.omo/evidence/f3-issue6-cselect-open.png`, `.omo/evidence/f3-issue6-cselect-after-cherry.png`, `.omo/evidence/f3-issue6-cselect-after-apple.png`, `.omo/evidence/f3-issue6-cselect-after-outside.png`
- Observation: Trigger text flowed "Apple" -> "Apple, Cherry" -> "Cherry"; menu open states initial=true, after Cherry=true, after Apple=true, after outside click=false.
- Console: clean

```
F3 VERDICT: REJECT
BLOCKERS (if REJECT):
1. Issue 1: Measured .cm-window at x=332.0, y=384.0, width=360.0, height=0.0; expected center x=332.0, y=384.0 (dx=0.0, dy=0.0), fully inside viewport=true, Playwright visible=false.
```
