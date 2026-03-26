import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SystemHost } from '../src/system/SystemHost';

const FOCUSED_CONTENT_LABEL = 'Focused content';
const FOCUSED_CONTENT_VALUE = 'persistent-note-123';

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

describe('Theme switch preservation', () => {
  it('preserves runtime state within a system', () => {
    const { rerender } = render(<SystemHost systemType="windows" theme="win98" />);

    const rootBefore = screen.getByTestId('screen-root');
    const frameBefore = screen.getByTestId('window-frame');
    const contentBefore = screen.getByTestId('window-content');
    const titleBefore = screen.getByTestId('window-title');
    const uuidBefore = contentBefore.getAttribute('data-window-uuid');
    const inputBefore = document.createElement('input');

    inputBefore.setAttribute('aria-label', FOCUSED_CONTENT_LABEL);
    contentBefore.appendChild(inputBefore);

    expect(rootBefore).toHaveClass('cm-system--windows');
    expect(rootBefore).toHaveClass('cm-theme--win98');
    expect(titleBefore).toHaveTextContent('Windows Window');
    expect(frameBefore.style.left).toBe('24px');
    expect(frameBefore.style.top).toBe('24px');

    dragPointer(titleBefore, {
      pointerId: 31,
      start: { x: 48, y: 40 },
      end: { x: 72, y: 65 },
    });

    fireEvent.change(inputBefore, { target: { value: FOCUSED_CONTENT_VALUE } });
    inputBefore.focus();

    expect(frameBefore.style.left).toBe('48px');
    expect(frameBefore.style.top).toBe('49px');
    expect(inputBefore.value).toBe(FOCUSED_CONTENT_VALUE);
    expect(document.activeElement).toBe(inputBefore);

    rerender(<SystemHost systemType="windows" theme="winxp" />);

    const rootAfter = screen.getByTestId('screen-root');
    const frameAfter = screen.getByTestId('window-frame');
    const contentAfter = screen.getByTestId('window-content');
    const titleAfter = screen.getByTestId('window-title');
    const inputAfter = within(contentAfter).getByRole('textbox', {
      name: FOCUSED_CONTENT_LABEL,
    }) as HTMLInputElement;

    expect(rootAfter).toBe(rootBefore);
    expect(frameAfter).toBe(frameBefore);
    expect(contentAfter).toBe(contentBefore);
    expect(titleAfter).toBe(titleBefore);
    expect(rootAfter).toHaveClass('cm-system--windows');
    expect(rootAfter).toHaveClass('cm-theme--winxp');
    expect(rootAfter).toHaveAttribute('data-theme', 'winxp');
    expect(contentAfter.getAttribute('data-window-uuid')).toBe(uuidBefore);
    expect(titleAfter).toHaveTextContent('Windows Window');
    expect(frameAfter.style.left).toBe('48px');
    expect(frameAfter.style.top).toBe('49px');
    expect(inputAfter).toBe(inputBefore);
    expect(inputAfter.value).toBe(FOCUSED_CONTENT_VALUE);
    expect(document.activeElement).toBe(inputAfter);
  });
});
