import React, {
  useState,
  useRef,
  useEffect,
  ReactNode,
  forwardRef,
  useImperativeHandle
} from 'react'
import { createPortal } from 'react-dom'
import './Popover.scss'

export interface PopoverProps {
  content: ReactNode
  children: ReactNode
  trigger?: 'click' | 'hover'
  placement?:
    | 'bottom-start'
    | 'bottom-end'
    | 'top-start'
    | 'top-end'
    | 'right-start'
  className?: string
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
}

export interface PopoverRef {
  close: () => void
}

export const Popover = forwardRef<PopoverRef, PopoverProps>(
  (
    {
      content,
      children,
      trigger = 'click',
      placement = 'bottom-start',
      className = '',
      visible,
      onVisibleChange
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = visible !== undefined
    const isOpen = isControlled ? visible : internalOpen

    const triggerRef = useRef<HTMLDivElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)

    const handleOpenChange = (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onVisibleChange?.(newOpen)
    }

    const toggle = () => handleOpenChange(!isOpen)
    const close = () => handleOpenChange(false)

    useImperativeHandle(ref, () => ({
      close
    }))

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          isOpen &&
          popoverRef.current &&
          !popoverRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          close()
        }
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          // We handle Escape here for the Popover itself, but Menu might want to handle it too.
          // If we close here, it might conflict with Menu's logic if Menu also listens to Escape.
          // But for a generic Popover, closing on Escape is standard.
          close()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [isOpen, isControlled, onVisibleChange])

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (trigger === 'click') {
          toggle()
        }
      }
    }

    const getPosition = () => {
      if (!triggerRef.current) return {}
      const rect = triggerRef.current.getBoundingClientRect()
      const style: React.CSSProperties = { position: 'absolute' }

      // Simplistic positioning logic based on placement
      if (placement.startsWith('bottom')) {
        style.top = rect.bottom + window.scrollY
        style.left =
          placement === 'bottom-end'
            ? rect.right +
              window.scrollX -
              (popoverRef.current?.offsetWidth || 0)
            : rect.left + window.scrollX
      } else if (placement.startsWith('top')) {
        style.bottom = window.innerHeight - rect.top - window.scrollY
        style.left =
          placement === 'top-end'
            ? rect.right +
              window.scrollX -
              (popoverRef.current?.offsetWidth || 0)
            : rect.left + window.scrollX
      } else if (placement === 'right-start') {
        style.top = rect.top + window.scrollY
        style.left = rect.right + window.scrollX
      }

      return style
    }

    return (
      <>
        <div
          ref={triggerRef}
          role='button'
          tabIndex={0}
          onClick={trigger === 'click' ? toggle : undefined}
          onKeyDown={handleTriggerKeyDown}
          onMouseEnter={
            trigger === 'hover' ? () => handleOpenChange(true) : undefined
          }
          onMouseLeave={
            trigger === 'hover' ? () => handleOpenChange(false) : undefined
          }
          style={{ display: 'inline-block' }}
        >
          {children}
        </div>
        {isOpen &&
          createPortal(
            <div
              ref={popoverRef}
              className={`cm-popover ${className}`}
              style={getPosition()}
            >
              {content}
            </div>,
            document.body
          )}
      </>
    )
  }
)

Popover.displayName = 'Popover'

export default Popover
