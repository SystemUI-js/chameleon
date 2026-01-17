import React, { TextareaHTMLAttributes, forwardRef } from 'react'
import './Textarea.css'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Custom props
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...rest }, ref) => {
    const cls = ['cm-textarea', className].filter(Boolean).join(' ')

    return <textarea ref={ref} className={cls} {...rest} />
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
