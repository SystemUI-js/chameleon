export type ThemeId = 'win98' | 'macos' | 'material'

export type CSSVarValue = string | number

export type TokenTree = {
  readonly [key: string]: CSSVarValue | TokenTree
}

export interface Theme {
  readonly id: ThemeId
  readonly name: string
  readonly tokens: {
    readonly color: {
      readonly surface: string
      readonly surfaceRaised: string
      readonly text: string
      readonly textMuted: string
      readonly textInvert: string
      readonly border: string
      readonly borderStrong: string
      readonly borderLight: string
      readonly borderLightest: string
      readonly borderDark: string
      readonly borderDarkest: string
      readonly focusRing: string
      readonly selectionBg: string
      readonly selectionText: string
    }
    readonly typography: {
      readonly fontFamily: string
      readonly fontSize: string
      readonly lineHeight: string
      readonly fontWeight: string | number
    }
    readonly spacing: {
      readonly xs: string
      readonly sm: string
      readonly md: string
      readonly lg: string
      readonly xl: string
    }
    readonly shadow: {
      readonly insetBevel: string
      readonly outsetBevel: string
      readonly popup: string
    }
  }
  readonly components: {
    readonly button: {
      readonly face: string
      readonly faceHover: string
      readonly faceActive: string
      readonly text: string
      readonly borderLight: string
      readonly borderDark: string
      readonly borderDarker: string
      readonly focusRing: string
    }
    readonly window: {
      readonly frame: string
      readonly titleBarBg: string
      readonly titleBarText: string
      readonly titleBarBgInactive: string
      readonly titleBarTextInactive: string
    }
  }
}

export type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme | ThemeId) => void
  themes: Readonly<Record<ThemeId, Theme>>
}
