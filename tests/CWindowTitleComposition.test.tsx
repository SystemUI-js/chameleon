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

    fireEvent.pointerDown(title, {
      pointerId: 1,
      button: 0,
      clientX: 50,
      clientY: 50,
    });
    fireEvent.pointerMove(document, {
      pointerId: 1,
      clientX: 70,
      clientY: 90,
    });
    fireEvent.pointerUp(document, {
      pointerId: 1,
      clientX: 70,
      clientY: 90,
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

    fireEvent.pointerDown(body, {
      pointerId: 2,
      button: 0,
      clientX: 40,
      clientY: 40,
    });
    fireEvent.pointerMove(document, {
      pointerId: 2,
      clientX: 80,
      clientY: 80,
    });
    fireEvent.pointerUp(document, {
      pointerId: 2,
      clientX: 80,
      clientY: 80,
    });

    expect(frame.style.left).toBe('15px');
    expect(frame.style.top).toBe('25px');
  });
});
