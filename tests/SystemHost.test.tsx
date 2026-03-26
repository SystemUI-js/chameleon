import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SystemHost } from '../src/system/SystemHost';
import { assertValidSystemThemeSelection } from '../src/system/registry';

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

describe('SystemHost', () => {
  it('preserves runtime window across windows theme switches', () => {
    const { rerender } = render(<SystemHost systemType="windows" theme="win98" />);

    const initialRoot = screen.getByTestId('screen-root');
    const initialFrame = screen.getByTestId('window-frame');
    const initialContent = screen.getByTestId('window-content');
    const initialTitle = screen.getByTestId('window-title');
    const initialUuid = initialContent.getAttribute('data-window-uuid');

    expect(initialRoot).toHaveClass('cm-system--windows');
    expect(initialRoot).toHaveClass('cm-theme--win98');
    expect(screen.getByTestId('windows-window-body')).toBeInTheDocument();
    expect(initialFrame.style.left).toBe('24px');
    expect(initialFrame.style.top).toBe('24px');
    expect(initialFrame.style.width).toBe('320px');
    expect(initialFrame.style.height).toBe('220px');

    dragPointer(initialTitle, {
      pointerId: 31,
      start: { x: 48, y: 40 },
      end: { x: 72, y: 65 },
    });

    dragPointer(screen.getByTestId('window-resize-e'), {
      pointerId: 32,
      start: { x: 344, y: 120 },
      end: { x: 366, y: 120 },
    });

    expect(initialFrame.style.left).toBe('48px');
    expect(initialFrame.style.top).toBe('49px');
    expect(initialFrame.style.width).toBe('342px');
    expect(initialFrame.style.height).toBe('220px');

    rerender(<SystemHost systemType="windows" theme="winxp" />);

    const updatedRoot = screen.getByTestId('screen-root');
    const updatedFrame = screen.getByTestId('window-frame');
    const updatedContent = screen.getByTestId('window-content');

    expect(updatedRoot).toHaveClass('cm-system--windows');
    expect(updatedRoot).toHaveClass('cm-theme--winxp');
    expect(updatedRoot).toHaveAttribute('data-theme', 'winxp');
    expect(updatedContent.getAttribute('data-window-uuid')).toBe(initialUuid);
    expect(updatedFrame.style.left).toBe('48px');
    expect(updatedFrame.style.top).toBe('49px');
    expect(updatedFrame.style.width).toBe('342px');
    expect(updatedFrame.style.height).toBe('220px');
    expect(screen.getByTestId('windows-window-body')).toBeInTheDocument();
    expect(screen.getByTestId('window-title')).toHaveTextContent('Windows Window');
    expect(screen.getByTestId('windows-start-bar')).toBeInTheDocument();
    expect(screen.getByTestId('windows-start-bar-button')).toBeInTheDocument();
  });

  it('reboots runtime session across system switches', () => {
    const { rerender } = render(<SystemHost systemType="windows" theme="winxp" />);

    const windowsFrame = screen.getByTestId('window-frame');
    const windowsTitle = screen.getByTestId('window-title');
    const windowsContent = screen.getByTestId('window-content');
    const windowsUuid = windowsContent.getAttribute('data-window-uuid');

    dragPointer(windowsTitle, {
      pointerId: 41,
      start: { x: 60, y: 44 },
      end: { x: 84, y: 70 },
    });

    expect(windowsFrame.style.left).toBe('48px');
    expect(windowsFrame.style.top).toBe('50px');
    expect(screen.getByTestId('windows-window-body')).toBeInTheDocument();

    rerender(<SystemHost systemType="default" theme="default" />);

    const defaultRoot = screen.getByTestId('screen-root');
    const defaultFrame = screen.getByTestId('window-frame');
    const defaultContent = screen.getByTestId('window-content');

    expect(defaultRoot).toHaveClass('cm-system--default');
    expect(defaultRoot).toHaveClass('cm-theme--default');
    expect(defaultRoot).toHaveAttribute('data-theme', 'default');
    expect(defaultContent.getAttribute('data-window-uuid')).not.toBe(windowsUuid);
    expect(defaultFrame.style.left).toBe('32px');
    expect(defaultFrame.style.top).toBe('28px');
    expect(defaultFrame.style.width).toBe('332px');
    expect(defaultFrame.style.height).toBe('228px');
    expect(screen.getByTestId('default-window-body')).toBeInTheDocument();
    expect(screen.queryByTestId('windows-window-body')).not.toBeInTheDocument();
    expect(screen.queryByTestId('windows-start-bar')).not.toBeInTheDocument();
  });
});

describe('assertValidSystemThemeSelection boundary assertions', () => {
  it('throws for windows system with default theme', () => {
    expect(() =>
      assertValidSystemThemeSelection({ systemType: 'windows', theme: 'default' }),
    ).toThrow('Invalid theme "default" for system type "windows"');
  });

  it('throws for default system with win98 theme', () => {
    expect(() =>
      assertValidSystemThemeSelection({ systemType: 'default', theme: 'win98' }),
    ).toThrow('Invalid theme "win98" for system type "default"');
  });

  it('throws for default system with winxp theme', () => {
    expect(() =>
      assertValidSystemThemeSelection({ systemType: 'default', theme: 'winxp' }),
    ).toThrow('Invalid theme "winxp" for system type "default"');
  });

  it('accepts valid windows+win98 combination', () => {
    expect(() =>
      assertValidSystemThemeSelection({ systemType: 'windows', theme: 'win98' }),
    ).not.toThrow();
  });

  it('accepts valid default+default combination', () => {
    expect(() =>
      assertValidSystemThemeSelection({ systemType: 'default', theme: 'default' }),
    ).not.toThrow();
  });
});
