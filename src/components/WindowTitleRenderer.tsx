import type { FC, PointerEventHandler, ReactNode } from 'react'
import { registerGlobalRenderer } from './globalRenderer'

export type WindowTitleRendererProps = {
  title: string
  icon?: ReactNode
  isActive?: boolean
  onMinimize?: () => void
  onMaximize?: () => void
  onClose?: () => void
  onPointerDown?: PointerEventHandler<HTMLDivElement>
}

export const DefaultWindowTitleRenderer: FC<WindowTitleRendererProps> = (
  props
) => {
  const { title, icon, onMinimize, onMaximize, onClose, onPointerDown } = props

  return (
    <div className='cm-window__title-bar' onPointerDown={onPointerDown}>
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
  )
}

export const Win98WindowTitleRenderer: FC<WindowTitleRendererProps> = (
  props
) => {
  return <DefaultWindowTitleRenderer {...props} />
}

export const WinXPWindowTitleRenderer: FC<WindowTitleRendererProps> = (
  props
) => {
  return <DefaultWindowTitleRenderer {...props} />
}

registerGlobalRenderer('window-title', DefaultWindowTitleRenderer)
registerGlobalRenderer('win98:window-title', Win98WindowTitleRenderer)
registerGlobalRenderer('winxp:window-title', WinXPWindowTitleRenderer)
