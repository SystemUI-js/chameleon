import { createContext, useContext } from 'react'
import { MenuItem } from './menuTypes'
import { FocusBehaviorConfig } from './menuState'

export interface MenuContextType {
  openPath: string[]
  setOpenPath: (path: string[]) => void
  focusBehavior: FocusBehaviorConfig
  closeAll: () => void
  registerMenu: (id: string, items: MenuItem[]) => void
  unregisterMenu: (id: string) => void
  getMenuItems: (id: string) => MenuItem[]
}

export const MenuContext = createContext<MenuContextType | null>(null)

export const useMenuContext = () => {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenuContext must be used within a MenuProvider')
  }
  return context
}
