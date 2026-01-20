export type OpenPath = string[]

export interface FocusBehaviorConfig {
  open: 'parent' | 'firstChild'
  close: 'parent' | 'firstChild'
}

export const defaultFocusBehavior: FocusBehaviorConfig = {
  open: 'parent',
  close: 'parent'
}

export const isSamePath = (a: OpenPath, b: OpenPath) =>
  a.length === b.length && a.every((value, index) => value === b[index])

export const withOpenPath = (path: OpenPath, id: string): OpenPath => [
  ...path,
  id
]

export const sliceOpenPath = (path: OpenPath, depth: number): OpenPath =>
  path.slice(0, Math.max(0, depth))
