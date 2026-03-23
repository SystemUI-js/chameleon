import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SystemHost, type SystemHostProps } from '../src/system/SystemHost';

const PERSISTENT_NOTE = 'persistent-note-123';

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

interface PersistentSystemHarnessProps {
  readonly note: string;
  readonly selection: SystemHostProps;
}

const PersistentSystemHarness = ({
  note,
  selection,
}: PersistentSystemHarnessProps): JSX.Element => {
  return (
    <>
      <div data-testid="persistent-note">{note}</div>
      <SystemHost systemType={selection.systemType} theme={selection.theme} />
    </>
  );
};

describe('System type switch', () => {
  it('reboots runtime state across systems', () => {
    const { rerender } = render(
      <PersistentSystemHarness
        note={PERSISTENT_NOTE}
        selection={{ systemType: 'windows', theme: 'winxp' }}
      />,
    );

    const persistentNote = screen.getByTestId('persistent-note');
    const windowsRoot = screen.getByTestId('screen-root');
    const windowsFrame = screen.getByTestId('window-frame');
    const windowsContent = screen.getByTestId('window-content');
    const windowsTitle = screen.getByTestId('window-title');
    const windowsUuid = windowsContent.getAttribute('data-window-uuid');

    expect(persistentNote).toHaveTextContent(PERSISTENT_NOTE);
    expect(windowsRoot).toHaveClass('cm-system--windows');
    expect(windowsRoot).toHaveClass('cm-theme--winxp');
    expect(windowsTitle).toHaveTextContent('Windows Window');
    expect(within(document.body).getByText(PERSISTENT_NOTE)).toBe(persistentNote);
    expect(windowsFrame.style.left).toBe('24px');
    expect(windowsFrame.style.top).toBe('24px');
    expect(windowsFrame.style.width).toBe('320px');
    expect(windowsFrame.style.height).toBe('220px');

    dragPointer(windowsTitle, {
      pointerId: 41,
      start: { x: 60, y: 44 },
      end: { x: 84, y: 70 },
    });

    expect(windowsFrame.style.left).toBe('48px');
    expect(windowsFrame.style.top).toBe('50px');

    rerender(
      <PersistentSystemHarness
        note={PERSISTENT_NOTE}
        selection={{ systemType: 'default', theme: 'default' }}
      />,
    );

    const persistentNoteAfter = screen.getByTestId('persistent-note');
    const defaultRoot = screen.getByTestId('screen-root');
    const defaultFrame = screen.getByTestId('window-frame');
    const defaultContent = screen.getByTestId('window-content');
    const defaultTitle = screen.getByTestId('window-title');

    expect(persistentNoteAfter).toBe(persistentNote);
    expect(persistentNoteAfter).toHaveTextContent(PERSISTENT_NOTE);
    expect(defaultRoot).toHaveClass('cm-system--default');
    expect(defaultRoot).toHaveClass('cm-theme--default');
    expect(defaultRoot).toHaveAttribute('data-theme', 'default');
    expect(defaultFrame).not.toBe(windowsFrame);
    expect(defaultContent).not.toBe(windowsContent);
    expect(defaultContent.getAttribute('data-window-uuid')).not.toBe(windowsUuid);
    expect(defaultTitle).toHaveTextContent('Default Window');
    expect(within(document.body).getByText(PERSISTENT_NOTE)).toBe(persistentNoteAfter);
    expect(defaultFrame.style.left).toBe('32px');
    expect(defaultFrame.style.top).toBe('28px');
    expect(defaultFrame.style.width).toBe('332px');
    expect(defaultFrame.style.height).toBe('228px');
  });
});
