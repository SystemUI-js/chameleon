import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import { act, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { Theme, type WindowTitleActionButtonPosition } from '../src';
import { CWindow } from '../src/components/Window/Window';
import { CWindowBody } from '../src/components/Window/WindowBody';
import { CWindowTitle } from '../src/components/Window/WindowTitle';
import {
  WidgetInteractionBehavior,
  WidgetPreviewSource,
  type WidgetPreviewRect,
} from '../src/components/Widget/Widget';

const setRect = (
  element: HTMLElement,
  rect: { width: number; height: number; left: number; top: number },
): void => {
  const domRect: DOMRect = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    left: rect.left,
    toJSON: () => '',
  } as DOMRect;

  Object.defineProperty(element, 'getBoundingClientRect', {
    value: () => domRect,
  });
};

const dragPointer = (
  target: HTMLElement,
  options: {
    pointerId: number;
    start: { x: number; y: number };
    end: { x: number; y: number };
  },
): void => {
  fireEvent.pointerDown(target, {
    pointerId: options.pointerId,
    button: 0,
    clientX: options.start.x,
    clientY: options.start.y,
  });

  fireEvent.pointerMove(document, {
    pointerId: options.pointerId,
    clientX: options.end.x,
    clientY: options.end.y,
  });

  fireEvent.pointerUp(document, {
    pointerId: options.pointerId,
    clientX: options.end.x,
    clientY: options.end.y,
  });
};

const getFrameMetrics = (
  frame: HTMLElement,
): { x: number; y: number; width: number; height: number } => ({
  x: Number.parseFloat(frame.style.left),
  y: Number.parseFloat(frame.style.top),
  width: Number.parseFloat(frame.style.width),
  height: Number.parseFloat(frame.style.height),
});

const readThemeStyles = (theme: 'default' | 'win98' | 'winxp'): string =>
  readFileSync(join(process.cwd(), 'src', 'theme', theme, 'styles', 'index.scss'), 'utf8');

class PreviewTestWindow extends CWindow {
  public setPreview(rect: WidgetPreviewRect) {
    this.setPreviewRect(rect, {
      source: WidgetPreviewSource.Move,
      behavior: WidgetInteractionBehavior.Outline,
      active: true,
    });
  }
}

describe('CWindow and CWindowTitle composition', () => {
  it('keeps default live behavior and does not render preview frame when behavior props are omitted', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow x={10} y={20} width={240} height={160}>
        <CWindowTitle>Default behavior</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();

    dragPointer(getByTestId('window-title'), {
      pointerId: 101,
      start: { x: 40, y: 40 },
      end: { x: 60, y: 65 },
    });

    expect(getFrameMetrics(frame)).toEqual({
      x: 30,
      y: 45,
      width: 240,
      height: 160,
    });
  });

  it('uses uuid from CWidget and keeps it stable across re-render', () => {
    const windowRef = React.createRef<CWindow>();
    const { rerender } = render(<CWindow ref={windowRef} />);

    const firstUuid = windowRef.current?.uuid;
    rerender(<CWindow ref={windowRef} />);
    const secondUuid = windowRef.current?.uuid;

    expect(firstUuid).toBeDefined();
    expect(secondUuid).toBe(firstUuid);
  });

  it('does not implicitly render CWindowTitle when consumer does not compose it', () => {
    const { queryByTestId } = render(
      <CWindow>
        <div data-testid="window-body">body</div>
      </CWindow>,
    );

    expect(queryByTestId('window-title')).not.toBeInTheDocument();
  });

  it('renders composed CWindowTitle content explicitly', () => {
    const { getByTestId } = render(
      <CWindow>
        <CWindowTitle>Composed Title</CWindowTitle>
      </CWindow>,
    );

    const title = getByTestId('window-title');
    const titleText = getByTestId('window-title-text');

    expect(title).toContainElement(titleText);
    expect(titleText).toHaveTextContent('Composed Title');
  });

  it('does not render title controls when actionButton is omitted', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow>
        <CWindowTitle>Backward compatible title</CWindowTitle>
      </CWindow>,
    );

    expect(getByTestId('window-title-text')).toHaveTextContent('Backward compatible title');
    expect(queryByTestId('window-title-controls')).not.toBeInTheDocument();
    expect(getByTestId('window-title')).not.toHaveClass('cm-window__title-bar--with-controls');
  });

  it('renders actionButton controls on the right by default', () => {
    const defaultActionButtonPosition: WindowTitleActionButtonPosition = 'right';
    const { getByTestId } = render(
      <CWindow>
        <CWindowTitle
          actionButton={
            <button type="button" data-testid="window-title-control-action">
              ×
            </button>
          }
        >
          Title with controls
        </CWindowTitle>
      </CWindow>,
    );

    const title = getByTestId('window-title');
    const titleText = getByTestId('window-title-text');
    const controls = getByTestId('window-title-controls');

    expect(defaultActionButtonPosition).toBe('right');
    expect(title).toHaveClass('cm-window__title-bar', 'cm-window__title-bar--with-controls');
    expect(controls).toHaveClass(
      'cm-window__title-bar__controls',
      'cm-window__title-bar__controls--right',
    );
    expect(title.firstElementChild).toBe(titleText);
    expect(title.lastElementChild).toBe(controls);
  });

  it('renders actionButton controls before the title when position is left', () => {
    const { getByTestId } = render(
      <CWindow>
        <CWindowTitle
          actionButton={
            <button type="button" data-testid="window-title-control-left">
              —
            </button>
          }
          actionButtonPosition="left"
        >
          Left controls
        </CWindowTitle>
      </CWindow>,
    );

    const title = getByTestId('window-title');
    const titleText = getByTestId('window-title-text');
    const controls = getByTestId('window-title-controls');

    expect(controls).toHaveClass(
      'cm-window__title-bar__controls',
      'cm-window__title-bar__controls--left',
    );
    expect(title.firstElementChild).toBe(controls);
    expect(title.lastElementChild).toBe(titleText);
  });

  it('renders composed CWindowBody explicitly and lets callers extend styling with className', () => {
    const { getByTestId } = render(
      <CWindow>
        <CWindowTitle>Body host</CWindowTitle>
        <CWindowBody className="window-body-custom window-body-padded">body content</CWindowBody>
      </CWindow>,
    );

    const body = getByTestId('window-body');

    expect(body).toHaveClass('cm-window__body');
    expect(body).toHaveClass('window-body-custom');
    expect(body).toHaveClass('window-body-padded');
    expect(body).toHaveTextContent('body content');
  });

  it('inherits theme for title and body while keeping base classes', () => {
    const { getByTestId } = render(
      <Theme name="cm-theme--retro">
        <CWindow>
          <CWindowTitle>Theme Title</CWindowTitle>
          <CWindowBody>Theme Body</CWindowBody>
        </CWindow>
      </Theme>,
    );

    expect(getByTestId('window-title')).toHaveClass('cm-window__title-bar', 'cm-theme--retro');
    expect(getByTestId('window-body')).toHaveClass('cm-window__body', 'cm-theme--retro');
  });

  it('prefers explicit theme over provider theme for title and body', () => {
    const { getByTestId } = render(
      <Theme name="cm-theme--retro">
        <CWindow>
          <CWindowTitle theme="cm-theme--xp">Theme Title</CWindowTitle>
          <CWindowBody theme="cm-theme--classic">Theme Body</CWindowBody>
        </CWindow>
      </Theme>,
    );

    expect(getByTestId('window-title')).toHaveClass('cm-window__title-bar', 'cm-theme--xp');
    expect(getByTestId('window-title')).not.toHaveClass('cm-theme--retro');
    expect(getByTestId('window-body')).toHaveClass('cm-window__body', 'cm-theme--classic');
    expect(getByTestId('window-body')).not.toHaveClass('cm-theme--retro');
  });

  it('keeps window title theme selectors self-scoped in theme styles', () => {
    expect(readThemeStyles('win98')).toContain('&.cm-window__title-bar');
    expect(readThemeStyles('win98')).toContain('&.cm-window-preview-frame');
    expect(readThemeStyles('winxp')).toContain('&.cm-window__title-bar');
    expect(readThemeStyles('winxp')).toContain('&.cm-window-preview-frame');
    expect(readThemeStyles('default')).toContain('&.cm-window__title-bar');
    expect(readThemeStyles('default')).toContain('&.cm-window-preview-frame');
  });

  it('keeps the outer frame absolute and places resize handles in an inner wrapper', () => {
    const { getByTestId } = render(
      <CWindow x={10} y={20} width={240} height={160}>
        <CWindowTitle>Layered</CWindowTitle>
        <div data-testid="window-body">body</div>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const inner = getByTestId('window-inner');
    const content = getByTestId('window-content');
    const eastHandle = getByTestId('window-resize-e');

    expect(frame.style.position).toBe('absolute');
    expect(inner).toHaveClass('cm-window__inner');
    expect(frame.firstElementChild).toBe(inner);
    expect(inner).toContainElement(content);
    expect(inner).toContainElement(eastHandle);
    expect(content).not.toContainElement(eastHandle);
  });

  it('inherits theme from provider on frame and content roots', () => {
    const { getByTestId } = render(
      <Theme name="cm-theme--win98">
        <CWindow>
          <CWindowTitle>Themed</CWindowTitle>
          <div data-testid="window-body">body</div>
        </CWindow>
      </Theme>,
    );

    const frame = getByTestId('window-frame');
    const content = getByTestId('window-content');

    expect(frame).toHaveClass('cm-theme--win98');
    expect(content).toHaveClass('cm-theme--win98');
  });

  it('prefers explicit window theme over provider theme', () => {
    const { getByTestId } = render(
      <Theme name="cm-theme--win98">
        <CWindow theme="cm-theme--winxp">
          <CWindowTitle>Override</CWindowTitle>
        </CWindow>
      </Theme>,
    );

    const frame = getByTestId('window-frame');
    const content = getByTestId('window-content');

    expect(frame).toHaveClass('cm-theme--winxp');
    expect(content).toHaveClass('cm-theme--winxp');
    expect(frame).not.toHaveClass('cm-theme--win98');
    expect(content).not.toHaveClass('cm-theme--win98');
  });

  it('moves window frame when dragging title bar', () => {
    const { getByTestId } = render(
      <CWindow x={10} y={20} width={240} height={160}>
        <CWindowTitle theme="cm-theme--xp">Draggable</CWindowTitle>
        <div data-testid="window-body">body</div>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const title = getByTestId('window-title');

    setRect(frame, { width: 240, height: 160, left: 10, top: 20 });

    dragPointer(title, {
      pointerId: 1,
      start: { x: 50, y: 50 },
      end: { x: 70, y: 90 },
    });

    expect(frame.style.left).toBe('30px');
    expect(frame.style.top).toBe('60px');
    expect(title).toHaveClass('cm-window__title-bar', 'cm-theme--xp');
  });

  it('does not start title drag when pointer interaction begins inside controls', () => {
    const onPointerDown = jest.fn();
    const onPointerCancel = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <CWindow
        x={10}
        y={20}
        width={240}
        height={160}
        moveBehavior={WidgetInteractionBehavior.Outline}
      >
        <CWindowTitle
          actionButton={
            <button
              type="button"
              data-testid="window-title-control-guarded"
              onPointerDown={onPointerDown}
              onPointerCancel={onPointerCancel}
            >
              □
            </button>
          }
        >
          Guarded controls
        </CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const control = getByTestId('window-title-control-guarded');
    const title = getByTestId('window-title');

    dragPointer(control, {
      pointerId: 106,
      start: { x: 40, y: 40 },
      end: { x: 80, y: 70 },
    });

    fireEvent.pointerCancel(control, {
      pointerId: 106,
      clientX: 80,
      clientY: 70,
    });

    expect(getFrameMetrics(frame)).toEqual({
      x: 10,
      y: 20,
      width: 240,
      height: 160,
    });
    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
    expect(title).toHaveAttribute('data-testid', 'window-title');
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(onPointerCancel).toHaveBeenCalledTimes(1);
  });

  it('threads moveBehavior into composed window titles and keeps live move behavior unchanged', () => {
    const receivedMoveBehaviors: Array<WidgetInteractionBehavior | undefined> = [];

    class InspectableWindowTitle extends CWindowTitle {
      public override render(): React.ReactElement {
        receivedMoveBehaviors.push(this.props.moveBehavior);
        return super.render();
      }
    }

    const { getByTestId, queryByTestId } = render(
      <CWindow
        x={10}
        y={20}
        width={240}
        height={160}
        moveBehavior={WidgetInteractionBehavior.Outline}
        resizeBehavior={WidgetInteractionBehavior.Outline}
      >
        <InspectableWindowTitle>Threaded behavior</InspectableWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');

    expect(receivedMoveBehaviors).toContain(WidgetInteractionBehavior.Outline);
    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();

    dragPointer(getByTestId('window-title'), {
      pointerId: 102,
      start: { x: 30, y: 30 },
      end: { x: 55, y: 50 },
    });

    expect(getFrameMetrics(frame)).toEqual({
      x: 35,
      y: 40,
      width: 240,
      height: 160,
    });
  });

  it('keeps real frame fixed and renders preview only during outline title drag until release', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow
        x={10}
        y={20}
        width={240}
        height={160}
        moveBehavior={WidgetInteractionBehavior.Outline}
      >
        <CWindowTitle>Outline drag</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const title = getByTestId('window-title');

    fireEvent.pointerDown(title, {
      pointerId: 103,
      button: 0,
      clientX: 50,
      clientY: 40,
    });

    fireEvent.pointerMove(document, {
      pointerId: 103,
      clientX: 70,
      clientY: 70,
    });

    expect(getFrameMetrics(frame)).toEqual({
      x: 10,
      y: 20,
      width: 240,
      height: 160,
    });

    const previewFrame = queryByTestId('window-preview-frame');
    expect(previewFrame).toBeInTheDocument();
    expect(previewFrame).toHaveStyle({
      left: '30px',
      top: '50px',
      width: '240px',
      height: '160px',
    });

    fireEvent.pointerUp(document, {
      pointerId: 103,
      clientX: 70,
      clientY: 70,
    });

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
    expect(getFrameMetrics(frame)).toEqual({
      x: 30,
      y: 50,
      width: 240,
      height: 160,
    });
  });

  it.each([['cm-theme--win98'], ['cm-theme--winxp']] as const)(
    'adds %s to outline preview frame before commit',
    (themeClass) => {
      const { getByTestId, queryByTestId } = render(
        <CWindow
          x={10}
          y={20}
          width={240}
          height={160}
          theme={themeClass}
          moveBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Outline themed preview</CWindowTitle>
        </CWindow>,
      );

      const title = getByTestId('window-title');

      expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();

      fireEvent.pointerDown(title, {
        pointerId: themeClass === 'cm-theme--win98' ? 201 : 202,
        button: 0,
        clientX: 50,
        clientY: 40,
      });

      fireEvent.pointerMove(document, {
        pointerId: themeClass === 'cm-theme--win98' ? 201 : 202,
        clientX: 72,
        clientY: 68,
      });

      const previewFrame = getByTestId('window-preview-frame');

      expect(previewFrame).toHaveClass('cm-window-preview-frame', themeClass);
      expect(previewFrame).not.toHaveClass('cm-theme--default');
    },
  );

  it('does not commit or render preview on zero-delta outline release', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow
        x={10}
        y={20}
        width={240}
        height={160}
        moveBehavior={WidgetInteractionBehavior.Outline}
      >
        <CWindowTitle>Zero delta</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const title = getByTestId('window-title');

    fireEvent.pointerDown(title, {
      pointerId: 104,
      button: 0,
      clientX: 45,
      clientY: 45,
    });

    fireEvent.pointerUp(document, {
      pointerId: 104,
      clientX: 45,
      clientY: 45,
    });

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
    expect(getFrameMetrics(frame)).toEqual({
      x: 10,
      y: 20,
      width: 240,
      height: 160,
    });
  });

  it('clears outline move preview and suppresses commit on pointer cancel', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow
        x={10}
        y={20}
        width={240}
        height={160}
        moveBehavior={WidgetInteractionBehavior.Outline}
      >
        <CWindowTitle>Cancelled outline move</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const title = getByTestId('window-title');

    fireEvent.pointerDown(title, {
      pointerId: 105,
      button: 0,
      clientX: 50,
      clientY: 40,
    });

    fireEvent.pointerMove(document, {
      pointerId: 105,
      clientX: 80,
      clientY: 70,
    });

    expect(queryByTestId('window-preview-frame')).toHaveStyle({
      left: '40px',
      top: '50px',
      width: '240px',
      height: '160px',
    });

    fireEvent.pointerCancel(title, {
      pointerId: 105,
      clientX: 80,
      clientY: 70,
    });

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
    expect(getFrameMetrics(frame)).toEqual({
      x: 10,
      y: 20,
      width: 240,
      height: 160,
    });

    fireEvent.pointerUp(document, {
      pointerId: 105,
      clientX: 80,
      clientY: 70,
    });

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
    expect(getFrameMetrics(frame)).toEqual({
      x: 10,
      y: 20,
      width: 240,
      height: 160,
    });
  });

  it('does not move window when dragging content area even when outline move is enabled', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow x={15} y={25} moveBehavior={WidgetInteractionBehavior.Outline}>
        <CWindowTitle>Title</CWindowTitle>
        <div data-testid="window-body">body</div>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const body = getByTestId('window-body');

    dragPointer(body, {
      pointerId: 2,
      start: { x: 40, y: 40 },
      end: { x: 80, y: 80 },
    });

    expect(frame.style.left).toBe('15px');
    expect(frame.style.top).toBe('25px');
    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
  });

  it('tears down an active outline title drag safely on unmount without leaking preview', () => {
    const { getByTestId, queryByTestId, unmount } = render(
      <CWindow
        x={15}
        y={25}
        width={240}
        height={160}
        moveBehavior={WidgetInteractionBehavior.Outline}
      >
        <CWindowTitle>Unmount safety</CWindowTitle>
      </CWindow>,
    );

    const title = getByTestId('window-title');

    fireEvent.pointerDown(title, {
      pointerId: 17,
      button: 0,
      clientX: 40,
      clientY: 40,
    });

    fireEvent.pointerMove(document, {
      pointerId: 17,
      clientX: 75,
      clientY: 95,
    });

    expect(queryByTestId('window-preview-frame')).toBeInTheDocument();

    unmount();

    expect(document.querySelector('[data-testid="window-preview-frame"]')).not.toBeInTheDocument();

    expect(() => {
      fireEvent.pointerMove(document, {
        pointerId: 17,
        clientX: 75,
        clientY: 95,
      });

      fireEvent.pointerUp(document, {
        pointerId: 17,
        clientX: 75,
        clientY: 95,
      });
    }).not.toThrow();
  });

  it.each([
    { direction: 'e', delta: { x: 20, y: 0 }, expected: { x: 10, y: 20, width: 260, height: 160 } },
    {
      direction: 'w',
      delta: { x: -20, y: 0 },
      expected: { x: -10, y: 20, width: 260, height: 160 },
    },
    {
      direction: 'n',
      delta: { x: 0, y: -10 },
      expected: { x: 10, y: 10, width: 240, height: 170 },
    },
    { direction: 's', delta: { x: 0, y: 10 }, expected: { x: 10, y: 20, width: 240, height: 170 } },
    {
      direction: 'ne',
      delta: { x: 20, y: -10 },
      expected: { x: 10, y: 10, width: 260, height: 170 },
    },
    {
      direction: 'nw',
      delta: { x: -20, y: -10 },
      expected: { x: -10, y: 10, width: 260, height: 170 },
    },
    {
      direction: 'se',
      delta: { x: 20, y: 10 },
      expected: { x: 10, y: 20, width: 260, height: 170 },
    },
    {
      direction: 'sw',
      delta: { x: -20, y: 10 },
      expected: { x: -10, y: 20, width: 260, height: 170 },
    },
  ])(
    'resizes window from %s handle with anchor-preserving behavior',
    ({ direction, delta, expected }) => {
      const { getByTestId } = render(
        <CWindow x={10} y={20} width={240} height={160}>
          <CWindowTitle>Resizable</CWindowTitle>
          <div data-testid="window-body">body</div>
        </CWindow>,
      );

      const frame = getByTestId('window-frame');
      const handle = getByTestId(`window-resize-${direction}`);

      dragPointer(handle, {
        pointerId: 10,
        start: { x: 100, y: 100 },
        end: { x: 100 + delta.x, y: 100 + delta.y },
      });

      expect(getFrameMetrics(frame)).toEqual(expected);
    },
  );

  it('keeps committed frame stable and renders resize preview only until outline resize release', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow
        x={10}
        y={20}
        width={240}
        height={160}
        resizeBehavior={WidgetInteractionBehavior.Outline}
      >
        <CWindowTitle>Outline resize</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const eastHandle = getByTestId('window-resize-e');

    fireEvent.pointerDown(eastHandle, {
      pointerId: 301,
      button: 0,
      clientX: 250,
      clientY: 100,
    });

    fireEvent.pointerMove(document, {
      pointerId: 301,
      clientX: 290,
      clientY: 100,
    });

    expect(getFrameMetrics(frame)).toEqual({
      x: 10,
      y: 20,
      width: 240,
      height: 160,
    });

    expect(queryByTestId('window-preview-frame')).toHaveStyle({
      left: '10px',
      top: '20px',
      width: '280px',
      height: '160px',
    });

    fireEvent.pointerUp(document, {
      pointerId: 301,
      clientX: 290,
      clientY: 100,
    });

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
    expect(getFrameMetrics(frame)).toEqual({
      x: 10,
      y: 20,
      width: 280,
      height: 160,
    });
  });

  it('applies resize clamp during outline preview before release commit', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow
        x={30}
        y={40}
        width={40}
        height={30}
        resizeBehavior={WidgetInteractionBehavior.Outline}
        resizeOptions={{
          minContentWidth: 20,
          minContentHeight: 10,
          maxContentWidth: 50,
          maxContentHeight: 60,
        }}
      >
        <CWindowTitle>Outline clamp</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const eastHandle = getByTestId('window-resize-e');

    fireEvent.pointerDown(eastHandle, {
      pointerId: 302,
      button: 0,
      clientX: 70,
      clientY: 55,
    });

    fireEvent.pointerMove(document, {
      pointerId: 302,
      clientX: 170,
      clientY: 55,
    });

    expect(getFrameMetrics(frame)).toEqual({
      x: 30,
      y: 40,
      width: 40,
      height: 30,
    });

    expect(queryByTestId('window-preview-frame')).toHaveStyle({
      left: '30px',
      top: '40px',
      width: '50px',
      height: '30px',
    });

    fireEvent.pointerUp(document, {
      pointerId: 302,
      clientX: 170,
      clientY: 55,
    });

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
    expect(getFrameMetrics(frame)).toEqual({
      x: 30,
      y: 40,
      width: 50,
      height: 30,
    });
  });

  it('does not commit or render resize preview on zero-delta outline resize release', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow
        x={10}
        y={20}
        width={240}
        height={160}
        resizeBehavior={WidgetInteractionBehavior.Outline}
      >
        <CWindowTitle>Zero delta resize</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const eastHandle = getByTestId('window-resize-e');

    fireEvent.pointerDown(eastHandle, {
      pointerId: 303,
      button: 0,
      clientX: 250,
      clientY: 100,
    });

    fireEvent.pointerUp(document, {
      pointerId: 303,
      clientX: 250,
      clientY: 100,
    });

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
    expect(getFrameMetrics(frame)).toEqual({
      x: 10,
      y: 20,
      width: 240,
      height: 160,
    });
  });

  it('clears outline resize preview and suppresses commit on pointer cancel', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow
        x={10}
        y={20}
        width={240}
        height={160}
        resizeBehavior={WidgetInteractionBehavior.Outline}
      >
        <CWindowTitle>Cancelled outline resize</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const eastHandle = getByTestId('window-resize-e');

    fireEvent.pointerDown(eastHandle, {
      pointerId: 305,
      button: 0,
      clientX: 250,
      clientY: 100,
    });

    fireEvent.pointerMove(document, {
      pointerId: 305,
      clientX: 290,
      clientY: 100,
    });

    expect(queryByTestId('window-preview-frame')).toHaveStyle({
      left: '10px',
      top: '20px',
      width: '280px',
      height: '160px',
    });

    fireEvent.pointerCancel(eastHandle, {
      pointerId: 305,
      clientX: 290,
      clientY: 100,
    });

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
    expect(getFrameMetrics(frame)).toEqual({
      x: 10,
      y: 20,
      width: 240,
      height: 160,
    });

    fireEvent.pointerUp(document, {
      pointerId: 305,
      clientX: 290,
      clientY: 100,
    });

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
    expect(getFrameMetrics(frame)).toEqual({
      x: 10,
      y: 20,
      width: 240,
      height: 160,
    });
  });

  it('disables resize when resizable is false and never creates a resize preview', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow
        x={12}
        y={24}
        width={200}
        height={120}
        resizable={false}
        resizeBehavior={WidgetInteractionBehavior.Outline}
      >
        <CWindowTitle>Drag only</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');
    const title = getByTestId('window-title');

    expect(queryByTestId('window-resize-e')).not.toBeInTheDocument();

    dragPointer(title, {
      pointerId: 11,
      start: { x: 60, y: 60 },
      end: { x: 90, y: 100 },
    });

    expect(frame.style.left).toBe('42px');
    expect(frame.style.top).toBe('64px');
    expect(frame.style.width).toBe('200px');
    expect(frame.style.height).toBe('120px');
    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
  });

  it('applies default edgeWidth as 4px when omitted', () => {
    const { getByTestId } = render(
      <CWindow x={0} y={0} width={100} height={100}>
        <CWindowTitle>Default edges</CWindowTitle>
      </CWindow>,
    );

    const northHandle = getByTestId('window-resize-n');
    const eastHandle = getByTestId('window-resize-e');

    expect(northHandle.style.height).toBe('4px');
    expect(northHandle.style.top).toBe('-2px');
    expect(northHandle.style.left).toBe('2px');
    expect(eastHandle.style.width).toBe('4px');
    expect(eastHandle.style.right).toBe('-2px');
  });

  it('applies custom edgeWidth from resizeOptions', () => {
    const { getByTestId } = render(
      <CWindow x={0} y={0} width={100} height={100} resizeOptions={{ edgeWidth: 12 }}>
        <CWindowTitle>Custom edges</CWindowTitle>
      </CWindow>,
    );

    const northHandle = getByTestId('window-resize-n');
    const eastHandle = getByTestId('window-resize-e');

    expect(northHandle.style.height).toBe('12px');
    expect(northHandle.style.top).toBe('-6px');
    expect(northHandle.style.left).toBe('6px');
    expect(eastHandle.style.width).toBe('12px');
    expect(eastHandle.style.right).toBe('-6px');
  });

  it('clamps min size to default 1px when shrinking past zero', () => {
    const { getByTestId } = render(
      <CWindow x={30} y={30} width={40} height={30}>
        <CWindowTitle>Clamp min</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');

    dragPointer(getByTestId('window-resize-e'), {
      pointerId: 12,
      start: { x: 60, y: 50 },
      end: { x: 0, y: 50 },
    });
    dragPointer(getByTestId('window-resize-s'), {
      pointerId: 13,
      start: { x: 60, y: 50 },
      end: { x: 60, y: -20 },
    });

    const metrics = getFrameMetrics(frame);
    expect(metrics.width).toBe(1);
    expect(metrics.height).toBe(1);
  });

  it('clamps max size and keeps anchor for west/north directions', () => {
    const { getByTestId } = render(
      <CWindow
        x={50}
        y={60}
        width={120}
        height={100}
        resizeOptions={{
          minContentWidth: 20,
          minContentHeight: 30,
          maxContentWidth: 150,
          maxContentHeight: 110,
        }}
      >
        <CWindowTitle>Clamp max</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');

    dragPointer(getByTestId('window-resize-e'), {
      pointerId: 14,
      start: { x: 160, y: 120 },
      end: { x: 260, y: 120 },
    });

    dragPointer(getByTestId('window-resize-nw'), {
      pointerId: 15,
      start: { x: 50, y: 60 },
      end: { x: -20, y: -20 },
    });

    const metrics = getFrameMetrics(frame);
    expect(metrics.width).toBe(150);
    expect(metrics.height).toBe(110);
    expect(metrics.x).toBe(50);
    expect(metrics.y).toBe(50);
  });

  it('keeps title drag behavior independent from resize interactions', () => {
    const { getByTestId } = render(
      <CWindow x={20} y={30} width={200} height={120}>
        <CWindowTitle>Independent interaction</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');

    dragPointer(getByTestId('window-title'), {
      pointerId: 16,
      start: { x: 80, y: 45 },
      end: { x: 120, y: 75 },
    });

    const metrics = getFrameMetrics(frame);
    expect(metrics.x).toBe(60);
    expect(metrics.y).toBe(60);
    expect(metrics.width).toBe(200);
    expect(metrics.height).toBe(120);
  });

  it('tears down an active outline resize safely on unmount without leaking preview', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      const { getByTestId, queryByTestId, unmount } = render(
        <CWindow
          x={15}
          y={25}
          width={240}
          height={160}
          resizeBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Resize unmount safety</CWindowTitle>
        </CWindow>,
      );

      const eastHandle = getByTestId('window-resize-e');

      fireEvent.pointerDown(eastHandle, {
        pointerId: 304,
        button: 0,
        clientX: 255,
        clientY: 100,
      });

      fireEvent.pointerMove(document, {
        pointerId: 304,
        clientX: 295,
        clientY: 100,
      });

      expect(queryByTestId('window-preview-frame')).toBeInTheDocument();

      unmount();

      expect(
        document.querySelector('[data-testid="window-preview-frame"]'),
      ).not.toBeInTheDocument();

      expect(() => {
        fireEvent.pointerMove(document, {
          pointerId: 304,
          clientX: 295,
          clientY: 100,
        });

        fireEvent.pointerUp(document, {
          pointerId: 304,
          clientX: 295,
          clientY: 100,
        });
      }).not.toThrow();

      expect(consoleError.mock.calls.flat().join(' ')).not.toContain(
        "Can't perform a React state update on an unmounted component",
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it('renders preview frame when preview is active with outline behavior while real frame remains', () => {
    const windowRef = React.createRef<PreviewTestWindow>();
    const { queryByTestId } = render(
      <PreviewTestWindow ref={windowRef} x={10} y={20} width={240} height={160}>
        <CWindowTitle>Preview test</CWindowTitle>
      </PreviewTestWindow>,
    );

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();

    act(() => {
      windowRef.current?.setPreview({ x: 50, y: 60, width: 280, height: 180 });
    });

    const previewFrame = queryByTestId('window-preview-frame');
    expect(previewFrame).toBeInTheDocument();
    expect(previewFrame).toHaveClass('cm-window-preview-frame');
    expect(previewFrame).toHaveStyle({
      left: '50px',
      top: '60px',
      width: '280px',
      height: '180px',
      zIndex: '2',
      pointerEvents: 'none',
    });
    expect(previewFrame?.previousElementSibling).toHaveAttribute('data-testid', 'window-frame');
  });

  it('does not render preview frame in default live mode even after drag interaction', () => {
    const { getByTestId, queryByTestId } = render(
      <CWindow x={10} y={20} width={240} height={160}>
        <CWindowTitle>Live mode no preview</CWindowTitle>
      </CWindow>,
    );

    const frame = getByTestId('window-frame');

    dragPointer(getByTestId('window-title'), {
      pointerId: 201,
      start: { x: 40, y: 40 },
      end: { x: 60, y: 65 },
    });

    expect(queryByTestId('window-preview-frame')).not.toBeInTheDocument();
    expect(getFrameMetrics(frame)).toEqual({
      x: 30,
      y: 45,
      width: 240,
      height: 160,
    });
  });

  it('preview frame has dedicated className for theme styling', () => {
    const windowRef = React.createRef<PreviewTestWindow>();
    render(
      <PreviewTestWindow ref={windowRef} x={10} y={20} width={240} height={160}>
        <CWindowTitle>Styled preview</CWindowTitle>
      </PreviewTestWindow>,
    );

    act(() => {
      windowRef.current?.setPreview({ x: 50, y: 60, width: 280, height: 180 });
    });

    const previewFrame = document.querySelector('.cm-window-preview-frame');
    expect(previewFrame).toBeInTheDocument();
    expect(previewFrame).toHaveClass('cm-window-preview-frame');
    expect(previewFrame).not.toHaveClass('cm-window-frame');
  });
});
