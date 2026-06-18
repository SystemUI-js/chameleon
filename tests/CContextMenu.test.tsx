import '@testing-library/jest-dom';
import { act, createEvent, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { CContextMenu as PackageEntryCContextMenu, Theme, type MenuListItem } from '../src';
import { CContextMenu } from '../src/components/CContextMenu/CContextMenu';
import { TOUCH_LONG_PRESS_DELAY_MS } from '../src/components/shared/useLongPress';

const SAMPLE_MENU_LIST: readonly MenuListItem[] = [
  { id: 'item-1', key: 'item-1', title: 'Item 1' },
  { id: 'item-2', key: 'item-2', title: 'Item 2', disabled: true },
];

const NESTED_MENU_LIST: readonly MenuListItem[] = [
  {
    id: 'parent',
    key: 'parent',
    title: 'Parent',
    trigger: 'click',
    children: [{ id: 'nested-leaf', key: 'nested-leaf', title: 'Nested Leaf' }],
  },
  { id: 'root-leaf', key: 'root-leaf', title: 'Root Leaf' },
];

function dispatchTouchPointerDown(
  element: Element,
  init: { readonly pointerId: number; readonly clientX: number; readonly clientY: number },
): void {
  const event = createEvent.pointerDown(element, {
    pointerId: init.pointerId,
    button: 0,
    clientX: init.clientX,
    clientY: init.clientY,
  });

  Object.defineProperty(event, 'pointerType', {
    configurable: true,
    value: 'touch',
  });

  fireEvent(element, event);
}

function dispatchTouchPointerMove(
  element: Element,
  init: { readonly pointerId: number; readonly clientX: number; readonly clientY: number },
): void {
  const event = createEvent.pointerMove(element, {
    pointerId: init.pointerId,
    clientX: init.clientX,
    clientY: init.clientY,
  });

  Object.defineProperty(event, 'pointerType', {
    configurable: true,
    value: 'touch',
  });

  fireEvent(element, event);
}

describe('CContextMenu', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('exports CContextMenu from package entry', () => {
    render(
      <PackageEntryCContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-package">
        <button type="button">Trigger</button>
      </PackageEntryCContextMenu>,
    );

    expect(PackageEntryCContextMenu).toBe(CContextMenu);
    expect(screen.getByTestId('ctx-package')).toBeInTheDocument();
    expect(screen.getByTestId('ctx-package')).toHaveClass('cm-ccontext-menu');
  });

  it('renders closed wrapper by default', () => {
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-closed">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const wrapper = screen.getByTestId('ctx-closed');
    expect(wrapper).toHaveAttribute('data-context-menu-state', 'closed');
    expect(wrapper).not.toHaveClass('cm-ccontext-menu--open');
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();
  });

  it('opens on right-click and prevents native contextmenu', () => {
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-right">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    const event = createEvent.contextMenu(trigger, { clientX: 10, clientY: 20 });
    fireEvent(trigger, event);

    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByTestId('ccontext-menu-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('ccontext-menu-overlay')).toHaveStyle({
      left: '10px',
      top: '20px',
    });
  });

  it('opens on touch long-press with default delay', () => {
    jest.useFakeTimers();
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-long">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    dispatchTouchPointerDown(trigger, { pointerId: 1, clientX: 30, clientY: 40 });

    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(TOUCH_LONG_PRESS_DELAY_MS);
    });

    expect(screen.getByTestId('ccontext-menu-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('ccontext-menu-overlay')).toHaveStyle({
      left: '30px',
      top: '40px',
    });
  });

  it('respects longPressDelay override', () => {
    jest.useFakeTimers();
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} longPressDelay={300} data-testid="ctx-delay">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    dispatchTouchPointerDown(trigger, { pointerId: 1, clientX: 50, clientY: 60 });

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getByTestId('ccontext-menu-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('ccontext-menu-overlay')).toHaveStyle({
      left: '50px',
      top: '60px',
    });
  });

  it('cancels long-press when pointer moves beyond threshold (default delay)', () => {
    jest.useFakeTimers();
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-move">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    dispatchTouchPointerDown(trigger, { pointerId: 1, clientX: 0, clientY: 0 });

    dispatchTouchPointerMove(document.body, {
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    });

    act(() => {
      jest.advanceTimersByTime(TOUCH_LONG_PRESS_DELAY_MS);
    });

    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();
  });

  it('cancels long-press when pointer moves beyond threshold (custom delay)', () => {
    jest.useFakeTimers();
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} longPressDelay={400} data-testid="ctx-move-custom">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    dispatchTouchPointerDown(trigger, { pointerId: 1, clientX: 0, clientY: 0 });

    dispatchTouchPointerMove(document.body, {
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    });

    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();
  });

  it('opens at trigger bottom-left on ContextMenu key', () => {
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-key">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      x: 64,
      y: 32,
      width: 80,
      height: 24,
      top: 32,
      left: 64,
      right: 144,
      bottom: 56,
      toJSON: () => {},
    });

    fireEvent.keyDown(trigger, { key: 'ContextMenu' });

    expect(screen.getByTestId('ccontext-menu-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('ccontext-menu-overlay')).toHaveStyle({
      left: '64px',
      top: '56px',
    });
  });

  it('opens at trigger bottom-left on Shift+F10', () => {
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-shift">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      x: 12,
      y: 20,
      width: 60,
      height: 20,
      top: 20,
      left: 12,
      right: 72,
      bottom: 40,
      toJSON: () => {},
    });

    fireEvent.keyDown(trigger, { key: 'F10', shiftKey: true });

    expect(screen.getByTestId('ccontext-menu-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('ccontext-menu-overlay')).toHaveStyle({
      left: '12px',
      top: '40px',
    });
  });

  it('focuses first menu item after keyboard open', () => {
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-focus">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.keyDown(trigger, { key: 'ContextMenu' });

    expect(screen.getByRole('menuitem', { name: 'Item 1' })).toHaveFocus();
  });

  it('closes on outside pointer down', () => {
    render(
      <div>
        <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-outside">
          <button type="button">Trigger</button>
        </CContextMenu>
        <button type="button">Outside</button>
      </div>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.contextMenu(trigger);
    expect(screen.getByTestId('ccontext-menu-overlay')).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();
  });

  it('closes on Escape and returns focus to trigger', () => {
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-esc">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.keyDown(trigger, { key: 'ContextMenu' });
    expect(screen.getByTestId('ccontext-menu-overlay')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes after selecting a leaf item by default', () => {
    const handleSelect = jest.fn();
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} onSelect={handleSelect} data-testid="ctx-select">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: 'Trigger' }));
    fireEvent.click(screen.getByTestId('menu-item-item-1'));

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith({ id: 'item-1', key: 'item-1', title: 'Item 1' });
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();
  });

  it('keeps menu open after selecting when closeOnSelect=false', () => {
    const handleSelect = jest.fn();
    render(
      <CContextMenu
        menuList={SAMPLE_MENU_LIST}
        onSelect={handleSelect}
        closeOnSelect={false}
        data-testid="ctx-noclose"
      >
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: 'Trigger' }));
    fireEvent.click(screen.getByTestId('menu-item-item-1'));

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('ccontext-menu-overlay')).toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} disabled data-testid="ctx-disabled">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.contextMenu(trigger);
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'ContextMenu' });
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();
  });

  it('closes when disabled becomes true while open', () => {
    const { rerender } = render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-disable-close">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: 'Trigger' }));
    expect(screen.getByTestId('ccontext-menu-overlay')).toBeInTheDocument();

    rerender(
      <CContextMenu menuList={SAMPLE_MENU_LIST} disabled data-testid="ctx-disable-close">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();
  });

  it('clamps overlay inside viewport with 8px margin', () => {
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 200,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 200,
    });

    const rectMock = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      toJSON: () => {},
    });

    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-clamp">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: 'Trigger' }), {
      clientX: 150,
      clientY: 150,
    });

    expect(screen.getByTestId('ccontext-menu-overlay')).toHaveStyle({
      left: '92px',
      top: '92px',
    });

    rectMock.mockRestore();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('selects a nested submenu leaf and closes', () => {
    const handleSelect = jest.fn();
    render(
      <CContextMenu menuList={NESTED_MENU_LIST} onSelect={handleSelect} data-testid="ctx-nested">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: 'Trigger' }));
    fireEvent.click(screen.getByTestId('menu-item-parent'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Nested Leaf' }));

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith({
      id: 'nested-leaf',
      key: 'nested-leaf',
      title: 'Nested Leaf',
    });
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();
  });

  it('merges className and theme on root wrapper', () => {
    render(
      <Theme name="win98">
        <CContextMenu menuList={SAMPLE_MENU_LIST} className="custom-class" data-testid="ctx-theme">
          <button type="button">Trigger</button>
        </CContextMenu>
      </Theme>,
    );

    const wrapper = screen.getByTestId('ctx-theme');
    expect(wrapper).toHaveClass('cm-ccontext-menu');
    expect(wrapper).toHaveClass('cm-theme--win98');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('explicit theme prop overrides Theme provider', () => {
    render(
      <Theme name="win98">
        <CContextMenu menuList={SAMPLE_MENU_LIST} theme="winxp" data-testid="ctx-override">
          <button type="button">Trigger</button>
        </CContextMenu>
      </Theme>,
    );

    const wrapper = screen.getByTestId('ctx-override');
    expect(wrapper).toHaveClass('cm-theme--winxp');
    expect(wrapper).not.toHaveClass('cm-theme--win98');
  });

  it('preserves child handlers and respects defaultPrevented', () => {
    const childContextMenu = jest.fn((event: React.MouseEvent) => {
      event.preventDefault();
    });
    const childPointerDown = jest.fn();
    const childKeyDown = jest.fn((event: React.KeyboardEvent) => {
      event.preventDefault();
    });

    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} data-testid="ctx-preserve">
        <button
          type="button"
          onContextMenu={childContextMenu}
          onPointerDown={childPointerDown}
          onKeyDown={childKeyDown}
        >
          Trigger
        </button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.contextMenu(trigger);
    expect(childContextMenu).toHaveBeenCalled();
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();

    fireEvent.pointerDown(trigger, { pointerType: 'touch' });
    expect(childPointerDown).toHaveBeenCalled();

    fireEvent.keyDown(trigger, { key: 'ContextMenu' });
    expect(childKeyDown).toHaveBeenCalled();
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();
  });

  it('only long-press opens when trigger="longpress"', () => {
    jest.useFakeTimers();
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} trigger="longpress" data-testid="ctx-long-only">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.contextMenu(trigger);
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();

    dispatchTouchPointerDown(trigger, { pointerId: 1, clientX: 0, clientY: 0 });
    act(() => {
      jest.advanceTimersByTime(TOUCH_LONG_PRESS_DELAY_MS);
    });
    expect(screen.getByTestId('ccontext-menu-overlay')).toBeInTheDocument();
  });

  it('only contextmenu opens when trigger="contextmenu"', () => {
    jest.useFakeTimers();
    render(
      <CContextMenu menuList={SAMPLE_MENU_LIST} trigger="contextmenu" data-testid="ctx-ctx-only">
        <button type="button">Trigger</button>
      </CContextMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    dispatchTouchPointerDown(trigger, { pointerId: 1, clientX: 0, clientY: 0 });
    act(() => {
      jest.advanceTimersByTime(TOUCH_LONG_PRESS_DELAY_MS);
    });
    expect(screen.queryByTestId('ccontext-menu-overlay')).not.toBeInTheDocument();

    fireEvent.contextMenu(trigger);
    expect(screen.getByTestId('ccontext-menu-overlay')).toBeInTheDocument();
  });
});
