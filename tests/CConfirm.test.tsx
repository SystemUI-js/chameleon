import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render } from '@testing-library/react';
import { CConfirm, confirm, type CConfirmProps } from '../src/components/Confirm';

function queryConfirmRoot(): HTMLElement | null {
  return document.body.querySelector('.cm-confirm');
}

function queryAllConfirmRoots(): readonly HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.cm-confirm'));
}

function flushTimers(): Promise<void> {
  return act(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
}

afterEach(() => {
  document.body.querySelectorAll('.cm-confirm').forEach((el) => {
    el.remove();
  });
});

describe('CConfirm component', () => {
  it('renders title, message, and both buttons when open=true', () => {
    render(
      <CConfirm
        open
        title="Please confirm"
        message="Are you sure?"
        onClose={() => undefined}
        data-testid="c1"
      />,
    );

    const root = queryConfirmRoot();
    expect(root).not.toBeNull();
    expect(root?.querySelector('.cm-modal__title')?.textContent).toBe('Please confirm');
    expect(root?.querySelector('.cm-confirm__body')?.textContent).toBe('Are you sure?');
    expect(root?.querySelector('.cm-confirm__cancel')?.textContent).toBe('Cancel');
    expect(root?.querySelector('.cm-confirm__ok')?.textContent).toBe('OK');
  });

  it('returns null portal output when open=false', () => {
    render(<CConfirm open={false} message="x" onClose={() => undefined} />);
    expect(queryConfirmRoot()).toBeNull();
  });

  it('OK click invokes onConfirm then onClose(true) in that order', () => {
    const calls: string[] = [];
    const onConfirm = jest.fn(() => calls.push('confirm'));
    const onClose = jest.fn((result: boolean) => calls.push(`close:${String(result)}`));

    render(<CConfirm open message="x" onConfirm={onConfirm} onClose={onClose} />);

    fireEvent.click(queryConfirmRoot()?.querySelector('.cm-confirm__ok') as HTMLButtonElement);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(true);
    expect(calls).toEqual(['confirm', 'close:true']);
  });

  it('Cancel button invokes onCancel then onClose(false) in that order', () => {
    const calls: string[] = [];
    const onCancel = jest.fn(() => calls.push('cancel'));
    const onClose = jest.fn((result: boolean) => calls.push(`close:${String(result)}`));

    render(<CConfirm open message="x" onCancel={onCancel} onClose={onClose} />);

    fireEvent.click(queryConfirmRoot()?.querySelector('.cm-confirm__cancel') as HTMLButtonElement);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(false);
    expect(calls).toEqual(['cancel', 'close:false']);
  });

  it('ESC keydown invokes onCancel then onClose(false) (inherited from CModal)', () => {
    const calls: string[] = [];
    const onCancel = jest.fn(() => calls.push('cancel'));
    const onClose = jest.fn((result: boolean) => calls.push(`close:${String(result)}`));

    render(<CConfirm open message="x" onCancel={onCancel} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(false);
    expect(calls).toEqual(['cancel', 'close:false']);
  });

  it('mask click invokes onCancel then onClose(false) (inherited from CModal)', () => {
    const calls: string[] = [];
    const onCancel = jest.fn(() => calls.push('cancel'));
    const onClose = jest.fn((result: boolean) => calls.push(`close:${String(result)}`));

    render(<CConfirm open message="x" onCancel={onCancel} onClose={onClose} />);

    fireEvent.click(queryConfirmRoot()?.querySelector('.cm-modal__mask') as Element);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(false);
    expect(calls).toEqual(['cancel', 'close:false']);
  });

  it('applies className merged with cm-confirm, theme, and data-testid', () => {
    const props: CConfirmProps = {
      open: true,
      message: 'x',
      onClose: () => undefined,
      className: 'extra-confirm',
      theme: 'win98',
      'data-testid': 'my-confirm',
    };

    render(<CConfirm {...props} />);

    const root = queryConfirmRoot();
    expect(root).toHaveClass('cm-confirm', 'extra-confirm', 'cm-theme--win98');
    expect(root).toHaveAttribute('data-testid', 'my-confirm');
  });

  it('respects confirmText and cancelText overrides', () => {
    render(
      <CConfirm
        open
        message="x"
        confirmText="Proceed"
        cancelText="Abort"
        onClose={() => undefined}
      />,
    );

    const root = queryConfirmRoot();
    expect(root?.querySelector('.cm-confirm__ok')?.textContent).toBe('Proceed');
    expect(root?.querySelector('.cm-confirm__cancel')?.textContent).toBe('Abort');
  });

  it('OK and Cancel buttons have explicit type="button"', () => {
    render(<CConfirm open message="x" onClose={() => undefined} />);

    const okBtn = queryConfirmRoot()?.querySelector<HTMLButtonElement>('.cm-confirm__ok');
    const cancelBtn = queryConfirmRoot()?.querySelector<HTMLButtonElement>('.cm-confirm__cancel');
    expect(okBtn?.type).toBe('button');
    expect(cancelBtn?.type).toBe('button');
  });

  it('renders children as body when provided (children takes precedence over message)', () => {
    render(
      <CConfirm open message="from-message" onClose={() => undefined}>
        <span data-testid="custom-child">from-children</span>
      </CConfirm>,
    );

    const body = queryConfirmRoot()?.querySelector('.cm-confirm__body');
    expect(body?.querySelector('[data-testid="custom-child"]')?.textContent).toBe('from-children');
    /* message should NOT also appear when children is provided */
    expect(body?.textContent).toBe('from-children');
  });

  it('renders message when no children provided', () => {
    render(<CConfirm open message="from-message" onClose={() => undefined} />);
    expect(queryConfirmRoot()?.querySelector('.cm-confirm__body')?.textContent).toBe(
      'from-message',
    );
  });
});

describe('confirm() imperative API', () => {
  it('shows a dialog and resolves true when OK is clicked', async () => {
    const promise = confirm({ message: 'Delete?', title: 'Delete' });

    await flushTimers();

    const root = queryConfirmRoot();
    expect(root).not.toBeNull();

    await act(async () => {
      fireEvent.click(root?.querySelector('.cm-confirm__ok') as HTMLButtonElement);
    });

    await expect(promise).resolves.toBe(true);
  });

  it('resolves false when Cancel is clicked', async () => {
    const promise = confirm({ message: 'Delete?' });

    await flushTimers();

    await act(async () => {
      fireEvent.click(
        queryConfirmRoot()?.querySelector('.cm-confirm__cancel') as HTMLButtonElement,
      );
    });

    await expect(promise).resolves.toBe(false);
  });

  it('resolves false when ESC is pressed', async () => {
    const promise = confirm({ message: 'Delete?' });

    await flushTimers();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    await expect(promise).resolves.toBe(false);
  });

  it('resolves false when mask is clicked', async () => {
    const promise = confirm({ message: 'Delete?' });

    await flushTimers();

    await act(async () => {
      fireEvent.click(queryConfirmRoot()?.querySelector('.cm-modal__mask') as Element);
    });

    await expect(promise).resolves.toBe(false);
  });

  it('removes its container from document.body after resolve', async () => {
    const promise = confirm({ message: 'gone' });

    await flushTimers();
    expect(queryAllConfirmRoots().length).toBe(1);

    await act(async () => {
      fireEvent.click(queryConfirmRoot()?.querySelector('.cm-confirm__ok') as HTMLButtonElement);
    });
    await promise;
    /* cleanup is deferred into setTimeout(0); flush the macrotask */
    await flushTimers();
    await flushTimers();

    expect(queryAllConfirmRoots().length).toBe(0);
  });

  it('two concurrent confirm() calls each get independent container/root', async () => {
    const p1 = confirm({ message: 'first', 'data-testid': 'first-confirm' });
    const p2 = confirm({ message: 'second', 'data-testid': 'second-confirm' });

    await flushTimers();

    /* Two separate .cm-confirm roots co-exist in body */
    expect(queryAllConfirmRoots().length).toBe(2);

    const first = document.body.querySelector('[data-testid="first-confirm"]');
    const second = document.body.querySelector('[data-testid="second-confirm"]');
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();

    /* Resolve only the second by clicking its OK */
    await act(async () => {
      fireEvent.click(second?.querySelector('.cm-confirm__ok') as HTMLButtonElement);
    });
    await expect(p2).resolves.toBe(true);

    /* p1 must NOT have resolved yet — only its container should remain */
    await flushTimers();
    await flushTimers();
    expect(document.body.querySelector('[data-testid="first-confirm"]')).not.toBeNull();
    expect(document.body.querySelector('[data-testid="second-confirm"]')).toBeNull();

    /* Now resolve p1 with Cancel */
    await act(async () => {
      fireEvent.click(first?.querySelector('.cm-confirm__cancel') as HTMLButtonElement);
    });
    await expect(p1).resolves.toBe(false);
    await flushTimers();
    await flushTimers();
    expect(queryAllConfirmRoots().length).toBe(0);
  });

  it('confirm() export is a function and returns a Promise', async () => {
    expect(typeof confirm).toBe('function');
    const p = confirm({ message: 'smoke' });
    expect(p).toBeInstanceOf(Promise);
    await flushTimers();
    const root = queryConfirmRoot();
    expect(root).not.toBeNull();
    await act(async () => {
      fireEvent.click(root?.querySelector('.cm-confirm__cancel') as HTMLButtonElement);
    });
    await expect(p).resolves.toBe(false);
    await flushTimers();
    await flushTimers();
  });

  it('accepts content field as body alias (ConfirmOptions.content)', async () => {
    const promise = confirm({ content: 'from-content-field' });
    await flushTimers();

    const body = queryConfirmRoot()?.querySelector('.cm-confirm__body');
    expect(body?.textContent).toBe('from-content-field');

    await act(async () => {
      fireEvent.click(
        queryConfirmRoot()?.querySelector('.cm-confirm__cancel') as HTMLButtonElement,
      );
    });
    await expect(promise).resolves.toBe(false);
    await flushTimers();
    await flushTimers();
  });

  it('returns false when document is undefined (SSR safety)', async () => {
    /* Simulate SSR by stashing `document`, then deleting it from globalThis.
     * confirm() inspects `typeof document` which becomes 'undefined' once removed. */
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
    delete (globalThis as unknown as Record<string, unknown>).document;
    try {
      const result = confirm({ message: 'ssr' });
      await expect(result).resolves.toBe(false);
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, 'document', descriptor);
      }
    }
  });
});

/* ── Visibility regression (Task 2) ──
 * Symptom reported by user: Confirm opens but body has height 0 — only the white
 * mask + title-bar text shows, the styled body and action row are invisible.
 *
 * Root cause (see .omo/notepads/style-component-fixes/learnings.md, Task 2 entry):
 *   CWidget.renderFrame (src/components/Widget/Widget.tsx:836-844) always emits
 *   inline `position: absolute; left: x; top: y; width; height` on .cm-window-frame.
 *   CModal passes `cWindowHeight = 0` when no explicit height prop is supplied
 *   (src/components/Modal/CModal.tsx:192). Task 1's Modal-scoped CSS override
 *   only neutralized `position/left/top` — not `height`. So the frame renders with
 *   inline `height: 0px`, and `.cm-window__inner { height: 100% }` resolves to 0,
 *   collapsing the entire Confirm body/actions.
 *
 * Fix scope: Confirm-only. Add `.cm-confirm .cm-window-frame { height: auto !important }`
 * plus belt-and-suspenders `flex: 0 0 auto` on body/actions so the flex column in
 * .cm-window doesn't shrink them to 0. Modal SCSS is intentionally untouched
 * (Task 2 must-not-do per .omo/plans/style-component-fixes.md).
 *
 * jsdom + identity-obj-proxy stubs SCSS and never computes layout, so we use the
 * Task 1 pattern: assert the SCSS source contains the required rule. Real-browser
 * geometry is verified via Playwright evidence (.omo/evidence/task-2-confirm-visible.md). */
describe('CConfirm visibility (Task 2 regression)', () => {
  const scssPath = resolve(__dirname, '../src/components/Confirm/index.scss');

  function loadScss(): string {
    return readFileSync(scssPath, 'utf8');
  }

  it('SCSS source neutralizes the inline height:0 that CWidget emits on .cm-window-frame', () => {
    const css = loadScss();
    /* Must scope under .cm-confirm so it cannot leak to non-Confirm modals.
     * Must use !important because the height comes from an inline style we
     * are forbidden from editing (CWidget.renderFrame). */
    expect(css).toMatch(
      /\.cm-confirm\s+\.cm-window-frame\s*\{[^}]*height\s*:\s*auto\s*!important[^}]*\}/,
    );
  });

  it('SCSS source keeps body and actions from collapsing inside the .cm-window flex column', () => {
    const css = loadScss();
    /* .cm-window is `display: flex; flex-direction: column` (src/components/Window/index.scss).
     * Without `flex: 0 0 auto` (or `flex-shrink: 0`), children can be squashed to 0
     * if a sibling claims remaining space. Lock body+actions to their content size. */
    expect(css).toMatch(/\.cm-confirm__body\s*\{[^}]*flex\s*:\s*0\s+0\s+auto[^}]*\}/);
    expect(css).toMatch(/\.cm-confirm__actions\s*\{[^}]*flex\s*:\s*0\s+0\s+auto[^}]*\}/);
  });

  it('SCSS source preserves .cm-confirm__body min-height so message line stays visible', () => {
    const css = loadScss();
    /* Pre-existing contract from Wave 0: body has min-height >= 32px so an
     * empty/short message still renders a visible row. */
    expect(css).toMatch(/\.cm-confirm__body\s*\{[^}]*min-height\s*:\s*32px[^}]*\}/);
  });

  it('declarative <CConfirm> mounts the styled body wrapper containing the message text', () => {
    render(<CConfirm open message="hello declarative" onClose={() => undefined} />);

    const root = queryConfirmRoot();
    const body = root?.querySelector('.cm-confirm__body') ?? null;
    const actions = root?.querySelector('.cm-confirm__actions') ?? null;

    /* Structural contract — body must wrap the message in the styled div so SCSS
     * rules (padding, min-height, color) actually apply. */
    expect(body).not.toBeNull();
    expect(body?.textContent).toBe('hello declarative');
    if (body === null) {
      throw new Error('Expected confirm body to be rendered');
    }
    const frame = root?.querySelector('[data-testid="window-frame"]') ?? null;

    /* Body must be a descendant of the .cm-window-frame, not a stray text node
     * adjacent to the title-bar (which is what produced the "only white area" symptom). */
    expect(frame?.contains(body)).toBe(true);
    /* Actions row exists alongside body with both styled buttons. */
    expect(actions).not.toBeNull();
    expect(actions?.querySelector('.cm-confirm__ok')).not.toBeNull();
    expect(actions?.querySelector('.cm-confirm__cancel')).not.toBeNull();
  });

  it('imperative confirm() mounts the SAME styled .cm-confirm > body/actions structure as declarative', async () => {
    let p!: Promise<boolean>;
    await act(async () => {
      p = confirm({ message: 'hello imperative' });
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    const root = queryConfirmRoot();
    expect(root).not.toBeNull();
    /* DOM parity contract: imperative path must reuse the styled wrapper, not
     * render raw text into the modal. This guards against a regression where
     * the imperative API ever bypasses CConfirm in favor of bare markup. */
    const body = root?.querySelector('.cm-confirm__body');
    const actions = root?.querySelector('.cm-confirm__actions');
    expect(body?.textContent).toBe('hello imperative');
    expect(actions?.querySelector('.cm-confirm__ok')).not.toBeNull();
    expect(actions?.querySelector('.cm-confirm__cancel')).not.toBeNull();

    /* Cleanup so afterEach doesn't see a stranded promise. */
    await act(async () => {
      fireEvent.click(root?.querySelector('.cm-confirm__cancel') as HTMLButtonElement);
    });
    await expect(p).resolves.toBe(false);
    await act(async () => {
      await new Promise<void>((r) => setTimeout(r, 0));
    });
    await act(async () => {
      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  it('declarative theme + custom className still merge onto .cm-confirm root (Task 1 contract preserved)', () => {
    render(
      <CConfirm
        open
        message="theme-check"
        onClose={() => undefined}
        theme="win98"
        className="extra-confirm"
        data-testid="themed-confirm"
      />,
    );

    const root = queryConfirmRoot();
    /* Mirrors the Wave 0 contract at line 119 — Task 2's SCSS additions must
     * not break theme/className merging. */
    expect(root).not.toBeNull();
    expect(root?.classList.contains('cm-confirm')).toBe(true);
    expect(root?.classList.contains('extra-confirm')).toBe(true);
    expect(root?.classList.contains('cm-theme--win98')).toBe(true);
    expect(root?.getAttribute('data-testid')).toBe('themed-confirm');
  });
});
