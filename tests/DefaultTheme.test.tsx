import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SystemHost } from '../src/system/SystemHost';

describe('Default theme window composition', () => {
  it('keeps shared window classes and supports dragging through SystemHost', async () => {
    const { getByTestId } = render(<SystemHost systemType="default" theme="default" />);

    const root = getByTestId('screen-root');
    const frame = getByTestId('window-frame');
    const content = getByTestId('window-content');
    const title = getByTestId('window-title');

    expect(root).toHaveClass('cm-system--default');
    expect(root).toHaveClass('cm-theme--default');
    expect(frame).toHaveClass('cm-window-frame');
    expect(content).toHaveClass('cm-window');
    expect(title).toHaveClass('cm-window__title-bar--with-controls');
    expect(content).toContainElement(title);
    expect(content).toHaveTextContent('Default content');
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
