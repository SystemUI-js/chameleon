import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { CSplitArea as PackageEntryCSplitArea } from '../src';
import { CSplitArea } from '../src/components/CSplitArea';

type MockPose = {
  position?: {
    x: number;
    y: number;
  };
};

type MockDragOptions = {
  getPose?: (element: HTMLElement) => MockPose & { width: number; height: number };
  setPose?: (element: HTMLElement, pose: MockPose) => void;
  setPoseOnEnd?: (element: HTMLElement, pose: MockPose) => void;
};

type MockDragInstance = {
  readonly element: HTMLElement;
  readonly options: MockDragOptions;
  disabled: boolean;
  setDisabled: () => void;
  move: (position: { x: number; y: number }) => void;
  end: (position: { x: number; y: number }) => void;
};

type RectInit = {
  left: number;
  top: number;
  width: number;
  height: number;
};

jest.mock('@system-ui-js/multi-drag', () => {
  const mockDragInstances: MockDragInstance[] = [];

  class MockDrag {
    public disabled = false;

    public constructor(
      public readonly element: HTMLElement,
      public readonly options: MockDragOptions,
    ) {
      mockDragInstances.push(this);
    }

    public setDisabled(): void {
      this.disabled = true;
    }

    public move(position: { x: number; y: number }): void {
      if (this.disabled) {
        return;
      }

      this.options.setPose?.(this.element, { position });
    }

    public end(position: { x: number; y: number }): void {
      if (this.disabled) {
        return;
      }

      this.options.setPoseOnEnd?.(this.element, { position });
    }
  }

  return {
    __esModule: true,
    Drag: MockDrag,
    __mock: {
      instances: mockDragInstances,
    },
  };
});

const { __mock: multiDragMock } = jest.requireMock('@system-ui-js/multi-drag') as {
  __mock: {
    instances: MockDragInstance[];
  };
};

function mockElementRect(element: HTMLElement, init: RectInit): void {
  const rect = {
    x: init.left,
    y: init.top,
    left: init.left,
    top: init.top,
    width: init.width,
    height: init.height,
    right: init.left + init.width,
    bottom: init.top + init.height,
    toJSON: () => undefined,
  } satisfies DOMRect;

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: jest.fn(() => rect),
  });
}

describe('CSplitArea', () => {
  beforeEach(() => {
    multiDragMock.instances.length = 0;
  });

  it('exports CSplitArea from package entry', () => {
    render(
      <PackageEntryCSplitArea data-testid="split-area-package-entry">
        <div>Left</div>
        <div>Right</div>
      </PackageEntryCSplitArea>,
    );

    expect(PackageEntryCSplitArea).toBe(CSplitArea);
    expect(screen.getByTestId('split-area-package-entry')).toHaveClass('cm-split-area');
  });

  it('renders continuous panels and separators from children', () => {
    const { container } = render(
      <CSplitArea data-testid="split-area-structure">
        <div>One</div>
        <div>Two</div>
        <div>Three</div>
      </CSplitArea>,
    );

    expect(screen.getByTestId('split-area-structure')).toHaveClass('cm-split-area--horizontal');
    expect(container.querySelectorAll('[data-split-area-panel]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-split-area-separator]')).toHaveLength(2);
  });

  it('switches direction classes and separator orientation metadata', () => {
    const { rerender } = render(
      <CSplitArea data-testid="split-area-direction" direction="horizontal">
        <div>Left</div>
        <div>Right</div>
      </CSplitArea>,
    );

    expect(screen.getByTestId('split-area-direction')).toHaveClass('cm-split-area--horizontal');
    expect(screen.getByTestId('split-area-direction')).not.toHaveClass('cm-split-area--vertical');
    expect(
      screen.getByTestId('split-area-direction').querySelector('[data-split-area-separator]'),
    ).toHaveAttribute('data-separator-orientation', 'vertical');

    rerender(
      <CSplitArea data-testid="split-area-direction" direction="vertical">
        <div>Top</div>
        <div>Bottom</div>
      </CSplitArea>,
    );

    expect(screen.getByTestId('split-area-direction')).toHaveClass('cm-split-area--vertical');
    expect(
      screen.getByTestId('split-area-direction').querySelector('[data-split-area-separator]'),
    ).toHaveAttribute('data-separator-orientation', 'horizontal');
  });

  it('recomputes layout when a middle child is removed', () => {
    function DynamicSplitArea(): React.ReactElement {
      const [showMiddle, setShowMiddle] = React.useState(true);

      return (
        <>
          <button type="button" onClick={() => setShowMiddle(false)}>
            remove middle
          </button>
          <CSplitArea data-testid="split-area-dynamic">
            <div key="left">Left</div>
            {showMiddle ? <div key="middle">Middle</div> : null}
            <div key="right">Right</div>
          </CSplitArea>
        </>
      );
    }

    const { container } = render(<DynamicSplitArea />);

    expect(container.querySelectorAll('[data-split-area-panel]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-split-area-separator]')).toHaveLength(2);
    expect(screen.getByText('Middle')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'remove middle' }));

    expect(container.querySelectorAll('[data-split-area-panel]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-split-area-separator]')).toHaveLength(1);
    expect(screen.queryByText('Middle')).not.toBeInTheDocument();
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('only enables drag instances when separators are movable', () => {
    const { rerender } = render(
      <CSplitArea separatorMovable={false}>
        <div>Left</div>
        <div>Right</div>
      </CSplitArea>,
    );

    expect(multiDragMock.instances).toHaveLength(0);

    rerender(
      <CSplitArea separatorMovable>
        <div>Left</div>
        <div>Right</div>
      </CSplitArea>,
    );

    expect(multiDragMock.instances).toHaveLength(1);
  });

  it('updates adjacent panel ratios after dragging a movable separator', () => {
    render(
      <CSplitArea data-testid="split-area-draggable" separatorMovable>
        <div>Left</div>
        <div>Right</div>
      </CSplitArea>,
    );

    const root = screen.getByTestId('split-area-draggable');
    const panels = root.querySelectorAll<HTMLElement>('[data-split-area-panel]');
    const separator = root.querySelector<HTMLElement>('[data-split-area-separator="0"]');

    expect(separator).not.toBeNull();
    expect(panels).toHaveLength(2);
    expect(multiDragMock.instances).toHaveLength(1);

    mockElementRect(root, { left: 0, top: 0, width: 408, height: 240 });
    mockElementRect(separator as HTMLElement, { left: 200, top: 0, width: 8, height: 240 });

    expect(panels[0]).toHaveStyle({ flex: '0 0 calc((100% - 8px) * 0.5)' });
    expect(panels[1]).toHaveStyle({ flex: '0 0 calc((100% - 8px) * 0.5)' });

    act(() => {
      fireEvent.pointerDown(separator as HTMLElement, { button: 0 });
      multiDragMock.instances[0]?.move({ x: 260, y: 0 });
      multiDragMock.instances[0]?.end({ x: 260, y: 0 });
    });

    const resizedPanels = root.querySelectorAll<HTMLElement>('[data-split-area-panel]');

    expect(resizedPanels[0]).toHaveStyle({ flex: '0 0 calc((100% - 8px) * 0.65)' });
    expect(resizedPanels[1]).toHaveStyle({ flex: '0 0 calc((100% - 8px) * 0.35)' });
  });

  it('rebinds drag instances when children are replaced with the same count', () => {
    const { rerender } = render(
      <CSplitArea separatorMovable>
        <div key="left">Left</div>
        <div key="right">Right</div>
      </CSplitArea>,
    );

    expect(multiDragMock.instances).toHaveLength(1);
    expect(multiDragMock.instances[0]?.disabled).toBe(false);

    rerender(
      <CSplitArea separatorMovable>
        <div key="preview">Preview</div>
        <div key="console">Console</div>
      </CSplitArea>,
    );

    expect(multiDragMock.instances).toHaveLength(2);
    expect(multiDragMock.instances[0]?.disabled).toBe(true);
    expect(multiDragMock.instances[1]?.disabled).toBe(false);
  });
});
