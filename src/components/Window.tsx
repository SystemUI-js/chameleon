import React, { ReactNode, HTMLAttributes, forwardRef } from 'react'
import './Window.css'

export interface WindowProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  children?: ReactNode
  isActive?: boolean
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  icon?: ReactNode
}

export const Window = forwardRef<HTMLDivElement, WindowProps>(
  (
    {
      title,
      children,
      isActive = true,
      onClose,
      onMinimize,
      onMaximize,
      icon,
      className = '',
      ...rest
    },
    ref
  ) => {
    const cls = ['cm-window', !isActive && 'cm-window--inactive', className]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={cls} {...rest}>
        <div className='cm-window__title-bar'>
          <div
            className='cm-window__title-text'
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {icon && <span className='cm-window__icon'>{icon}</span>}
            {title}
          </div>
          <div className='cm-window__controls'>
            {onMinimize && (
              <button
                className='cm-window__btn'
                onClick={onMinimize}
                aria-label='Minimize'
              >
                _
              </button>
            )}
            {onMaximize && (
              <button
                className='cm-window__btn'
                onClick={onMaximize}
                aria-label='Maximize'
              >
                □
              </button>
            )}
            {onClose && (
              <button
                className='cm-window__btn'
                onClick={onClose}
                aria-label='Close'
              >
                ×
              </button>
            )}
          </div>
        </div>
        <div className='cm-window__body'>{children}</div>
      </div>
    )
  }
)

Window.displayName = 'Window'

export default Window
