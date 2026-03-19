import { fireEvent } from '@testing-library/dom';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { CWindow } from '../src/components/Window/Window';
import { CWindowTitle } from '../src/components/Window/WindowTitle';

const setRect = (
  element: HTMLElement,
  rect: { width: number; height: number; left: number; top: number },
): void => {
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

  Object.defineProperty(element, 'getBoundingClientRect', {
    value: () => domRect,
  });
};

const dragPointer = (
  target: HTMLElement,
  options: {
    pointerId: number;
    start: { x: number; y: number };
    end: { x: number; y: number };
  },
): void => {
  fireEvent.pointerDown(target, {
    pointerId: options.pointerId,
    button: 0,
    clientX: options.start.x,
    clientY: options.start.y,
  });

  fireEvent.pointerMove(document, {
    pointerId: options.pointerId,
    clientX: options.end.x,
    clientY: options.end.y,
  });

  fireEvent.pointerUp(document, {
    pointerId: options.pointerId,
    clientX: options.end.x,
    clientY: options.end.y,
  });
};

const getFrameMetrics = (
  frame: HTMLElement,
): { x: number; y: number; width: number; height: number } => ({
  x: Number.parseFloat(frame.style.left),
  y: Number.parseFloat(frame.style.top),
  width: Number.parseFloat(frame.style.width),
  height: Number.parseFloat(frame.style.height),
});

describe('CWindow and CWindowTitle composition', () => {
  it('uses uuid from CWidget and keeps it stable across re-render', () => {
    const windowRef = React.createRef<CWindow>();
    const { rerender } = render(<CWindow ref={windowRef} />);

    const firstUuid = windowRef.current?.uuid;
    rerender(<CWindow ref={windowRef} />);
    const secondUuid = windowRef.current?.uuid;

    expect(firstUuid).toBeDefined();
    expect(secondUuid).toBe(firstUuid);
  });

  it('does not implicitly render CWindowTitle when consumer does not compose it', () => {
    const { queryByTestId } = render(
      <CWindow>
        <div data-testid="window-body">body</div>
      </CWindow>,
    );

    expect(queryByTestId('window-title')).not.toBeInTheDocument();
  });

  it('renders composed CWindowTitle content explicitly', () => {
    const { getByTestId } = render(
      <CWindow>
        <CWindowTitle>Composed Title</CWindowTitle>
      </CWindow>,
    );

    expect(getByTestId('window-title')).toHaveTextContent('Composed Title');
  });

  it('moves window frame when dragging title bar', () => {
    const { getByTestId } = render(
      <CWindow x={10} y={20} width={240} height={160}>
        <CWindowTitle>Draggable</CWindowTitle>
        <div data-testid="window-body">body</div>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const title = getByTestId('window-title');

    setRect(frame, { width: 240, height: 160, left: 10, top: 20 });

    dragPointer(title, {
      pointerId: 1,
      start: { x: 50, y: 50 },
      end: { x: 70, y: 90 },
    });

    expect(frame.style.left).toBe('30px');
    expect(frame.style.top).toBe('60px');
  });

  it('does not move window when dragging content area', () => {
    const { getByTestId } = render(
      <CWindow x={15} y={25}>
        <CWindowTitle>Title</CWindowTitle>
        <div data-testid="window-body">body</div>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const body = getByTestId('window-body');

    dragPointer(body, {
      pointerId: 2,
      start: { x: 40, y: 40 },
      end: { x: 80, y: 80 },
    });

    expect(frame.style.left).toBe('15px');
    expect(frame.style.top).toBe('25px');
  });

  it.each([
    { direction: 'e', delta: { x: 20, y: 0 }, expected: { x: 10, y: 20, width: 260, height: 160 } },
    {
      direction: 'w',
      delta: { x: -20, y: 0 },
      expected: { x: -10, y: 20, width: 260, height: 160 },
    },
    {
      direction: 'n',
      delta: { x: 0, y: -10 },
      expected: { x: 10, y: 10, width: 240, height: 170 },
    },
    { direction: 's', delta: { x: 0, y: 10 }, expected: { x: 10, y: 20, width: 240, height: 170 } },
    {
      direction: 'ne',
      delta: { x: 20, y: -10 },
      expected: { x: 10, y: 10, width: 260, height: 170 },
    },
    {
      direction: 'nw',
      delta: { x: -20, y: -10 },
      expected: { x: -10, y: 10, width: 260, height: 170 },
    },
    {
      direction: 'se',
      delta: { x: 20, y: 10 },
      expected: { x: 10, y: 20, width: 260, height: 170 },
    },
    {
      direction: 'sw',
      delta: { x: -20, y: 10 },
      expected: { x: -10, y: 20, width: 260, height: 170 },
    },
  ])(
    'resizes window from %s handle with anchor-preserving behavior',
    ({ direction, delta, expected }) => {
      const { getByTestId } = render(
        <CWindow x={10} y={20} width={240} height={160}>
          <CWindowTitle>Resizable</CWindowTitle>
          <div data-testid="window-body">body</div>
        </CWindow>,
      );

      const frame = getByTestId('window-frame');
      const handle = getByTestId(`window-resize-${direction}`);

      dragPointer(handle, {
        pointerId: 10,
        start: { x: 100, y: 100 },
        end: { x: 100 + delta.x, y: 100 + delta.y },
      });

      expect(getFrameMetrics(frame)).toEqual(expected);
    },
  );

  it('disables resize when resizable is false but still allows title dragging', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow x={12} y={24} width={200} height={120} resizable={false}>
        <CWindowTitle>Drag only</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const title = getByTestId('window-title');

    expect(queryByTestId('window-resize-e')).not.toBeInTheDocument();

    dragPointer(title, {
      pointerId: 11,
      start: { x: 60, y: 60 },
      end: { x: 90, y: 100 },
    });

    expect(frame.style.left).toBe('42px');
    expect(frame.style.top).toBe('64px');
    expect(frame.style.width).toBe('200px');
    expect(frame.style.height).toBe('120px');
  });

  it('applies default edgeWidth as 4px when omitted', () => {
    const { getByTestId } = render(
      <CWindow x={0} y={0} width={100} height={100}>
        <CWindowTitle>Default edges</CWindowTitle>
      </CWindow>,
    );

    const northHandle = getByTestId('window-resize-n');
    const eastHandle = getByTestId('window-resize-e');

    expect(northHandle.style.height).toBe('4px');
    expect(northHandle.style.top).toBe('-2px');
    expect(northHandle.style.left).toBe('2px');
    expect(eastHandle.style.width).toBe('4px');
    expect(eastHandle.style.right).toBe('-2px');
  });

  it('applies custom edgeWidth from resizeOptions', () => {
    const { getByTestId } = render(
      <CWindow x={0} y={0} width={100} height={100} resizeOptions={{ edgeWidth: 12 }}>
        <CWindowTitle>Custom edges</CWindowTitle>
      </CWindow>,
    );

    const northHandle = getByTestId('window-resize-n');
    const eastHandle = getByTestId('window-resize-e');

    expect(northHandle.style.height).toBe('12px');
    expect(northHandle.style.top).toBe('-6px');
    expect(northHandle.style.left).toBe('6px');
    expect(eastHandle.style.width).toBe('12px');
    expect(eastHandle.style.right).toBe('-6px');
  });

  it('clamps min size to default 1px when shrinking past zero', () => {
    const { getByTestId } = render(
      <CWindow x={30} y={30} width={40} height={30}>
        <CWindowTitle>Clamp min</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');

    dragPointer(getByTestId('window-resize-e'), {
      pointerId: 12,
      start: { x: 60, y: 50 },
      end: { x: 0, y: 50 },
    });
    dragPointer(getByTestId('window-resize-s'), {
      pointerId: 13,
      start: { x: 60, y: 50 },
      end: { x: 60, y: -20 },
    });

    const metrics = getFrameMetrics(frame);
    expect(metrics.width).toBe(1);
    expect(metrics.height).toBe(1);
  });

  it('clamps max size and keeps anchor for west/north directions', () => {
    const { getByTestId } = render(
      <CWindow
        x={50}
        y={60}
        width={120}
        height={100}
        resizeOptions={{
          minContentWidth: 20,
          minContentHeight: 30,
          maxContentWidth: 150,
          maxContentHeight: 110,
        }}
      >
        <CWindowTitle>Clamp max</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');

    dragPointer(getByTestId('window-resize-e'), {
      pointerId: 14,
      start: { x: 160, y: 120 },
      end: { x: 260, y: 120 },
    });

    dragPointer(getByTestId('window-resize-nw'), {
      pointerId: 15,
      start: { x: 50, y: 60 },
      end: { x: -20, y: -20 },
    });

    const metrics = getFrameMetrics(frame);
    expect(metrics.width).toBe(150);
    expect(metrics.height).toBe(110);
    expect(metrics.x).toBe(50);
    expect(metrics.y).toBe(50);
  });

  it('keeps title drag behavior independent from resize interactions', () => {
    const { getByTestId } = render(
      <CWindow x={20} y={30} width={200} height={120}>
        <CWindowTitle>Independent interaction</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');

    dragPointer(getByTestId('window-title'), {
      pointerId: 16,
      start: { x: 80, y: 45 },
      end: { x: 120, y: 75 },
    });

    const metrics = getFrameMetrics(frame);
    expect(metrics.x).toBe(60);
    expect(metrics.y).toBe(60);
    expect(metrics.width).toBe(200);
    expect(metrics.height).toBe(120);
  });
});
