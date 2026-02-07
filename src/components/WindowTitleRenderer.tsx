import type {
  FC,
  MouseEventHandler,
  PointerEventHandler,
  ReactNode
} from 'react'
import type { MenuItem } from '../types'
import { ContextMenu } from './ContextMenu'
import { registerGlobalRenderer } from './globalRenderer'

export type WindowTitleRendererProps = {
  title: string
  icon?: ReactNode
  isActive?: boolean
  onMinimize?: () => void
  onMaximize?: () => void
  onClose?: () => void
  onPointerDown?: PointerEventHandler<HTMLDivElement>
  onContextMenu?: MouseEventHandler<HTMLDivElement>
}

export const DefaultWindowTitleRenderer: FC<WindowTitleRendererProps> = (
  props
) => {
  const {
    title,
    icon,
    onMinimize,
    onMaximize,
    onClose,
    onPointerDown,
    onContextMenu
  } = props

  return (
    <div
      className='cm-window__title-bar'
      onPointerDown={onPointerDown}
      onContextMenu={onContextMenu}
    >
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

const createWindowTitleRenderer = (
  menuLabel: string
): FC<WindowTitleRendererProps> => {
  const Renderer: FC<WindowTitleRendererProps> = (props) => {
    const menuItems: MenuItem[] = [
      {
        id: 'close',
        label: 'Close',
        onClick: () => {
          props.onClose?.()
        }
      }
    ]

    return (
      <ContextMenu items={menuItems} menuLabel={menuLabel}>
        <DefaultWindowTitleRenderer {...props} />
      </ContextMenu>
    )
  }

  Renderer.displayName = `WindowTitleRenderer(${menuLabel})`
  return Renderer
}

export const Win98WindowTitleRenderer = createWindowTitleRenderer('Window menu')
export const WinXPWindowTitleRenderer = createWindowTitleRenderer('Window menu')

registerGlobalRenderer('window-title', DefaultWindowTitleRenderer)
registerGlobalRenderer('win98:window-title', Win98WindowTitleRenderer)
registerGlobalRenderer('winxp:window-title', WinXPWindowTitleRenderer)
