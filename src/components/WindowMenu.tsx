import React, { ReactNode } from 'react'
import './WindowMenu.css'

export interface MenuItem {
  id: string
  label: string
  onClick?: () => void
  disabled?: boolean
}

export interface WindowMenuProps {
  items: MenuItem[]
  className?: string
}

export const WindowMenu: React.FC<WindowMenuProps> = ({
  items,
  className = ''
}) => {
  const cls = ['cm-window-menu', className].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`cm-window-menu__item ${item.disabled ? 'cm-window-menu__item--disabled' : ''}`}
          onClick={() => !item.disabled && item.onClick?.()}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}

export default WindowMenu
