import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { Window, ThemeProvider } from '../src';
import type { Theme } from '../src';
import { winxp } from '../src/theme/winxp';
import { win98 } from '../src/theme/win98';

type RectInput = {
  width: number;
  height: number;
  left: number;
  top: number;
};

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
    toJSON: () => '',
  } as DOMRect;
  Object.defineProperty(el, 'getBoundingClientRect', {
    value: () => domRect,
  });
};

const attachPointerCaptureMocks = (el: HTMLElement) => {
  Object.defineProperty(el, 'setPointerCapture', {
    value: jest.fn(),
  });
  Object.defineProperty(el, 'releasePointerCapture', {
    value: jest.fn(),
  });
};

beforeAll(() => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 });
  Object.defineProperty(window, 'innerHeight', { writable: true, value: 600 });
  Object.defineProperty(global, 'requestAnimationFrame', {
    value: (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    },
  });
  Object.defineProperty(global, 'cancelAnimationFrame', {
    value: () => 0,
  });
});

describe('Window interactions', () => {
  it('moves and emits callbacks when movable', () => {
    const onMoveStart = jest.fn();
    const onMoving = jest.fn();
    const onMoveEnd = jest.fn();

    const testContainer = document.body.appendChild(document.createElement('div'));
    const { container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <Window
          title="Test"
          initialPosition={{ x: 100, y: 100 }}
          movable
          onMoveStart={onMoveStart}
          onMoving={onMoving}
          onMoveEnd={onMoveEnd}
        />
      </ThemeProvider>,
      { container: testContainer },
    );

    const windowEl = container.querySelector('.cm-window') as HTMLElement;
    const titleBar = container.querySelector('.cm-window__title-bar') as HTMLElement;

    attachPointerCaptureMocks(titleBar);
    attachPointerCaptureMocks(windowEl);
    setRect(windowEl, { width: 300, height: 200, left: 100, top: 100 });

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 1,
      clientX: 120,
      clientY: 120,
    });

    expect(onMoveStart).toHaveBeenCalledTimes(1);
    expect(windowEl).toHaveClass('isDragging');

    fireEvent.pointerMove(windowEl, {
      pointerId: 1,
      clientX: 140,
      clientY: 150,
    });

    expect(onMoving).toHaveBeenCalled();
    expect(onMoving).toHaveBeenLastCalledWith({ x: 120, y: 130 });

    fireEvent.pointerUp(windowEl, { pointerId: 1 });

    expect(onMoveEnd).toHaveBeenCalledWith({ x: 120, y: 130 });
    expect(windowEl).not.toHaveClass('isDragging');

    testContainer.remove();
  });

  it('fires onActive when becoming active and not when already active', () => {
    const onActive = jest.fn();

    const testContainer = document.body.appendChild(document.createElement('div'));
    const { rerender } = render(
      <ThemeProvider defaultTheme={winxp}>
        <Window title="Test" isActive={false} onActive={onActive} />
      </ThemeProvider>,
      { container: testContainer },
    );

    const getTitleBar = () => testContainer.querySelector('.cm-window__title-bar') as HTMLElement;

    attachPointerCaptureMocks(getTitleBar());

    fireEvent.pointerDown(getTitleBar(), {
      button: 0,
      pointerId: 1,
      clientX: 10,
      clientY: 10,
    });

    expect(onActive).toHaveBeenCalledTimes(1);

    rerender(
      <ThemeProvider defaultTheme={winxp}>
        <Window title="Test" isActive onActive={onActive} />
      </ThemeProvider>,
    );

    fireEvent.pointerDown(getTitleBar(), {
      button: 0,
      pointerId: 2,
      clientX: 12,
      clientY: 12,
    });

    expect(onActive).toHaveBeenCalledTimes(1);

    rerender(
      <ThemeProvider defaultTheme={winxp}>
        <Window title="Test" isActive={false} onActive={onActive} />
      </ThemeProvider>,
    );

    fireEvent.pointerDown(getTitleBar(), {
      button: 0,
      pointerId: 3,
      clientX: 14,
      clientY: 14,
    });

    expect(onActive).toHaveBeenCalledTimes(2);

    testContainer.remove();
  });

  it('does not move when movable is false', () => {
    const onMoveStart = jest.fn();
    const onMoveEnd = jest.fn();

    const testContainer = document.body.appendChild(document.createElement('div'));
    const { container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <Window title="Test" movable={false} onMoveStart={onMoveStart} onMoveEnd={onMoveEnd} />
      </ThemeProvider>,
      { container: testContainer },
    );

    const titleBar = container.querySelector('.cm-window__title-bar') as HTMLElement;

    attachPointerCaptureMocks(titleBar);

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 1,
      clientX: 120,
      clientY: 120,
    });

    expect(onMoveStart).not.toHaveBeenCalled();
    expect(onMoveEnd).not.toHaveBeenCalled();

    testContainer.remove();
  });

  it('resizes in follow mode and emits resize callbacks', () => {
    const onResizeStart = jest.fn();
    const onResizing = jest.fn();
    const onResizeEnd = jest.fn();

    const testContainer = document.body.appendChild(document.createElement('div'));
    const { container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <Window
          title="Test"
          resizable
          initialSize={{ width: 300, height: 200 }}
          minWidth={200}
          minHeight={100}
          interactionMode="follow"
          onResizeStart={onResizeStart}
          onResizing={onResizing}
          onResizeEnd={onResizeEnd}
        />
      </ThemeProvider>,
      { container: testContainer },
    );

    const windowEl = container.querySelector('.cm-window') as HTMLElement;
    const handle = container.querySelector('[data-direction="se"]') as HTMLElement;

    attachPointerCaptureMocks(handle);
    attachPointerCaptureMocks(windowEl);
    setRect(windowEl, { width: 300, height: 200, left: 100, top: 100 });

    fireEvent.pointerDown(handle, {
      button: 0,
      pointerId: 2,
      clientX: 300,
      clientY: 200,
    });

    expect(onResizeStart).toHaveBeenCalledTimes(1);
    expect(windowEl).toHaveClass('isDragging');

    fireEvent.pointerMove(windowEl, {
      pointerId: 2,
      clientX: 350,
      clientY: 240,
    });

    expect(onResizing).toHaveBeenCalledWith({
      size: { width: 350, height: 240 },
      position: { x: 0, y: 0 },
    });

    fireEvent.pointerUp(windowEl, { pointerId: 2 });

    expect(onResizeEnd).toHaveBeenCalledWith({
      size: { width: 350, height: 240 },
      position: { x: 0, y: 0 },
    });

    testContainer.remove();
  });

  it('resizes only on end in static mode', () => {
    const onResizing = jest.fn();
    const onResizeEnd = jest.fn();

    const testContainer = document.body.appendChild(document.createElement('div'));
    const { container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <Window
          title="Test"
          resizable
          initialSize={{ width: 300, height: 200 }}
          interactionMode="static"
          onResizing={onResizing}
          onResizeEnd={onResizeEnd}
        />
      </ThemeProvider>,
      { container: testContainer },
    );

    const windowEl = container.querySelector('.cm-window') as HTMLElement;
    const handle = container.querySelector('[data-direction="se"]') as HTMLElement;

    attachPointerCaptureMocks(handle);
    attachPointerCaptureMocks(windowEl);
    setRect(windowEl, { width: 300, height: 200, left: 100, top: 100 });

    fireEvent.pointerDown(handle, {
      button: 0,
      pointerId: 3,
      clientX: 300,
      clientY: 200,
    });

    fireEvent.pointerMove(windowEl, {
      pointerId: 3,
      clientX: 360,
      clientY: 250,
    });

    expect(onResizing).toHaveBeenCalledWith({
      size: { width: 360, height: 250 },
      position: { x: 0, y: 0 },
    });

    fireEvent.pointerUp(windowEl, { pointerId: 3 });

    expect(onResizeEnd).toHaveBeenCalledWith({
      size: { width: 360, height: 250 },
      position: { x: 0, y: 0 },
    });

    testContainer.remove();
  });

  it('uses theme default interactionMode when not provided', () => {
    const onMoving = jest.fn();

    const testContainer = document.body.appendChild(document.createElement('div'));
    const { container } = render(
      <ThemeProvider defaultTheme={win98}>
        <Window title="Test" movable initialPosition={{ x: 10, y: 10 }} onMoving={onMoving} />
      </ThemeProvider>,
      { container: testContainer },
    );

    const windowEl = container.querySelector('.cm-window') as HTMLElement;
    const titleBar = container.querySelector('.cm-window__title-bar') as HTMLElement;

    attachPointerCaptureMocks(titleBar);
    attachPointerCaptureMocks(windowEl);
    setRect(windowEl, { width: 300, height: 200, left: 10, top: 10 });

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 4,
      clientX: 20,
      clientY: 20,
    });

    fireEvent.pointerMove(windowEl, {
      pointerId: 4,
      clientX: 40,
      clientY: 40,
    });

    expect(onMoving).toHaveBeenCalledWith({ x: 30, y: 30 });

    fireEvent.pointerUp(windowEl, { pointerId: 4 });

    testContainer.remove();
  });

  it('selects docking zone by priority and dispatches preview/commit/leave callbacks', () => {
    const onDockPreview = jest.fn();
    const onDockCommit = jest.fn();
    const onDockLeave = jest.fn();

    const dockingTheme: Theme = {
      ...winxp,
      behavior: {
        ...winxp.behavior,
        docking: {
          zones: [
            {
              id: 'top-left',
              gridColumnStart: 1,
              gridColumnEnd: 2,
              gridRowStart: 1,
              gridRowEnd: 2,
              priority: 1,
            },
            {
              id: 'top',
              gridColumnStart: 1,
              gridColumnEnd: 2,
              gridRowStart: 1,
              gridRowEnd: 2,
              priority: 10,
            },
          ],
          policy: {
            thresholdPx: 32,
            mode: 'release',
          },
          events: {
            onDockPreview,
            onDockCommit,
            onDockLeave,
          },
        },
      },
    };

    const testContainer = document.body.appendChild(document.createElement('div'));
    const { container } = render(
      <ThemeProvider defaultTheme={dockingTheme}>
        <Window title="Docking" initialPosition={{ x: 120, y: 120 }} movable />
      </ThemeProvider>,
      { container: testContainer },
    );

    const windowEl = container.querySelector('.cm-window') as HTMLElement;
    const titleBar = container.querySelector('.cm-window__title-bar') as HTMLElement;

    attachPointerCaptureMocks(titleBar);
    attachPointerCaptureMocks(windowEl);
    setRect(windowEl, { width: 300, height: 200, left: 120, top: 120 });

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 8,
      clientX: 130,
      clientY: 130,
    });

    fireEvent.pointerMove(windowEl, {
      pointerId: 8,
      clientX: 90,
      clientY: 90,
    });

    expect(onDockPreview).toHaveBeenCalledWith({ zoneId: 'top' });

    fireEvent.pointerUp(windowEl, { pointerId: 8 });

    expect(onDockCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        zoneId: 'top',
        x: 0,
        y: 0,
      }),
    );
    expect(onDockLeave).toHaveBeenCalled();

    testContainer.remove();
  });
});
