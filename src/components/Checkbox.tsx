import React, { InputHTMLAttributes, forwardRef } from 'react'
import './Checkbox.css'

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', disabled, ...rest }, ref) => {
    const cls = ['cm-checkbox', disabled && 'cm-checkbox--disabled', className]
      .filter(Boolean)
      .join(' ')

    return (
      <label className={cls}>
        <input
          ref={ref}
          type='checkbox'
          className='cm-checkbox__input'
          disabled={disabled}
          {...rest}
        />
        <span className='cm-checkbox__box'>
          <svg className='cm-checkbox__check' viewBox='0 0 10 10'>
            <path
              d='M1 5 L4 8 L9 2'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='square'
            />
          </svg>
        </span>
        {label && <span className='cm-checkbox__label'>{label}</span>}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
