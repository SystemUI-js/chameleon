import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { CTooltip as PackageEntryCTooltip, Theme } from '../src';
import { CTooltip } from '../src/components/Tooltip';

describe('CTooltip', () => {
  it('exports CTooltip from package entry', () => {
    render(
      <PackageEntryCTooltip title="Package tooltip" data-testid="tooltip-package-entry">
        <button type="button">Package trigger</button>
      </PackageEntryCTooltip>,
    );

    const root = screen.getByTestId('tooltip-package-entry');

    expect(PackageEntryCTooltip).toBe(CTooltip);
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('cm-tooltip');
  });

  it('renders tooltip content with ARIA wiring only while visible', () => {
    render(
      <CTooltip title="Hidden tooltip">
        <button type="button">Hover me</button>
      </CTooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Hover me' });
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    expect(tooltip).toHaveTextContent('Hidden tooltip');
    expect(tooltip).toHaveAttribute('aria-hidden', 'true');
    expect(trigger).not.toHaveAttribute('aria-describedby');

    fireEvent.pointerEnter(trigger);

    expect(tooltip).toHaveAttribute('aria-hidden', 'false');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('opens by default when defaultOpen is set', () => {
    render(
      <CTooltip title="Default open" defaultOpen data-testid="default-open">
        <button type="button">Default trigger</button>
      </CTooltip>,
    );

    const root = screen.getByTestId('default-open');
    const trigger = screen.getByRole('button', { name: 'Default trigger' });
    const tooltip = screen.getByRole('tooltip');

    expect(root).toHaveClass('cm-tooltip--open');
    expect(root).toHaveAttribute('data-tooltip-state', 'open');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('shows and hides on hover trigger', () => {
    render(
      <CTooltip title="Pointer tooltip" data-testid="pointer-tooltip">
        <button type="button">Pointer trigger</button>
      </CTooltip>,
    );

    const root = screen.getByTestId('pointer-tooltip');
    const trigger = screen.getByRole('button', { name: 'Pointer trigger' });
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    expect(root).toHaveAttribute('data-tooltip-state', 'closed');
    expect(root).not.toHaveClass('cm-tooltip--open');
    expect(tooltip).toHaveAttribute('aria-hidden', 'true');

    fireEvent.pointerEnter(trigger);

    expect(root).toHaveAttribute('data-tooltip-state', 'open');
    expect(root).toHaveClass('cm-tooltip--open');
    expect(tooltip).toHaveAttribute('aria-hidden', 'false');
    expect(tooltip).toHaveClass('cm-tooltip__popup');
    expect(tooltip).toHaveClass('cm-tooltip__overlay--visible');

    fireEvent.pointerLeave(trigger);

    expect(root).toHaveAttribute('data-tooltip-state', 'closed');
    expect(root).not.toHaveClass('cm-tooltip--open');
    expect(tooltip).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows and hides on focus trigger', () => {
    render(
      <CTooltip title="Focus tooltip" trigger="focus">
        <button type="button">Focus trigger</button>
      </CTooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Focus trigger' });
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    fireEvent.focus(trigger);

    expect(tooltip).toHaveAttribute('aria-hidden', 'false');

    fireEvent.blur(trigger);

    expect(tooltip).toHaveAttribute('aria-hidden', 'true');
  });

  it('toggles on click trigger', () => {
    render(
      <CTooltip title="Click tooltip" trigger="click">
        <button type="button">Click trigger</button>
      </CTooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Click trigger' });
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);

    expect(tooltip).toHaveAttribute('aria-hidden', 'false');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);

    expect(tooltip).toHaveAttribute('aria-hidden', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('reports controlled open changes without mutating visible state internally', () => {
    const handleOpenChange = jest.fn();
    const { rerender } = render(
      <CTooltip
        title="Controlled tooltip"
        trigger="click"
        open={false}
        onOpenChange={handleOpenChange}
      >
        <button type="button">Controlled trigger</button>
      </CTooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Controlled trigger' });
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    fireEvent.click(trigger);

    expect(handleOpenChange).toHaveBeenLastCalledWith(true);
    expect(tooltip).toHaveAttribute('aria-hidden', 'true');

    rerender(
      <CTooltip title="Controlled tooltip" trigger="click" open onOpenChange={handleOpenChange}>
        <button type="button">Controlled trigger</button>
      </CTooltip>,
    );

    expect(tooltip).toHaveAttribute('aria-hidden', 'false');

    fireEvent.click(trigger);

    expect(handleOpenChange).toHaveBeenLastCalledWith(false);
    expect(tooltip).toHaveAttribute('aria-hidden', 'false');
  });

  it('does not open or call onOpenChange when disabled', () => {
    const handleOpenChange = jest.fn();
    render(
      <CTooltip
        title="Disabled tooltip"
        disabled
        trigger="click"
        onOpenChange={handleOpenChange}
        data-testid="disabled-tooltip"
      >
        <button type="button">Disabled trigger</button>
      </CTooltip>,
    );

    const root = screen.getByTestId('disabled-tooltip');
    const trigger = screen.getByRole('button', { name: 'Disabled trigger' });
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    fireEvent.click(trigger);

    expect(root).toHaveClass('cm-tooltip--disabled');
    expect(root).not.toHaveClass('cm-tooltip--open');
    expect(tooltip).toHaveAttribute('aria-hidden', 'true');
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('honors mouse enter and leave delays and clears timers on unmount', () => {
    jest.useFakeTimers();

    const { unmount } = render(
      <CTooltip title="Delayed tooltip" mouseEnterDelay={0.05} mouseLeaveDelay={0.05}>
        <button type="button">Delayed trigger</button>
      </CTooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Delayed trigger' });
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    fireEvent.pointerEnter(trigger);
    expect(tooltip).toHaveAttribute('aria-hidden', 'true');

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(tooltip).toHaveAttribute('aria-hidden', 'false');

    fireEvent.pointerLeave(trigger);
    expect(tooltip).toHaveAttribute('aria-hidden', 'false');

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(tooltip).toHaveAttribute('aria-hidden', 'true');

    fireEvent.pointerEnter(trigger);
    expect(jest.getTimerCount()).toBe(1);
    unmount();
    expect(jest.getTimerCount()).toBe(0);

    jest.useRealTimers();
  });

  it('keeps original trigger event handlers when injecting tooltip behavior', () => {
    const handleClick = jest.fn();
    const handleFocus = jest.fn();
    const handlePointerEnter = jest.fn();

    render(
      <>
        <CTooltip title="Composed hover handlers">
          <button type="button" onPointerEnter={handlePointerEnter}>
            Hover trigger
          </button>
        </CTooltip>
        <CTooltip title="Composed focus handlers" trigger="focus">
          <button type="button" onFocus={handleFocus}>
            Focus trigger
          </button>
        </CTooltip>
        <CTooltip title="Composed click handlers" trigger="click">
          <button type="button" onClick={handleClick}>
            Click trigger
          </button>
        </CTooltip>
      </>,
    );

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Hover trigger' }));
    fireEvent.focus(screen.getByRole('button', { name: 'Focus trigger' }));
    fireEvent.click(screen.getByRole('button', { name: 'Click trigger' }));

    expect(handlePointerEnter).toHaveBeenCalledTimes(1);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies placement modifier classes and required popup structure', () => {
    const { rerender } = render(
      <CTooltip title="Top tooltip" placement="top" data-testid="placed-tooltip">
        <button type="button">Top</button>
      </CTooltip>,
    );

    const root = screen.getByTestId('placed-tooltip');
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    expect(root).toHaveClass('cm-tooltip--top');
    expect(tooltip).toHaveClass('cm-tooltip__popup');
    expect(tooltip).toHaveClass('cm-tooltip__overlay--top');
    expect(tooltip.querySelector('.cm-tooltip__arrow')).toBeInTheDocument();
    expect(tooltip.querySelector('.cm-tooltip__content')).toHaveTextContent('Top tooltip');

    rerender(
      <CTooltip title="Bottom tooltip" placement="bottom" data-testid="placed-tooltip">
        <button type="button">Bottom</button>
      </CTooltip>,
    );

    expect(root).toHaveClass('cm-tooltip--bottom');

    rerender(
      <CTooltip title="Left tooltip" placement="left" data-testid="placed-tooltip">
        <button type="button">Left</button>
      </CTooltip>,
    );

    expect(root).toHaveClass('cm-tooltip--left');

    rerender(
      <CTooltip title="Right tooltip" placement="right" data-testid="placed-tooltip">
        <button type="button">Right</button>
      </CTooltip>,
    );

    expect(root).toHaveClass('cm-tooltip--right');
  });

  it('merges className with theme following correct order: base → theme → className', () => {
    render(
      <CTooltip title="Themed tooltip" className="custom-class" theme="win98" data-testid="themed">
        <button type="button">Themed trigger</button>
      </CTooltip>,
    );

    const root = screen.getByTestId('themed');

    expect(root).toHaveClass('cm-tooltip');
    expect(root).toHaveClass('cm-tooltip--top');
    expect(root).toHaveClass('cm-theme--win98');
    expect(root).toHaveClass('custom-class');
    expect(root.className).toBe('cm-tooltip cm-tooltip--top cm-theme--win98 custom-class');
  });

  it('inherits theme class from Theme provider', () => {
    render(
      <Theme name="winxp">
        <CTooltip title="Provider themed" data-testid="provider-themed">
          <button type="button">Provider trigger</button>
        </CTooltip>
      </Theme>,
    );

    const root = screen.getByTestId('provider-themed');

    expect(root).toHaveClass('cm-tooltip');
    expect(root).toHaveClass('cm-theme--winxp');
  });
});
