# Data Model: Theme & Window Behavior Refinements

## Entities

### Theme

- **id**: `ThemeId` (string union)
- **name**: string
- **tokens**
  - **color**: `surface`, `surfaceRaised`, `text`, `textMuted`, `textInvert`, `border`, `borderStrong`, `borderLight`, `borderLightest`, `borderDark`, `borderDarkest`, `focusRing`, `selectionBg`, `selectionText`
  - **typography**: `fontFamily`, `fontSize`, `lineHeight`, `fontWeight`
  - **spacing**: `xs`, `sm`, `md`, `lg`, `xl`
  - **shadow**: `insetBevel`, `outsetBevel`, `popup`
  - **radius**: `sm`, `md`, `lg`, `round`
  - **gradient**: `titleBar`, `titleBarInactive`, `buttonFace`, `buttonFaceHover`, `buttonFaceActive`, `tabBg`, `tabBgActive`
- **components**
  - **button**: `face`, `faceHover`, `faceActive`, `text`, `borderLight`, `borderDark`, `borderDarker`, `border`, `focusRing`
  - **window**: `frame`, `titleBarBg`, `titleBarText`, `titleBarBgInactive`, `titleBarTextInactive`, `titleBarHeight`, `closeButtonBg`, `closeButtonBgHover`, `closeButtonBgActive`
  - **taskbar**: `bg`, `height`, `borderLight`, `borderDark`, `itemBg`, `itemBgHover`, `itemBgActive`, `itemText`, `itemTextActive`
  - **startButton**: `bg`, `bgHover`, `bgActive`, `text`, `borderLight`, `borderDark`, `borderDarker`
- **behavior**
  - **windowDragMode**: `'static' | 'follow'` - Default interaction mode for window dragging/updates
  - **windowDefaults**: Partial defaults for Window props. Example:
    ```typescript
    {
      interactionMode: 'follow' | 'static',
      movable: boolean,
      resizable: boolean,
      minWidth: number,
      minHeight: number
    }
    ```

### WindowState

- **position**: `{ x: number; y: number }`
- **size**: `{ width: number; height: number }`
- **isActive**: boolean
- **interactionMode**: `'static' | 'follow'`
- **movable**: boolean
- **resizable**: boolean

### ModalState

- **isOpen**: boolean
- **clickOutsideToClose**: boolean

### MenuState

- **openPath**: `string[]` (menu/submenu hierarchy)
- **focusBehavior**: `{ close: 'firstChild' | 'current' }`

## Relationships

- **Theme → Window**: theme tokens + behavior defaults drive Window visual and interaction behavior.
- **Theme → Modal/DropDownMenu**: theme tokens override base styles to maintain consistent look.
- **MenuState → DropDownMenu**: open path controls which submenu level is active.

## Validation Rules

- **WindowState**: `size.width >= minWidth`, `size.height >= minHeight`.
- **WindowState**: `position` constrained so at least `grabEdge` remains in viewport.
- **MenuState**: `openPath` only includes valid menu item ids.

## State Transitions

- **Window activation**: `isActive: false -> true` on title bar click; triggers `onActive` once.
- **Window drag/resize**: `interactionMode: follow` updates live; `static` updates on end.
- **Menu open/close**: `openPath` updated on hover/keyboard events.
