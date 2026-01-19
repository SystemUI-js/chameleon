import React, { useState } from 'react'
import Button from './Button'
import './Transfer.scss'

export interface TransferItem {
  key: string
  label: string
  disabled?: boolean
}

export interface TransferProps {
  dataSource: TransferItem[]
  targetKeys: string[]
  onChange?: (nextTargetKeys: string[]) => void
  className?: string
}

export const Transfer: React.FC<TransferProps> = ({
  dataSource,
  targetKeys,
  onChange,
  className = ''
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  const leftData = dataSource.filter((item) => !targetKeys.includes(item.key))
  const rightData = dataSource.filter((item) => targetKeys.includes(item.key))

  const handleSelect = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const moveToRight = () => {
    const keysToMove = selectedKeys.filter((key) =>
      leftData.find((item) => item.key === key)
    )
    onChange?.([...targetKeys, ...keysToMove])
    setSelectedKeys([])
  }

  const moveToLeft = () => {
    const keysToMove = selectedKeys.filter((key) =>
      rightData.find((item) => item.key === key)
    )
    onChange?.(targetKeys.filter((key) => !keysToMove.includes(key)))
    setSelectedKeys([])
  }

  const renderList = (data: TransferItem[]) => (
    <div className='cm-transfer__list'>
      {data.map((item) => (
        <div
          key={item.key}
          className={`cm-transfer__item ${selectedKeys.includes(item.key) ? 'cm-transfer__item--selected' : ''}`}
          onClick={() => handleSelect(item.key)}
        >
          {item.label}
        </div>
      ))}
    </div>
  )

  return (
    <div className={`cm-transfer ${className}`}>
      {renderList(leftData)}
      <div className='cm-transfer__actions'>
        <Button
          onClick={moveToRight}
          disabled={
            !selectedKeys.some((k) => leftData.find((i) => i.key === k))
          }
        >
          &gt;
        </Button>
        <Button
          onClick={moveToLeft}
          disabled={
            !selectedKeys.some((k) => rightData.find((i) => i.key === k))
          }
        >
          &lt;
        </Button>
      </div>
      {renderList(rightData)}
    </div>
  )
}

export default Transfer
