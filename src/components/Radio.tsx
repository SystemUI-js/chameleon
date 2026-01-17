import React, { InputHTMLAttributes, forwardRef } from 'react'
import './Radio.css'

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = '', disabled, ...rest }, ref) => {
    const cls = ['cm-radio', disabled && 'cm-radio--disabled', className]
      .filter(Boolean)
      .join(' ')

    return (
      <label className={cls}>
        <input
          ref={ref}
          type='radio'
          className='cm-radio__input'
          disabled={disabled}
          {...rest}
        />
        <span className='cm-radio__circle'>
          <span className='cm-radio__dot' />
        </span>
        {label && <span className='cm-radio__label'>{label}</span>}
      </label>
    )
  }
)

Radio.displayName = 'Radio'

export default Radio
