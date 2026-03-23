import { fireEvent } from '@testing-library/dom';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CScreen } from '../src/components/Screen/Screen';
import { CWindow } from '../src/components/Window/Window';
import { CWindowTitle } from '../src/components/Window/WindowTitle';
import { createSystemSessionFixture } from './helpers/systemSession.fixture';

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

describe('CScreen root scope', () => {
  it('renders one stable screen root wrapper around the grid', () => {
    const { container, getByTestId } = render(
      <CScreen>
        <div data-testid="screen-body">Screen body</div>
      </CScreen>,
    );

    const root = getByTestId('screen-root');
    const grid = root.firstElementChild;

    expect(container.querySelectorAll('[data-testid="screen-root"]')).toHaveLength(1);
    expect(grid).not.toBeNull();

    if (!grid) {
      throw new Error('Expected CGrid to render as the direct screen child.');
    }

    expect(root.childElementCount).toBe(1);
    expect(grid).toHaveClass('c-grid');
    expect(grid).toContainElement(getByTestId('screen-body'));
  });

  it('applies screen root classes and data attributes', () => {
    const session = createSystemSessionFixture({
      persistentStoreState: {
        className: 'cm-system--windows cm-theme--winxp screen-shell',
        screenClassName: 'screen-grid-scope',
        systemType: 'windows',
        theme: 'winxp',
      },
    });

    const { getByTestId } = render(
      <CScreen
        className={session.persistentStoreState.className}
        screenClassName={session.persistentStoreState.screenClassName}
        systemType={session.persistentStoreState.systemType}
        theme={session.persistentStoreState.theme}
      >
        <div data-testid="screen-body">Screen body</div>
      </CScreen>,
    );

    const root = getByTestId('screen-root');
    const grid = root.firstElementChild;

    expect(root).toHaveClass('cm-system--windows');
    expect(root).toHaveClass('cm-theme--winxp');
    expect(root).toHaveClass('screen-shell');
    expect(root).toHaveAttribute('data-system-type', 'windows');
    expect(root).toHaveAttribute('data-theme', 'winxp');
    expect(root.getAttribute('data-system-type')).toBe('windows');
    expect(root.getAttribute('data-theme')).toBe('winxp');
    expect(grid).not.toBeNull();

    if (!grid) {
      throw new Error('Expected CGrid to render as the direct screen child.');
    }

    expect(grid).toHaveClass('c-grid');
    expect(grid).toHaveClass('screen-grid-scope');
  });

  it('keeps window drag behavior intact', () => {
    const session = createSystemSessionFixture({
      persistentStoreState: {
        className: 'cm-system--windows cm-theme--default',
        systemType: 'windows',
        theme: 'default',
      },
      runtimeWindowSessionState: {
        title: 'Scope Safe Window',
        frame: {
          x: 32,
          y: 28,
          width: 332,
          height: 228,
        },
      },
    });

    const { getByTestId } = render(
      <CScreen
        className={session.persistentStoreState.className}
        screenClassName={session.persistentStoreState.screenClassName}
        systemType={session.persistentStoreState.systemType}
        theme={session.persistentStoreState.theme}
      >
        <CWindow
          x={session.runtimeWindowSessionState.frame.x}
          y={session.runtimeWindowSessionState.frame.y}
          width={session.runtimeWindowSessionState.frame.width}
          height={session.runtimeWindowSessionState.frame.height}
        >
          <CWindowTitle>{session.runtimeWindowSessionState.title}</CWindowTitle>
          {session.runtimeWindowSessionState.body}
        </CWindow>
      </CScreen>,
    );

    const root = getByTestId('screen-root');
    const frame = getByTestId('window-frame');
    const content = getByTestId('window-content');
    const title = getByTestId('window-title');
    const eastHandle = getByTestId('window-resize-e');
    const initialUuid = content.getAttribute('data-window-uuid');

    expect(root).toHaveAttribute('data-system-type', session.persistentStoreState.systemType);
    expect(root).toHaveAttribute('data-theme', session.persistentStoreState.theme);
    expect(title).toHaveTextContent('Scope Safe Window');
    expect(frame.style.left).toBe('32px');
    expect(frame.style.top).toBe('28px');
    expect(frame.style.width).toBe('332px');
    expect(frame.style.height).toBe('228px');

    dragPointer(title, {
      pointerId: 21,
      start: { x: 44, y: 38 },
      end: { x: 68, y: 61 },
    });

    expect(frame.style.left).toBe('56px');
    expect(frame.style.top).toBe('51px');
    expect(content.getAttribute('data-window-uuid')).toBe(initialUuid);

    dragPointer(eastHandle, {
      pointerId: 22,
      start: { x: 100, y: 100 },
      end: { x: 118, y: 100 },
    });

    expect(frame.style.left).toBe('56px');
    expect(frame.style.top).toBe('51px');
    expect(frame.style.width).toBe('350px');
    expect(frame.style.height).toBe('228px');
    expect(content.getAttribute('data-window-uuid')).toBe(initialUuid);
  });
});
