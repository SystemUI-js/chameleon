# add-cdock learnings

## 2026-03-22 research snapshot
- `src/components/Widget/Widget.tsx` is the base contract: `CWidgetProps` already includes `children`, and `renderFrame()` renders an absolute-positioned frame with overridable `className`, `testId`, and `style`.
- `renderFrame()` currently builds frame style as `left/top/width/height/position` and then spreads `options.style`, so Dock must control merge order deliberately when protecting edge layout from caller overrides.
- `src/components/Window/Window.tsx` is the main class-component reference: `constructor` initializes state from props with `??`, and `componentDidUpdate()` syncs only controlled props when they change.
- `tests/Grid.test.tsx` is the clearest style-merge reference: preserve caller visual styles while asserting internal layout styles with `toHaveStyle()`.
- `src/components/index.ts` is the only component barrel; `src/index.ts` re-exports `./components`, so Dock should enter the public API through the component barrel instead of a separate root export.
- Official React guidance retrieved by librarian aligns with the plan: initialize once from props/defaults, sync only controlled props in `componentDidUpdate`, and never treat post-mount default prop changes as re-initialization.

## 2026-03-22 t1 implementation
- T1 can stay minimal by exporting the full public prop surface in `src/components/Dock/Dock.tsx` while only initializing `position` and `height` once in the constructor; no controlled sync or edge mapping is needed yet.
- Reusing `CWidget.renderFrame()` is enough to prove renderability in phase 1 as long as `className`, `style`, and `data-testid` are forwarded intentionally and internal Dock-only props are not spread onto the DOM.
- A focused Jest case in `tests/Dock.test.tsx` can validate the public contract by typing a `CDockProps` object with the planned props set and asserting the rendered frame remains absolute-positioned with caller styles preserved.
- The "must provide `height` or `defaultHeight`" rule is best enforced as a union layered on top of shared dock props, plus a `@ts-expect-error` regression guard inside `tests/Dock.test.tsx` so `yarn tsc --noEmit` fails if the contract is accidentally widened.

## 2026-03-22 t2 implementation
- T2 works cleanly as a dedicated dock-edge helper in `src/components/Dock/Dock.tsx` that returns a fresh style object per `resolvedPosition`, so each branch only emits the active edge keys plus the relevant `width` or `height` thickness field.
- Because T4 controlled/default sync is intentionally out of scope, T2 regression tests in `tests/Dock.test.tsx` should verify each direction with separate mount cycles instead of `rerender`-driven prop updates; that still proves there are no stale opposite-axis style fields in the mapped output.

## 2026-03-22 t3 implementation
- T3 stays within scope by keeping `CDock` on the `CWidget.renderFrame()` path and only enriching frame options: compose `cm-dock` plus `cm-dock--{position}` into the frame class, default `testId` to `dock-frame`, and pass `children` directly as frame content without any inner wrapper.
- `src/components/Dock/index.scss` can remain a tiny static contract file with only `.cm-dock` and direction modifier selectors; runtime edge calculations stay in `Dock.tsx`, matching the minimal SCSS pattern used by `Window` and `Screen`.
- Stable DOM assertions for this phase are best split between default-id coverage (`dock-frame` contains child content) and override coverage (caller-supplied `data-testid` still selects the same single frame element with composed dock classes).

## 2026-03-22 t4 implementation
- T4 follows the local `CWindow` pattern cleanly by storing only `resolvedPosition` and `resolvedHeight` in `CDock` state, initializing them with `position ?? defaultPosition ?? 'top'` and `height ?? defaultHeight`.
- `componentDidUpdate(prevProps)` should watch only `position` and `height`; using `this.props.position ?? this.state.resolvedPosition` and `this.props.height ?? this.state.resolvedHeight` preserves the last resolved value when a controlled prop becomes `undefined` without re-reading defaults.
- The safest regression tests for this phase are: one initial-render default case, one controlled rerender case with `waitFor()` for class-component `setState`, and one rerender proving post-mount `defaultPosition` / `defaultHeight` changes do not reset internal state.

## 2026-03-22 t5 implementation
- T5 is safest when `CDock` strips caller-provided `position/top/right/bottom/left/width/height` before merging `style`, then reapplies computed dock-edge styles plus `position: 'absolute'`; this preserves visual props like `color`, `border`, and `zIndex` without letting reserved layout keys leak back in.
- The callback-silence regression should cover three paths in one test: mount with defaults, rerender with changed default props, and rerender with controlled `position` / `height` sync; all three must keep `onPositionChange` and `onHeightChange` at zero calls.

## 2026-03-22 t6 implementation
- `CDock` enters the public package surface by adding `export * from './Dock/Dock';` to `src/components/index.ts`, matching the existing one-line barrel style and letting `src/index.ts` keep its existing `export * from './components';` passthrough unchanged.
- The safest public-API regression is a dedicated Jest case in `tests/Dock.test.tsx` that imports `CDock` from `../src`, renders it, and asserts it matches the direct symbol without weakening the older Dock behavior tests.

## 2026-03-22 t7 verification
- T7 passed without any Dock code changes: `yarn test -- --runTestsByPath tests/Dock.test.tsx`, `yarn lint`, `yarn test`, and `yarn build` all completed successfully in the required order.
- The only build output beyond success remained the previously noted non-blocking Sass legacy API deprecation warnings and `vite:dts` outside-emitted notices, so no Dock-scoped fix was necessary.

## 2026-03-22 f2-f4 corrective fix
- `src/components/index.ts` must stay a pure component barrel; removing stray `export const A = 1;` restores the intended public API shape while keeping `export * from './Dock/Dock';` intact.
