import React, { ReactNode, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Popover } from './Popover'
import { DropDownMenu } from './DropDownMenu'
import type { MenuItem } from '../types'

export interface ContextMenuProps {
  items: MenuItem[]
  children?: ReactNode
  className?: string
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  children,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

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
    },
    [items]
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const openMenu = () => {
    setIsOpen(true)
    menuRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isOpen) return

      const menu = document.querySelector('.cm-context-menu')
      if (menu && !menu.contains(e.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  }, [openMenu, menuRef])
    const handleClickOutside = (e: MouseEvent) => {
      if (!isOpen) return

      const menu = document.querySelector('.cm-context-menu')
      if (menu && !menu.contains(e.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {children}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={`cm-context-menu ${className || ''}`}
            role='menu'
            aria-label={menuLabel}
            aria-haspopup={isOpen ? 'true' : undefined}
            aria-expanded={isOpen ? 'true' : undefined}
          >
            <Popover
              visible={isOpen}
              onClose={handleClose}
              position={{ top: position.y, left: position.x }}
            >
              <DropDownMenu items={items} />
            </Popover>
          </div>,
          document.body
        )}
    </>
  )
}

ContextMenu.displayName = 'ContextMenu'
