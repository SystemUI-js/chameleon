export type MountRegistryEntry = {
  readonly id: string
  readonly exclude: boolean
  readonly priority: number
}

export type MountRegistrySnapshot = {
  readonly name: string
  readonly element: HTMLElement | null
  readonly consumers: readonly MountRegistryEntry[]
}

type MountSlotRecord = {
  name: string
  element?: HTMLElement
  consumers: Map<string, MountRegistryEntry>
  listeners: Set<() => void>
}

const registry = new Map<string, MountSlotRecord>()

function ensureSlot(name: string): MountSlotRecord {
  const existing = registry.get(name)
  if (existing) return existing

  const slot: MountSlotRecord = {
    name,
    consumers: new Map(),
    listeners: new Set()
  }
  registry.set(name, slot)
  return slot
}

function maybeCleanupSlot(name: string, slot: MountSlotRecord): void {
  if (slot.element) return
  if (slot.consumers.size > 0) return
  if (slot.listeners.size > 0) return
  registry.delete(name)
}

function notify(name: string): void {
  const slot = registry.get(name)
  if (!slot) return
  slot.listeners.forEach((listener) => listener())
}

export function registerMountSlot(name: string, element: HTMLElement): void {
  const slot = ensureSlot(name)
  if (slot.element) {
    throw new Error(`MountProvider name "${name}" is already registered`)
  }
  slot.element = element
  notify(name)
}

export function unregisterMountSlot(name: string, element: HTMLElement): void {
  const slot = registry.get(name)
  if (!slot) return
  if (slot.element !== element) return
  slot.element = undefined
  notify(name)
  maybeCleanupSlot(name, slot)
}

export function registerMountConsumer(
  name: string,
  entry: MountRegistryEntry
): () => void {
  const slot = ensureSlot(name)
  slot.consumers.set(entry.id, entry)
  notify(name)

  return () => {
    const existingSlot = registry.get(name)
    if (!existingSlot) return
    existingSlot.consumers.delete(entry.id)
    notify(name)
    maybeCleanupSlot(name, existingSlot)
  }
}

export function subscribeMountSlot(
  name: string,
  listener: () => void
): () => void {
  const slot = ensureSlot(name)
  slot.listeners.add(listener)

  return () => {
    const existingSlot = registry.get(name)
    if (!existingSlot) return
    existingSlot.listeners.delete(listener)
    maybeCleanupSlot(name, existingSlot)
  }
}

export function getMountSlotSnapshot(
  name: string
): MountRegistrySnapshot | null {
  const slot = registry.get(name)
  if (!slot) return null

  return {
    name: slot.name,
    element: slot.element ?? null,
    consumers: Array.from(slot.consumers.values())
  }
}
