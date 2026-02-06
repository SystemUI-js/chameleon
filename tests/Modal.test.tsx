import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Modal, ThemeProvider } from '../src'
import { winxp } from '../src/theme/winxp'

describe('Modal inherits Window behavior', () => {
  it('passes move/resize props to Window', () => {
    const onMoveStart = jest.fn()
    const onResizeStart = jest.fn()

    const testContainer = document.body.appendChild(
      document.createElement('div')
    )
    render(
      <ThemeProvider defaultTheme={winxp}>
        <Modal
          title='Modal'
          isOpen
          onClose={() => undefined}
          movable
          resizable
          onMoveStart={onMoveStart}
          onResizeStart={onResizeStart}
        >
          Body
        </Modal>
      </ThemeProvider>,
      { container: testContainer }
    )

    const titleBar = document.body.querySelector(
      '.cm-window__title-bar'
    ) as HTMLElement
    const handle = document.body.querySelector(
      '[data-direction="se"]'
    ) as HTMLElement

    expect(titleBar).toBeInTheDocument()
    expect(handle).toBeInTheDocument()

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 1,
      clientX: 10,
      clientY: 10
    })

    fireEvent.pointerDown(handle, {
      button: 0,
      pointerId: 2,
      clientX: 20,
      clientY: 20
    })

    expect(onMoveStart).toHaveBeenCalledTimes(1)
    expect(onResizeStart).toHaveBeenCalledTimes(1)

    const modalContent = document.querySelector('.cm-modal-content')

    expect(modalContent).toBeInTheDocument()

    testContainer.remove()
  })
})
