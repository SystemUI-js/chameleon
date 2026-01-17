import React, {
  useState,
  useRef,
  useEffect,
  ReactNode,
  forwardRef
} from 'react'
import { createPortal } from 'react-dom'
import './Popover.css'

export interface PopoverProps {
  content: ReactNode
  children: ReactNode
  trigger?: 'click' | 'hover'
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  className?: string
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      content,
      children,
      trigger = 'click',
      placement = 'bottom-start',
      className = ''
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const triggerRef = useRef<HTMLDivElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)

    const toggle = () => setIsOpen(!isOpen)
    const close = () => setIsOpen(false)

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          popoverRef.current &&
          !popoverRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          close()
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

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
      } else {
        style.bottom = window.innerHeight - rect.top - window.scrollY
        style.left =
          placement === 'top-end'
            ? rect.right +
              window.scrollX -
              (popoverRef.current?.offsetWidth || 0)
            : rect.left + window.scrollX
      }

      return style
    }

    return (
      <>
        <div
          ref={triggerRef}
          onClick={trigger === 'click' ? toggle : undefined}
          onMouseEnter={trigger === 'hover' ? () => setIsOpen(true) : undefined}
          onMouseLeave={
            trigger === 'hover' ? () => setIsOpen(false) : undefined
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
