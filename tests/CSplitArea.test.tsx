import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
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
  });

  it('applies direction style', () => {
    render(
      <CSplitArea data-testid="split-area-vertical" direction="vertical">
        <div>A</div>
        <div>B</div>
      </CSplitArea>,
    );

    expect(screen.getByTestId('split-area-vertical')).toHaveStyle({ flexDirection: 'column' });
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
  });
});
