import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StartButton, Taskbar, ThemeProvider } from '../src';
import type { StartMenuHeightLevel, Theme } from '../src';
import { win98 } from '../src/theme/win98';
import { winxp } from '../src/theme/winxp';

const renderTaskbar = (
  theme: Theme,
  options?: {
    defaultStartMenuOpen?: boolean;
    defaultStartMenuLevel?: StartMenuHeightLevel;
    startMenuLevel?: StartMenuHeightLevel;
  },
) =>
  render(
    <ThemeProvider defaultTheme={theme}>
      <Taskbar
        startButton={<StartButton>Start</StartButton>}
        startMenu={<div data-testid="menu-content">Menu content</div>}
        defaultStartMenuOpen={options?.defaultStartMenuOpen}
        defaultStartMenuLevel={options?.defaultStartMenuLevel}
        startMenuLevel={options?.startMenuLevel}
      />
    </ThemeProvider>,
  );

describe('Taskbar discrete start menu height', () => {
  it('opens menu with legal default level and normalizes illegal controlled level', () => {
    const { container, rerender } = renderTaskbar(winxp, {
      defaultStartMenuOpen: true,
      defaultStartMenuLevel: '2x',
    });

    expect(container.querySelector('.cm-taskbar__start-menu')).toHaveAttribute('data-level', '2x');

    rerender(
      <ThemeProvider defaultTheme={winxp}>
        <Taskbar
          startButton={<StartButton>Start</StartButton>}
          startMenu={<div>Menu content</div>}
          defaultStartMenuOpen
          startMenuLevel={'invalid-level' as unknown as StartMenuHeightLevel}
        />
      </ThemeProvider>,
    );

    expect(container.querySelector('.cm-taskbar__start-menu')).toHaveAttribute('data-level', '1x');
  });

  it('snaps by threshold and finalizes to legal level on drag end', () => {
    const { container } = renderTaskbar(winxp, {
      defaultStartMenuOpen: true,
      defaultStartMenuLevel: '1x',
    });

    const panel = container.querySelector('.cm-taskbar__start-menu') as HTMLElement;
    const handle = container.querySelector('.cm-taskbar__start-menu-resize-handle') as HTMLElement;

    fireEvent.pointerDown(handle, {
      pointerId: 1,
      clientY: 100,
    });

    fireEvent.pointerMove(window, {
      pointerId: 1,
      clientY: 80,
    });

    expect(panel).toHaveAttribute('data-level', '1x');

    fireEvent.pointerMove(window, {
      pointerId: 1,
      clientY: 40,
    });

    expect(panel).toHaveAttribute('data-level', '2x');

    fireEvent.pointerUp(window, {
      pointerId: 1,
      clientY: 40,
    });

    expect(panel).toHaveAttribute('data-level', '2x');
  });

  it('ignores non-bottom-edge interaction for level changes', () => {
    const { container } = renderTaskbar(win98, {
      defaultStartMenuOpen: true,
      defaultStartMenuLevel: '1x',
    });

    const panel = container.querySelector('.cm-taskbar__start-menu') as HTMLElement;
    const content = container.querySelector('[data-testid="menu-content"]') as HTMLElement;

    fireEvent.pointerDown(content, {
      pointerId: 2,
      clientY: 100,
    });
    fireEvent.pointerMove(window, {
      pointerId: 2,
      clientY: 200,
    });
    fireEvent.pointerUp(window, {
      pointerId: 2,
      clientY: 200,
    });

    expect(panel).toHaveAttribute('data-level', '1x');
  });

  it('keeps equivalent discrete semantics across win98 and winxp', () => {
    const runSameDrag = (theme: Theme) => {
      const { container, unmount } = renderTaskbar(theme, {
        defaultStartMenuOpen: true,
        defaultStartMenuLevel: '1x',
      });

      const panel = container.querySelector('.cm-taskbar__start-menu') as HTMLElement;
      const handle = container.querySelector(
        '.cm-taskbar__start-menu-resize-handle',
      ) as HTMLElement;

      fireEvent.pointerDown(handle, { pointerId: 7, clientY: 100 });
      fireEvent.pointerMove(window, { pointerId: 7, clientY: 30 });
      fireEvent.pointerUp(window, { pointerId: 7, clientY: 30 });

      const level = panel.getAttribute('data-level');
      unmount();
      return level;
    };

    expect(runSameDrag(win98)).toBe('2x');
    expect(runSameDrag(winxp)).toBe('2x');
  });

  it('uses downward drag to increase level when menu mounts below taskbar', () => {
    const topMountedTheme: Theme = {
      ...winxp,
      behavior: {
        ...winxp.behavior,
        startMenuMount: 'top',
      },
    };

    const { container } = renderTaskbar(topMountedTheme, {
      defaultStartMenuOpen: true,
      defaultStartMenuLevel: '1x',
    });

    const panel = container.querySelector('.cm-taskbar__start-menu') as HTMLElement;
    const handle = container.querySelector('.cm-taskbar__start-menu-resize-handle') as HTMLElement;

    fireEvent.pointerDown(handle, { pointerId: 11, clientY: 100 });
    fireEvent.pointerMove(window, { pointerId: 11, clientY: 140 });
    fireEvent.pointerUp(window, { pointerId: 11, clientY: 140 });

    expect(panel).toHaveAttribute('data-level', '2x');
  });
});
