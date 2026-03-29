## 2026-03-27

- Regression verification showed the Win98 common-control refresh stayed isolated: `src/theme/winxp/styles/index.scss` and `src/theme/default/styles/index.scss` still carry their own rounded/non-Win98 button, radio, and select treatments, and `src/dev/commonControlsPreview.tsx` still exposes the same stable interactive/disabled preview paths used by smoke tests.
- `tests/SystemTypeThemeRegistry.test.tsx` still protects the intended system/theme matrix (`windows -> win98|winxp`, `default -> default`), so cross-theme pollution risk remains covered by characterization tests.
- Win98 theme scoping stays safe when selectors remain under `.cm-system--windows.cm-theme--win98`, but window body styling should use an explicit semantic hook instead of `.cm-window > :not(.cm-window__title-bar)`; structural negation selectors are brittle against future child-node additions.

- 这类样式计划不能只看命令是否变绿；若计划把数值型 CSS 断言、default/disabled Win98 fixture 覆盖和 happy/edge 证据文件写成验收项，就必须在 Playwright 路径与证据产物里逐条落地，否则仍应判定为未完成。
