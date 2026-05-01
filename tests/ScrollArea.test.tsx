import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  CScrollArea as PackageEntryCScrollArea,
  CScrollBar as PackageEntryCScrollBar,
  type CScrollAreaProps,
} from '../src';
import { CScrollArea } from '../src/components/ScrollArea';
import { CScrollBar, type CScrollBarProps } from '../src/components/ScrollArea/ScrollBar';

function getRequiredDescendant(root: HTMLElement, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);

  if (!element) {
    throw new Error(`${selector} not found`);
  }

  return element;
}

function setElementRect(
  element: HTMLElement,
  rect: Pick<DOMRect, 'height' | 'left' | 'top' | 'width'>,
): void {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () =>
      ({
        bottom: rect.top + rect.height,
        height: rect.height,
        left: rect.left,
        right: rect.left + rect.width,
        top: rect.top,
        width: rect.width,
        x: rect.left,
        y: rect.top,
        toJSON: () => ({}),
      }) as DOMRect,
  });
}

function renderDirectScrollBar(overrides: Partial<CScrollBarProps> = {}): {
  readonly onScrollPositionChange: jest.Mock;
  readonly root: HTMLElement;
  readonly thumb: HTMLElement;
  readonly track: HTMLElement;
} {
  const onScrollPositionChange = jest.fn();
  const props: CScrollBarProps = {
    orientation: 'vertical',
    scrollSize: 400,
    viewportSize: 100,
    scrollPosition: 100,
    maxScrollPosition: 300,
    thumbSize: 20,
    thumbPosition: 20,
    visible: true,
    onScrollPositionChange,
    'data-testid': 'direct-scrollbar',
    ...overrides,
  };

  render(<CScrollBar {...props} />);

  const root = screen.getByTestId('direct-scrollbar');
  const track = getRequiredDescendant(root, '.cm-scroll-bar__track');
  const thumb = getRequiredDescendant(root, '.cm-scroll-bar__thumb');

  return { onScrollPositionChange, root, thumb, track };
}

function getScrollAreaContent(testId: string): HTMLElement {
  const root = screen.getByTestId(testId);
  const content = root.querySelector<HTMLElement>('[data-scroll-area-content="true"]');

  if (!content) {
    throw new Error('scroll area content not found');
  }

  return content;
}

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
    expect(root).toHaveClass('cm-scroll-area', 'cm-theme--default', 'custom-root');
    expect(content).toHaveClass('cm-scroll-area__content', 'custom-content');
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

    expect(root).toHaveStyle({ overflowX: 'hidden', overflowY: 'scroll' });
    expect(root).toHaveAttribute('tabindex', '0');
    expect(root).toHaveAttribute('aria-label', 'Notifications');
  });

  it('respects explicit tabIndex and forwards scroll events', () => {
    const handleScroll = jest.fn();

    render(
      <CScrollArea data-testid="scroll-area-scroll" onScroll={handleScroll} tabIndex={-1}>
        <div style={{ height: '480px' }}>Long content</div>
      </CScrollArea>,
    );

    const root = screen.getByTestId('scroll-area-scroll');

    fireEvent.scroll(root, { target: { scrollTop: 48 } });

    expect(root).toHaveAttribute('tabindex', '-1');
    expect(handleScroll).toHaveBeenCalledTimes(1);
  });

  it('removes default tab stop when both axes are hidden', () => {
    render(
      <CScrollArea data-testid="scroll-area-hidden" overflowX="hidden" overflowY="hidden">
        <div>Static content</div>
      </CScrollArea>,
    );

    expect(screen.getByTestId('scroll-area-hidden')).not.toHaveAttribute('tabindex');
  });

  describe('CScrollBar DOM scrollbar functionality', () => {
    it('exports CScrollBar from package entry', () => {
      expect(PackageEntryCScrollBar).toBe(CScrollBar);
    });

    it('native default: no .cm-scroll-bar elements when scrollBarComponent omitted', () => {
      render(
        <CScrollArea data-testid="scroll-area-native">
          <div>Content</div>
        </CScrollArea>,
      );

      const scrollBars = screen
        .getByTestId('scroll-area-native')
        .querySelectorAll('.cm-scroll-bar');
      expect(scrollBars).toHaveLength(0);
    });

    it('DOM mode: scrollbar elements rendered with scrollBarComponent={CScrollBar}', () => {
      render(
        <CScrollArea data-testid="scroll-area-dom" scrollBarComponent={CScrollBar}>
          <div>Content</div>
        </CScrollArea>,
      );

      const scrollBars = screen.getByTestId('scroll-area-dom').querySelectorAll('.cm-scroll-bar');
      expect(scrollBars.length).toBeGreaterThan(0);
    });

    it('DOM mode: injected scrollbar receives all required props for vertical orientation', () => {
      const MockScrollBar = jest.fn(() => (
        <div className="cm-scroll-bar" data-testid="mock-scrollbar" />
      ));

      render(
        <CScrollArea data-testid="scroll-area-vertical" scrollBarComponent={MockScrollBar}>
          <div style={{ height: '800px' }}>Long content</div>
        </CScrollArea>,
      );

      const root = screen.getByTestId('scroll-area-vertical');
      const viewport = root.querySelector<HTMLElement>('.cm-scroll-area__viewport');
      expect(viewport).not.toBeNull();

      Object.defineProperty(viewport!, 'scrollHeight', {
        value: 800,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(viewport!, 'clientHeight', {
        value: 200,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(viewport!, 'scrollTop', {
        value: 0,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(viewport!, 'scrollWidth', {
        value: 100,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(viewport!, 'clientWidth', {
        value: 100,
        writable: true,
        configurable: true,
      });

      fireEvent.scroll(viewport!);

      const verticalProps = MockScrollBar.mock.calls
        .filter((call) => call[0]?.orientation === 'vertical' && call[0]?.scrollSize > 0)
        .pop()?.[0];
      expect(verticalProps).toBeDefined();
      expect(verticalProps).toMatchObject({
        orientation: 'vertical',
        visible: expect.any(Boolean),
        onScrollPositionChange: expect.any(Function),
      });
      expect(verticalProps?.scrollSize).toBe(800);
      expect(verticalProps?.viewportSize).toBe(200);
      expect(verticalProps?.thumbSize).toBeGreaterThan(0);
    });

    it('DOM mode: injected scrollbar receives all required props for horizontal orientation', () => {
      const MockScrollBar = jest.fn(() => (
        <div className="cm-scroll-bar" data-testid="mock-scrollbar" />
      ));

      render(
        <CScrollArea
          data-testid="scroll-area-horizontal"
          scrollBarComponent={MockScrollBar}
          overflowY="hidden"
        >
          <div style={{ width: '800px' }}>Wide content</div>
        </CScrollArea>,
      );

      const root = screen.getByTestId('scroll-area-horizontal');
      const viewport = root.querySelector<HTMLElement>('.cm-scroll-area__viewport');
      expect(viewport).not.toBeNull();

      Object.defineProperty(viewport!, 'scrollWidth', {
        value: 800,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(viewport!, 'clientWidth', {
        value: 200,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(viewport!, 'scrollLeft', {
        value: 0,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(viewport!, 'scrollHeight', {
        value: 100,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(viewport!, 'clientHeight', {
        value: 100,
        writable: true,
        configurable: true,
      });

      fireEvent.scroll(viewport!);

      const horizontalProps = MockScrollBar.mock.calls
        .filter((call) => call[0]?.orientation === 'horizontal' && call[0]?.scrollSize > 0)
        .pop()?.[0];
      expect(horizontalProps).toBeDefined();
      expect(horizontalProps).toMatchObject({
        orientation: 'horizontal',
        visible: expect.any(Boolean),
        onScrollPositionChange: expect.any(Function),
      });
      expect(horizontalProps?.scrollSize).toBe(800);
      expect(horizontalProps?.viewportSize).toBe(200);
    });

    it('direct scrollbar clamps track clicks to the thumb travel range', () => {
      const { onScrollPositionChange, track } = renderDirectScrollBar();
      setElementRect(track, { height: 100, left: 0, top: 0, width: 10 });

      fireEvent.click(track, { clientY: 50 });
      expect(onScrollPositionChange).toHaveBeenLastCalledWith(150);

      fireEvent.click(track, { clientY: 200 });
      expect(onScrollPositionChange).toHaveBeenLastCalledWith(300);

      fireEvent.click(track, { clientY: -20 });
      expect(onScrollPositionChange).toHaveBeenLastCalledWith(0);
    });

    it('direct scrollbar clamps thumb drags to the thumb travel range', () => {
      const { onScrollPositionChange, thumb, track } = renderDirectScrollBar();
      setElementRect(track, { height: 100, left: 0, top: 0, width: 10 });

      fireEvent.mouseDown(thumb, { clientY: 10 });
      fireEvent.mouseMove(document, { clientY: 200 });
      expect(onScrollPositionChange).toHaveBeenLastCalledWith(300);

      fireEvent.mouseMove(document, { clientY: -100 });
      expect(onScrollPositionChange).toHaveBeenLastCalledWith(0);
      fireEvent.mouseUp(document);
    });

    it('direct scrollbar keeps zero-overflow interactions clamped to zero', () => {
      const { onScrollPositionChange, thumb, track } = renderDirectScrollBar({
        maxScrollPosition: 0,
        scrollPosition: 0,
        scrollSize: 100,
        thumbPosition: 0,
        thumbSize: 100,
        viewportSize: 100,
        visible: false,
      });
      setElementRect(track, { height: 100, left: 0, top: 0, width: 10 });

      fireEvent.click(track, { clientY: 50 });
      expect(onScrollPositionChange).toHaveBeenLastCalledWith(0);

      fireEvent.mouseDown(thumb, { clientY: 10 });
      fireEvent.mouseMove(document, { clientY: 80 });
      expect(onScrollPositionChange).toHaveBeenLastCalledWith(0);
      fireEvent.mouseUp(document);
    });

    it('direct scrollbar marks hidden axes as aria-hidden', () => {
      const { root } = renderDirectScrollBar({
        maxScrollPosition: 0,
        scrollPosition: 0,
        thumbPosition: 0,
        visible: false,
      });

      expect(root).toHaveAttribute('aria-hidden', 'true');
      expect(root).toHaveClass('cm-scroll-bar--hidden');
    });

    it('hidden axes do not render visible DOM scrollbars', () => {
      const MockScrollBar = jest.fn(() => (
        <div className="cm-scroll-bar" data-testid="mock-scrollbar" />
      ));

      render(
        <CScrollArea
          data-testid="scroll-area-hidden-axis"
          scrollBarComponent={MockScrollBar}
          overflowY="hidden"
        >
          <div style={{ width: '800px' }}>Wide content</div>
        </CScrollArea>,
      );

      const viewport = screen
        .getByTestId('scroll-area-hidden-axis')
        .querySelector<HTMLElement>('.cm-scroll-area__viewport');
      if (viewport) {
        Object.defineProperty(viewport, 'scrollWidth', { configurable: true, value: 800 });
        Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 200 });
        Object.defineProperty(viewport, 'scrollLeft', {
          configurable: true,
          value: 0,
          writable: true,
        });
        Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: 100 });
        Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 100 });
      }

      fireEvent.scroll(viewport!);

      const allScrollBars = screen
        .getByTestId('scroll-area-hidden-axis')
        .querySelectorAll('.cm-scroll-bar');
      expect(allScrollBars.length).toBe(1);
    });

    it('onScrollPositionChange updates scroll position', () => {
      const MockScrollBar = jest.fn(() => (
        <div className="cm-scroll-bar" data-testid="mock-scrollbar" />
      ));

      render(
        <CScrollArea data-testid="scroll-area-position" scrollBarComponent={MockScrollBar}>
          <div style={{ height: '800px' }}>Long content</div>
        </CScrollArea>,
      );

      const viewport = screen
        .getByTestId('scroll-area-position')
        .querySelector<HTMLElement>('.cm-scroll-area__viewport');

      if (viewport) {
        Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: 800 });
        Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 200 });
        Object.defineProperty(viewport, 'scrollTop', {
          configurable: true,
          value: 0,
          writable: true,
        });
        Object.defineProperty(viewport, 'scrollWidth', { configurable: true, value: 100 });
        Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 100 });
      }

      // Trigger measurement to get the scrollbar
      fireEvent.scroll(viewport!);

      const verticalProps = MockScrollBar.mock.calls.find(
        (call) => call[0]?.orientation === 'vertical',
      )?.[0];

      expect(verticalProps?.onScrollPositionChange).toBeDefined();
      act(() => {
        verticalProps?.onScrollPositionChange(300);
      });

      expect(viewport!.scrollTop).toBe(300);
    });

    it('zero-overflow case: visible=false', () => {
      const MockScrollBar = jest.fn(() => (
        <div className="cm-scroll-bar" data-testid="mock-scrollbar" />
      ));

      render(
        <CScrollArea data-testid="scroll-area-zero" scrollBarComponent={MockScrollBar}>
          <div style={{ height: '100px' }}>Short content</div>
        </CScrollArea>,
      );

      const viewport = screen
        .getByTestId('scroll-area-zero')
        .querySelector<HTMLElement>('.cm-scroll-area__viewport');
      if (viewport) {
        Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: 100 });
        Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 100 });
        Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 0 });
        Object.defineProperty(viewport, 'scrollWidth', { configurable: true, value: 100 });
        Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 100 });
      }

      fireEvent.scroll(viewport!);

      const verticalProps = MockScrollBar.mock.calls.find(
        (call) => call[0]?.orientation === 'vertical',
      )?.[0];
      expect(verticalProps?.visible).toBe(false);
    });

    it('DOM mode adds cm-scroll-area--dom-scrollbar class', () => {
      const MockScrollBar = jest.fn(() => <div className="cm-scroll-bar" />);

      render(
        <CScrollArea data-testid="scroll-area-dom-class" scrollBarComponent={MockScrollBar}>
          <div>Content</div>
        </CScrollArea>,
      );

      const root = screen.getByTestId('scroll-area-dom-class');
      expect(root).toHaveClass('cm-scroll-area--dom-scrollbar');
    });
  });
});
