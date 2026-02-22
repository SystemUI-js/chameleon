import { fireEvent } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MountConsumer, ThemeProvider, useTheme } from '../src';
import { winxp } from '../src/theme/winxp';
import GridMountLayout from '../src/dev/GridMountLayout';
import { Text } from '../src/components/Text';

const EXPECTED_SLOTS = [
  'layout-top-left',
  'layout-top',
  'layout-top-right',
  'layout-left',
  'layout-center',
  'layout-right',
  'layout-bottom-left',
  'layout-bottom',
  'layout-bottom-right',
] as const;

const ThemeSwitchHarness: React.FC = () => {
  const { setTheme } = useTheme();
  return (
    <>
      <button type="button" onClick={() => setTheme('win98')}>
        Switch Theme
      </button>
      <GridMountLayout />
    </>
  );
};

const LeftSidebarHarness: React.FC = () => {
  return (
    <>
      <GridMountLayout />
      <MountConsumer name="layout-left">
        <Text>Left Dock Content</Text>
      </MountConsumer>
    </>
  );
};

describe('GridMountLayout', () => {
  it('renders all nine mount slots and keeps center empty by default', () => {
    const { container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <GridMountLayout />
      </ThemeProvider>,
    );

    for (const slotName of EXPECTED_SLOTS) {
      expect(container.querySelector(`[data-slot="${slotName}"]`)).toBeInTheDocument();
    }

    expect(container.querySelectorAll('.cm-grid-slot')).toHaveLength(9);
    expect(container.querySelector('.cm-grid-slot--center .cm-window')).toBeNull();
  });

  it('updates docking region feedback when theme changes', () => {
    const { container, getByRole } = render(
      <ThemeProvider defaultTheme={winxp}>
        <ThemeSwitchHarness />
      </ThemeProvider>,
    );

    const topSlot = container.querySelector('[data-slot="layout-top"]');
    expect(topSlot).toHaveAttribute('data-dock-enabled', 'true');

    fireEvent.click(getByRole('button', { name: 'Switch Theme' }));

    expect(topSlot).toHaveAttribute('data-dock-enabled', 'false');
  });

  it('collapses empty sidebar tracks to zero and expands when sidebar content exists', async () => {
    const { container, rerender } = render(
      <ThemeProvider defaultTheme={winxp}>
        <GridMountLayout />
      </ThemeProvider>,
    );

    const grid = container.querySelector('.cm-layer__grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--cm-grid-left-size')).toBe('0px');
    expect(grid.style.getPropertyValue('--cm-grid-right-size')).toBe('0px');
    expect(grid.style.getPropertyValue('--cm-grid-bottom-size')).toBe('0px');

    rerender(
      <ThemeProvider defaultTheme={winxp}>
        <LeftSidebarHarness />
      </ThemeProvider>,
    );

    await waitFor(() => {
      const updatedGrid = container.querySelector('.cm-layer__grid') as HTMLElement;
      expect(updatedGrid.style.getPropertyValue('--cm-grid-left-size')).toBe(
        'var(--cm-grid-edge-size)',
      );
    });
  });
});
