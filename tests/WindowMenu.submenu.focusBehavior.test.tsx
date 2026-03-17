import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { WindowMenu } from '../src'
import { MenuItem } from '../src/components/menuTypes'

describe('WindowMenu submenu focus behavior', () => {
  it('supports focusBehavior open=firstChild', () => {
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
      <WindowMenu
        items={items}
        focusBehavior={{ open: 'firstChild', close: 'parent' }}
      />
    )

    fireEvent.click(screen.getByText('Edit'))
    fireEvent.keyDown(document.body, { key: 'ArrowRight' })

    expect(screen.getByText('Undo')).toHaveFocus()
  })
})
