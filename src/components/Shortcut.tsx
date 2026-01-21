import React, { ReactNode } from 'react'
import './Shortcut.scss'

export interface ShortcutProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  selected?: boolean
  className?: string
}

export const Shortcut: React.FC<ShortcutProps> = ({
  icon,
  label,
  onClick,
  selected,
  className = ''
}) => {
  return (
    <div
      className={`cm-shortcut ${selected ? 'cm-shortcut--selected' : ''} ${className}`}
      onClick={onClick}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <div className='cm-shortcut__icon'>{icon}</div>
      <div className='cm-shortcut__label'>{label}</div>
    </div>
  )
}

export default Shortcut
