import { render } from '@testing-library/react'
import { fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { Window, ThemeProvider } from '../src'
import { winxp } from '../src/theme/winxp'
import { win98 } from '../src/theme/win98'

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

beforeAll(() => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 })
  Object.defineProperty(window, 'innerHeight', { writable: true, value: 600 })
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
      <ThemeProvider defaultTheme={winxp}>
        <Window
          title='Test'
          initialPosition={{ x: 100, y: 100 }}
          movable
          onMoveStart={onMoveStart}
          onMoving={onMoving}
          onMoveEnd={onMoveEnd}
        />
      </ThemeProvider>,
      { container: testContainer }
    )

    const windowEl = container.querySelector('.cm-window') as HTMLElement
    const titleBar = container.querySelector(
      '.cm-window__title-bar'
    ) as HTMLElement

    setRect(windowEl, { width: 300, height: 200, left: 100, top: 100 })

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 1,
      clientX: 120,
      clientY: 120
    })

    expect(onMoveStart).toHaveBeenCalledTimes(1)
    expect(windowEl).toHaveClass('isDragging')

    fireEvent.pointerMove(document, {
      pointerId: 1,
      clientX: 140,
      clientY: 150
    })

    expect(onMoving).toHaveBeenCalled()
    expect(onMoving).toHaveBeenLastCalledWith({ x: 120, y: 130 })

    fireEvent.pointerUp(document, {
      pointerId: 1,
      clientX: 140,
      clientY: 150
    })

    expect(onMoveEnd).toHaveBeenCalledWith({ x: 120, y: 130 })
    expect(windowEl).not.toHaveClass('isDragging')

    testContainer.remove()
  })

  it('fires onActive when becoming active and not when already active', () => {
    const onActive = jest.fn()

    const testContainer = document.body.appendChild(
      document.createElement('div')
    )
    const { rerender } = render(
      <ThemeProvider defaultTheme={winxp}>
        <Window title='Test' isActive={false} onActive={onActive} />
      </ThemeProvider>,
      { container: testContainer }
    )

    const getTitleBar = () =>
      testContainer.querySelector('.cm-window__title-bar') as HTMLElement

    fireEvent.pointerDown(getTitleBar(), {
      button: 0,
      pointerId: 2,
      clientX: 10,
      clientY: 10
    })

    expect(onActive).toHaveBeenCalledTimes(1)

    rerender(
      <ThemeProvider defaultTheme={winxp}>
        <Window title='Test' isActive onActive={onActive} />
      </ThemeProvider>
    )

    fireEvent.pointerDown(getTitleBar(), {
      button: 0,
      pointerId: 3,
      clientX: 12,
      clientY: 12
    })

    expect(onActive).toHaveBeenCalledTimes(1)

    rerender(
      <ThemeProvider defaultTheme={winxp}>
        <Window title='Test' isActive={false} onActive={onActive} />
      </ThemeProvider>
    )

    fireEvent.pointerDown(getTitleBar(), {
      button: 0,
      pointerId: 4,
      clientX: 14,
      clientY: 14
    })

    expect(onActive).toHaveBeenCalledTimes(2)

    testContainer.remove()
  })

  it('does not move when movable is false', () => {
    const onMoveStart = jest.fn()
    const onMoveEnd = jest.fn()

    const testContainer = document.body.appendChild(
      document.createElement('div')
    )
    const { container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <Window
          title='Test'
          movable={false}
          onMoveStart={onMoveStart}
          onMoveEnd={onMoveEnd}
        />
      </ThemeProvider>,
      { container: testContainer }
    )

    const titleBar = container.querySelector(
      '.cm-window__title-bar'
    ) as HTMLElement

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 5,
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
      <ThemeProvider defaultTheme={winxp}>
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
        />
      </ThemeProvider>,
      { container: testContainer }
    )

    const windowEl = container.querySelector('.cm-window') as HTMLElement
    const handle = container.querySelector(
      '[data-direction="se"]'
    ) as HTMLElement

    setRect(windowEl, { width: 300, height: 200, left: 100, top: 100 })

    fireEvent.pointerDown(handle, {
      button: 0,
      pointerId: 6,
      clientX: 300,
      clientY: 200
    })

    expect(onResizeStart).toHaveBeenCalledTimes(1)
    expect(windowEl).toHaveClass('isDragging')

    fireEvent.pointerMove(document, {
      pointerId: 6,
      clientX: 350,
      clientY: 240
    })

    expect(onResizing).toHaveBeenCalledWith({
      size: { width: 350, height: 240 },
      position: { x: 0, y: 0 }
    })

    fireEvent.pointerUp(document, {
      pointerId: 6,
      clientX: 350,
      clientY: 240
    })

    expect(onResizeEnd).toHaveBeenCalledWith({
      size: { width: 350, height: 240 },
      position: { x: 0, y: 0 }
    })

    testContainer.remove()
  })

  it('resizes only on end in static mode', () => {
    const onResizing = jest.fn()
    const onResizeEnd = jest.fn()

    const testContainer = document.body.appendChild(
      document.createElement('div')
    )
    const { container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <Window
          title='Test'
          resizable
          initialSize={{ width: 300, height: 200 }}
          interactionMode='static'
          onResizing={onResizing}
          onResizeEnd={onResizeEnd}
        />
      </ThemeProvider>,
      { container: testContainer }
    )

    const windowEl = container.querySelector('.cm-window') as HTMLElement
    const handle = container.querySelector(
      '[data-direction="se"]'
    ) as HTMLElement

    setRect(windowEl, { width: 300, height: 200, left: 100, top: 100 })

    fireEvent.pointerDown(handle, {
      button: 0,
      pointerId: 7,
      clientX: 300,
      clientY: 200
    })

    fireEvent.pointerMove(document, {
      pointerId: 7,
      clientX: 360,
      clientY: 250
    })

    expect(onResizing).toHaveBeenCalledWith({
      size: { width: 360, height: 250 },
      position: { x: 0, y: 0 }
    })

    const preview = container.querySelector('.cm-window-preview') as HTMLElement
    expect(preview).toBeInTheDocument()
    expect(preview).toHaveStyle({ width: '360px', height: '250px' })
    expect(preview).toHaveStyle({ left: '0px', top: '0px' })
    expect(windowEl).toHaveStyle({ width: '300px', height: '200px' })

    fireEvent.pointerUp(document, {
      pointerId: 7,
      clientX: 360,
      clientY: 250
    })

    expect(onResizeEnd).toHaveBeenCalledWith({
      size: { width: 360, height: 250 },
      position: { x: 0, y: 0 }
    })

    testContainer.remove()
  })

  it('uses theme default interactionMode when not provided', () => {
    const onMoving = jest.fn()

    const testContainer = document.body.appendChild(
      document.createElement('div')
    )
    const { container } = render(
      <ThemeProvider defaultTheme={win98}>
        <Window
          title='Test'
          movable
          initialPosition={{ x: 10, y: 10 }}
          onMoving={onMoving}
        />
      </ThemeProvider>,
      { container: testContainer }
    )

    const windowEl = container.querySelector('.cm-window') as HTMLElement
    const titleBar = container.querySelector(
      '.cm-window__title-bar'
    ) as HTMLElement

    setRect(windowEl, { width: 300, height: 200, left: 10, top: 10 })

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 8,
      clientX: 20,
      clientY: 20
    })

    fireEvent.pointerMove(document, {
      pointerId: 8,
      clientX: 40,
      clientY: 40
    })

    expect(onMoving).toHaveBeenCalledWith({ x: 30, y: 30 })

    fireEvent.pointerUp(document, {
      pointerId: 8,
      clientX: 40,
      clientY: 40
    })

    testContainer.remove()
  })
})
