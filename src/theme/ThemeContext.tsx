import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  ReactNode
} from 'react'
import {
  Theme,
  ThemeId,
  TokenTree,
  CSSVarValue,
  ThemeContextType
} from './types'
import { defaultTheme } from './default'
import { win98 } from './win98'
import { winxp } from './winxp'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  theme?: Theme
  defaultTheme?: Theme
  themes?: Readonly<Record<ThemeId, Theme>>
  onThemeChange?: (theme: Theme) => void
}

function isThemeId(input: Theme | ThemeId): input is ThemeId {
  return typeof input === 'string'
}

function kebabize(input: string): string {
  return input.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

function flattenTokens(
  tree: TokenTree,
  prefix: string,
  out: Record<string, CSSVarValue>
): void {
  for (const [key, value] of Object.entries(tree)) {
    const next = `${prefix}-${kebabize(key)}`
    if (value !== null && typeof value === 'object') {
      flattenTokens(value as TokenTree, next, out)
    } else {
      out[next] = value as CSSVarValue
    }
  }
}

function themeToCSSVars(theme: Theme): Record<string, string> {
  const out: Record<string, CSSVarValue> = {}
  flattenTokens(theme.tokens as unknown as TokenTree, '--cm', out)
  flattenTokens(theme.components as unknown as TokenTree, '--cm', out)

  const vars: Record<string, string> = {}
  for (const [k, v] of Object.entries(out)) vars[k] = String(v)
  return vars
}

export const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
  const themes = useMemo<Readonly<Record<ThemeId, Theme>>>(() => {
    const base: Record<ThemeId, Theme> = {
      default: defaultTheme,
      win98,
      winxp,
      macos: win98, // Placeholder
      material: win98 // Placeholder
    }
    return { ...base, ...props.themes }
  }, [props.themes])

  const isControlled = props.theme !== undefined
  const [internalTheme, setInternalTheme] = useState<Theme>(
    props.defaultTheme ?? win98
  )

  const activeTheme = (props.theme ?? internalTheme) as Theme
  const rootRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return

    const vars = themeToCSSVars(activeTheme)
    for (const [name, value] of Object.entries(vars)) {
      el.style.setProperty(name, value)
    }
    el.dataset.cmTheme = activeTheme.id
  }, [activeTheme])

  const setTheme = useCallback(
    (next: Theme | ThemeId) => {
      const resolved = isThemeId(next) ? themes[next] : next
      if (!resolved) return

      if (!isControlled) setInternalTheme(resolved)
      props.onThemeChange?.(resolved)
    },
    [isControlled, props, themes]
  )

  const value = useMemo<ThemeContextType>(
    () => ({ theme: activeTheme, setTheme, themes }),
    [activeTheme, setTheme, themes]
  )

  return (
    <ThemeContext.Provider value={value}>
      <div
        ref={rootRef}
        className='cm-theme-root'
        style={{ display: 'contents' }}
      >
        {props.children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export type WithThemeProps = {
  theme: ThemeContextType['theme']
  setTheme: ThemeContextType['setTheme']
}

export function withTheme<P extends object>(
  Component: React.ComponentType<P & WithThemeProps>
) {
  function Wrapped(props: P) {
    const { theme, setTheme } = useTheme()
    return <Component {...props} theme={theme} setTheme={setTheme} />
  }

  Wrapped.displayName = `withTheme(${Component.displayName ?? Component.name ?? 'Component'})`
  return Wrapped
}

export * from './types'
