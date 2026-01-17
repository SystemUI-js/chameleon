import React, { HTMLAttributes, ElementType } from 'react'
import './Text.css'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body'
  bold?: boolean
  italic?: boolean
}

export const Text: React.FC<TextProps> = ({
  as,
  variant = 'body',
  bold = false,
  italic = false,
  className = '',
  children,
  ...rest
}) => {
  const Tag = as || ((variant.startsWith('h') ? variant : 'p') as ElementType)

  const cls = [
    'cm-text',
    `cm-text--${variant}`,
    bold && 'cm-text--bold',
    italic && 'cm-text--italic',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  )
}

export default Text
