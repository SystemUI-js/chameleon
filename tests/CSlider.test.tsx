import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  CSlider as PackageEntryCSlider,
  type CSliderClassNames as PackageEntryCSliderClassNames,
  type CSliderProps as PackageEntryCSliderProps,
} from '../src';
import { CSlider } from '../src/components/CSlider';

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

type ControlledSliderProps = {
  readonly initialValue?: number;
  readonly onChange?: (value: number) => void;
  readonly step?: number;
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

function getSliderElements(testId: string): {
  root: HTMLElement;
  track: HTMLElement;
  fill: HTMLElement;
  thumb: HTMLElement;
} {
  const root = screen.getByTestId(testId);
  const track = root.querySelector<HTMLElement>('[data-slider-track="true"]');
  const fill = root.querySelector<HTMLElement>('[data-slider-fill="true"]');
  const thumb = root.querySelector<HTMLElement>('[data-slider-thumb="true"]');

  if (!track || !fill || !thumb) {
    throw new Error('slider elements not found');
  }

  return {
    root,
    track,
    fill,
    thumb,
  };
}

function ControlledSlider({
  initialValue = 20,
  onChange,
  step = 10,
}: ControlledSliderProps): React.ReactElement {
  const [value, setValue] = React.useState(initialValue);
  const handleSliderChange = React.useCallback(
    (nextValue: number) => {
      onChange?.(nextValue);
      setValue(nextValue);
    },
    [onChange],
  );

  return (
    <CSlider
      data-testid="controlled-slider"
      min={0}
      max={100}
      step={step}
      value={value}
      onChange={handleSliderChange}
    />
  );
}

function InlineControlledSlider({
  initialValue = 20,
  step = 10,
}: Omit<ControlledSliderProps, 'onChange'>): React.ReactElement {
  const [value, setValue] = React.useState(initialValue);

  return (
    <CSlider
      data-testid="inline-controlled-slider"
      min={0}
      max={100}
      step={step}
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
    />
  );
}

describe('CSlider', () => {
  beforeEach(() => {
    multiDragMock.instances.length = 0;
  });

  it('exports CSlider and related types from package entry', () => {
    const classNames: PackageEntryCSliderClassNames = {
      track: 'custom-track',
      fill: 'custom-fill',
      thumb: 'custom-thumb',
    };
    const props: PackageEntryCSliderProps = {
      value: 25,
      className: 'custom-root',
      classNames,
      'data-testid': 'slider-package-entry',
    };

    render(<PackageEntryCSlider {...props} />);

    const { root, track, fill, thumb } = getSliderElements('slider-package-entry');

    expect(PackageEntryCSlider).toBe(CSlider);
    expect(root).toHaveClass('cm-cslider', 'custom-root');
    expect(track).toHaveClass('cm-cslider__track', 'custom-track');
    expect(fill).toHaveClass('cm-cslider__fill', 'custom-fill');
    expect(thumb).toHaveClass('cm-cslider__thumb', 'custom-thumb');
  });

  it('renders thumb and fill using the normalized current value', () => {
    const { rerender } = render(
      <CSlider data-testid="slider-normalized" min={0} max={100} value={120} />,
    );

    let slider = getSliderElements('slider-normalized');

    expect(slider.fill).toHaveStyle({ width: '100%' });
    expect(slider.thumb).toHaveStyle({ left: '100%' });

    rerender(<CSlider data-testid="slider-normalized" min={0} max={100} value={-20} />);

    slider = getSliderElements('slider-normalized');

    expect(slider.fill).toHaveStyle({ width: '0%' });
    expect(slider.thumb).toHaveStyle({ left: '0%' });
  });

  it('aligns external values to the nearest step', () => {
    render(<CSlider data-testid="slider-step" min={0} max={100} step={25} value={63} />);

    const { fill, thumb } = getSliderElements('slider-step');

    expect(fill).toHaveStyle({ width: '75%' });
    expect(thumb).toHaveStyle({ left: '75%' });
  });

  it('updates value consistently for track press and thumb drag', () => {
    const handleChange = jest.fn<void, [number]>();

    render(<ControlledSlider onChange={handleChange} />);

    const { track, thumb, fill } = getSliderElements('controlled-slider');

    expect(multiDragMock.instances).toHaveLength(1);

    mockElementRect(track, { left: 100, top: 0, width: 200, height: 4 });
    mockElementRect(thumb, { left: 132, top: -6, width: 16, height: 16 });

    act(() => {
      fireEvent.pointerDown(track, { button: 0, clientX: 176 });
    });

    expect(handleChange).toHaveBeenLastCalledWith(40);
    expect(fill).toHaveStyle({ width: '40%' });

    act(() => {
      fireEvent.pointerDown(thumb, { button: 0 });
      multiDragMock.instances[0]?.move({ x: 249, y: -6 });
      multiDragMock.instances[0]?.end({ x: 249, y: -6 });
    });

    expect(handleChange).toHaveBeenLastCalledWith(80);
    expect(fill).toHaveStyle({ width: '80%' });
  });

  it('keeps dragging after the first update with an inline controlled onChange', () => {
    render(<InlineControlledSlider />);

    const { track, thumb, fill } = getSliderElements('inline-controlled-slider');

    expect(multiDragMock.instances).toHaveLength(1);

    mockElementRect(track, { left: 100, top: 0, width: 200, height: 4 });
    mockElementRect(thumb, { left: 132, top: -6, width: 16, height: 16 });

    act(() => {
      fireEvent.pointerDown(thumb, { button: 0 });
      multiDragMock.instances[0]?.move({ x: 172, y: -6 });
    });

    expect(fill).toHaveStyle({ width: '40%' });
    expect(multiDragMock.instances).toHaveLength(1);

    act(() => {
      multiDragMock.instances[0]?.move({ x: 212, y: -6 });
    });

    expect(multiDragMock.instances[0]?.disabled).toBe(false);
    expect(fill).toHaveStyle({ width: '60%' });
  });

  it('does not create interactions when disabled', () => {
    const handleChange = jest.fn<void, [number]>();

    render(
      <CSlider
        data-testid="slider-disabled"
        min={0}
        max={100}
        value={50}
        disabled
        onChange={handleChange}
      />,
    );

    const { root, track } = getSliderElements('slider-disabled');

    mockElementRect(track, { left: 0, top: 0, width: 200, height: 4 });

    act(() => {
      fireEvent.pointerDown(track, { button: 0, clientX: 160 });
    });

    expect(root).toHaveClass('cm-cslider--disabled');
    expect(multiDragMock.instances).toHaveLength(0);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('re-emits the same candidate value when the controlled value stays unchanged', () => {
    const handleChange = jest.fn<void, [number]>();

    render(
      <CSlider
        data-testid="slider-retry"
        min={0}
        max={100}
        step={20}
        value={20}
        onChange={handleChange}
      />,
    );

    const { track } = getSliderElements('slider-retry');

    mockElementRect(track, { left: 100, top: 0, width: 200, height: 4 });

    act(() => {
      fireEvent.pointerDown(track, { button: 0, clientX: 176 });
      fireEvent.pointerDown(track, { button: 0, clientX: 176 });
    });

    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenNthCalledWith(1, 40);
    expect(handleChange).toHaveBeenNthCalledWith(2, 40);
  });

  it('exposes slider semantics and supports keyboard interaction', () => {
    const handleChange = jest.fn<void, [number]>();

    render(
      <CSlider
        data-testid="slider-accessible"
        min={0}
        max={100}
        step={10}
        value={50}
        aria-label="Volume"
        onChange={handleChange}
      />,
    );

    const { thumb } = getSliderElements('slider-accessible');

    expect(thumb).toHaveAttribute('role', 'slider');
    expect(thumb).toHaveAttribute('tabindex', '0');
    expect(thumb).toHaveAttribute('aria-label', 'Volume');
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
    expect(thumb).toHaveAttribute('aria-valuenow', '50');

    act(() => {
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });
      fireEvent.keyDown(thumb, { key: 'Home' });
      fireEvent.keyDown(thumb, { key: 'End' });
    });

    expect(handleChange).toHaveBeenNthCalledWith(1, 60);
    expect(handleChange).toHaveBeenNthCalledWith(2, 0);
    expect(handleChange).toHaveBeenNthCalledWith(3, 100);
  });
});
