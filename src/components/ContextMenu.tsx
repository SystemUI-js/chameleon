import React, {
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef
} from 'react'
import { createPortal } from 'react-dom'
import type { MenuItem } from '../types'

export interface ContextMenuProps {
  items: MenuItem[]
  children?: ReactNode
  className?: string
  menuLabel?: string
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  children,
  className,
  menuLabel = 'Context menu'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const refCounter = useRef(0)
  const [openPath, setOpenPath] = useState<string[]>([])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const menuWidth = 200
      const menuHeight = items.length * 32

      const x = Math.min(e.clientX, window.innerWidth - menuWidth)
      const y = Math.min(e.clientY, window.innerHeight - menuHeight)

      setPosition({ x, y })
      setIsOpen(true)
      setOpenPath([])
    },
    [items]
  )

  const handleTriggerContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (React.isValidElement(children)) {
        const childElement = children as React.ReactElement<{
          onContextMenu?: React.MouseEventHandler
        }>
        childElement.props.onContextMenu?.(e)
      }

      if (!e.defaultPrevented) {
        handleContextMenu(e)
      }
    },
    [children, handleContextMenu]
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setOpenPath([])
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isOpen) return

      const menu = document.querySelector('.cm-context-menu')
      if (menu && !menu.contains(e.target as Node)) {
        setIsOpen(false)
        setOpenPath([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && itemRefs.current[0]) {
      itemRefs.current[0].focus()
    }
  }, [isOpen])

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled) {
      item.onClick?.()
      handleClose()
    }
  }

  const renderMenuItem = (item: MenuItem, level: number = 0): ReactNode => {
    if (item.items) {
      const isSubmenuOpen = openPath[level] === item.id
      return (
        <div
          key={item.id}
          ref={(el) => {
            itemRefs.current[refCounter.current++] = el
          }}
          className={`cm-dropdown-item ${item.disabled ? 'cm-dropdown-item--disabled' : ''} cm-dropdown-item--submenu ${isSubmenuOpen ? 'cm-dropdown-item--active' : ''}`}
          role='menuitem'
          tabIndex={-1}
          onClick={() => {
            if (!item.disabled) {
              setOpenPath([...openPath.slice(0, level), item.id])
            }
          }}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !item.disabled) {
              e.preventDefault()
              setOpenPath([...openPath.slice(0, level), item.id])
            }
          }}
          onMouseEnter={() => {
            if (!item.disabled) {
              setOpenPath([...openPath.slice(0, level), item.id])
            }
          }}
        >
          {item.label}
          <span className='cm-dropdown-item__arrow'>▶</span>
          {isSubmenuOpen && (
            <div className='cm-context-submenu'>
              {item.items.map((subItem) => renderMenuItem(subItem, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        key={item.id}
        ref={(el) => {
          itemRefs.current[refCounter.current++] = el
        }}
        className={`cm-dropdown-item ${item.disabled ? 'cm-dropdown-item--disabled' : ''}`}
        role='menuitem'
        tabIndex={-1}
        onClick={() => handleItemClick(item)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !item.disabled) {
            e.preventDefault()
            handleItemClick(item)
          }
        }}
        onMouseEnter={() => {
          setOpenPath(openPath.slice(0, level))
        }}
      >
        {item.icon && (
          <span className='cm-dropdown-item__icon'>{item.icon}</span>
        )}
        {item.label}
      </div>
    )
  }

  let childrenWithHandler: ReactNode
  if (React.isValidElement(children)) {
    childrenWithHandler = React.cloneElement(children as React.ReactElement, {
      onContextMenu: handleTriggerContextMenu
    })
  } else if (children != null) {
    childrenWithHandler = (
      <div
        className='cm-context-menu__trigger'
        onContextMenu={handleTriggerContextMenu}
        role='presentation'
      >
        {children}
      </div>
    )
  } else {
    childrenWithHandler = children
  }

  return (
    <>
      {childrenWithHandler}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={`cm-context-menu ${className || ''}`}
            role='menu'
            aria-label={menuLabel}
            style={{
              position: 'absolute',
              left: position.x,
              top: position.y
            }}
          >
            <div className='cm-dropdown-menu'>
              {(() => {
                refCounter.current = 0
                return items.map((item) => renderMenuItem(item))
              })()}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

ContextMenu.displayName = 'ContextMenu'
