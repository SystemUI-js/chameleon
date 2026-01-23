import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { DropDownMenu, ThemeProvider } from '../src'
import { MenuItem } from '../src/components/menuTypes'
import { winxp } from '../src/theme/winxp'

describe('DropDownMenu submenu rendering', () => {
  it('renders nested submenu content when opened', () => {
    const items: MenuItem[] = [
      {
        id: 'edit',
        label: 'Edit',
        children: [
          { id: 'undo', label: 'Undo' },
          { id: 'redo', label: 'Redo' }
        ]
      }
    ]

    render(
      <ThemeProvider defaultTheme={winxp}>
        <DropDownMenu items={items}>
          <button data-testid='dropdown-trigger'>Open</button>
        </DropDownMenu>
      </ThemeProvider>
    )

    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('dropdown-trigger'))
    expect(screen.getByText('Edit')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Edit'))
    expect(screen.getByText('Undo')).toBeInTheDocument()

    const menu = document.querySelector('.cm-dropdown-menu')
    expect(menu).toHaveClass('cm-dropdown-menu')
  })
})
