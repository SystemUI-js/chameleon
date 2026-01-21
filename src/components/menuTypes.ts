import { ReactNode } from 'react'

export interface MenuItemBase {
  id: string
  disabled?: boolean
}

export interface MenuItemDivider extends MenuItemBase {
  divider: true
  label?: never
  onSelect?: never
  children?: never
}

export interface MenuItemAction extends MenuItemBase {
  label: ReactNode
  divider?: false
  onSelect?: () => void
  children?: MenuItem[]
}

export type MenuItem = MenuItemDivider | MenuItemAction
