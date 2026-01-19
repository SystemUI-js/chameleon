import React, { ReactNode } from 'react'
import Popover from './Popover'
import './DropDownMenu.scss'

export interface DropDownMenuItem {
  key: string
  label: ReactNode
  disabled?: boolean
  onClick?: () => void
  divider?: boolean
}

export interface DropDownMenuProps {
  items: DropDownMenuItem[]
  children: ReactNode
}

export const DropDownMenu: React.FC<DropDownMenuProps> = ({
  items,
  children
}) => {
  const content = (
    <div className='cm-dropdown-menu'>
      {items.map((item) =>
        item.divider ? (
          <div key={item.key} className='cm-dropdown-divider' />
        ) : (
          <div
            key={item.key}
            className={`cm-dropdown-item ${item.disabled ? 'cm-dropdown-item--disabled' : ''}`}
            onClick={() => !item.disabled && item.onClick?.()}
          >
            {item.label}
          </div>
        )
      )}
    </div>
  )

  return (
    <Popover content={content} trigger='click'>
      {children}
    </Popover>
  )
}

export default DropDownMenu
