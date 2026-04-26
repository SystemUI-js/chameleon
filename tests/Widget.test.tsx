import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  CWidget,
  WidgetInteractionBehavior,
  WidgetPreviewSource,
} from '../src/components/Widget/Widget';

class TestWidget extends CWidget {
  public setActiveFromTest(active: boolean): void {
    this.setWidgetActive(active);
  }

  public setPreviewFromTest(behavior: WidgetInteractionBehavior): void {
    this.setState((current) => ({
      ...current,
      preview: {
        active: true,
        behavior,
        source: WidgetPreviewSource.Move,
        rect: { x: 12, y: 24, width: 120, height: 80 },
      },
    }));
  }

  public render(): React.ReactElement {
    return this.renderFrame(<div data-testid="test-widget-content">Content</div>, undefined, {
      testId: 'test-widget-frame',
      previewTestId: 'test-widget-preview-frame',
    });
  }
}

describe('CWidget active state', () => {
  it('renders active by default in uncontrolled mode', () => {
    render(<CWidget />);
    expect(screen.getByTestId('widget-frame')).toBeInTheDocument();
  });

  it('applies the active class when active', () => {
    render(<TestWidget active />);
    expect(screen.getByTestId('test-widget-frame')).toHaveClass('cm-widget--active');
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

  it('renders preview frame only for outline behavior', () => {
    const widgetRef = React.createRef<TestWidget>();
    render(<TestWidget ref={widgetRef} />);

    act(() => {
      widgetRef.current?.setPreviewFromTest(WidgetInteractionBehavior.Live);
    });

    expect(screen.queryByTestId('test-widget-preview-frame')).not.toBeInTheDocument();

    act(() => {
      widgetRef.current?.setPreviewFromTest(WidgetInteractionBehavior.Outline);
    });

    expect(screen.getByTestId('test-widget-preview-frame')).toBeInTheDocument();
  });
});
