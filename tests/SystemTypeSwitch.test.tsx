import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SystemHost, type SystemHostProps } from '../src/system/SystemHost';
import { resolveDevSelectionForSystemType, DEV_SYSTEM_TYPE } from '../src/dev/themeSwitcher';
import { assertValidSystemThemeSelection, SYSTEM_TYPE, THEME } from '../src/system/registry';

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

    const systemSwitch = screen.getByTestId('system-switch');
    const switchLabel = screen.getByText('切换系统');

    expect(systemSwitch).toBeInTheDocument();
    expect(switchLabel).toBeInTheDocument();
    expect(systemSwitch).toHaveAttribute('name', 'system-switch');

    const options = within(systemSwitch).getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Windows');
    expect(options[1]).toHaveTextContent('Default');

    const initialLeft = defaultFrame.style.left;
    const initialTop = defaultFrame.style.top;

    fireEvent.pointerDown(systemSwitch, {
      pointerId: 42,
      button: 0,
      clientX: 100,
      clientY: 50,
    });

    expect(defaultFrame.style.left).toBe(initialLeft);
    expect(defaultFrame.style.top).toBe(initialTop);
  });
});

describe('resolveDevSelectionForSystemType', () => {
  it('returns windows with win98 theme', () => {
    const result = resolveDevSelectionForSystemType(DEV_SYSTEM_TYPE.windows);
    expect(result).toEqual({
      systemType: 'windows',
      theme: 'win98',
    });
  });

  it('returns default system with default theme', () => {
    const result = resolveDevSelectionForSystemType(DEV_SYSTEM_TYPE.default);
    expect(result).toEqual({
      systemType: 'default',
      theme: 'default',
    });
  });
});

describe('System switch with theme reset and remount', () => {
  it('default→windows→default cycle: windows gets win98, StartBar appears, UUID changes, back to default', () => {
    const { rerender } = render(
      <PersistentSystemHarness
        note={PERSISTENT_NOTE}
        selection={{ systemType: 'default', theme: 'default' }}
      />,
    );

    // --- Phase 1: default window ---
    const defaultRoot = screen.getByTestId('screen-root');
    const defaultContent = screen.getByTestId('window-content');
    const defaultUuid = defaultContent.getAttribute('data-window-uuid');

    expect(defaultRoot).toHaveClass('cm-system--default');
    expect(defaultRoot).toHaveClass('cm-theme--default');
    expect(defaultRoot).toHaveAttribute('data-system-type', 'default');
    expect(defaultRoot).toHaveAttribute('data-theme', 'default');
    expect(screen.queryByTestId('windows-start-bar')).not.toBeInTheDocument();
    expect(screen.getByTestId('window-title')).toHaveTextContent('Default Window');

    // --- Phase 2: switch to windows ---
    rerender(
      <PersistentSystemHarness
        note={PERSISTENT_NOTE}
        selection={{ systemType: 'windows', theme: 'win98' }}
      />,
    );

    const windowsRoot = screen.getByTestId('screen-root');
    const windowsContent = screen.getByTestId('window-content');
    const windowsUuid = windowsContent.getAttribute('data-window-uuid');

    // Verify attributes after windows switch
    expect(windowsRoot).toHaveClass('cm-system--windows');
    expect(windowsRoot).toHaveClass('cm-theme--win98');
    expect(windowsRoot).toHaveAttribute('data-system-type', 'windows');
    expect(windowsRoot).toHaveAttribute('data-theme', 'win98');
    expect(windowsContent.getAttribute('data-window-uuid')).not.toBe(defaultUuid);

    // Verify StartBar appears
    expect(screen.getByTestId('windows-start-bar')).toBeInTheDocument();
    expect(screen.getByTestId('windows-start-bar-button')).toBeInTheDocument();
    expect(screen.getByTestId('window-title')).toHaveTextContent('Windows Window');

    // --- Phase 3: switch back to default ---
    rerender(
      <PersistentSystemHarness
        note={PERSISTENT_NOTE}
        selection={{ systemType: 'default', theme: 'default' }}
      />,
    );

    const backToDefaultRoot = screen.getByTestId('screen-root');
    const backToDefaultContent = screen.getByTestId('window-content');

    // Theme returns to default
    expect(backToDefaultRoot).toHaveClass('cm-system--default');
    expect(backToDefaultRoot).toHaveClass('cm-theme--default');
    expect(backToDefaultRoot).toHaveAttribute('data-system-type', 'default');
    expect(backToDefaultRoot).toHaveAttribute('data-theme', 'default');

    // Window UUID changed (proves remount)
    expect(backToDefaultContent.getAttribute('data-window-uuid')).not.toBe(windowsUuid);

    // StartBar gone
    expect(screen.queryByTestId('windows-start-bar')).not.toBeInTheDocument();
    expect(screen.getByTestId('window-title')).toHaveTextContent('Default Window');
  });

  it('windows→default: UUID proves remount (different from windows UUID)', () => {
    const { rerender } = render(
      <PersistentSystemHarness
        note={PERSISTENT_NOTE}
        selection={{ systemType: 'windows', theme: 'win98' }}
      />,
    );

    const windowsContent = screen.getByTestId('window-content');
    const windowsUuid = windowsContent.getAttribute('data-window-uuid');

    rerender(
      <PersistentSystemHarness
        note={PERSISTENT_NOTE}
        selection={{ systemType: 'default', theme: 'default' }}
      />,
    );

    const defaultContent = screen.getByTestId('window-content');
    expect(defaultContent.getAttribute('data-window-uuid')).not.toBe(windowsUuid);
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

  it('accepts valid windows+winxp combination', () => {
    expect(() =>
      assertValidSystemThemeSelection({ systemType: 'windows', theme: 'winxp' }),
    ).not.toThrow();
  });

  it('accepts valid default+default combination', () => {
    expect(() =>
      assertValidSystemThemeSelection({ systemType: 'default', theme: 'default' }),
    ).not.toThrow();
  });

  it('SYSTEM_THEME_MATRIX confirms windows accepts win98 and winxp only', () => {
    const windowsThemes = [THEME.win98, THEME.winxp];
    const defaultThemes = [THEME.default];

    windowsThemes.forEach((theme) => {
      expect(() =>
        assertValidSystemThemeSelection({ systemType: SYSTEM_TYPE.windows, theme }),
      ).not.toThrow();
    });

    defaultThemes.forEach((theme) => {
      expect(() =>
        assertValidSystemThemeSelection({ systemType: SYSTEM_TYPE.default, theme }),
      ).not.toThrow();
    });

    // Cross-check: win98 on default should throw
    expect(() =>
      assertValidSystemThemeSelection({ systemType: SYSTEM_TYPE.default, theme: THEME.win98 }),
    ).toThrow();
  });
});
