import type { WindowTitleRendererProps } from './WindowTitleRenderer'

export interface GlobalRendererPropsMap {
  'window-title': WindowTitleRendererProps
}

export type GlobalRendererName = keyof GlobalRendererPropsMap
