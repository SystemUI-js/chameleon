import { fireEvent } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MountConsumer, ThemeProvider, useTheme } from '../src';
import { winxp } from '../src/theme/winxp';
import GridMountLayout from '../src/dev/GridMountLayout';
import { Text } from '../src/components/Text';

type RectInput = {
  width: number;
  height: number;
  left: number;
  top: number;
};

const setRect = (el: HTMLElement, rect: RectInput) => {
  const domRect: DOMRect = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    left: rect.left,
    toJSON: () => '',
  } as DOMRect;
  Object.defineProperty(el, 'getBoundingClientRect', {
    value: () => domRect,
  });
};

const attachPointerCaptureMocks = (el: HTMLElement) => {
  Object.defineProperty(el, 'setPointerCapture', {
    value: jest.fn(),
  });
  Object.defineProperty(el, 'releasePointerCapture', {
    value: jest.fn(),
  });
};

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

  it('creates one new window per click with title bar text and placeholder body', () => {
    const { getByRole, getByText, queryByText, container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <GridMountLayout />
      </ThemeProvider>,
    );

    expect(queryByText('Demo Window #1')).toBeNull();
    expect(queryByText('This is demo window 1.')).toBeNull();

    fireEvent.click(getByRole('button', { name: 'New Window' }));

    expect(getByText('Demo Window #1')).toBeInTheDocument();
    expect(getByText('This is demo window 1.')).toBeInTheDocument();
    expect(container.querySelectorAll('.cm-grid-slot--center .cm-window')).toHaveLength(1);
  });

  it('keeps sequentially created windows distinguishable by incremented title', () => {
    const { getByRole, getByText, container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <GridMountLayout />
      </ThemeProvider>,
    );

    const newWindowButton = getByRole('button', { name: 'New Window' });
    fireEvent.click(newWindowButton);
    fireEvent.click(newWindowButton);
    fireEvent.click(newWindowButton);

    expect(getByText('Demo Window #1')).toBeInTheDocument();
    expect(getByText('Demo Window #2')).toBeInTheDocument();
    expect(getByText('Demo Window #3')).toBeInTheDocument();
    expect(container.querySelectorAll('.cm-grid-slot--center .cm-window')).toHaveLength(3);
  });

  it('creates windows with draggable and resizable interactions', () => {
    const requestAnimationFrameSpy = jest
      .spyOn(global, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });
    const cancelAnimationFrameSpy = jest
      .spyOn(global, 'cancelAnimationFrame')
      .mockImplementation(() => 0);

    const { getByRole, container } = render(
      <ThemeProvider defaultTheme={winxp}>
        <GridMountLayout />
      </ThemeProvider>,
    );

    fireEvent.click(getByRole('button', { name: 'New Window' }));

    const windowEl = container.querySelector('.cm-grid-slot--center .cm-window') as HTMLElement;
    const titleBar = windowEl.querySelector('.cm-window__title-bar') as HTMLElement;
    const southEastHandle = windowEl.querySelector('[data-direction="se"]') as HTMLElement;

    expect(southEastHandle).toBeInTheDocument();
    expect(windowEl.querySelectorAll('.cm-window__resize-handle')).toHaveLength(8);

    attachPointerCaptureMocks(titleBar);
    attachPointerCaptureMocks(windowEl);
    attachPointerCaptureMocks(southEastHandle);
    setRect(windowEl, { width: 280, height: 180, left: 24, top: 24 });

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 11,
      clientX: 100,
      clientY: 100,
    });

    fireEvent.pointerMove(windowEl, {
      pointerId: 11,
      clientX: 130,
      clientY: 140,
    });

    fireEvent.pointerUp(windowEl, { pointerId: 11 });

    expect(windowEl.style.left).toBe('54px');
    expect(windowEl.style.top).toBe('64px');

    fireEvent.pointerDown(southEastHandle, {
      button: 0,
      pointerId: 12,
      clientX: 280,
      clientY: 180,
    });

    fireEvent.pointerMove(windowEl, {
      pointerId: 12,
      clientX: 320,
      clientY: 230,
    });

    fireEvent.pointerUp(windowEl, { pointerId: 12 });

    expect(windowEl.style.width).toBe('320px');
    expect(windowEl.style.height).toBe('230px');

    requestAnimationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
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
