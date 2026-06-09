# F3 Real Manual QA Evidence — add-datepicker-modal-confirm

## Scope

- Dev server: `NO_PROXY=127.0.0.1,localhost yarn dev`
- URL: `http://localhost:5673/`
- Browser driver: Python Playwright, Chromium headless
- Themes covered: `default`, `win98`, `winxp`, `win7`
- Components covered: `CDatePicker`, `CModal`, `CConfirm`

## Theme Matrix

| Theme | CDatePicker | CModal | CConfirm |
|---|---|---|---|
| default | PASS — opened calendar, selected `2026-01-20`, verified value update, cleared value | PASS — verified mask, title, close button; closed by ×, ESC, and mask click at `{x:5,y:5}` | PASS — imperative `confirm()` resolved `true` on OK and `false` on Cancel |
| win98 | PASS — opened calendar, selected `2026-01-20`, verified value update, cleared value | PASS — verified mask, title, close button; closed by ×, ESC, and mask click at `{x:5,y:5}` | PASS — imperative `confirm()` resolved `true` on OK and `false` on Cancel |
| winxp | PASS — opened calendar, selected `2026-01-20`, verified value update, cleared value | PASS — verified mask, title, close button; closed by ×, ESC, and mask click at `{x:5,y:5}` | PASS — imperative `confirm()` resolved `true` on OK and `false` on Cancel |
| win7 | PASS — opened calendar, selected `2026-01-20`, verified value update, cleared value | PASS — verified mask, title, close button; closed by ×, ESC, and mask click at `{x:5,y:5}` | PASS — imperative `confirm()` resolved `true` on OK and `false` on Cancel |

## Screenshot Evidence

| Theme | Component | Screenshot |
|---|---|---|
| default | CDatePicker | `.playwright-mcp/f3-default-date-picker.png` |
| default | CModal | `.playwright-mcp/f3-default-modal.png` |
| default | CConfirm | `.playwright-mcp/f3-default-confirm.png` |
| win98 | CDatePicker | `.playwright-mcp/f3-win98-date-picker.png` |
| win98 | CModal | `.playwright-mcp/f3-win98-modal.png` |
| win98 | CConfirm | `.playwright-mcp/f3-win98-confirm.png` |
| winxp | CDatePicker | `.playwright-mcp/f3-winxp-date-picker.png` |
| winxp | CModal | `.playwright-mcp/f3-winxp-modal.png` |
| winxp | CConfirm | `.playwright-mcp/f3-winxp-confirm.png` |
| win7 | CDatePicker | `.playwright-mcp/f3-win7-date-picker.png` |
| win7 | CModal | `.playwright-mcp/f3-win7-modal.png` |
| win7 | CConfirm | `.playwright-mcp/f3-win7-confirm.png` |

## Console Log Excerpts

```text
No console entries after filtering expected Vite/React dev-mode noise:
- [vite] connecting
- [vite] connected
- Download the React DevTools
```

## Dev Server Readiness Excerpt

```text
VITE v5.4.21  ready in 970 ms
➜  Local:   http://localhost:5673/
```

## Raw Playwright Result Excerpt

```text
default/CDatePicker: PASS - opened calendar, selected 2026-01-20, cleared value
default/CModal: PASS - mask/title/close rendered; closed by ×, ESC, and mask offset
default/CConfirm: PASS - imperative confirm() returned true on OK and false on Cancel
win98/CDatePicker: PASS - opened calendar, selected 2026-01-20, cleared value
win98/CModal: PASS - mask/title/close rendered; closed by ×, ESC, and mask offset
win98/CConfirm: PASS - imperative confirm() returned true on OK and false on Cancel
winxp/CDatePicker: PASS - opened calendar, selected 2026-01-20, cleared value
winxp/CModal: PASS - mask/title/close rendered; closed by ×, ESC, and mask offset
winxp/CConfirm: PASS - imperative confirm() returned true on OK and false on Cancel
win7/CDatePicker: PASS - opened calendar, selected 2026-01-20, cleared value
win7/CModal: PASS - mask/title/close rendered; closed by ×, ESC, and mask offset
win7/CConfirm: PASS - imperative confirm() returned true on OK and false on Cancel
```

## VERDICT

APPROVE
