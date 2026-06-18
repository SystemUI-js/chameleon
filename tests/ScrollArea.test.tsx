import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { CScrollAreaProps } from '../src';
import { CScrollArea as PackageEntryCScrollArea } from '../src';
import { CScrollArea as ComponentsEntryCScrollArea } from '../src/components';
import { CScrollArea } from '../src/components/ScrollArea';
import type { AxisState } from '../src/components/ScrollArea/scrollMetrics';

interface MockScrollAreaMetrics {
  readonly clientWidth: number;
  readonly clientHeight: number;
  readonly scrollWidth: number;
  readonly scrollHeight: number;
}

let scrollAreaMetrics: MockScrollAreaMetrics = {
  clientWidth: 0,
  clientHeight: 0,
  scrollWidth: 0,
  scrollHeight: 0,
};

let scrollOffsets = new WeakMap<HTMLElement, { scrollLeft: number; scrollTop: number }>();
const originalDescriptors = new Map<string, PropertyDescriptor | undefined>();

class MockResizeObserver implements ResizeObserver {
  static readonly observers: MockResizeObserver[] = [];

  readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.observers.push(this);
  }

  observe(): void {}

  unobserve(): void {}

  disconnect(): void {}

  static trigger(): void {
    MockResizeObserver.observers.forEach((observer) => {
      observer.callback([], observer);
    });
  }

  static reset(): void {
    MockResizeObserver.observers.length = 0;
  }
}

function isScrollAreaViewport(element: HTMLElement): boolean {
  return element.getAttribute('data-scroll-area-viewport') === 'true';
}

function defineMetricGetter(name: keyof MockScrollAreaMetrics): void {
  originalDescriptors.set(name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name));
  Object.defineProperty(HTMLElement.prototype, name, {
    configurable: true,
    get() {
      return isScrollAreaViewport(this as HTMLElement) ? scrollAreaMetrics[name] : 0;
    },
  });
}

function defineScrollOffsetProperty(name: 'scrollLeft' | 'scrollTop'): void {
  originalDescriptors.set(name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name));
  Object.defineProperty(HTMLElement.prototype, name, {
    configurable: true,
    get() {
      const offsets = scrollOffsets.get(this as HTMLElement);

      return offsets?.[name] ?? 0;
    },
    set(value: number) {
      const element = this as HTMLElement;
      const offsets = scrollOffsets.get(element) ?? { scrollLeft: 0, scrollTop: 0 };
      scrollOffsets.set(element, { ...offsets, [name]: value });
    },
  });
}

function restoreDescriptor(name: string): void {
  const originalDescriptor = originalDescriptors.get(name);

  if (originalDescriptor) {
    Object.defineProperty(HTMLElement.prototype, name, originalDescriptor);
    return;
  }

  delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
}

function setScrollAreaMetrics(metrics: MockScrollAreaMetrics): void {
  scrollAreaMetrics = metrics;
}

function getAxisState(testId: string, axis: AxisState['id']): AxisState {
  const serializedAxisState = screen.getByTestId(testId).getAttribute(`data-scroll-axis-${axis}`);

  if (!serializedAxisState) {
    throw new Error(`${axis} axis state not found`);
  }

  return JSON.parse(serializedAxisState) as AxisState;
}

function getScrollAreaContent(testId: string): HTMLElement {
  const root = screen.getByTestId(testId);
  const content = root.querySelector<HTMLElement>('[data-scroll-area-content="true"]');

  if (!content) {
    throw new Error('scroll area content not found');
  }

  return content;
}

function getScrollAreaViewport(testId: string): HTMLElement {
  const root = screen.getByTestId(testId);
  const viewport = root.querySelector<HTMLElement>('[data-scroll-area-viewport="true"]');

  if (!viewport) {
    throw new Error('scroll area viewport not found');
  }

  return viewport;
}

beforeAll(() => {
  defineMetricGetter('clientWidth');
  defineMetricGetter('clientHeight');
  defineMetricGetter('scrollWidth');
  defineMetricGetter('scrollHeight');
  defineScrollOffsetProperty('scrollLeft');
  defineScrollOffsetProperty('scrollTop');
  globalThis.ResizeObserver = MockResizeObserver;
});

beforeEach(() => {
  setScrollAreaMetrics({ clientWidth: 0, clientHeight: 0, scrollWidth: 0, scrollHeight: 0 });
  scrollOffsets = new WeakMap<HTMLElement, { scrollLeft: number; scrollTop: number }>();
  MockResizeObserver.reset();
});

afterAll(() => {
  restoreDescriptor('clientWidth');
  restoreDescriptor('clientHeight');
  restoreDescriptor('scrollWidth');
  restoreDescriptor('scrollHeight');
  restoreDescriptor('scrollLeft');
  restoreDescriptor('scrollTop');
});

describe('CScrollArea', () => {
  it('exports CScrollArea from package entry', () => {
    const props: CScrollAreaProps = {
      className: 'custom-root',
      contentClassName: 'custom-content',
      theme: 'cm-theme--default',
      'data-testid': 'scroll-area-package-entry',
    };

    render(
      <PackageEntryCScrollArea {...props}>
        <div>Activity</div>
      </PackageEntryCScrollArea>,
    );

    const root = screen.getByTestId('scroll-area-package-entry');
    const content = getScrollAreaContent('scroll-area-package-entry');

    expect(PackageEntryCScrollArea).toBe(CScrollArea);
    expect(ComponentsEntryCScrollArea).toBe(CScrollArea);
    expect(root).toHaveClass('cm-scroll-area', 'cm-theme--default', 'custom-root');
    expect(content).toHaveClass('cm-scroll-area__content', 'custom-content');
  });

  it('defaults scrollbar visibility to auto', () => {
    render(
      <CScrollArea data-testid="scroll-area-auto">
        <div>Default visibility</div>
      </CScrollArea>,
    );

    expect(screen.getByTestId('scroll-area-auto')).toHaveAttribute(
      'data-scrollbar-visibility',
      'auto',
    );
  });

  it('suppresses horizontal custom scrollbar eligibility when the x axis is hidden', () => {
    render(
      <CScrollArea
        data-testid="scroll-area-hidden-x"
        overflowX="hidden"
        scrollbarVisibility="always"
      >
        <div style={{ height: '320px', width: '640px' }}>Oversized content</div>
      </CScrollArea>,
    );

    const root = screen.getByTestId('scroll-area-hidden-x');

    expect(root).toHaveAttribute('data-scrollbar-horizontal-visible', 'false');
    expect(root.querySelector('[data-scrollbar-orientation="horizontal"]')).not.toBeInTheDocument();
  });

  it('applies overflow styles and makes the region focusable by default', () => {
    render(
      <CScrollArea
        data-testid="scroll-area-default"
        overflowX="hidden"
        overflowY="scroll"
        aria-label="Notifications"
      >
        <div>Item</div>
      </CScrollArea>,
    );

    const root = screen.getByTestId('scroll-area-default');
    const viewport = getScrollAreaViewport('scroll-area-default');

    expect(root.style.overflowX).toBe('');
    expect(root.style.overflowY).toBe('');
    expect(root).not.toHaveAttribute('tabindex');
    expect(root).not.toHaveAttribute('aria-label');
    expect(viewport).toHaveStyle({ overflowX: 'hidden', overflowY: 'scroll' });
    expect(viewport).toHaveAttribute('tabindex', '0');
    expect(viewport).toHaveAttribute('aria-label', 'Notifications');
  });

  it('respects explicit tabIndex and forwards scroll events', () => {
    const handleScroll = jest.fn();

    render(
      <CScrollArea data-testid="scroll-area-scroll" onScroll={handleScroll} tabIndex={-1}>
        <div style={{ height: '480px' }}>Long content</div>
      </CScrollArea>,
    );

    const root = screen.getByTestId('scroll-area-scroll');
    const viewport = getScrollAreaViewport('scroll-area-scroll');

    fireEvent.scroll(viewport, { target: { scrollTop: 48 } });

    expect(root).not.toHaveAttribute('tabindex');
    expect(viewport).toHaveAttribute('tabindex', '-1');
    expect(handleScroll).toHaveBeenCalledTimes(1);
  });

  it('removes default tab stop when both axes are hidden', () => {
    render(
      <CScrollArea data-testid="scroll-area-hidden" overflowX="hidden" overflowY="hidden">
        <div>Static content</div>
      </CScrollArea>,
    );

    expect(screen.getByTestId('scroll-area-hidden')).not.toHaveAttribute('tabindex');
    expect(getScrollAreaViewport('scroll-area-hidden')).not.toHaveAttribute('tabindex');
  });

  it('computes axis state after initial render', async () => {
    setScrollAreaMetrics({
      clientWidth: 120,
      clientHeight: 100,
      scrollWidth: 300,
      scrollHeight: 400,
    });

    render(
      <CScrollArea data-testid="scroll-area-mount">
        <div>Measured content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(getAxisState('scroll-area-mount', 'vertical')).toMatchObject({
        id: 'vertical',
        viewportSize: 100,
        contentSize: 400,
        maxScrollOffset: 300,
        scrollable: true,
        canScrollBackward: false,
        canScrollForward: true,
        trackSize: 100,
        thumbSize: 25,
        thumbOffset: 0,
      });
      expect(getAxisState('scroll-area-mount', 'horizontal')).toMatchObject({
        id: 'horizontal',
        viewportSize: 120,
        contentSize: 300,
        maxScrollOffset: 180,
        scrollable: true,
        trackSize: 120,
        thumbSize: 48,
      });
    });
  });

  it('updates scrollable state when content grows beyond the viewport', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 100,
    });

    render(
      <CScrollArea data-testid="scroll-area-content-growth">
        <div>Growing content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(getAxisState('scroll-area-content-growth', 'vertical').scrollable).toBe(false);
    });

    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 300,
    });
    act(() => {
      MockResizeObserver.trigger();
    });

    await waitFor(() => {
      expect(getAxisState('scroll-area-content-growth', 'vertical')).toMatchObject({
        contentSize: 300,
        maxScrollOffset: 200,
        scrollable: true,
        canScrollForward: true,
      });
    });
  });

  it('resets thumb state when content shrinks inside the viewport', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 400,
    });

    render(
      <CScrollArea data-testid="scroll-area-content-shrink">
        <div>Shrinking content</div>
      </CScrollArea>,
    );

    const viewport = getScrollAreaViewport('scroll-area-content-shrink');
    viewport.scrollTop = 120;
    fireEvent.scroll(viewport);

    await waitFor(() => {
      expect(getAxisState('scroll-area-content-shrink', 'vertical').thumbOffset).toBeGreaterThan(0);
    });

    viewport.scrollTop = 0;
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 80,
    });
    act(() => {
      MockResizeObserver.trigger();
    });

    await waitFor(() => {
      expect(getAxisState('scroll-area-content-shrink', 'vertical')).toMatchObject({
        contentSize: 80,
        maxScrollOffset: 0,
        scrollable: false,
        canScrollBackward: false,
        canScrollForward: false,
        thumbSize: 100,
        thumbOffset: 0,
      });
    });
  });

  it('recalculates axis state when the viewport resizes', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 400,
    });

    render(
      <CScrollArea data-testid="scroll-area-viewport-resize">
        <div>Resizable viewport</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(getAxisState('scroll-area-viewport-resize', 'vertical').thumbSize).toBe(25);
    });

    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 200,
      scrollWidth: 100,
      scrollHeight: 400,
    });
    act(() => {
      MockResizeObserver.trigger();
    });

    await waitFor(() => {
      expect(getAxisState('scroll-area-viewport-resize', 'vertical')).toMatchObject({
        viewportSize: 200,
        maxScrollOffset: 200,
        trackSize: 200,
        thumbSize: 100,
      });
    });
  });

  it('maps programmatic scrollTop and scrollLeft changes to thumb offsets', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 300,
      scrollHeight: 400,
    });

    render(
      <CScrollArea data-testid="scroll-area-programmatic-scroll">
        <div>Scrollable content</div>
      </CScrollArea>,
    );

    const viewport = getScrollAreaViewport('scroll-area-programmatic-scroll');
    viewport.scrollTop = 150;
    viewport.scrollLeft = 100;
    fireEvent.scroll(viewport);

    await waitFor(() => {
      expect(getAxisState('scroll-area-programmatic-scroll', 'vertical')).toMatchObject({
        scrollOffset: 150,
        thumbSize: 25,
        thumbOffset: 37.5,
      });
      expect(getAxisState('scroll-area-programmatic-scroll', 'horizontal')).toMatchObject({
        scrollOffset: 100,
        thumbSize: 33,
        thumbOffset: 33.5,
      });
    });
  });

  it('clamps thumb size between 20px and the track size', async () => {
    setScrollAreaMetrics({
      clientWidth: 10,
      clientHeight: 100,
      scrollWidth: 1000,
      scrollHeight: 10000,
    });

    render(
      <CScrollArea data-testid="scroll-area-thumb-size">
        <div>Very large content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(getAxisState('scroll-area-thumb-size', 'vertical').thumbSize).toBe(20);
      expect(getAxisState('scroll-area-thumb-size', 'horizontal').thumbSize).toBe(10);
    });

    setScrollAreaMetrics({ clientWidth: 120, clientHeight: 80, scrollWidth: 80, scrollHeight: 40 });
    act(() => {
      MockResizeObserver.trigger();
    });

    await waitFor(() => {
      expect(getAxisState('scroll-area-thumb-size', 'vertical').thumbSize).toBe(80);
      expect(getAxisState('scroll-area-thumb-size', 'horizontal').thumbSize).toBe(120);
    });
  });

  it('keeps thumb offset within the track bounds', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 300,
      scrollHeight: 400,
    });

    render(
      <CScrollArea data-testid="scroll-area-thumb-offset-bounds">
        <div>Bounded content</div>
      </CScrollArea>,
    );

    const viewport = getScrollAreaViewport('scroll-area-thumb-offset-bounds');
    viewport.scrollTop = 999;
    viewport.scrollLeft = -20;
    fireEvent.scroll(viewport);

    await waitFor(() => {
      const verticalAxis = getAxisState('scroll-area-thumb-offset-bounds', 'vertical');
      const horizontalAxis = getAxisState('scroll-area-thumb-offset-bounds', 'horizontal');

      expect(verticalAxis.thumbOffset).toBe(verticalAxis.trackSize - verticalAxis.thumbSize);
      expect(horizontalAxis.thumbOffset).toBe(0);
    });
  });

  it('renders vertical scrollbar when content overflows and visibility is auto', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 400,
    });

    render(
      <CScrollArea data-testid="scroll-area-vertical-auto-visible">
        <div>Overflow content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll-area-scrollbar-vertical')).toBeInTheDocument();
    });
  });

  it('does not render vertical scrollbar when content fits and visibility is auto', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 100,
    });

    render(
      <CScrollArea data-testid="scroll-area-vertical-auto-hidden">
        <div>Fits content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(getAxisState('scroll-area-vertical-auto-hidden', 'vertical').scrollable).toBe(false);
    });

    expect(screen.queryByTestId('scroll-area-scrollbar-vertical')).not.toBeInTheDocument();
  });

  it('renders vertical scrollbar with visibility always even if content fits', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 100,
    });

    render(
      <CScrollArea data-testid="scroll-area-vertical-always" scrollbarVisibility="always">
        <div>Fits content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll-area-scrollbar-vertical')).toBeInTheDocument();
    });
  });

  it('updates viewport scrollTop via vertical scrollbar button clicks', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 400,
    });

    render(
      <CScrollArea data-testid="scroll-area-vertical-btn">
        <div>Scrollable content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll-area-scrollbar-vertical')).toBeInTheDocument();
    });

    const incrementBtn = screen.getByTestId('scroll-area-scrollbar-vertical-increment');
    const decrementBtn = screen.getByTestId('scroll-area-scrollbar-vertical-decrement');

    fireEvent.click(incrementBtn);

    await waitFor(() => {
      expect(getScrollAreaViewport('scroll-area-vertical-btn').scrollTop).toBe(16);
    });

    fireEvent.click(decrementBtn);

    await waitFor(() => {
      expect(getScrollAreaViewport('scroll-area-vertical-btn').scrollTop).toBe(0);
    });
  });

  it('reflects thumb position from vertical axis state', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 400,
    });

    render(
      <CScrollArea data-testid="scroll-area-vertical-thumb">
        <div>Scrollable content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll-area-scrollbar-vertical-thumb')).toBeInTheDocument();
    });

    const thumb = screen.getByTestId('scroll-area-scrollbar-vertical-thumb');

    expect(thumb).toHaveStyle({ transform: 'translateY(0px)' });

    const viewport = getScrollAreaViewport('scroll-area-vertical-thumb');
    viewport.scrollTop = 150;
    fireEvent.scroll(viewport);

    await waitFor(() => {
      expect(thumb).toHaveStyle({ transform: 'translateY(37.5px)' });
    });
  });

  it('renders horizontal scrollbar when content overflows and visibility is auto', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 400,
      scrollHeight: 100,
    });

    render(
      <CScrollArea data-testid="scroll-area-horizontal-auto-visible">
        <div>Overflow content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll-area-scrollbar-horizontal')).toBeInTheDocument();
    });
  });

  it('does not render horizontal scrollbar when content fits and visibility is auto', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 100,
    });

    render(
      <CScrollArea data-testid="scroll-area-horizontal-auto-hidden">
        <div>Fits content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(getAxisState('scroll-area-horizontal-auto-hidden', 'horizontal').scrollable).toBe(
        false,
      );
    });

    expect(screen.queryByTestId('scroll-area-scrollbar-horizontal')).not.toBeInTheDocument();
  });

  it('renders horizontal scrollbar with visibility always even if content fits', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 100,
    });

    render(
      <CScrollArea data-testid="scroll-area-horizontal-always" scrollbarVisibility="always">
        <div>Fits content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll-area-scrollbar-horizontal')).toBeInTheDocument();
    });
  });

  it('updates viewport scrollLeft via horizontal scrollbar button clicks', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 400,
      scrollHeight: 100,
    });

    render(
      <CScrollArea data-testid="scroll-area-horizontal-btn">
        <div>Scrollable content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll-area-scrollbar-horizontal')).toBeInTheDocument();
    });

    const incrementBtn = screen.getByTestId('scroll-area-scrollbar-horizontal-increment');
    const decrementBtn = screen.getByTestId('scroll-area-scrollbar-horizontal-decrement');

    fireEvent.click(incrementBtn);

    await waitFor(() => {
      expect(getScrollAreaViewport('scroll-area-horizontal-btn').scrollLeft).toBe(16);
    });

    fireEvent.click(decrementBtn);

    await waitFor(() => {
      expect(getScrollAreaViewport('scroll-area-horizontal-btn').scrollLeft).toBe(0);
    });
  });

  it('reflects thumb position from horizontal axis state', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 400,
      scrollHeight: 100,
    });

    render(
      <CScrollArea data-testid="scroll-area-horizontal-thumb">
        <div>Scrollable content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll-area-scrollbar-horizontal-thumb')).toBeInTheDocument();
    });

    const thumb = screen.getByTestId('scroll-area-scrollbar-horizontal-thumb');

    expect(thumb).toHaveStyle({ transform: 'translateX(0px)' });

    const viewport = getScrollAreaViewport('scroll-area-horizontal-thumb');
    viewport.scrollLeft = 150;
    fireEvent.scroll(viewport);

    await waitFor(() => {
      expect(thumb).toHaveStyle({ transform: 'translateX(37.5px)' });
    });
  });

  it('renders the scrollbar corner when both axes overflow', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 400,
      scrollHeight: 400,
    });

    render(
      <CScrollArea data-testid="scroll-area-corner-visible">
        <div>Two-axis overflow</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll-area-scrollbar-vertical')).toBeInTheDocument();
      expect(screen.getByTestId('scroll-area-scrollbar-horizontal')).toBeInTheDocument();
      expect(screen.getByTestId('scroll-area-scrollbar-corner')).toHaveClass(
        'cm-scroll-area__scrollbar-corner',
      );
    });
  });

  it('does not render the scrollbar corner when only one axis overflows', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 400,
    });

    render(
      <CScrollArea data-testid="scroll-area-corner-hidden">
        <div>Single-axis overflow</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll-area-scrollbar-vertical')).toBeInTheDocument();
      expect(screen.queryByTestId('scroll-area-scrollbar-horizontal')).not.toBeInTheDocument();
    });

    expect(screen.queryByTestId('scroll-area-scrollbar-corner')).not.toBeInTheDocument();
  });

  it('keeps theme anchoring and scrollbar classes available for themed scrollbars', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 400,
      scrollHeight: 400,
    });

    render(
      <CScrollArea data-testid="scroll-area-themed-scrollbars" theme="cm-theme--win98">
        <div>Themed overflow</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll-area-themed-scrollbars')).toHaveClass(
        'cm-scroll-area',
        'cm-theme--win98',
      );
      expect(screen.getByTestId('scroll-area-scrollbar-vertical-thumb')).toHaveClass(
        'cm-scroll-area__scrollbar-vertical-thumb',
      );
      expect(screen.getByTestId('scroll-area-scrollbar-horizontal-thumb')).toHaveClass(
        'cm-scroll-area__scrollbar-horizontal-thumb',
      );
    });
  });

  it('forwards onScroll exactly once per native viewport scroll event', () => {
    const handleScroll = jest.fn();

    render(
      <CScrollArea data-testid="scroll-area-single-forward" onScroll={handleScroll}>
        <div>Scrollable content</div>
      </CScrollArea>,
    );

    const viewport = getScrollAreaViewport('scroll-area-single-forward');

    fireEvent.scroll(viewport);
    fireEvent.scroll(viewport);

    expect(handleScroll).toHaveBeenCalledTimes(2);
  });

  it('suppresses horizontal custom scrollbar when overflowX is hidden', async () => {
    setScrollAreaMetrics({
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 400,
      scrollHeight: 100,
    });

    render(
      <CScrollArea data-testid="scroll-area-hidden-x-scroll" overflowX="hidden">
        <div>Oversized content</div>
      </CScrollArea>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('scroll-area-scrollbar-horizontal')).not.toBeInTheDocument();
    });
  });
});
