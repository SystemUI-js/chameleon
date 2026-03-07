import { fireEvent } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Win98Theme } from '../src/theme/win98';

describe('Win98 title composition', () => {
  it('renders visible win98 title area and supports dragging', async () => {
    const { getByTestId } = render(<Win98Theme />);

    const title = getByTestId('window-title');
    const frame = getByTestId('window-frame');

    expect(title).toHaveTextContent('Win98 Window');
    expect(title).toHaveClass('cm-window__title-bar--win98');
    expect(frame.style.left).toBe('24px');
    expect(frame.style.top).toBe('24px');

    fireEvent.pointerDown(title, {
      pointerId: 3,
      button: 0,
      clientX: 30,
      clientY: 30,
    });
    fireEvent.pointerMove(document, {
      pointerId: 3,
      clientX: 45,
      clientY: 55,
    });
    fireEvent.pointerUp(document, {
      pointerId: 3,
      clientX: 45,
      clientY: 55,
    });

    await waitFor(() => {
      expect(frame.style.left).toBe('39px');
      expect(frame.style.top).toBe('49px');
    });
  });
});
