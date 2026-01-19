import React, { useState, ReactNode } from 'react'
import './Collapse.scss'

export interface CollapseItem {
  id: string
  title: string
  content: ReactNode
}

export interface CollapseProps {
  items: CollapseItem[]
  defaultActiveIds?: string[]
  accordion?: boolean
  className?: string
}

export const Collapse: React.FC<CollapseProps> = ({
  items,
  defaultActiveIds = [],
  accordion = false,
  className = ''
}) => {
  const [activeIds, setActiveIds] = useState<string[]>(defaultActiveIds)

  const toggle = (id: string) => {
    if (accordion) {
      setActiveIds(activeIds.includes(id) ? [] : [id])
    } else {
      setActiveIds(
        activeIds.includes(id)
          ? activeIds.filter((item) => item !== id)
          : [...activeIds, id]
      )
    }
  }

  const cls = ['cm-collapse', className].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      {items.map((item) => {
        const isOpen = activeIds.includes(item.id)
        return (
          <div key={item.id} className='cm-collapse-item'>
            <div className='cm-collapse-header' onClick={() => toggle(item.id)}>
              <div className='cm-collapse-header__icon'>
                {isOpen ? '-' : '+'}
              </div>
              <span className='cm-collapse-header__title'>{item.title}</span>
            </div>
            {isOpen && (
              <div className='cm-collapse-content'>{item.content}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Collapse
