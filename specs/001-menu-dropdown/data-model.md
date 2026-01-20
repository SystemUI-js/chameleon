# Data Model: Menu Dropdown

## Entities

### Menu
- **Fields**: id, label, items[]
- **Relationships**: Menu contains MenuItem[]

### MenuItem
- **Fields**: id, label, disabled, action, children[] (optional), divider (optional)
- **Relationships**: MenuItem may contain MenuItem[] as children
- **Validation Rules**:
  - id must be unique within the same Menu
  - children is omitted or empty when no submenu exists
  - divider items must not have children or action

### Action
- **Fields**: type, payload (optional)
- **Relationships**: MenuItem references Action

### FocusBehavior
- **Fields**: open, close
- **Values**: parent | firstChild
- **Relationships**: Applied per Menu instance

## State Transitions

- **Closed → Open**: triggered by click on a menu item with children
- **Open → Closed**: triggered by outside click, Escape, or selecting an item
- **Open Parent → Open Child**: triggered by Right Arrow when focused on parent with children
- **Open Child → Parent Focused**: triggered by Left Arrow or closing child submenu
