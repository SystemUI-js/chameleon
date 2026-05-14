import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { CWidget } from '../src/components/Widget/Widget';

class TestWidget extends CWidget {
  public setActiveFromTest(active: boolean): void {
    this.setWidgetActive(active);
  }

  public render(): React.ReactElement {
    return this.renderFrame(<div data-testid="test-widget-content">Content</div>, undefined, {
      className: 'test-widget-frame',
      testId: 'test-widget-frame',
    });
  }
}

describe('CWidget active state', () => {
  it('renders active by default in uncontrolled mode', () => {
    render(<CWidget />);

    expect(screen.getByTestId('widget-frame')).toHaveClass('cm-widget--active');
  });

  it('uses controlled active prop and follows prop updates', () => {
    const { rerender } = render(<TestWidget active={false} />);

    expect(screen.getByTestId('test-widget-frame')).not.toHaveClass('cm-widget--active');

    rerender(<TestWidget active />);

    expect(screen.getByTestId('test-widget-frame')).toHaveClass('cm-widget--active');
  });

  it('updates uncontrolled active state, toggles class name, and fires onActive', () => {
    const handleActive = jest.fn();
    const widgetRef = React.createRef<TestWidget>();

    render(<TestWidget ref={widgetRef} onActive={handleActive} />);

    const frame = screen.getByTestId('test-widget-frame');

    expect(frame).toHaveClass('test-widget-frame', 'cm-widget--active');

    act(() => {
      widgetRef.current?.setActiveFromTest(false);
    });

    expect(frame).toHaveClass('test-widget-frame');
    expect(frame).not.toHaveClass('cm-widget--active');
    expect(handleActive).toHaveBeenNthCalledWith(1, false);

    fireEvent.pointerDown(frame);

    expect(frame).toHaveClass('test-widget-frame', 'cm-widget--active');
    expect(handleActive).toHaveBeenNthCalledWith(2, true);
    expect(handleActive).toHaveBeenCalledTimes(2);
  });
});
