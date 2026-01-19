export type ThemeId = 'default' | 'win98' | 'winxp' | 'macos' | 'material'

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
    readonly radius: {
      readonly sm: string
      readonly md: string
      readonly lg: string
      readonly round: string
    }
    readonly gradient: {
      readonly titleBar: string
      readonly titleBarInactive: string
      readonly buttonFace: string
      readonly buttonFaceHover: string
      readonly buttonFaceActive: string
      readonly tabBg: string
      readonly tabBgActive: string
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
      readonly border: string
      readonly focusRing: string
    }
    readonly window: {
      readonly frame: string
      readonly titleBarBg: string
      readonly titleBarText: string
      readonly titleBarBgInactive: string
      readonly titleBarTextInactive: string
      readonly titleBarHeight: string
      readonly closeButtonBg: string
      readonly closeButtonBgHover: string
      readonly closeButtonBgActive: string
    }
    readonly taskbar: {
      readonly bg: string
      readonly height: string
      readonly borderLight: string
      readonly borderDark: string
      readonly itemBg: string
      readonly itemBgHover: string
      readonly itemBgActive: string
      readonly itemText: string
      readonly itemTextActive: string
    }
    readonly startButton: {
      readonly bg: string
      readonly bgHover: string
      readonly bgActive: string
      readonly text: string
      readonly borderLight: string
      readonly borderDark: string
      readonly borderDarker: string
    }
  }
}

export type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme | ThemeId) => void
  themes: Readonly<Record<ThemeId, Theme>>
}
