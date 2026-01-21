import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { DropDownMenu } from '../src'
import { MenuItem } from '../src/components/menuTypes'

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
      <DropDownMenu items={items}>
        <button data-testid='dropdown-trigger'>Open</button>
      </DropDownMenu>
    )

    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('dropdown-trigger'))
    expect(screen.getByText('Edit')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Edit'))
    expect(screen.getByText('Undo')).toBeInTheDocument()
  })
})
