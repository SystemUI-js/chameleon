import React, {
  ReactNode,
  useRef,
  useContext,
  useEffect,
  useLayoutEffect
} from 'react'
import Popover, { PopoverRef } from './Popover'
import { MenuItem, MenuItemAction } from './menuTypes'
import './DropDownMenu.scss'
import { MenuContext } from './MenuContext'
import { getFirstFocusableIndex } from './menuFocus'
import { getNextFocusableIndex } from './menuKeyboard'

export interface DropDownMenuProps {
  items: MenuItem[]
  children: ReactNode
  onSelect?: () => void
  placement?:
    | 'bottom-start'
    | 'bottom-end'
    | 'top-start'
    | 'top-end'
    | 'right-start'
  triggerId?: string
  level?: number
}

export const DropDownMenu: React.FC<DropDownMenuProps> = ({
  items,
  children,
  onSelect,
  placement = 'bottom-start',
  triggerId,
  level = 0
}) => {
  const context = useContext(MenuContext)
  const popoverRef = useRef<PopoverRef>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Derived state from context
  const isOpen =
    context && triggerId ? context.openPath[level] === triggerId : undefined

  // Focus management when opening
  useLayoutEffect(() => {
    if (isOpen) {
      const shouldFocusFirst =
        !context || context.focusBehavior?.open === 'firstChild'
      if (shouldFocusFirst) {
        const indexToFocus = getFirstFocusableIndex(items)
        if (indexToFocus !== -1) {
          itemRefs.current[indexToFocus]?.focus()
        }
      }
    }
  }, [isOpen, items, context?.focusBehavior])

  const handleItemClick = (item: MenuItemAction) => {
    if (item.disabled) return
    item.onSelect?.()
    onSelect?.()

    if (context) {
      context.closeAll()
    } else {
      popoverRef.current?.close()
    }
  }

  const openSubmenu = (itemId: string) => {
    if (context) {
      context.setOpenPath([...context.openPath.slice(0, level + 1), itemId])
    }
  }

  const handleItemKeyDown = (e: React.KeyboardEvent, item: MenuItemAction) => {
    if (item.disabled) return

    const hasChildren = item.children && item.children.length > 0

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      if (hasChildren) {
        openSubmenu(item.id)
      } else {
        handleItemClick(item)
      }
    } else if (e.key === 'ArrowRight') {
      if (hasChildren) {
        e.preventDefault()
        e.stopPropagation()
        openSubmenu(item.id)
      }
    }
  }

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (!context || !triggerId) return

    const currentIndex = itemRefs.current.findIndex(
      (ref) => ref === document.activeElement
    )

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      const direction = e.key === 'ArrowDown' ? 'next' : 'prev'
      const nextIndex = getNextFocusableIndex(items, currentIndex, direction)
      if (nextIndex !== -1) {
        itemRefs.current[nextIndex]?.focus()
      }
    } else if (e.key === 'ArrowLeft') {
      if (level > 0) {
        // Close current menu
        e.preventDefault()
        e.stopPropagation()
        // Go back to parent
        context.setOpenPath(context.openPath.slice(0, level))
      } else {
        // Top level (root), let WindowMenu handle it (switch root)
        return // Allow bubbling
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      // Close current level
      context.setOpenPath(context.openPath.slice(0, level))
    }
  }

  // Restore focus when submenu closes?
  useEffect(() => {
    if (context && isOpen && context.openPath.length === level + 1) {
      // We are the leaf menu.
    }
  }, [context?.openPath, level, isOpen])

  const content = (
    <div
      className='cm-dropdown-menu'
      role='menu'
      tabIndex={-1}
      onMouseDown={(e) => e.preventDefault()} // Prevent focus loss on click
      onKeyDown={handleContainerKeyDown}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return <div key={item.id} className='cm-dropdown-divider' />
        }

        const actionItem = item as MenuItemAction
        const hasChildren =
          actionItem.children && actionItem.children.length > 0

        const isSubmenuOpen =
          context && hasChildren && context.openPath[level + 1] === item.id

        if (hasChildren) {
          return (
            <DropDownMenu
              key={item.id}
              items={actionItem.children!}
              onSelect={() => {
                onSelect?.()
                if (!context) popoverRef.current?.close()
              }}
              placement='right-start'
              triggerId={item.id}
              level={level + 1}
            >
              <div
                ref={(el) => (itemRefs.current[index] = el)}
                className={`cm-dropdown-item ${item.disabled ? 'cm-dropdown-item--disabled' : ''} cm-dropdown-item--submenu ${isSubmenuOpen ? 'cm-dropdown-item--active' : ''}`}
                role='menuitem'
                tabIndex={-1}
                onClick={() => {
                  if (!item.disabled) {
                    openSubmenu(item.id)
                  }
                }}
                onKeyDown={(e) => handleItemKeyDown(e, actionItem)}
                onMouseEnter={() => {
                  if (context && !item.disabled) {
                    // Open submenu on hover
                    context.setOpenPath([
                      ...context.openPath.slice(0, level + 1),
                      item.id
                    ])
                  }
                }}
              >
                {actionItem.label}
                <span className='cm-dropdown-item__arrow'>▶</span>
              </div>
            </DropDownMenu>
          )
        }

        return (
          <div
            key={item.id}
            ref={(el) => (itemRefs.current[index] = el)}
            className={`cm-dropdown-item ${item.disabled ? 'cm-dropdown-item--disabled' : ''}`}
            role='menuitem'
            tabIndex={-1}
            onClick={() => handleItemClick(actionItem)}
            onKeyDown={(e) => handleItemKeyDown(e, actionItem)}
            onMouseEnter={() => {
              if (context) {
                // Close any deeper submenus if hovering a sibling
                if (context.openPath.length > level + 1) {
                  context.setOpenPath(context.openPath.slice(0, level + 1))
                }
                // Focus this item?
                itemRefs.current[index]?.focus()
              }
            }}
          >
            {actionItem.label}
          </div>
        )
      })}
    </div>
  )

  return (
    <Popover
      ref={popoverRef}
      content={content}
      trigger='click'
      placement={placement}
      visible={isOpen}
      onVisibleChange={(visible) => {
        if (context && !visible) {
          // Closed by outside click
          // Close this level and deeper
          context.setOpenPath(context.openPath.slice(0, level))
        }
      }}
    >
      {children}
    </Popover>
  )
}

export default DropDownMenu
