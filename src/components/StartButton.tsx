import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react'
import './StartButton.scss'

export interface StartButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
}

export const StartButton = forwardRef<HTMLButtonElement, StartButtonProps>(
  ({ children = 'Start', className = '', ...rest }, ref) => {
    const cls = ['cm-start-button', className].filter(Boolean).join(' ')

    return (
      <button ref={ref} className={cls} {...rest}>
        <span className='cm-start-button__icon'></span>
        <span className='cm-start-button__text'>{children}</span>
      </button>
    )
  }
)

StartButton.displayName = 'StartButton'

export default StartButton
