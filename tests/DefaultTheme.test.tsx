import { fireEvent } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DefaultTheme } from '../src/theme/default';

describe('Default theme window composition', () => {
  it('keeps base classes, adds default classes, and supports dragging', async () => {
    const { getByTestId } = render(<DefaultTheme />);

    const frame = getByTestId('window-frame');
    const content = getByTestId('window-content');
    const title = getByTestId('window-title');

    expect(frame).toHaveClass('cm-window-frame');
    expect(frame).toHaveClass('cm-default-window-frame');
    expect(content).toHaveClass('cm-window');
    expect(content).toHaveClass('cm-default-window');
    expect(title).toHaveClass('cm-window__title-bar');
    expect(title).toHaveClass('cm-window__title-bar--default');
    expect(title).toHaveClass('cm-default-window-title');
    expect(title).toHaveTextContent('Default Window');
    expect(frame.style.left).toBe('32px');
    expect(frame.style.top).toBe('28px');

    fireEvent.pointerDown(title, {
      pointerId: 7,
      button: 0,
      clientX: 44,
      clientY: 38,
    });
    fireEvent.pointerMove(document, {
      pointerId: 7,
      clientX: 68,
      clientY: 61,
    });
    fireEvent.pointerUp(document, {
      pointerId: 7,
      clientX: 68,
      clientY: 61,
    });

    await waitFor(() => {
      expect(frame.style.left).toBe('56px');
      expect(frame.style.top).toBe('51px');
    });
  });
});
