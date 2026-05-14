import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CDock as PackageEntryCDock, Theme } from '../src';
import { CDock, type CDockProps } from '../src/components/Dock/Dock';

describe('CDock', () => {
  it('exports CDock from package entry', () => {
    render(<PackageEntryCDock data-testid="dock-package-entry" defaultHeight={24} />);

    const dock = screen.getByTestId('dock-package-entry');

    expect(PackageEntryCDock).toBe(CDock);
    expect(dock).toBeInTheDocument();
    expect(dock).toHaveClass('cm-dock');
  });

  it('requires height or defaultHeight in props typing', () => {
    const validWithHeight: CDockProps = { height: 24 };
    const validWithDefaultHeight: CDockProps = { defaultHeight: 24 };
    const validWithBoth: CDockProps = { height: 24, defaultHeight: 12 };
    // @ts-expect-error CDock requires height or defaultHeight
    const invalidWithoutThickness: CDockProps = {};

    expect([validWithHeight, validWithDefaultHeight, validWithBoth]).toHaveLength(3);
    expect(invalidWithoutThickness).toEqual({});
  });

  it('renders with supported dock props', () => {
    const onPositionChange = jest.fn();
    const onHeightChange = jest.fn();
    const props: CDockProps = {
      position: 'bottom',
      defaultPosition: 'left',
      height: 48,
      defaultHeight: 32,
      gapStart: 12,
      gapEnd: 24,
      className: 'dock-shell',
      style: {
        backgroundColor: 'rgb(0, 0, 0)',
      },
      onPositionChange,
      onHeightChange,
      'data-testid': 'dock-under-test',
      children: <span>dock-content</span>,
    };

    render(<CDock {...props} />);

    const dock = screen.getByTestId('dock-under-test');

    expect(dock).toBeInTheDocument();
    expect(dock).toHaveClass('cm-dock');
    expect(dock).toHaveClass('cm-dock--bottom');
    expect(dock).toHaveClass('dock-shell');
    expect(dock).toHaveStyle({
      backgroundColor: 'rgb(0, 0, 0)',
      height: '48px',
      position: 'absolute',
    });
    expect(dock).toHaveTextContent('dock-content');
  });

  it('renders children inside dock frame', () => {
    render(
      <CDock defaultHeight={32}>
        <span>dock-body</span>
      </CDock>,
    );

    const dock = screen.getByTestId('dock-frame');

    expect(dock).toBeInTheDocument();
    expect(dock.tagName).toBe('DIV');
    expect(dock).toContainElement(screen.getByText('dock-body'));
  });

  it('applies dock base and modifier classes', () => {
    render(
      <CDock data-testid="dock-custom" position="left" defaultHeight={24} className="dock-shell" />,
    );

    const dock = screen.getByTestId('dock-custom');

    expect(dock).toHaveClass('cm-dock');
    expect(dock).toHaveClass('cm-dock--left');
    expect(dock).toHaveClass('dock-shell');
    expect(dock).not.toHaveClass('cm-dock--top');
  });

  it('inherits theme class from provider', () => {
    render(
      <Theme name="cm-theme--win98">
        <CDock data-testid="dock-themed" defaultHeight={24} />
      </Theme>,
    );

    expect(screen.getByTestId('dock-themed')).toHaveClass('cm-theme--win98');
  });

  it('prefers explicit theme over provider theme', () => {
    render(
      <Theme name="cm-theme--win98">
        <CDock data-testid="dock-themed-override" defaultHeight={24} theme="cm-theme--winxp" />
      </Theme>,
    );

    const dock = screen.getByTestId('dock-themed-override');
    expect(dock).toHaveClass('cm-theme--winxp');
    expect(dock).not.toHaveClass('cm-theme--win98');
  });

  it('maps top and bottom docking styles', () => {
    const { unmount } = render(
      <CDock data-testid="dock-top" position="top" height={48} gapStart={12} gapEnd={24} />,
    );

    const topDock = screen.getByTestId('dock-top');

    expect(topDock).toHaveStyle({
      position: 'absolute',
      top: '0px',
      left: '12px',
      right: '24px',
      height: '48px',
    });
    expect(topDock.style.bottom).toBe('');
    expect(topDock.style.width).toBe('');

    unmount();

    render(
      <CDock data-testid="dock-bottom" position="bottom" height={48} gapStart={12} gapEnd={24} />,
    );

    const bottomDock = screen.getByTestId('dock-bottom');

    expect(bottomDock).toHaveStyle({
      position: 'absolute',
      bottom: '0px',
      left: '12px',
      right: '24px',
      height: '48px',
    });
    expect(bottomDock.style.top).toBe('');
    expect(bottomDock.style.width).toBe('');
  });

  it('maps left and right docking styles', () => {
    const { unmount } = render(
      <CDock data-testid="dock-left" position="left" height={36} gapStart={10} gapEnd={18} />,
    );

    const leftDock = screen.getByTestId('dock-left');

    expect(leftDock).toHaveStyle({
      position: 'absolute',
      left: '0px',
      top: '10px',
      bottom: '18px',
      width: '36px',
    });
    expect(leftDock.style.right).toBe('');
    expect(leftDock.style.height).toBe('');

    unmount();

    render(
      <CDock data-testid="dock-right" position="right" height={36} gapStart={10} gapEnd={18} />,
    );

    const rightDock = screen.getByTestId('dock-right');

    expect(rightDock).toHaveStyle({
      position: 'absolute',
      right: '0px',
      top: '10px',
      bottom: '18px',
      width: '36px',
    });
    expect(rightDock.style.left).toBe('');
    expect(rightDock.style.height).toBe('');
  });

  it('uses default values on initial render', () => {
    render(
      <CDock
        data-testid="dock-defaults"
        defaultPosition="top"
        defaultHeight={40}
        gapStart={8}
        gapEnd={16}
      />,
    );

    const dock = screen.getByTestId('dock-defaults');

    expect(dock).toHaveClass('cm-dock--top');
    expect(dock).toHaveStyle({
      position: 'absolute',
      top: '0px',
      left: '8px',
      right: '16px',
      height: '40px',
    });
    expect(dock.style.bottom).toBe('');
    expect(dock.style.width).toBe('');
  });

  it('syncs controlled position and height updates', async () => {
    const { rerender } = render(
      <CDock data-testid="dock-sync" position="top" height={32} gapStart={6} gapEnd={10} />,
    );

    const dock = screen.getByTestId('dock-sync');

    expect(dock).toHaveClass('cm-dock--top');
    expect(dock).toHaveStyle({
      position: 'absolute',
      top: '0px',
      left: '6px',
      right: '10px',
      height: '32px',
    });

    rerender(
      <CDock data-testid="dock-sync" position="left" height={48} gapStart={6} gapEnd={10} />,
    );

    await waitFor(() => {
      expect(dock).toHaveClass('cm-dock--left');
      expect(dock).toHaveStyle({
        position: 'absolute',
        left: '0px',
        top: '6px',
        bottom: '10px',
        width: '48px',
      });
    });

    expect(dock.style.right).toBe('');
    expect(dock.style.height).toBe('');
  });

  it('ignores default prop changes after mount', () => {
    const { rerender } = render(
      <CDock
        data-testid="dock-default-sync"
        defaultPosition="bottom"
        defaultHeight={28}
        gapStart={4}
        gapEnd={12}
      />,
    );

    const dock = screen.getByTestId('dock-default-sync');

    expect(dock).toHaveClass('cm-dock--bottom');
    expect(dock).toHaveStyle({
      position: 'absolute',
      bottom: '0px',
      left: '4px',
      right: '12px',
      height: '28px',
    });

    rerender(
      <CDock
        data-testid="dock-default-sync"
        defaultPosition="right"
        defaultHeight={52}
        gapStart={4}
        gapEnd={12}
      />,
    );

    expect(dock).toHaveClass('cm-dock--bottom');
    expect(dock).not.toHaveClass('cm-dock--right');
    expect(dock).toHaveStyle({
      position: 'absolute',
      bottom: '0px',
      left: '4px',
      right: '12px',
      height: '28px',
    });
    expect(dock.style.top).toBe('');
    expect(dock.style.width).toBe('');
  });

  it('preserves visual styles without overriding dock edges', () => {
    render(
      <CDock
        data-testid="dock-style-guard"
        position="left"
        height={44}
        gapStart={14}
        gapEnd={20}
        style={{
          color: 'rgb(255, 255, 255)',
          border: '1px solid rgb(255, 0, 0)',
          zIndex: 9,
          position: 'fixed',
          top: 999,
          right: 888,
          bottom: 777,
          left: 666,
          width: 555,
          height: 444,
        }}
      />,
    );

    const dock = screen.getByTestId('dock-style-guard');

    expect(dock).toHaveStyle({
      color: 'rgb(255, 255, 255)',
      border: '1px solid rgb(255, 0, 0)',
      zIndex: '9',
      position: 'absolute',
      left: '0px',
      top: '14px',
      bottom: '20px',
      width: '44px',
    });
    expect(dock.style.right).toBe('');
    expect(dock.style.height).toBe('');
  });

  it('does not call reserved callbacks in phase 1', async () => {
    const onPositionChange = jest.fn();
    const onHeightChange = jest.fn();
    const { rerender } = render(
      <CDock
        data-testid="dock-callback-silence"
        defaultPosition="bottom"
        defaultHeight={28}
        gapStart={4}
        gapEnd={12}
        onPositionChange={onPositionChange}
        onHeightChange={onHeightChange}
      />,
    );

    const dock = screen.getByTestId('dock-callback-silence');

    expect(dock).toHaveClass('cm-dock--bottom');
    expect(onPositionChange).not.toHaveBeenCalled();
    expect(onHeightChange).not.toHaveBeenCalled();

    rerender(
      <CDock
        data-testid="dock-callback-silence"
        defaultPosition="right"
        defaultHeight={52}
        gapStart={4}
        gapEnd={12}
        onPositionChange={onPositionChange}
        onHeightChange={onHeightChange}
      />,
    );

    expect(dock).toHaveClass('cm-dock--bottom');
    expect(onPositionChange).not.toHaveBeenCalled();
    expect(onHeightChange).not.toHaveBeenCalled();

    rerender(
      <CDock
        data-testid="dock-callback-silence"
        position="left"
        height={40}
        gapStart={4}
        gapEnd={12}
        onPositionChange={onPositionChange}
        onHeightChange={onHeightChange}
      />,
    );

    await waitFor(() => {
      expect(dock).toHaveClass('cm-dock--left');
      expect(dock).toHaveStyle({
        position: 'absolute',
        left: '0px',
        top: '4px',
        bottom: '12px',
        width: '40px',
      });
    });

    expect(onPositionChange).not.toHaveBeenCalled();
    expect(onHeightChange).not.toHaveBeenCalled();
  });
});
