# Phase 1 Data Model

## Entities

### Window
- fields:
  - title: string
  - position: { x: number, y: number }
  - size: { width: number, height: number }
  - minWidth: number
  - minHeight: number
  - movable: boolean
  - resizable: boolean
  - interactionMode: 'static' | 'follow'
  - isActive: boolean
  - isDragging: boolean (derived, applied as className while active)
- relationships:
  - Window has many resize handles (8 directions)
- validation:
  - position values are numbers (px)
  - size width/height >= minWidth/minHeight
  - position is clamped to viewport with grab edge visible
- state transitions:
  - idle -> moving -> idle
  - idle -> resizing -> idle

### Modal
- fields:
  - isOpen: boolean
  - clickOutsideToClose: boolean
- relationships:
  - Modal content renders Window, so inherits Window behavior
- validation:
  - when isOpen is false, Modal is not rendered
