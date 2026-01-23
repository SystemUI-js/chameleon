import React, { ReactNode, useRef, useContext, useLayoutEffect } from 'react'
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

// Helper function to handle closing and focus logic for ArrowLeft and Escape
const handleCloseAndFocus = (
  level: number,
  items: MenuItem[],
  currentIndex: number,
  itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  context: NonNullable<React.ContextType<typeof MenuContext>>
) => {
  const shouldFocusFirst = context.focusBehavior?.close === 'firstChild'
  const indexToFocus = shouldFocusFirst
    ? getFirstFocusableIndex(items)
    : currentIndex

  context.setOpenPath(context.openPath.slice(0, level))

  if (indexToFocus !== -1) {
    requestAnimationFrame(() => {
      itemRefs.current[indexToFocus]?.focus()
    })
  }
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
      const indexToFocus = getFirstFocusableIndex(items)
      if (indexToFocus !== -1) {
        const itemEl = itemRefs.current[indexToFocus]
        if (itemEl) {
          itemEl.tabIndex = 0
          itemEl.focus()
        }
      }
    }
  }, [isOpen, items])

  const handleItemClick = (item: MenuItemAction) => {
    if (item.disabled) return
    item.onSelect?.()
    onSelect?.()

    if (context) {
      // For submenu items, let parent handle closing
      // For leaf items (no children), don't close - let event bubble to parent
      const hasChildren = item.children && item.children.length > 0
      if (!hasChildren) {
        context.closeAll()
      }
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
      if (hasChildren) {
        // Submenu item: prevent bubbling to parent, let submenu handle
        e.stopPropagation()
        openSubmenu(item.id)
      } else {
        // Leaf item: allow normal flow
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

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault()
        e.stopPropagation()
        const direction = e.key === 'ArrowDown' ? 'next' : 'prev'
        const nextIndex = getNextFocusableIndex(items, currentIndex, direction)
        if (nextIndex !== -1) {
          itemRefs.current[nextIndex]?.focus()
        }
        break
      }

      case 'ArrowLeft': {
        if (level > 0) {
          e.preventDefault()
          e.stopPropagation()
          handleCloseAndFocus(level, items, currentIndex, itemRefs, context)
        }
        break
      }

      case 'Escape': {
        e.preventDefault()
        e.stopPropagation()
        handleCloseAndFocus(level, items, currentIndex, itemRefs, context)
        break
      }
    }
  }

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
