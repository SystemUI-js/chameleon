import React, { useState, useRef, useCallback, useMemo } from 'react'
import { MenuItem, MenuItemAction } from './menuTypes'
import DropDownMenu from './DropDownMenu'
import './WindowMenu.scss'
import { MenuContext, MenuContextType } from './MenuContext'
import { FocusBehaviorConfig, defaultFocusBehavior } from './menuState'
import { getNextFocusableIndex } from './menuKeyboard'

export interface WindowMenuProps {
  items: MenuItem[]
  className?: string
  focusBehavior?: FocusBehaviorConfig
}

export const WindowMenu: React.FC<WindowMenuProps> = ({
  items,
  className = '',
  focusBehavior = defaultFocusBehavior
}) => {
  const [openPath, setOpenPath] = useState<string[]>([])
  const menuRegistry = useRef<Map<string, MenuItem[]>>(new Map())
  const cls = ['cm-window-menu', className].filter(Boolean).join(' ')

  const registerMenu = useCallback((id: string, items: MenuItem[]) => {
    menuRegistry.current.set(id, items)
  }, [])

  const unregisterMenu = useCallback((id: string) => {
    menuRegistry.current.delete(id)
  }, [])

  const getMenuItems = useCallback((id: string) => {
    return menuRegistry.current.get(id) || []
  }, [])

  const closeAll = useCallback(() => setOpenPath([]), [])

  const handleRootKeyDown = (e: React.KeyboardEvent) => {
    if (openPath.length === 0) return

    // Handle switching root menus
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const currentRootId = openPath[0]
      const currentIndex = items.findIndex((item) => item.id === currentRootId)
      if (currentIndex === -1) return

      const direction = e.key === 'ArrowRight' ? 'next' : 'prev'
      const nextIndex = getNextFocusableIndex(items, currentIndex, direction)

      if (nextIndex !== -1) {
        e.preventDefault()
        const nextItem = items[nextIndex]
        // Only open if it has children, otherwise just close?
        // Standard behavior: if I move to a simple button, it focuses it but doesn't "open" a menu.
        // But here we are in "menu mode".
        // For simplicity, let's assume all root items in this context are menus or we just select them.
        // If it's a simple action, we might just focus it (but we don't have focus management for root yet).
        // Let's just setOpenPath to the new item.
        setOpenPath([nextItem.id])
      }
    }
  }

  const handleItemKeyDown = (e: React.KeyboardEvent, item: MenuItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (item.disabled) return

      const actionItem = item as MenuItemAction
      if (actionItem.children && actionItem.children.length > 0) {
        // Submenu item: prevent bubbling to parent
        e.stopPropagation()
        setOpenPath([item.id])
      } else {
        actionItem.onSelect?.()
        closeAll()
      }
    }
  }

  const contextValue: MenuContextType = useMemo(
    () => ({
      openPath,
      setOpenPath,
      focusBehavior,
      closeAll,
      registerMenu,
      unregisterMenu,
      getMenuItems
    }),
    [
      openPath,
      focusBehavior,
      closeAll,
      registerMenu,
      unregisterMenu,
      getMenuItems
    ]
  )

  return (
    <MenuContext.Provider value={contextValue}>
      <div
        className={cls}
        onKeyDown={handleRootKeyDown}
        role='menubar'
        tabIndex={-1}
      >
        {items.map((item) => {
          if (item.divider) {
            return <div key={item.id} className='cm-window-menu__divider' />
          }

          const actionItem = item as MenuItemAction
          const hasChildren =
            actionItem.children && actionItem.children.length > 0
          const isOpen = openPath[0] === item.id

          if (hasChildren) {
            return (
              <DropDownMenu
                key={item.id}
                items={actionItem.children!}
                triggerId={item.id}
                level={0}
              >
                <div
                  role='menuitem'
                  tabIndex={0}
                  className={`cm-window-menu__item ${item.disabled ? 'cm-window-menu__item--disabled' : ''} ${isOpen ? 'cm-window-menu__item--active' : ''}`}
                  onClick={() => !item.disabled && setOpenPath([item.id])}
                  onKeyDown={(e) => handleItemKeyDown(e, item)}
                  onMouseEnter={() => {
                    // If another menu is open, switch to this one
                    if (openPath.length > 0 && !isOpen && !item.disabled) {
                      setOpenPath([item.id])
                    }
                  }}
                >
                  {actionItem.label}
                </div>
              </DropDownMenu>
            )
          }

          return (
            <div
              key={item.id}
              role='menuitem'
              tabIndex={0}
              className={`cm-window-menu__item ${item.disabled ? 'cm-window-menu__item--disabled' : ''}`}
              onClick={() => {
                if (!item.disabled) {
                  actionItem.onSelect?.()
                  closeAll()
                }
              }}
              onKeyDown={(e) => handleItemKeyDown(e, item)}
              onMouseEnter={() => {
                if (openPath.length > 0 && !item.disabled) {
                  setOpenPath([]) // Close others if hovering a simple button? Or keep open?
                  // Standard: hovering a simple button in menu bar closes the previous menu and highlights the button.
                  // But we don't have "highlight" state for root buttons yet other than openPath.
                }
              }}
            >
              {actionItem.label}
            </div>
          )
        })}
      </div>
    </MenuContext.Provider>
  )
}

export default WindowMenu
