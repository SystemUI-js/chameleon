import { MenuItem } from '../../src/components/menuTypes'

export const menuItemsFixture: MenuItem[] = [
  { id: 'file', label: 'File' },
  {
    id: 'edit',
    label: 'Edit',
    children: [
      { id: 'undo', label: 'Undo', onSelect: jest.fn() },
      { id: 'redo', label: 'Redo', onSelect: jest.fn() },
      { id: 'divider-1', divider: true },
      {
        id: 'prefs',
        label: 'Preferences',
        children: [
          { id: 'theme', label: 'Theme', onSelect: jest.fn() },
          { id: 'shortcuts', label: 'Shortcuts', onSelect: jest.fn() }
        ]
      }
    ]
  },
  { id: 'view', label: 'View', disabled: true }
]
