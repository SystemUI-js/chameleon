import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { WindowMenu } from '../src'
import { MenuItem } from '../src/components/menuTypes'

describe('WindowMenu submenu (click)', () => {
  it('opens submenu on click and closes after selection', () => {
    const onUndo = jest.fn()
    const items: MenuItem[] = [
      { id: 'file', label: 'File' },
      {
        id: 'edit',
        label: 'Edit',
        children: [
          { id: 'undo', label: 'Undo', onSelect: onUndo },
          { id: 'redo', label: 'Redo' }
        ]
      }
    ]

    render(<WindowMenu items={items} />)

    expect(screen.queryByText('Undo')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Edit'))
    expect(screen.getByText('Undo')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Undo'))
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Undo')).not.toBeInTheDocument()
  })
})
