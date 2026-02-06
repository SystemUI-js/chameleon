import React, { HTMLAttributes, useState, useEffect, useRef } from 'react'
import {
  Drag,
  DragOperationType,
  FingerOperationType,
  type Pose
} from '@system-ui-js/multi-drag'
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
  onKeyDown: onKeyDownProp,
  onMouseDown: onMouseDownProp,
  ...rest
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const splitterRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<Drag | null>(null)
  const lastAxisRef = useRef(0)
  const typeRef = useRef(type)
  const onResizeRef = useRef(onResize)
  const onResizeEndRef = useRef(onResizeEnd)

  useEffect(() => {
    typeRef.current = type
  }, [type])

  useEffect(() => {
    onResizeRef.current = onResize
    onResizeEndRef.current = onResizeEnd
  }, [onResize, onResizeEnd])

  useEffect(() => {
    if (!isDragging) return
    document.body.style.cursor =
      type === 'vertical' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.body.style.cursor = 'unset'
      document.body.style.userSelect = 'unset'
    }
  }, [isDragging, type])

  useEffect(() => {
    if (!splitterRef.current || dragRef.current) return
    const drag = new Drag(splitterRef.current, {
      getPose: () => {
        const axisValue = lastAxisRef.current
        return {
          position: { x: axisValue, y: axisValue },
          width: 0,
          height: 0
        }
      },
      setPose: (_element: HTMLElement, pose: Partial<Pose>) => {
        const axisValue =
          typeRef.current === 'vertical' ? pose.position?.x : pose.position?.y
        if (axisValue === undefined) return
        const delta = axisValue - lastAxisRef.current
        if (delta === 0) return
        lastAxisRef.current = axisValue
        onResizeRef.current?.(delta)
      }
    })

    drag.addEventListener(
      DragOperationType.Start,
      (
        fingers: {
          getLastOperation: (
            type: FingerOperationType
          ) => { event: PointerEvent } | undefined
        }[]
      ) => {
        const startEvent = fingers[0]?.getLastOperation(
          FingerOperationType.Start
        )?.event
        if (startEvent) {
          lastAxisRef.current =
            typeRef.current === 'vertical'
              ? startEvent.clientX
              : startEvent.clientY
        }
        setIsDragging(true)
      }
    )

    drag.addEventListener(DragOperationType.End, () => {
      setIsDragging(false)
      onResizeEndRef.current?.()
    })

    dragRef.current = drag

    return () => {
      drag.setDisabled()
      drag.setPassive(true)
    }
  }, [])

  const cls = ['cm-splitter', `cm-splitter--${type}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={splitterRef}
      className={cls}
      onMouseDown={(e) => {
        onMouseDownProp?.(e)
      }}
      role='button'
      aria-label='Splitter'
      tabIndex={0}
      onKeyDown={(e) => {
        onKeyDownProp?.(e)
        if (e.defaultPrevented) return

        if (onResize) {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault()
            onResize(10)
            onResizeEnd?.()
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault()
            onResize(-10)
            onResizeEnd?.()
          }
        }
      }}
      {...rest}
    />
  )
}

export default Splitter
