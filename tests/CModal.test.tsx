import '@testing-library/jest-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render } from '@testing-library/react';
import type React from 'react';
import { CModal, type CModalProps } from '../src/components/Modal';

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

const mockDragInstances: MockDragInstance[] = [];

jest.mock('@system-ui-js/multi-drag', () => {
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
      if (this.disabled) return;
      this.options.setPose?.(this.element, { position });
    }

    public end(position: { x: number; y: number }): void {
      if (this.disabled) return;
      this.options.setPoseOnEnd?.(this.element, { position });
    }
  }

  return {
    __esModule: true,
    Drag: MockDrag,
  };
});

/* jsdom 未提供 react-dom/server.browser 需要的 MessageChannel / TextEncoder。
 * 这里使用 node 端口（server.node.js）以避免浏览器构建产物的全局依赖。
 * 必须在文件顶层 require，而不是 import，以保证 polyfill 顺序。 */
if (typeof (globalThis as { TextEncoder?: unknown }).TextEncoder === 'undefined') {
  /* eslint-disable-next-line @typescript-eslint/no-require-imports -- polyfill 必须用 require */
  const { TextEncoder, TextDecoder } = require('node:util') as typeof import('node:util');
  (globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
  (globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;
}
if (typeof (globalThis as { MessageChannel?: unknown }).MessageChannel === 'undefined') {
  class FakeMessageChannel {
    public readonly port1 = { postMessage: () => undefined, onmessage: null };
    public readonly port2 = { postMessage: () => undefined, onmessage: null };
  }
  (globalThis as unknown as { MessageChannel: typeof FakeMessageChannel }).MessageChannel =
    FakeMessageChannel;
}

/* eslint-disable-next-line @typescript-eslint/no-require-imports -- 受 polyfill 顺序约束需在 polyfill 之后 require */
const { renderToString } = require('react-dom/server') as typeof import('react-dom/server');

/**
 * 在 document.body 上查询第一个 .cm-modal 节点（portal 容器）。
 * 注意：CModal 每个实例会创建独立的 portal 容器并挂载到 body。
 */
function queryModalRoot(): HTMLElement | null {
  return document.body.querySelector('.cm-modal');
}

function queryAllModalRoots(): readonly HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.cm-modal'));
}

describe('CModal', () => {
  beforeEach(() => {
    mockDragInstances.length = 0;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
  });

  /* ── 渲染条件 ── */

  it('returns null portal output when open=false', () => {
    const { container } = render(
      <CModal open={false} onClose={() => undefined} data-testid="m1">
        body
      </CModal>,
    );

    /* 既不在组件输出树里，也不在 body 上 */
    expect(container.querySelector('.cm-modal')).toBeNull();
    expect(queryModalRoot()).toBeNull();
  });

  it('portals to document.body when open=true', () => {
    render(
      <CModal open onClose={() => undefined} title="Hello" data-testid="m1">
        body content
      </CModal>,
    );

    const root = queryModalRoot();
    expect(root).not.toBeNull();
    expect(root?.parentElement).toBe(document.body);
    expect(root).toHaveClass('cm-modal', 'cm-modal--open');
    expect(root?.querySelector('.cm-modal__mask')).not.toBeNull();
    expect(root?.querySelector('.cm-modal__content')).not.toBeNull();
    expect(root?.querySelector('.cm-modal__window-host')).not.toBeNull();
  });

  /* ── 窗口居中（Centering） ──
   * 关键回归：CWindow 总是以 `position: absolute; left: 0; top: 0` 作为内联样式渲染，
   * 这会导致窗口左上角钉在 .cm-modal__content（已经 flex 居中）的中心点，
   * 而不是窗口本身的几何中心。
   * 修复方式：在 Modal 作用域内通过 SCSS 覆盖 .cm-window-frame 的定位为 static，
   * 让 flex 父容器 .cm-modal__content 自然居中窗口的“盒子本身”。
   * 由于 jsdom 不解析外部 SCSS（jest moduleNameMapper 用 identity-obj-proxy 桩掉了），
   * 我们直接对源文件做契约级断言，证明覆盖规则存在；几何效果由 Playwright 与人工 QA 验证。
   */
  it('SCSS source contains Modal-scoped override that neutralizes CWindow absolute positioning', () => {
    const scssPath = resolve(__dirname, '../src/components/Modal/index.scss');
    const css = readFileSync(scssPath, 'utf8');

    /* 必须有作用域选择器，且必须把 position/left/top 三者全部归零，
     * 否则居中只对了一半，inline `left: 0; top: 0` 仍会生效。 */
    expect(css).toMatch(
      /\.cm-modal(?::not\(\.cm-modal--draggable\))?\s+\.cm-window-frame\s*\{[^}]*position\s*:\s*static\s*!important[^}]*\}/,
    );
    expect(css).toMatch(
      /\.cm-modal(?::not\(\.cm-modal--draggable\))?\s+\.cm-window-frame\s*\{[^}]*left\s*:\s*auto\s*!important[^}]*\}/,
    );
    expect(css).toMatch(
      /\.cm-modal(?::not\(\.cm-modal--draggable\))?\s+\.cm-window-frame\s*\{[^}]*top\s*:\s*auto\s*!important[^}]*\}/,
    );
  });

  /* F3 real-browser QA regression — Issue 1 BLOCKER.
   * CWidget.renderFrame writes inline `height: <number>px` from the height prop,
   * and CModal passes `cWindowHeight = 0` for the default (unspecified-height) case.
   * Without a Modal-scoped `height: auto !important` override the frame collapses
   * to 0px and the modal becomes invisible in real browsers. jsdom never proved
   * this because identity-obj-proxy stubs the SCSS — so we lock the source-file
   * contract here, paired with tests/ui/modal.visibility.spec.ts for geometry. */
  it('SCSS source contains Modal-scoped height-auto override that neutralizes CWindow inline height', () => {
    const scssPath = resolve(__dirname, '../src/components/Modal/index.scss');
    const css = readFileSync(scssPath, 'utf8');

    expect(css).toMatch(
      /\.cm-modal:not\(\.cm-modal--resizable\)\s+\.cm-window-frame\s*\{[^}]*height\s*:\s*auto\s*!important[^}]*\}/,
    );
  });

  it('centers draggable windows from the viewport center and stores drag as center offsets', () => {
    render(
      <CModal open draggable onClose={() => undefined} title="x" data-testid="m1">
        body
      </CModal>,
    );

    const root = queryModalRoot();
    const frame = root?.querySelector<HTMLElement>('[data-testid="window-frame"]');
    expect(root).toHaveClass('cm-modal--draggable');
    expect(frame).toHaveStyle({
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    });
    expect(mockDragInstances).toHaveLength(1);

    act(() => {
      mockDragInstances[0].move({ x: 1, y: 1 });
    });

    expect(frame).toHaveStyle({
      left: 'calc(50% + 1px)',
      top: 'calc(50% + 1px)',
      transform: 'translate(-50%, -50%)',
    });
  });

  it('disables resizable and warns when width and height are not both numeric', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    render(
      <CModal open resizable onClose={() => undefined} title="x" data-testid="m1">
        body
      </CModal>,
    );

    const root = queryModalRoot();
    expect(root).not.toHaveClass('cm-modal--resizable');
    expect(root?.querySelector('[data-testid="window-resize-s"]')).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      'CModal: resizable requires numeric width and height. Resize has been disabled.',
    );

    warn.mockRestore();
  });

  it('enables resizable when width and height are both numeric', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    render(
      <CModal open resizable width={420} height={200} onClose={() => undefined} title="x">
        body
      </CModal>,
    );

    const root = queryModalRoot();
    expect(root).toHaveClass('cm-modal--resizable');
    expect(root?.querySelector('[data-testid="window-resize-s"]')).not.toBeNull();
    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });

  it('uses viewport px coordinates without transform for draggable resizable windows', () => {
    render(
      <CModal
        open
        draggable
        resizable
        width={420}
        height={200}
        onClose={() => undefined}
        title="x"
        data-testid="m1"
      >
        body
      </CModal>,
    );

    const root = queryModalRoot();
    const frame = root?.querySelector<HTMLElement>('[data-testid="window-frame"]');
    expect(root).toHaveClass('cm-modal--draggable', 'cm-modal--resizable');
    expect(frame).toHaveStyle({
      left: '302px',
      top: '284px',
    });
    expect(frame?.style.transform).toBe('');
    const titleDrag = mockDragInstances.find(
      (instance) => instance.element.dataset.testid === 'window-title',
    );
    expect(titleDrag).toBeDefined();

    act(() => {
      titleDrag?.move({ x: 303, y: 285 });
    });

    expect(frame).toHaveStyle({
      left: '303px',
      top: '285px',
    });
    expect(frame?.style.transform).toBe('');
  });

  it('places the CWindow frame as a direct flex child of cm-modal__content via cm-modal__window-host', () => {
    render(
      <CModal open onClose={() => undefined} title="x" data-testid="m1">
        body
      </CModal>,
    );

    /* 结构契约：content → window-host → window-frame。
     * 这保证 flex 居中链路完整：content 居中 host，host 自然包裹 frame，
     * frame 的定位被 SCSS 覆盖为 static，从而几何盒子被 flex 居中。 */
    const root = queryModalRoot();
    const content = root?.querySelector('.cm-modal__content');
    const host = content?.querySelector(':scope > .cm-modal__window-host');
    const frame = host?.querySelector(':scope > [data-testid="window-frame"]');

    expect(content).not.toBeNull();
    expect(host).not.toBeNull();
    expect(frame).not.toBeNull();
  });

  it('renders title and children inside the window shell', () => {
    render(
      <CModal open onClose={() => undefined} title="My Title">
        <p data-testid="body-paragraph">body content</p>
      </CModal>,
    );

    const root = queryModalRoot();
    expect(root?.querySelector('.cm-modal__title')?.textContent).toBe('My Title');
    expect(root?.querySelector('[data-testid="body-paragraph"]')?.textContent).toBe('body content');
    /* CWindow shell present (does not use CWindowTitle — no drag) */
    expect(root?.querySelector('.cm-window')).not.toBeNull();
  });

  /* ── 关闭按钮 ── */

  it('shows close button by default and invokes onClose when clicked', () => {
    const handleClose = jest.fn();
    render(
      <CModal open onClose={handleClose} title="x" data-testid="m1">
        body
      </CModal>,
    );

    const closeBtn = queryModalRoot()?.querySelector<HTMLButtonElement>('.cm-modal__close-button');
    expect(closeBtn).not.toBeNull();
    fireEvent.click(closeBtn as HTMLButtonElement);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('hides close button when showCloseButton=false', () => {
    const handleClose = jest.fn();
    render(
      <CModal open onClose={handleClose} title="x" showCloseButton={false}>
        body
      </CModal>,
    );

    expect(queryModalRoot()?.querySelector('.cm-modal__close-button')).toBeNull();
  });

  /* ── 遮罩点击 ── */

  it('invokes onClose when clicking the mask directly', () => {
    const handleClose = jest.fn();
    render(
      <CModal open onClose={handleClose} title="x">
        body
      </CModal>,
    );

    const mask = queryModalRoot()?.querySelector('.cm-modal__mask');
    fireEvent.click(mask as Element);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT invoke onClose when clicking inner content', () => {
    const handleClose = jest.fn();
    render(
      <CModal open onClose={handleClose} title="x">
        <button type="button" data-testid="inner-btn">
          inner
        </button>
      </CModal>,
    );

    fireEvent.click(queryModalRoot()?.querySelector('[data-testid="inner-btn"]') as Element);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('does NOT close on mask click when closeOnMaskClick=false', () => {
    const handleClose = jest.fn();
    render(
      <CModal open onClose={handleClose} title="x" closeOnMaskClick={false}>
        body
      </CModal>,
    );

    fireEvent.click(queryModalRoot()?.querySelector('.cm-modal__mask') as Element);
    expect(handleClose).not.toHaveBeenCalled();
  });

  /* ── ESC 行为 ── */

  it('invokes onClose on Escape keydown', () => {
    const handleClose = jest.fn();
    render(
      <CModal open onClose={handleClose} title="x">
        body
      </CModal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT close on Escape when closeOnEsc=false', () => {
    const handleClose = jest.fn();
    render(
      <CModal open onClose={handleClose} title="x" closeOnEsc={false}>
        body
      </CModal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('only closes the topmost modal when two modals are stacked', () => {
    const closeOuter = jest.fn();
    const closeInner = jest.fn();

    /* 两个独立挂载，inner 后挂载，应当是栈顶 */
    render(
      <CModal open onClose={closeOuter} title="outer">
        outer body
      </CModal>,
    );
    render(
      <CModal open onClose={closeInner} title="inner">
        inner body
      </CModal>,
    );

    expect(queryAllModalRoots()).toHaveLength(2);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeInner).toHaveBeenCalledTimes(1);
    expect(closeOuter).not.toHaveBeenCalled();
  });

  /* ── focus 恢复 ── */

  /* ── 焦点陷阱（Focus Trap） ── */

  it('auto-focuses the close button when opened', () => {
    render(
      <CModal open onClose={() => undefined} title="x" data-testid="m1">
        <button type="button" data-testid="inner-btn">
          inner
        </button>
      </CModal>,
    );

    /* 关闭按钮在标题栏中是 window-host 内第一个可聚焦的元素，应自动获得焦点。 */
    const closeBtn = queryModalRoot()?.querySelector<HTMLButtonElement>('.cm-modal__close-button');
    expect(closeBtn).not.toBeNull();
    expect(document.activeElement).toBe(closeBtn);
  });

  it('traps Tab focus within modal content (cycles last → first, first ← last)', () => {
    /* 外部按钮：若 trap 失效，焦点会逃到这里。 */
    const outside = document.createElement('button');
    outside.textContent = 'outside';
    document.body.appendChild(outside);

    render(
      <CModal open onClose={() => undefined} title="x" data-testid="m1">
        <button type="button" data-testid="inner-btn">
          inner
        </button>
      </CModal>,
    );

    const host = queryModalRoot()?.querySelector<HTMLDivElement>('.cm-modal__window-host');
    expect(host).not.toBeNull();

    /* 收集 host 内的可聚焦元素，顺序为：close 按钮 → inner 按钮。 */
    if (host == null) {
      throw new Error('Expected modal window host to be rendered');
    }

    const focusables = Array.from(
      host.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    expect(focusables.length).toBeGreaterThanOrEqual(2);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    /* 场景 1：焦点在最后一个元素，按 Tab → 应循环到第一个元素。 */
    last.focus();
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    /* 场景 2：焦点在第一个元素，按 Shift+Tab → 应循环到最后一个元素。 */
    first.focus();
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);

    /* 验证焦点从未跑到 modal 外部按钮。 */
    expect(document.activeElement).not.toBe(outside);

    document.body.removeChild(outside);
  });

  it('restores focus to the previously focused element on unmount', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'trigger';
    document.body.appendChild(trigger);
    trigger.focus();
    const focusSpy = jest.spyOn(trigger, 'focus');

    const { unmount } = render(
      <CModal open onClose={() => undefined} title="x">
        body
      </CModal>,
    );

    unmount();

    expect(focusSpy).toHaveBeenCalled();
    document.body.removeChild(trigger);
    focusSpy.mockRestore();
  });

  /* ── SSR safety ── */

  it('renderToString does not throw and produces empty output (portal returns null)', () => {
    expect(() =>
      renderToString(
        <CModal open onClose={() => undefined} title="x">
          body
        </CModal>,
      ),
    ).not.toThrow();
    expect(
      renderToString(
        <CModal open onClose={() => undefined} title="x">
          body
        </CModal>,
      ),
    ).toBe('');
  });

  /* ── 清理 ── */

  it('removes its portal container on unmount', () => {
    const { unmount } = render(
      <CModal open onClose={() => undefined} title="x">
        body
      </CModal>,
    );

    expect(queryAllModalRoots()).toHaveLength(1);
    unmount();
    expect(queryAllModalRoots()).toHaveLength(0);
  });

  it('removes its portal container when open toggles back to false', () => {
    function Wrapper({ open }: { open: boolean }): React.ReactElement {
      return (
        <CModal open={open} onClose={() => undefined} title="x">
          body
        </CModal>
      );
    }

    const { rerender } = render(<Wrapper open />);
    expect(queryAllModalRoots()).toHaveLength(1);

    rerender(<Wrapper open={false} />);
    expect(queryAllModalRoots()).toHaveLength(0);
  });

  /* ── 自定义 className / data-testid / aria-label ── */

  it('applies string width as inline style on cm-modal__window-host', () => {
    render(
      <CModal open onClose={() => undefined} title="x" width="60%" data-testid="m1">
        body
      </CModal>,
    );

    const host = queryModalRoot()?.querySelector('.cm-modal__window-host');
    expect(host).not.toBeNull();
    expect(host).toHaveStyle({ width: '60%' });
  });

  it('applies className, maskClassName, contentClassName, data-testid and aria-label', () => {
    const props: CModalProps = {
      open: true,
      onClose: () => undefined,
      title: 'x',
      className: 'extra-root',
      maskClassName: 'extra-mask',
      contentClassName: 'extra-content',
      'data-testid': 'mymodal',
      'aria-label': 'My Modal',
    };

    render(<CModal {...props}>body</CModal>);

    const root = queryModalRoot();
    expect(root).toHaveClass('cm-modal', 'extra-root');
    expect(root).toHaveAttribute('data-testid', 'mymodal');
    expect(root).toHaveAttribute('aria-label', 'My Modal');
    expect(root?.querySelector('.cm-modal__mask')).toHaveClass('extra-mask');
    expect(root?.querySelector('.cm-modal__content')).toHaveClass('extra-content');
  });
});
