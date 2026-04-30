import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { CSplitArea } from '../src/components/CSplitArea';

describe('CSplitArea', () => {
  it('renders panels for each child', () => {
    render(
      <CSplitArea data-testid="split-area">
        <div>A</div>
        <div>B</div>
      </CSplitArea>,
    );

    expect(screen.getByTestId('split-area-panel-0')).toBeInTheDocument();
    expect(screen.getByTestId('split-area-panel-1')).toBeInTheDocument();
    expect(screen.getByTestId('split-area')).toHaveClass(
      'cm-split-area',
      'cm-split-area--horizontal',
    );
    expect(screen.getByTestId('split-area-panel-0')).toHaveClass('cm-split-area__panel');
  });

  it('applies direction style', () => {
    render(
      <CSplitArea data-testid="split-area-vertical" direction="vertical">
        <div>A</div>
        <div>B</div>
      </CSplitArea>,
    );

    expect(screen.getByTestId('split-area-vertical')).toHaveStyle({ flexDirection: 'column' });
    expect(screen.getByTestId('split-area-vertical')).toHaveClass('cm-split-area--vertical');
  });

  it('renders movable separators', () => {
    render(
      <CSplitArea data-testid="split-area-movable" separatorMovable>
        <div>A</div>
        <div>B</div>
      </CSplitArea>,
    );

    fireEvent.click(screen.getByTestId('split-area-movable-separator-0'));
    expect(screen.getByTestId('split-area-movable-separator-0')).toBeInTheDocument();
    expect(screen.getByTestId('split-area-movable-separator-0')).toHaveClass(
      'cm-split-area__separator',
      'cm-split-area__separator--horizontal',
      'cm-split-area__separator--movable',
    );
  });

  it('updates adjacent panel ratios when dragging a movable separator', () => {
    render(
      <CSplitArea data-testid="split-area-drag" separatorMovable>
        <div>A</div>
        <div>B</div>
      </CSplitArea>,
    );

    const root = screen.getByTestId('split-area-drag');
    const firstPanel = screen.getByTestId('split-area-drag-panel-0');
    const secondPanel = screen.getByTestId('split-area-drag-panel-1');
    const separator = screen.getByTestId('split-area-drag-separator-0');

    jest.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      bottom: 100,
      height: 100,
      left: 0,
      right: 200,
      top: 0,
      width: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.mouseDown(separator, { button: 0, clientX: 100, clientY: 0 });
    fireEvent.mouseMove(window, { clientX: 140, clientY: 0 });
    fireEvent.mouseUp(window);

    expect(firstPanel).toHaveStyle({ flexGrow: '0.7' });
    expect(secondPanel).toHaveStyle({ flexGrow: '0.3' });
  });
});
