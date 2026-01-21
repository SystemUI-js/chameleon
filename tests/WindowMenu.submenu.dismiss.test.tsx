import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { WindowMenu } from '../src'
import { MenuItem } from '../src/components/menuTypes'

describe('WindowMenu submenu dismiss', () => {
  it('closes submenu on outside click', () => {
    const items: MenuItem[] = [
      { id: 'file', label: 'File' },
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

    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('Undo')).not.toBeInTheDocument()
  })
})
