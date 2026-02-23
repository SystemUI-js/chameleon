import type { ComponentType } from 'react'
import { useCallback, useSyncExternalStore } from 'react'
import { useOptionalTheme } from '../theme/ThemeContext'
import {
  getGlobalRendererSnapshot,
  subscribeGlobalRenderer,
  type GlobalRendererName,
  type GlobalRendererProps
} from './globalRenderer'

export type GlobalRenderProps<Name extends GlobalRendererName> = {
  name: Name
} & GlobalRendererProps<Name>

export function GlobalRender<Name extends GlobalRendererName>(
  props: GlobalRenderProps<Name>
) {
  const { name, ...rendererProps } = props
  const theme = useOptionalTheme()
  const themeKey = `${theme.id}:${name}`

  const getSnapshot = useCallback(() => {
    const themedSnapshot = getGlobalRendererSnapshot(themeKey)
    if (themedSnapshot) return themedSnapshot
    return getGlobalRendererSnapshot(name)
  }, [name, themeKey])

  const subscribe = useCallback(
    (listener: () => void) => {
      const unsubscribeTheme = subscribeGlobalRenderer(themeKey, listener)
      const unsubscribeDefault = subscribeGlobalRenderer(name, listener)
      return () => {
        unsubscribeTheme()
        unsubscribeDefault()
      }
    },
    [name, themeKey]
  )

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  if (!snapshot) return null

  const Renderer = snapshot.renderer as ComponentType<GlobalRendererProps<Name>>

  return <Renderer {...(rendererProps as GlobalRendererProps<Name>)} />
}
