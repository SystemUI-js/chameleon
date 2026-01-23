export type WindowInteractionState = {
  readonly active: boolean
  readonly type: 'move' | 'resize' | null
  readonly direction: ResizeDirection | null
}

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export type MenuItem = {
  readonly id: string
  readonly label: string
  readonly icon?: React.ReactNode
  readonly onClick?: () => void
  readonly disabled?: boolean
  readonly items?: MenuItem[]
}

export type MenuPath = {
  readonly paths: readonly string[]
}
