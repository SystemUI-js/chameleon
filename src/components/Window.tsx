import {
  ReactNode,
  HTMLAttributes,
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  type MutableRefObject
} from 'react'
import {
  Drag,
  DragOperationType,
  FingerOperationType,
  type Pose
} from '@system-ui-js/multi-drag'
import { useThemeBehavior } from '../theme/ThemeContext'
import './Window.scss'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export type InteractionMode = 'static' | 'follow'

export interface WindowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onResize'> {
  title: string
  children?: ReactNode
  isActive?: boolean
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  onActive?: () => void
  icon?: ReactNode

  position?: Position
  size?: Size

  initialPosition?: Position
  initialSize?: Size

  minWidth?: number
  minHeight?: number
  movable?: boolean
  resizable?: boolean
  interactionMode?: InteractionMode
  grabEdge?: number

  onMoveStart?: () => void
  onMoving?: (pos: Position) => void
  onMoveEnd?: (pos: Position) => void

  onResizeStart?: () => void
  onResizing?: (data: { size: Size; position: Position }) => void
  onResizeEnd?: (data: { size: Size; position: Position }) => void
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export const Window = forwardRef<HTMLDivElement, WindowProps>(
  (
    {
      title,
      children,
      isActive = true,
      onClose,
      onMinimize,
      onMaximize,
      onActive,
      icon,
      className = '',
      position: controlledPos,
      size: controlledSize,
      initialPosition = { x: 0, y: 0 },
      initialSize,
      minWidth,
      minHeight,
      movable,
      resizable,
      interactionMode,
      grabEdge = 30,
      onMoveStart,
      onMoving,
      onMoveEnd,
      onResizeStart,
      onResizing,
      onResizeEnd,
      style,
      ...rest
    },
    ref
  ) => {
    const { windowDefaults, windowDragMode } = useThemeBehavior()
    const resolvedInteractionMode =
      interactionMode ?? windowDefaults.interactionMode ?? windowDragMode
    const resolvedMovable = movable ?? windowDefaults.movable ?? true
    const resolvedResizable = resizable ?? windowDefaults.resizable ?? false
    const resolvedMinWidth = minWidth ?? windowDefaults.minWidth ?? 200
    const resolvedMinHeight = minHeight ?? windowDefaults.minHeight ?? 100
    const activateWholeArea = windowDefaults.activateWholeArea ?? true

    const [pos, setPos] = useState<Position>(controlledPos || initialPosition)
    const [size, setSize] = useState<Size | undefined>(
      controlledSize || initialSize
    )
    const [isDragging, setIsDragging] = useState(false)
    const [previewPos, setPreviewPos] = useState<Position | null>(null)
    const onActiveRef = useRef(onActive)
    const isActiveRef = useRef(isActive)
    const activationSourceRef = useRef<'pointer' | 'keyboard' | null>(null)

    const interactionRef = useRef<{
      active: boolean
      type: 'move' | 'resize'
      mode: InteractionMode
      direction: ResizeDirection | null
      startLeft: number
      startTop: number
      startWidth: number
      startHeight: number
    }>({
      active: false,
      type: 'move',
      mode: 'follow',
      direction: null,
      startLeft: 0,
      startTop: 0,
      startWidth: 0,
      startHeight: 0
    })

    const internalRef = useRef<HTMLDivElement | null>(null)
    const titleBarRef = useRef<HTMLDivElement | null>(null)
    const moveDragRef = useRef<Drag | null>(null)
    const resizeDragRefs = useRef<Record<ResizeDirection, Drag | null>>({
      n: null,
      s: null,
      e: null,
      w: null,
      ne: null,
      nw: null,
      se: null,
      sw: null
    })
    const resizeHandleRefs = useRef<
      Record<ResizeDirection, HTMLDivElement | null>
    >({
      n: null,
      s: null,
      e: null,
      w: null,
      ne: null,
      nw: null,
      se: null,
      sw: null
    })
    const lastMovePosRef = useRef<Position>(pos)
    const lastResizeStateRef = useRef<{ size: Size; position: Position }>({
      size: size || { width: resolvedMinWidth, height: resolvedMinHeight },
      position: pos
    })
    const modeRef = useRef<InteractionMode>(
      (resolvedInteractionMode ?? 'follow') as InteractionMode
    )
    const ignoreDragRef = useRef(false)

    useEffect(() => {
      lastMovePosRef.current = pos
    }, [pos])

    useEffect(() => {
      if (size) {
        lastResizeStateRef.current = { size, position: pos }
      }
    }, [pos, size])

    useEffect(() => {
      modeRef.current = (resolvedInteractionMode ?? 'follow') as InteractionMode
    }, [resolvedInteractionMode])

    const posRef = useRef<Position>(pos)
    const sizeRef = useRef<Size | undefined>(size)
    const minWidthRef = useRef(resolvedMinWidth)
    const minHeightRef = useRef(resolvedMinHeight)
    const grabEdgeRef = useRef(grabEdge)
    const movableRef = useRef(resolvedMovable)
    const resizableRef = useRef(resolvedResizable)
    const onMoveStartRef = useRef(onMoveStart)
    const onMovingRef = useRef(onMoving)
    const onMoveEndRef = useRef(onMoveEnd)
    const onResizeStartRef = useRef(onResizeStart)
    const onResizingRef = useRef(onResizing)
    const onResizeEndRef = useRef(onResizeEnd)

    useEffect(() => {
      onActiveRef.current = onActive
    }, [onActive])

    useEffect(() => {
      posRef.current = pos
    }, [pos])

    useEffect(() => {
      sizeRef.current = size
    }, [size])

    useEffect(() => {
      minWidthRef.current = resolvedMinWidth
      minHeightRef.current = resolvedMinHeight
    }, [resolvedMinHeight, resolvedMinWidth])

    useEffect(() => {
      grabEdgeRef.current = grabEdge
    }, [grabEdge])

    useEffect(() => {
      movableRef.current = resolvedMovable
      resizableRef.current = resolvedResizable
    }, [resolvedMovable, resolvedResizable])

    useEffect(() => {
      onMoveStartRef.current = onMoveStart
      onMovingRef.current = onMoving
      onMoveEndRef.current = onMoveEnd
      onResizeStartRef.current = onResizeStart
      onResizingRef.current = onResizing
      onResizeEndRef.current = onResizeEnd
    }, [
      onMoveStart,
      onMoving,
      onMoveEnd,
      onResizeStart,
      onResizing,
      onResizeEnd
    ])

    useEffect(() => {
      if (!interactionRef.current.active && controlledPos) {
        setPos(controlledPos)
      }
    }, [controlledPos])

    useEffect(() => {
      if (!interactionRef.current.active && controlledSize) {
        setSize(controlledSize)
      }
    }, [controlledSize])

    useEffect(() => {
      if (!isActiveRef.current && isActive) {
        if (activationSourceRef.current !== 'pointer') {
          onActiveRef.current?.()
        }
      }
      activationSourceRef.current = null
      isActiveRef.current = isActive
    }, [isActive])

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!activateWholeArea) return
      if ((e.target as HTMLElement).closest('.cm-window__controls')) return

      if (!isActive) {
        activationSourceRef.current = 'pointer'
        onActiveRef.current?.()
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!activateWholeArea) return
      if ((e.target as HTMLElement).closest('.cm-window__controls')) return

      if ((e.key === 'Enter' || e.key === ' ') && !isActive) {
        e.preventDefault()
        activationSourceRef.current = 'keyboard'
        onActiveRef.current?.()
      }
    }

    const getRectSnapshot = useCallback(() => {
      const rect = internalRef.current?.getBoundingClientRect()
      const width = rect?.width ?? sizeRef.current?.width ?? minWidthRef.current
      const height =
        rect?.height ?? sizeRef.current?.height ?? minHeightRef.current
      return { width, height }
    }, [])

    const clampMovePosition = useCallback(
      (nextPos: Position) => {
        const { width, height } = getRectSnapshot()
        const viewportW = window.innerWidth
        const viewportH = window.innerHeight
        const edge = grabEdgeRef.current

        const clampedX = Math.min(
          Math.max(nextPos.x, edge - width),
          viewportW - edge
        )
        const clampedY = Math.min(
          Math.max(nextPos.y, edge - height),
          viewportH - edge
        )

        return { x: clampedX, y: clampedY }
      },
      [getRectSnapshot]
    )

    const applyMovePose = useCallback(
      (pose: Partial<Pose>, finalize: boolean) => {
        if (ignoreDragRef.current) return
        if (!interactionRef.current.active) return
        if (interactionRef.current.type !== 'move') return

        const rawPos = pose.position ?? posRef.current
        const nextPos = clampMovePosition({ x: rawPos.x, y: rawPos.y })
        lastMovePosRef.current = nextPos

        if (modeRef.current === 'follow' || finalize) {
          setPos(nextPos)
        } else {
          setPreviewPos(nextPos)
        }

        if (!finalize) {
          onMovingRef.current?.(nextPos)
        } else {
          setPreviewPos(null)
        }
      },
      [clampMovePosition]
    )

    const applyResizePose = useCallback(
      (pose: Partial<Pose>, finalize: boolean) => {
        if (ignoreDragRef.current) return
        if (!interactionRef.current.active) return
        if (interactionRef.current.type !== 'resize') return
        const { startLeft, startTop, startWidth, startHeight, direction } =
          interactionRef.current
        if (!direction) return

        const rawPos = pose.position ?? { x: startLeft, y: startTop }
        const dx = rawPos.x - startLeft
        const dy = rawPos.y - startTop

        let newX = startLeft
        let newY = startTop
        let newW = startWidth
        let newH = startHeight

        if (direction.includes('e')) {
          newW = Math.max(minWidthRef.current, startWidth + dx)
        } else if (direction.includes('w')) {
          const maxDelta = startWidth - minWidthRef.current
          const delta = Math.min(dx, maxDelta)
          newW = startWidth - delta
          newX = startLeft + delta
        }

        if (direction.includes('s')) {
          newH = Math.max(minHeightRef.current, startHeight + dy)
        } else if (direction.includes('n')) {
          const maxDelta = startHeight - minHeightRef.current
          const delta = Math.min(dy, maxDelta)
          newH = startHeight - delta
          newY = startTop + delta
        }

        const nextSize = { width: newW, height: newH }
        const nextPos = { x: newX, y: newY }
        lastResizeStateRef.current = { size: nextSize, position: nextPos }

        if (modeRef.current === 'follow' || finalize) {
          setPos(nextPos)
          setSize(nextSize)
        }

        if (!finalize) {
          onResizingRef.current?.({ size: nextSize, position: nextPos })
        }
      },
      []
    )

    const startInteraction = useCallback(
      (type: 'move' | 'resize', direction: ResizeDirection | null) => {
        const { width, height } = getRectSnapshot()
        interactionRef.current = {
          active: true,
          type,
          mode: modeRef.current,
          direction,
          startLeft: posRef.current.x,
          startTop: posRef.current.y,
          startWidth: width,
          startHeight: height
        }
        lastMovePosRef.current = posRef.current
        lastResizeStateRef.current = {
          size: sizeRef.current || { width, height },
          position: posRef.current
        }
        setIsDragging(true)
      },
      [getRectSnapshot]
    )

    const handleMoveStart = useCallback(
      (
        fingers: {
          getLastOperation: (
            type: FingerOperationType
          ) => { event: PointerEvent } | undefined
        }[]
      ) => {
        if (!movableRef.current) return
        const startEvent = fingers[0]?.getLastOperation(
          FingerOperationType.Start
        )?.event
        if (
          startEvent &&
          (startEvent.target as HTMLElement).closest('.cm-window__controls')
        ) {
          ignoreDragRef.current = true
          return
        }
        ignoreDragRef.current = false
        if (!isActiveRef.current) {
          activationSourceRef.current = 'pointer'
          onActiveRef.current?.()
        }
        startInteraction('move', null)
        onMoveStartRef.current?.()
      },
      [startInteraction]
    )

    const handleResizeStart = useCallback(
      (direction: ResizeDirection) => {
        if (!resizableRef.current) return
        ignoreDragRef.current = false
        startInteraction('resize', direction)
        onResizeStartRef.current?.()
      },
      [startInteraction]
    )

    const handleMoveEnd = useCallback(() => {
      if (ignoreDragRef.current) {
        ignoreDragRef.current = false
        return
      }
      interactionRef.current.active = false
      setIsDragging(false)
      onMoveEndRef.current?.(lastMovePosRef.current)
    }, [])

    const handleResizeEnd = useCallback(() => {
      if (ignoreDragRef.current) {
        ignoreDragRef.current = false
        return
      }
      interactionRef.current.active = false
      setIsDragging(false)
      onResizeEndRef.current?.(lastResizeStateRef.current)
    }, [])

    const setResizeHandleRef = useCallback(
      (direction: ResizeDirection) => (node: HTMLDivElement | null) => {
        resizeHandleRefs.current[direction] = node
      },
      []
    )

    useEffect(() => {
      if (!titleBarRef.current || moveDragRef.current) return
      const drag = new Drag(titleBarRef.current, {
        getPose: () => {
          const { width, height } = getRectSnapshot()
          return {
            position: posRef.current,
            width,
            height
          }
        },
        setPose: (_element: HTMLElement, pose: Partial<Pose>) => {
          applyMovePose(pose, false)
        },
        setPoseOnEnd: (_element: HTMLElement, pose: Partial<Pose>) => {
          applyMovePose(pose, true)
        }
      })

      drag.addEventListener(DragOperationType.Start, handleMoveStart)
      drag.addEventListener(DragOperationType.End, handleMoveEnd)
      moveDragRef.current = drag
    }, [applyMovePose, getRectSnapshot, handleMoveEnd, handleMoveStart])

    useEffect(() => {
      const directions: ResizeDirection[] = [
        'n',
        's',
        'e',
        'w',
        'ne',
        'nw',
        'se',
        'sw'
      ]
      directions.forEach((direction) => {
        const handle = resizeHandleRefs.current[direction]
        if (!handle || resizeDragRefs.current[direction]) return
        const drag = new Drag(handle, {
          getPose: () => {
            const { width, height } = getRectSnapshot()
            return {
              position: posRef.current,
              width,
              height
            }
          },
          setPose: (_element: HTMLElement, pose: Partial<Pose>) => {
            applyResizePose(pose, false)
          },
          setPoseOnEnd: (_element: HTMLElement, pose: Partial<Pose>) => {
            applyResizePose(pose, true)
          }
        })
        drag.addEventListener(DragOperationType.Start, () => {
          handleResizeStart(direction)
        })
        drag.addEventListener(DragOperationType.End, handleResizeEnd)
        resizeDragRefs.current[direction] = drag
      })
    }, [applyResizePose, getRectSnapshot, handleResizeEnd, handleResizeStart])

    useEffect(() => {
      if (moveDragRef.current) {
        moveDragRef.current.setEnabled(resolvedMovable)
        moveDragRef.current.setPassive(!resolvedMovable)
      }
    }, [resolvedMovable])

    useEffect(() => {
      Object.values(resizeDragRefs.current).forEach((drag) => {
        if (!drag) return
        drag.setEnabled(resolvedResizable)
        drag.setPassive(!resolvedResizable)
      })
    }, [resolvedResizable])

    useEffect(() => {
      return () => {
        if (moveDragRef.current) {
          moveDragRef.current.setDisabled()
          moveDragRef.current.setPassive(true)
        }
        Object.values(resizeDragRefs.current).forEach((drag) => {
          if (!drag) return
          drag.setDisabled()
          drag.setPassive(true)
        })
      }
    }, [])

    const setMergedRef = (node: HTMLDivElement | null) => {
      internalRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref)
        (ref as MutableRefObject<HTMLDivElement | null>).current = node
    }

    const cls = [
      'cm-window',
      !isActive && 'cm-window--inactive',
      isDragging && 'isDragging',
      className
    ]
      .filter(Boolean)
      .join(' ')

    const combinedStyle = {
      ...style,
      left: pos.x,
      top: pos.y,
      width: size?.width,
      height: size?.height,
      position: 'absolute' as const
    }

    return (
      <>
        <div
          ref={setMergedRef}
          className={cls}
          style={combinedStyle}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role={activateWholeArea ? 'button' : undefined}
          tabIndex={activateWholeArea ? 0 : undefined}
          {...rest}
        >
          <div className='cm-window__title-bar' ref={titleBarRef}>
            <div
              className='cm-window__title-text'
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {icon && <span className='cm-window__icon'>{icon}</span>}
              {title}
            </div>
            <div className='cm-window__controls'>
              {onMinimize && (
                <button
                  className='cm-window__btn'
                  onClick={onMinimize}
                  aria-label='Minimize'
                >
                  _
                </button>
              )}
              {onMaximize && (
                <button
                  className='cm-window__btn'
                  onClick={onMaximize}
                  aria-label='Maximize'
                >
                  □
                </button>
              )}
              {onClose && (
                <button
                  className='cm-window__btn'
                  onClick={onClose}
                  aria-label='Close'
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className='cm-window__body'>{children}</div>

          {resolvedResizable && (
            <>
              {(
                [
                  'n',
                  's',
                  'e',
                  'w',
                  'ne',
                  'nw',
                  'se',
                  'sw'
                ] as ResizeDirection[]
              ).map((dir) => (
                <div
                  key={dir}
                  className='cm-window__resize-handle'
                  data-direction={dir}
                  ref={setResizeHandleRef(dir)}
                />
              ))}
            </>
          )}
        </div>

        {resolvedInteractionMode === 'static' && isDragging && previewPos && (
          <div
            className='cm-window-preview'
            style={{
              position: 'fixed',
              left: previewPos.x,
              top: previewPos.y,
              width: size?.width || resolvedMinWidth,
              height: size?.height || resolvedMinHeight,
              pointerEvents: 'none',
              zIndex: 9999
            }}
          />
        )}
      </>
    )
  }
)

Window.displayName = 'Window'

export default Window
