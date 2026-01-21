import { TextareaHTMLAttributes, forwardRef } from 'react'
import './Textarea.scss'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...rest }, ref) => {
    const cls = ['cm-textarea', className].filter(Boolean).join(' ')

    return <textarea ref={ref} className={cls} {...rest} />
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
