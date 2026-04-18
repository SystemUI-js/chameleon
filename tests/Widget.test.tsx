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
      testId: 'test-widget-frame',
    });
  }
}

describe('CWidget active state', () => {
  it('renders active by default in uncontrolled mode', () => {
    render(<CWidget />);
    expect(screen.getByTestId('widget-frame')).toBeInTheDocument();
  });

  it('uses controlled active prop and follows prop updates', () => {
    const { rerender } = render(<TestWidget active={false} />);
    expect(screen.getByTestId('test-widget-frame')).toBeInTheDocument();
    rerender(<TestWidget active />);
    expect(screen.getByTestId('test-widget-frame')).toBeInTheDocument();
  });

  it('updates uncontrolled active state and fires onActive', () => {
    const handleActive = jest.fn();
    const widgetRef = React.createRef<TestWidget>();
    render(<TestWidget ref={widgetRef} onActive={handleActive} />);

    act(() => {
      widgetRef.current?.setActiveFromTest(false);
    });

    expect(handleActive).toHaveBeenNthCalledWith(1, false);
    fireEvent.mouseDown(screen.getByTestId('test-widget-frame'));
    expect(handleActive).toHaveBeenNthCalledWith(2, true);
  });
});
