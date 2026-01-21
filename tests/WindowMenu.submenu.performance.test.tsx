import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { WindowMenu } from '../src'
import { MenuItem } from '../src/components/menuTypes'

describe('WindowMenu submenu performance', () => {
  it('opens submenu within 200ms (real timing)', () => {
    const items: MenuItem[] = [
      {
        id: 'edit',
        label: 'Edit',
        children: Array.from({ length: 50 }).map((_, index) => ({
          id: `item-${index}`,
          label: `Item ${index}`
        }))
      }
    ]

    render(<WindowMenu items={items} />)

    const start = performance.now()
    fireEvent.click(screen.getByText('Edit'))
    expect(screen.getByText('Item 0')).toBeInTheDocument()
    expect(screen.getByText('Item 49')).toBeInTheDocument()
    const end = performance.now()

    expect(end - start).toBeLessThan(200)
  })
})
