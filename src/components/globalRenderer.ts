import type { ComponentType } from 'react'
import type { ThemeId } from '../theme/types'
import {
  getRendererSnapshot,
  registerRenderer,
  subscribeRenderer,
  unregisterRenderer,
  type GlobalRendererSnapshot
} from './globalRendererRegistry'
import type {
  GlobalRendererName,
  GlobalRendererPropsMap
} from './globalRendererTypes'

export type GlobalRendererProps<Name extends GlobalRendererName> =
  GlobalRendererPropsMap[Name]

export type GlobalRendererComponent<Name extends GlobalRendererName> =
  ComponentType<GlobalRendererProps<Name>>

export type ThemeAwareRendererName<Name extends GlobalRendererName> =
  | Name
  | `${ThemeId}:${Name}`

export function registerGlobalRenderer<Name extends GlobalRendererName>(
  name: ThemeAwareRendererName<Name>,
  renderer: GlobalRendererComponent<Name>
): void {
  registerRenderer(name, renderer as ComponentType<unknown>)
}

export function unregisterGlobalRenderer<Name extends GlobalRendererName>(
  name: ThemeAwareRendererName<Name>,
  renderer: GlobalRendererComponent<Name>
): void {
  unregisterRenderer(name, renderer as ComponentType<unknown>)
}

export const subscribeGlobalRenderer = subscribeRenderer
export const getGlobalRendererSnapshot = getRendererSnapshot

export type { GlobalRendererSnapshot, GlobalRendererName }
