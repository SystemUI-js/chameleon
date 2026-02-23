import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/dom'
import {
  ThemeProvider,
  Window,
  defaultTheme,
  MountProvider,
  type Theme
} from '../src'
import { win98 } from '../src/theme/win98'
import { winxp } from '../src/theme/winxp'

const openTitleMenu = (titleBar: HTMLElement) => {
  fireEvent.contextMenu(titleBar, { clientX: 120, clientY: 90 })
}

const renderWindowWithTheme = (theme: Theme) => {
  const { container } = render(
    <ThemeProvider defaultTheme={theme}>
      <Window title='Test Window' />
    </ThemeProvider>
  )

  const titleBar = container.querySelector(
    '.cm-window__title-bar'
  ) as HTMLElement

  return { container, titleBar }
}

describe('Window title bar context menu', () => {
  it('opens context menu on Win98 title bar right-click', () => {
    const { titleBar } = renderWindowWithTheme(win98)

    openTitleMenu(titleBar)

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('opens context menu on WinXP title bar right-click', () => {
    const { titleBar } = renderWindowWithTheme(winxp)

    openTitleMenu(titleBar)

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('mounts context menu inside popups layer when provided', () => {
    const { container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <MountProvider name='layer-popups' data-testid='popups-layer' />
        <Window title='Test Window' />
      </ThemeProvider>
    )

    const titleBar = container.querySelector(
      '.cm-window__title-bar'
    ) as HTMLElement

    openTitleMenu(titleBar)

    const menu = screen.getByRole('menu')
    const layer = screen.getByTestId('popups-layer')

    expect(layer.contains(menu)).toBe(true)
    expect(menu.style.zIndex).toContain('--cm-z-index-popups')
  })

  it('invokes onClose when clicking Close', () => {
    const onClose = jest.fn()
    const { container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <Window title='Test Window' onClose={onClose} />
      </ThemeProvider>
    )

    const titleBar = container.querySelector(
      '.cm-window__title-bar'
    ) as HTMLElement

    openTitleMenu(titleBar)

    fireEvent.click(screen.getByText('Close'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not show context menu for non Win98/WinXP themes', () => {
    const { container } = render(
      <ThemeProvider defaultTheme={defaultTheme}>
        <Window title='Test Window' />
      </ThemeProvider>
    )

    const titleBar = container.querySelector(
      '.cm-window__title-bar'
    ) as HTMLElement

    openTitleMenu(titleBar)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })
})
