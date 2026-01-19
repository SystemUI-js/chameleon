import { useState, useRef, useEffect, forwardRef } from 'react'
import './Select.scss'

export interface SelectOption {
  value: string | number
  label: string
}

export interface SelectProps {
  options: SelectOption[]
  value?: string | number
  onChange?: (value: string | number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    { options, value, onChange, placeholder, className = '', disabled = false },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (optionValue: string | number) => {
      if (!disabled && onChange) {
        onChange(optionValue)
      }
      setIsOpen(false)
    }

    const cls = [
      'cm-select',
      isOpen && 'cm-select--open',
      disabled && 'cm-select--disabled',
      className
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        className={cls}
        ref={(node) => {
          // Handle both refs
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
          // @ts-ignore
          containerRef.current = node
        }}
        style={{ position: 'relative' }}
      >
        <div
          className='cm-select__trigger'
          onClick={() => !disabled && setIsOpen(!isOpen)}
          tabIndex={disabled ? -1 : 0}
        >
          <span className='cm-select__value'>
            {selectedOption ? selectedOption.label : placeholder || ''}
          </span>
          <div className='cm-select__arrow-btn'>
            <svg width='7' height='4' viewBox='0 0 7 4'>
              <path d='M0 0 L3.5 4 L7 0 Z' fill='currentColor' />
            </svg>
          </div>
        </div>

        {isOpen && (
          <ul className='cm-select__dropdown'>
            {options.map((option) => (
              <li
                key={option.value}
                className={`cm-select__option ${option.value === value ? 'cm-select__option--selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
