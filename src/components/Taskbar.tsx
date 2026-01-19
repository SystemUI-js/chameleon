import { ReactNode, HTMLAttributes, forwardRef } from 'react'
import './Taskbar.scss'

export interface TaskbarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  startButton?: ReactNode
}

export const Taskbar = forwardRef<HTMLDivElement, TaskbarProps>(
  ({ children, startButton, className = '', ...rest }, ref) => {
    const cls = ['cm-taskbar', className].filter(Boolean).join(' ')

    return (
      <div ref={ref} className={cls} {...rest}>
        <div className='cm-taskbar__start'>{startButton}</div>
        <div className='cm-taskbar__items'>{children}</div>
        <div className='cm-taskbar__system-tray' />
      </div>
    )
  }
)

Taskbar.displayName = 'Taskbar'

export default Taskbar
