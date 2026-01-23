import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Modal } from '../src'

const attachPointerCaptureMocks = (el: HTMLElement) => {
  Object.defineProperty(el, 'setPointerCapture', {
    value: jest.fn()
  })
  Object.defineProperty(el, 'releasePointerCapture', {
    value: jest.fn()
  })
}

describe('Modal inherits Window behavior', () => {
  it('passes move/resize props to Window', () => {
    const onMoveStart = jest.fn()
    const onResizeStart = jest.fn()

    const testContainer = document.body.appendChild(
      document.createElement('div')
    )
    render(
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
      </Modal>,
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

    attachPointerCaptureMocks(titleBar)
    attachPointerCaptureMocks(handle)

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

    testContainer.remove()
  })
})
