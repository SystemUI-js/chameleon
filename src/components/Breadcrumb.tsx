import React, { ReactNode } from 'react'
import './Breadcrumb.css'

export interface BreadcrumbItem {
  id: string
  label: ReactNode
  href?: string
  onClick?: () => void
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: ReactNode
  className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '>',
  className = ''
}) => {
  return (
    <div className={`cm-breadcrumb ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && (
            <span className='cm-breadcrumb-separator'>{separator}</span>
          )}
          <span className='cm-breadcrumb-item' onClick={item.onClick}>
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}

export default Breadcrumb
