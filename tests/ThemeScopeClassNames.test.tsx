import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SystemHost } from '../src/system/SystemHost';

describe('Theme scope class names', () => {
  it('applies the active theme class to screen root', () => {
    const { rerender } = render(<SystemHost systemType="windows" theme="win98" />);

    expect(screen.getByTestId('screen-root').className).toBe('cm-system--windows cm-theme--win98');

    rerender(<SystemHost systemType="default" theme="default" />);

    expect(screen.getByTestId('screen-root').className).toBe(
      'cm-system--default cm-theme--default',
    );
  });

  it('does not remount runtime windows on same system theme change', () => {
    const { rerender } = render(<SystemHost systemType="windows" theme="win98" />);

    const rootBefore = screen.getByTestId('screen-root');
    const frameBefore = screen.getByTestId('window-frame');
    const contentBefore = screen.getByTestId('window-content');
    const titleBefore = screen.getByTestId('window-title');
    const uuidBefore = contentBefore.getAttribute('data-window-uuid');

    rerender(<SystemHost systemType="windows" theme="winxp" />);

    const rootAfter = screen.getByTestId('screen-root');
    const frameAfter = screen.getByTestId('window-frame');
    const contentAfter = screen.getByTestId('window-content');
    const titleAfter = screen.getByTestId('window-title');

    expect(rootAfter).toBe(rootBefore);
    expect(rootAfter.className).toBe('cm-system--windows cm-theme--winxp');
    expect(frameAfter).toBe(frameBefore);
    expect(contentAfter).toBe(contentBefore);
    expect(titleAfter).toBe(titleBefore);
    expect(contentAfter.getAttribute('data-window-uuid')).toBe(uuidBefore);
    expect(screen.getByTestId('windows-window-body')).toBeInTheDocument();
    expect(titleAfter).toHaveTextContent('Windows Window');
    expect(screen.getByTestId('windows-start-bar')).toBeInTheDocument();
    expect(screen.getByTestId('windows-start-bar-button')).toBeInTheDocument();
  });
});
