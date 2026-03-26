import { fireEvent } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SystemHost } from '../src/system/SystemHost';

describe('Win98 title composition', () => {
  it('renders visible title content and supports dragging through SystemHost', async () => {
    const { getByTestId } = render(<SystemHost systemType="windows" theme="win98" />);

    const root = getByTestId('screen-root');
    const title = getByTestId('window-title');
    const frame = getByTestId('window-frame');
    const content = getByTestId('window-content');

    expect(root).toHaveClass('cm-system--windows');
    expect(root).toHaveClass('cm-theme--win98');
    expect(title).toHaveClass('cm-window__title-bar');
    expect(title).toHaveTextContent('Windows Window');
    expect(content).toContainElement(title);
    expect(content).toHaveTextContent('Windows content');
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
