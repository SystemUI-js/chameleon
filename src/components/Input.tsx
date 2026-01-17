import React, { InputHTMLAttributes, forwardRef } from 'react'
import './Input.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Add custom props here if needed
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...rest }, ref) => {
    const cls = ['cm-input', className].filter(Boolean).join(' ')

    return <input ref={ref} className={cls} {...rest} />
  }
)

Input.displayName = 'Input'

export default Input
