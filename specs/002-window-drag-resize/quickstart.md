# Phase 1 Quickstart

## Window drag/resize usage

```tsx
import { Window } from '@sysui/chameleon'

export function Example() {
  return (
    <Window
      title='Demo'
      position={{ x: 80, y: 60 }}
      size={{ width: 320, height: 200 }}
      minWidth={200}
      minHeight={120}
      movable
      resizable
      interactionMode='follow'
      onMoveStart={() => console.log('move start')}
      onMoving={(pos) => console.log('moving', pos)}
      onMoveEnd={(pos) => console.log('move end', pos)}
      onResizeStart={() => console.log('resize start')}
      onResizing={(data) => console.log('resizing', data)}
      onResizeEnd={(data) => console.log('resize end', data)}
    >
      内容区域
    </Window>
  )
}
```

## Modal inherits Window behavior

```tsx
import { Modal } from '@sysui/chameleon'

export function ModalExample({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title='Modal'
      position={{ x: 120, y: 80 }}
      size={{ width: 360, height: 220 }}
      minWidth={220}
      minHeight={140}
      movable
      resizable
      interactionMode='static'
    >
      模态内容
    </Modal>
  )
}
```
