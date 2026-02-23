export type StackGroup = 'base' | 'alwaysTop' | 'anchors' | 'popups'

type StackGroupState = {
  counter: number
  order: Map<string, number>
  snapshot: Record<string, number>
  listeners: Set<() => void>
}

const stackGroups = new Map<StackGroup, StackGroupState>()

function ensureGroup(group: StackGroup): StackGroupState {
  const existing = stackGroups.get(group)
  if (existing) return existing
  const state: StackGroupState = {
    counter: 0,
    order: new Map(),
    snapshot: {},
    listeners: new Set()
  }
  stackGroups.set(group, state)
  return state
}

function updateSnapshot(state: StackGroupState): void {
  const snapshot: Record<string, number> = {}
  for (const [id, order] of state.order.entries()) {
    snapshot[id] = order
  }
  state.snapshot = snapshot
}

function notify(group: StackGroup): void {
  const state = stackGroups.get(group)
  if (!state) return
  updateSnapshot(state)
  state.listeners.forEach((listener) => listener())
}

function normalizeIfNeeded(group: StackGroup): void {
  const state = stackGroups.get(group)
  if (!state) return
  if (state.counter <= 1000) return

  const entries = Array.from(state.order.entries())
  entries.sort((a, b) => a[1] - b[1])

  state.order.clear()
  state.counter = 0
  for (const [id] of entries) {
    state.counter += 1
    state.order.set(id, state.counter)
  }
}

export function registerStackItem(group: StackGroup, id: string): () => void {
  const state = ensureGroup(group)
  if (!state.order.has(id)) {
    state.counter += 1
    state.order.set(id, state.counter)
    notify(group)
  }

  return () => {
    const existing = stackGroups.get(group)
    if (!existing) return
    if (!existing.order.delete(id)) return
    notify(group)
  }
}

export function bringToFront(group: StackGroup, id: string): void {
  const state = ensureGroup(group)
  state.counter += 1
  state.order.set(id, state.counter)
  normalizeIfNeeded(group)
  notify(group)
}

export function subscribeStackGroup(
  group: StackGroup,
  listener: () => void
): () => void {
  const state = ensureGroup(group)
  state.listeners.add(listener)
  return () => {
    const existing = stackGroups.get(group)
    if (!existing) return
    existing.listeners.delete(listener)
  }
}

export function getStackSnapshot(group: StackGroup): Record<string, number> {
  const state = ensureGroup(group)
  return state.snapshot
}
