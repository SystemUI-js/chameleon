# F2 Code Quality Review

## Verdict

REJECTED

## Checks Run

1. `yarn lint`
2. Search for `\bany\b|as any` in `src/components/StartBar`, `src/components/Dock`, `src/system/windows`, `tests`
3. Search for `TODO|FIXME` in `src/components/StartBar`, `src/system/windows`, `tests`
4. Review `src/components/StartBar/StartBar.tsx`
5. Review `src/components/Dock/Dock.tsx` and extracted `src/components/Dock/dockLayout.ts`

## Results

- `yarn lint` passed. ESLint emitted a non-blocking migration warning about `.eslintignore`, but the command completed successfully.
- No `any` / `as any` matches were found in the required directories.
- No `TODO` / `FIXME` matches were found in the required directories.
- `CDockProps` contract is unchanged in `src/components/Dock/Dock.tsx:8` and `src/components/Dock/Dock.tsx:31`.
- `CDock` default behavior is unchanged: constructor still resolves `position` as `props.position ?? props.defaultPosition ?? 'top'` and `height` as `props.height ?? props.defaultHeight` in `src/components/Dock/Dock.tsx:42`.

## Violations

1. `CStartBar` public API surface is broader than required.
   - `CStartBarProps` extends `CWidgetProps` at `src/components/StartBar/StartBar.tsx:6`.
   - `CWidgetProps` includes `x`, `y`, `width`, and `height` via `WidgetLayoutProps` in `src/components/Widget/Widget.tsx:4` and `src/components/Widget/Widget.tsx:11`.
   - Therefore `CStartBar` currently exposes inherited `x`, `y`, and `width` props in addition to the allowed surface (`children`, `className`, `style`, `height`, `defaultHeight`, `gapStart`, `gapEnd`, `startLabel`, `data-testid`).

## Contract Notes

- `CStartBar` does **not** expose `position` or `defaultPosition`; those props are absent from `src/components/StartBar/StartBar.tsx:6`.
- The current rejection is solely due to extra inherited layout props on `CStartBar`.

## Evidence References

- `src/components/StartBar/StartBar.tsx:6`
- `src/components/Widget/Widget.tsx:4`
- `src/components/Widget/Widget.tsx:11`
- `src/components/Dock/Dock.tsx:8`
- `src/components/Dock/Dock.tsx:31`
- `src/components/Dock/Dock.tsx:42`
- `src/components/Dock/dockLayout.ts:4`
