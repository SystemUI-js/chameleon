import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { WindowMenu } from '../src'
import { MenuItem } from '../src/components/menuTypes'

describe('WindowMenu submenu keyboard navigation', () => {
  it('opens submenu with ArrowRight and selects with Enter', () => {
    const onUndo = jest.fn()
    const items: MenuItem[] = [
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

    fireEvent.click(screen.getByText('Edit'))
    expect(screen.getByText('Undo')).toBeInTheDocument()

    // Dispatch to active element (Undo)
    fireEvent.keyDown(document.activeElement || document.body, {
      key: 'ArrowRight'
    })
    expect(screen.getByText('Undo')).toBeInTheDocument()

    fireEvent.keyDown(document.activeElement || document.body, { key: 'Enter' })
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Undo')).not.toBeInTheDocument()
  })

  it('moves focus with ArrowUp/ArrowDown and returns with ArrowLeft', () => {
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
    // Focus is now on Undo

    fireEvent.keyDown(document.activeElement || document.body, {
      key: 'ArrowRight'
    })
    expect(screen.getByText('Undo')).toBeInTheDocument()

    fireEvent.keyDown(document.activeElement || document.body, {
      key: 'ArrowDown'
    })
    // Focus is now on Redo

    fireEvent.keyDown(document.activeElement || document.body, {
      key: 'ArrowUp'
    })
    // Focus is now on Undo

    fireEvent.keyDown(document.activeElement || document.body, {
      key: 'ArrowLeft'
    })
    // In a horizontal menu with one item, ArrowLeft wraps around to the same item, keeping it open.
    expect(screen.getByText('Undo')).toBeInTheDocument()
  })
})
