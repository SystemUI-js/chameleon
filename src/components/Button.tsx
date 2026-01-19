import { ButtonHTMLAttributes, forwardRef } from 'react'
import './Button.scss'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', className = '', children, ...rest }, ref) => {
    const base = 'cm-btn'
    const cls = [base, `${base}--${variant}`, className]
      .filter(Boolean)
      .join(' ')

    return (
      <button ref={ref} className={cls} {...rest}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
