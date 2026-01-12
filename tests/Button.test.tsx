import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import { Button } from '../src'
import '@testing-library/jest-dom'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant class', () => {
    render(<Button variant='secondary'>Hi</Button>)
    const btn = screen.getByText('Hi')
    expect(btn).toHaveClass('cm-btn')
    expect(btn).toHaveClass('cm-btn--secondary')
  })
})
