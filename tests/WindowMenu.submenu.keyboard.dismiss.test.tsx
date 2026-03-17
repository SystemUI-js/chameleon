import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { WindowMenu } from '../src'
import { MenuItem } from '../src/components/menuTypes'

describe('WindowMenu submenu keyboard dismiss', () => {
  it('closes submenu on Escape', () => {
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

    render(<WindowMenu items={items} />)

    fireEvent.click(screen.getByText('Edit'))
    expect(screen.getByText('Undo')).toBeInTheDocument()

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByText('Undo')).not.toBeInTheDocument()
  })
})
