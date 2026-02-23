import type { ComponentType } from 'react'

export type GlobalRendererSnapshot = {
  readonly name: string
  readonly renderer: ComponentType<unknown>
}

type GlobalRendererRecord = {
  name: string
  renderer?: ComponentType<unknown>
  listeners: Set<() => void>
  snapshot?: GlobalRendererSnapshot
}

const registry = new Map<string, GlobalRendererRecord>()

function ensureRecord(name: string): GlobalRendererRecord {
  const existing = registry.get(name)
  if (existing) return existing

  const record: GlobalRendererRecord = {
    name,
    listeners: new Set()
  }
  registry.set(name, record)
  return record
}

function maybeCleanupRecord(name: string, record: GlobalRendererRecord): void {
  if (record.renderer) return
  if (record.listeners.size > 0) return
  registry.delete(name)
}

function notify(name: string): void {
  const record = registry.get(name)
  if (!record) return
  record.listeners.forEach((listener) => listener())
}

export function registerRenderer(
  name: string,
  renderer: ComponentType<unknown>
): void {
  const record = ensureRecord(name)
  if (record.renderer) {
    throw new Error(`Global renderer "${name}" is already registered`)
  }
  record.renderer = renderer
  notify(name)
}

export function unregisterRenderer(
  name: string,
  renderer: ComponentType<unknown>
): void {
  const record = registry.get(name)
  if (!record) return
  if (record.renderer !== renderer) return
  record.renderer = undefined
  record.snapshot = undefined
  notify(name)
  maybeCleanupRecord(name, record)
}

export function subscribeRenderer(
  name: string,
  listener: () => void
): () => void {
  const record = ensureRecord(name)
  record.listeners.add(listener)

  return () => {
    const existing = registry.get(name)
    if (!existing) return
    existing.listeners.delete(listener)
    maybeCleanupRecord(name, existing)
  }
}

export function getRendererSnapshot(
  name: string
): GlobalRendererSnapshot | null {
  const record = registry.get(name)
  if (!record?.renderer) return null

  if (!record.snapshot || record.snapshot.renderer !== record.renderer) {
    record.snapshot = {
      name: record.name,
      renderer: record.renderer
    }
  }

  return record.snapshot
}
