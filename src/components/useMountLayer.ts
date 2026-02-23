import { useCallback, useSyncExternalStore } from 'react'
import { getMountSlotSnapshot, subscribeMountSlot } from './mountRegistry'

export function useMountLayer(
  name: string,
  fallback: HTMLElement | null
): HTMLElement | null {
  const getSnapshot = useCallback(() => {
    return getMountSlotSnapshot(name)?.element ?? fallback
  }, [name, fallback])

  const subscribe = useCallback(
    (listener: () => void) => subscribeMountSlot(name, listener),
    [name]
  )

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
