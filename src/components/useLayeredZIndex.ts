import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore
} from 'react'
import {
  bringToFront,
  getStackSnapshot,
  registerStackItem,
  subscribeStackGroup,
  type StackGroup
} from './stacking'

const groupVarMap: Record<StackGroup, string> = {
  base: '--cm-z-index-base',
  alwaysTop: '--cm-z-index-always-top',
  anchors: '--cm-z-index-anchors',
  popups: '--cm-z-index-popups'
}

export function useLayeredZIndex(
  group: StackGroup,
  active: boolean
): {
  zIndex: string
  order: number
  bringToFront: () => void
} {
  const id = useId()
  const wasActiveRef = useRef(false)

  useEffect(() => registerStackItem(group, id), [group, id])

  const subscribe = useCallback(
    (listener: () => void) => subscribeStackGroup(group, listener),
    [group]
  )
  const getSnapshot = useCallback(() => getStackSnapshot(group), [group])
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const order = snapshot[id] ?? 0

  const bring = useCallback(() => bringToFront(group, id), [group, id])

  useEffect(() => {
    if (active && !wasActiveRef.current) {
      bring()
    }
    wasActiveRef.current = active
  }, [active, bring])

  const zIndex = `calc(${groupVarMap[group]} + ${order})`

  return { zIndex, order, bringToFront: bring }
}
