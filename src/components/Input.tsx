import { InputHTMLAttributes, forwardRef } from 'react'
import './Input.scss'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...rest }, ref) => {
    const cls = ['cm-input', className].filter(Boolean).join(' ')

    return <input ref={ref} className={cls} {...rest} />
  }
)

Input.displayName = 'Input'

export default Input
