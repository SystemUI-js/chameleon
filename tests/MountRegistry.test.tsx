import { render, screen } from '@testing-library/react'
import { MountConsumer, MountProvider } from '../src'

describe('MountConsumer', () => {
  it('renders all consumers when not excluding', () => {
    render(
      <>
        <MountProvider name='slot' data-testid='slot' />
        <MountConsumer name='slot'>Alpha</MountConsumer>
        <MountConsumer name='slot'>Beta</MountConsumer>
      </>
    )

    const slot = screen.getByTestId('slot')
    expect(slot).toHaveTextContent('Alpha')
    expect(slot).toHaveTextContent('Beta')
  })

  it('renders the highest priority excluded consumer', () => {
    render(
      <>
        <MountProvider name='slot' data-testid='slot' />
        <MountConsumer name='slot' exclude priority={1}>
          Low
        </MountConsumer>
        <MountConsumer name='slot' exclude priority={3}>
          High
        </MountConsumer>
        <MountConsumer name='slot'>Other</MountConsumer>
      </>
    )

    const slot = screen.getByTestId('slot')
    expect(slot).toHaveTextContent('High')
    expect(slot).not.toHaveTextContent('Low')
    expect(slot).not.toHaveTextContent('Other')
  })
})
