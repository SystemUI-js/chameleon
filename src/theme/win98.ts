import { Theme } from './types'

export const win98: Theme = {
  id: 'win98',
  name: 'Windows 98',
  tokens: {
    color: {
      surface: '#c0c0c0',
      surfaceRaised: '#dfdfdf',
      text: '#000000',
      textMuted: '#808080',
      textInvert: '#ffffff',
      border: '#808080',
      borderStrong: '#000000',
      borderLight: '#dfdfdf',
      borderLightest: '#ffffff',
      borderDark: '#808080',
      borderDarkest: '#000000',
      focusRing: '#000000', // Dotted line in win98 usually
      selectionBg: '#000080',
      selectionText: '#ffffff'
    },
    typography: {
      fontFamily:
        "'MS Sans Serif', 'Microsoft Sans Serif', 'Segoe UI', sans-serif",
      fontSize: '12px',
      lineHeight: '1.2',
      fontWeight: 400
    },
    spacing: {
      xs: '2px',
      sm: '4px',
      md: '8px',
      lg: '16px',
      xl: '24px'
    },
    shadow: {
      insetBevel:
        'inset 1px 1px 0 #000000, inset 2px 2px 0 #808080, inset -1px -1px 0 #ffffff, inset -2px -2px 0 #dfdfdf',
      outsetBevel:
        'inset 1px 1px 0 #ffffff, inset 2px 2px 0 #dfdfdf, inset -1px -1px 0 #000000, inset -2px -2px 0 #808080',
      popup: '2px 2px 0 #000000'
    }
  },
  components: {
    button: {
      face: '#c0c0c0',
      faceHover: '#c0c0c0',
      faceActive: '#c0c0c0',
      text: '#000000',
      borderLight: '#ffffff',
      borderDark: '#808080',
      borderDarker: '#000000',
      focusRing: '#000000'
    },
    window: {
      frame: '#c0c0c0',
      titleBarBg: '#000080',
      titleBarText: '#ffffff',
      titleBarBgInactive: '#808080',
      titleBarTextInactive: '#c0c0c0'
    }
  }
}
