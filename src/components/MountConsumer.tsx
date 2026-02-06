import { ReactNode, useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  getMountSlotSnapshot,
  registerMountConsumer,
  subscribeMountSlot
} from './mountRegistry'

export interface MountConsumerProps {
  name: string
  children: ReactNode
  exclude?: boolean
  priority?: number
}

export const MountConsumer: React.FC<MountConsumerProps> = ({
  name,
  children,
  exclude = false,
  priority = 0
}) => {
  const id = useId()
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    return subscribeMountSlot(name, () => {
      forceUpdate((value) => value + 1)
    })
  }, [name])

  useEffect(() => {
    return registerMountConsumer(name, { id, exclude, priority })
  }, [name, id, exclude, priority])

  const snapshot = getMountSlotSnapshot(name)
  if (!snapshot?.element) return null

  const excludeEntries = snapshot.consumers.filter((entry) => entry.exclude)

  let shouldRender = true
  if (excludeEntries.length > 0) {
    let selectedId: string | null = null
    let selectedPriority = Number.NEGATIVE_INFINITY

    for (const entry of excludeEntries) {
      if (entry.priority > selectedPriority) {
        selectedPriority = entry.priority
        selectedId = entry.id
      }
    }

    shouldRender = exclude && id === selectedId
  }

  if (!shouldRender) return null

  return createPortal(<>{children}</>, snapshot.element)
}

MountConsumer.displayName = 'MountConsumer'

export default MountConsumer
