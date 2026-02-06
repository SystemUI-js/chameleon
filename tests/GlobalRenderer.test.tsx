import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  GlobalRender,
  registerGlobalRenderer,
  ThemeProvider,
  Window
} from '../src'
import { winxp } from '../src/theme/winxp'
import {
  DefaultWindowTitleRenderer,
  Win98WindowTitleRenderer,
  WinXPWindowTitleRenderer,
  type WindowTitleRendererProps
} from '../src/components/WindowTitleRenderer'
import {
  getRendererSnapshot,
  unregisterRenderer
} from '../src/components/globalRendererRegistry'

const clearRenderer = (name: string) => {
  const snapshot = getRendererSnapshot(name)
  if (!snapshot) return
  unregisterRenderer(snapshot.name, snapshot.renderer)
}

const clearDefaultRenderers = () => {
  clearRenderer('window-title')
  clearRenderer('win98:window-title')
  clearRenderer('winxp:window-title')
}

const ensureDefaultRenderers = () => {
  if (!getRendererSnapshot('window-title')) {
    registerGlobalRenderer('window-title', DefaultWindowTitleRenderer)
  }
  if (!getRendererSnapshot('win98:window-title')) {
    registerGlobalRenderer('win98:window-title', Win98WindowTitleRenderer)
  }
  if (!getRendererSnapshot('winxp:window-title')) {
    registerGlobalRenderer('winxp:window-title', WinXPWindowTitleRenderer)
  }
}

beforeEach(() => {
  clearDefaultRenderers()
})

afterEach(() => {
  clearDefaultRenderers()
  ensureDefaultRenderers()
})

describe('Global renderer registry', () => {
  it('registers renderer and prevents duplicates', () => {
    const TestRenderer = ({ title }: WindowTitleRendererProps) => (
      <span data-testid='registered-renderer'>{title}</span>
    )

    registerGlobalRenderer('window-title', TestRenderer)

    const snapshot = getRendererSnapshot('window-title')
    expect(snapshot?.renderer).toBe(TestRenderer)

    expect(() => registerGlobalRenderer('window-title', TestRenderer)).toThrow(
      'already registered'
    )
  })
})

describe('GlobalRender', () => {
  it('prefers theme-specific renderer when available', () => {
    const DefaultRenderer = ({ title }: WindowTitleRendererProps) => (
      <span data-testid='default-renderer'>{title}</span>
    )
    const ThemeRenderer = ({ title }: WindowTitleRendererProps) => (
      <span data-testid='theme-renderer'>{title}</span>
    )

    registerGlobalRenderer('window-title', DefaultRenderer)
    registerGlobalRenderer('winxp:window-title', ThemeRenderer)

    render(
      <ThemeProvider defaultTheme={winxp}>
        <GlobalRender name='window-title' title='Theme Title' />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme-renderer')).toHaveTextContent(
      'Theme Title'
    )
  })

  it('falls back to default renderer when theme-specific is missing', () => {
    const DefaultRenderer = ({ title }: WindowTitleRendererProps) => (
      <span data-testid='default-renderer'>{title}</span>
    )

    registerGlobalRenderer('window-title', DefaultRenderer)

    render(
      <ThemeProvider defaultTheme={winxp}>
        <GlobalRender name='window-title' title='Default Title' />
      </ThemeProvider>
    )

    expect(screen.getByTestId('default-renderer')).toHaveTextContent(
      'Default Title'
    )
  })
})

describe('Window title rendering', () => {
  it('renders title bar via GlobalRender', () => {
    const CustomRenderer = ({ title }: WindowTitleRendererProps) => (
      <span data-testid='custom-title'>{title}</span>
    )

    registerGlobalRenderer('window-title', CustomRenderer)

    render(
      <ThemeProvider defaultTheme={winxp}>
        <Window title='Custom Window' />
      </ThemeProvider>
    )

    expect(screen.getByTestId('custom-title')).toHaveTextContent(
      'Custom Window'
    )
  })
})
