# Decisions

## 2026-04-04 Task 1 CMenu scaffold

- Used `import React from 'react'` instead of `import type React from 'react'` because `React.Children.only()` is a runtime call that requires React to be in the module scope as a value.
- Excluded `CMenuTrigger` and `MenuListItem` marker interfaces because empty interfaces trigger `@typescript-eslint/no-empty-interface` errors. The plan lists these for future export but they have no properties to justify them at this stage.
- Default menu state is `closed` with `data-menu-state="closed"` attribute for future open/close state management.
- `CMenuTrigger` exported as interface with `type: 'trigger'` discriminator field (not empty interface).
- `MenuListItem` exported as recursive interface with `id`, `key?`, `title`, `children?`, `trigger?`, `disabled?` fields.
- `CMenuProps.children` typed as `CMenuTrigger` (React.ReactElement type alias).
- Future-task props `menuList` and `onSelect` prefixed with underscore rename to avoid lint errors while keeping public API intact.
- Corrected contract: `CMenuTrigger = React.ReactElement` (type alias), `MenuListItem.trigger: 'click' | 'hover'`, `CMenuProps.trigger: 'click' | 'hover'`, `CMenuProps.onSelect: (item: MenuListItem) => void`.
- Final fix: `menuList` is required (not optional) per plan line 65; `MenuListItem.key` is required (not optional) per plan line 66.
