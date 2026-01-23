import { render } from '@testing-library/react'
import { fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { Window } from '../src'

type RectInput = {
  width: number
  height: number
  left: number
  top: number
}

const setRect = (el: HTMLElement, rect: RectInput) => {
  const domRect: DOMRect = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    left: rect.left,
    toJSON: () => ''
  } as DOMRect
  Object.defineProperty(el, 'getBoundingClientRect', {
    value: () => domRect
  })
}

const attachPointerCaptureMocks = (el: HTMLElement) => {
  Object.defineProperty(el, 'setPointerCapture', {
    value: jest.fn()
  })
  Object.defineProperty(el, 'releasePointerCapture', {
    value: jest.fn()
  })
}

beforeAll(() => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 })
  Object.defineProperty(window, 'innerHeight', { writable: true, value: 600 })
  Object.defineProperty(global, 'requestAnimationFrame', {
    value: (cb: FrameRequestCallback) => {
      cb(0)
      return 1
    }
  })
  Object.defineProperty(global, 'cancelAnimationFrame', {
    value: () => 0
  })
})

describe('Window interactions', () => {
  it('moves and emits callbacks when movable', () => {
    const onMoveStart = jest.fn()
    const onMoving = jest.fn()
    const onMoveEnd = jest.fn()

    const testContainer = document.body.appendChild(
      document.createElement('div')
    )
    const { container } = render(
      <Window
        title='Test'
        initialPosition={{ x: 100, y: 100 }}
        movable
        onMoveStart={onMoveStart}
        onMoving={onMoving}
        onMoveEnd={onMoveEnd}
      />,
      { container: testContainer }
    )

    const windowEl = container.querySelector('.cm-window') as HTMLElement
    const titleBar = container.querySelector(
      '.cm-window__title-bar'
    ) as HTMLElement

    attachPointerCaptureMocks(titleBar)
    attachPointerCaptureMocks(windowEl)
    setRect(windowEl, { width: 300, height: 200, left: 100, top: 100 })

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 1,
      clientX: 120,
      clientY: 120
    })

    expect(onMoveStart).toHaveBeenCalledTimes(1)
    expect(windowEl).toHaveClass('isDragging')

    fireEvent.pointerMove(windowEl, {
      pointerId: 1,
      clientX: 140,
      clientY: 150
    })

    expect(onMoving).toHaveBeenCalled()
    expect(onMoving).toHaveBeenLastCalledWith({ x: 120, y: 130 })

    fireEvent.pointerUp(windowEl, { pointerId: 1 })

    expect(onMoveEnd).toHaveBeenCalledWith({ x: 120, y: 130 })
    expect(windowEl).not.toHaveClass('isDragging')

    testContainer.remove()
  })

  it('does not move when movable is false', () => {
    const onMoveStart = jest.fn()
    const onMoveEnd = jest.fn()

    const testContainer = document.body.appendChild(
      document.createElement('div')
    )
    const { container } = render(
      <Window
        title='Test'
        movable={false}
        onMoveStart={onMoveStart}
        onMoveEnd={onMoveEnd}
      />,
      { container: testContainer }
    )

    const titleBar = container.querySelector(
      '.cm-window__title-bar'
    ) as HTMLElement

    attachPointerCaptureMocks(titleBar)

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 1,
      clientX: 120,
      clientY: 120
    })

    expect(onMoveStart).not.toHaveBeenCalled()
    expect(onMoveEnd).not.toHaveBeenCalled()

    testContainer.remove()
  })

  it('resizes in follow mode and emits resize callbacks', () => {
    const onResizeStart = jest.fn()
    const onResizing = jest.fn()
    const onResizeEnd = jest.fn()

    const testContainer = document.body.appendChild(
      document.createElement('div')
    )
    const { container } = render(
      <Window
        title='Test'
        resizable
        initialSize={{ width: 300, height: 200 }}
        minWidth={200}
        minHeight={100}
        interactionMode='follow'
        onResizeStart={onResizeStart}
        onResizing={onResizing}
        onResizeEnd={onResizeEnd}
      />,
      { container: testContainer }
    )

    const windowEl = container.querySelector('.cm-window') as HTMLElement
    const handle = container.querySelector(
      '[data-direction="se"]'
    ) as HTMLElement

    attachPointerCaptureMocks(handle)
    attachPointerCaptureMocks(windowEl)
    setRect(windowEl, { width: 300, height: 200, left: 100, top: 100 })

    fireEvent.pointerDown(handle, {
      button: 0,
      pointerId: 2,
      clientX: 300,
      clientY: 200
    })

    expect(onResizeStart).toHaveBeenCalledTimes(1)
    expect(windowEl).toHaveClass('isDragging')

    fireEvent.pointerMove(windowEl, {
      pointerId: 2,
      clientX: 350,
      clientY: 240
    })

    expect(onResizing).toHaveBeenCalledWith({ width: 350, height: 240 })

    fireEvent.pointerUp(windowEl, { pointerId: 2 })

    expect(onResizeEnd).toHaveBeenCalledWith({ width: 350, height: 240 })

    testContainer.remove()
  })

  it('resizes only on end in static mode', () => {
    const onResizing = jest.fn()
    const onResizeEnd = jest.fn()

    const testContainer = document.body.appendChild(
      document.createElement('div')
    )
    const { container } = render(
      <Window
        title='Test'
        resizable
        initialSize={{ width: 300, height: 200 }}
        interactionMode='static'
        onResizing={onResizing}
        onResizeEnd={onResizeEnd}
      />,
      { container: testContainer }
    )

    const windowEl = container.querySelector('.cm-window') as HTMLElement
    const handle = container.querySelector(
      '[data-direction="se"]'
    ) as HTMLElement

    attachPointerCaptureMocks(handle)
    attachPointerCaptureMocks(windowEl)
    setRect(windowEl, { width: 300, height: 200, left: 100, top: 100 })

    fireEvent.pointerDown(handle, {
      button: 0,
      pointerId: 3,
      clientX: 300,
      clientY: 200
    })

    fireEvent.pointerMove(windowEl, {
      pointerId: 3,
      clientX: 360,
      clientY: 250
    })

    // In static mode, onResizing should be called for consumers to render ghost outline
    expect(onResizing).toHaveBeenCalledWith({ width: 360, height: 250 })

    fireEvent.pointerUp(windowEl, { pointerId: 3 })

    expect(onResizeEnd).toHaveBeenCalledWith({ width: 360, height: 250 })

    testContainer.remove()
  })
})
