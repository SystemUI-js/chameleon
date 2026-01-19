import React, { HTMLAttributes, useState, useEffect, useRef } from 'react'
import './Splitter.scss'

export interface SplitterProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'vertical' | 'horizontal'
  onResize?: (delta: number) => void
  onResizeEnd?: () => void
}

export const Splitter: React.FC<SplitterProps> = ({
  type = 'vertical',
  onResize,
  onResizeEnd,
  className = '',
  ...rest
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const startPosRef = useRef(0)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging) return
      const currentPos = type === 'vertical' ? e.clientX : e.clientY
      const delta = currentPos - startPosRef.current
      onResize?.(delta)
      startPosRef.current = currentPos // Reset for relative delta
    }

    const handleUp = () => {
      if (isDragging) {
        setIsDragging(false)
        onResizeEnd?.()
        document.body.style.cursor = 'unset'
        document.body.style.userSelect = 'unset'
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
      document.body.style.cursor =
        type === 'vertical' ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [isDragging, onResize, onResizeEnd, type])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startPosRef.current = type === 'vertical' ? e.clientX : e.clientY
  }

  const cls = ['cm-splitter', `cm-splitter--${type}`, className]
    .filter(Boolean)
    .join(' ')

  return <div className={cls} onMouseDown={handleMouseDown} {...rest} />
}

export default Splitter
