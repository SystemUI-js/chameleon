import React, { useState, ReactNode, forwardRef } from 'react'
import './Tabs.css'

export interface TabItem {
  id: string
  label: ReactNode
  content: ReactNode
}

export interface TabsProps {
  items: TabItem[]
  defaultActiveId?: string
  className?: string
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ items, defaultActiveId, className = '' }, ref) => {
    const [activeId, setActiveId] = useState(defaultActiveId || items[0]?.id)

    const cls = ['cm-tabs', className].filter(Boolean).join(' ')

    return (
      <div className={cls} ref={ref}>
        <div className='cm-tabs__list' role='tablist'>
          {items.map((item) => (
            <div
              key={item.id}
              role='tab'
              aria-selected={activeId === item.id}
              className={`cm-tabs__tab ${activeId === item.id ? 'cm-tabs__tab--active' : ''}`}
              onClick={() => setActiveId(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>
        <div className='cm-tabs__panel' role='tabpanel'>
          {items.find((item) => item.id === activeId)?.content}
        </div>
      </div>
    )
  }
)

Tabs.displayName = 'Tabs'

export default Tabs
