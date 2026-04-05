# Decisions

## 2026-04-04 Task 1 CMenu scaffold

- Used `import React from 'react'` instead of `import type React from 'react'` because `React.Children.only()` is a runtime call that requires React to be in the module scope as a value.
- Excluded `CMenuTrigger` and `MenuListItem` marker interfaces because empty interfaces trigger `@typescript-eslint/no-empty-interface` errors. The plan lists these for future export but they have no properties to justify them at this stage.
- Default menu state is `closed` with `data-menu-state="closed"` attribute for future open/close state management.

## Final constraints

- `CMenuTrigger` is the canonical alias `React.ReactElement`.
- `MenuListItem` is a recursive interface with required `id`, required `key`, required `title`, optional `children`, optional `trigger`, and optional `disabled`.
- `MenuListItem.trigger` is limited to `'click' | 'hover'`.
- `CMenuProps.children` is typed as `CMenuTrigger`.
- `CMenuProps.menuList` is required and typed as `readonly MenuListItem[]`.
- `CMenuProps.trigger` is limited to `'click' | 'hover'`.
- `CMenuProps.onSelect` receives the full item payload: `(item: MenuListItem) => void`.
