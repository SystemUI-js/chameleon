import React from 'react';
import { createPortal } from 'react-dom';
import { MenuTree, type MenuListItem } from '../Menu/MenuTree';
import {
  useLongPress,
  TOUCH_LONG_PRESS_DELAY_MS,
  TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX,
} from '../shared/useLongPress';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CContextMenuProps {
  /** 触发上下文菜单的单一子元素。 */
  readonly children: React.ReactElement;
  /** 菜单项列表，直接复用 MenuTree 的数据结构。 */
  readonly menuList: readonly MenuListItem[];
  /** 选中叶子项时的回调。 */
  readonly onSelect?: (item: MenuListItem) => void;
  /** 选中后是否关闭菜单，默认 true。 */
  readonly closeOnSelect?: boolean;
  /** 是否禁用，默认 false。 */
  readonly disabled?: boolean;
  /** 触发方式，默认 'both'。 */
  readonly trigger?: 'contextmenu' | 'longpress' | 'both';
  /** 长按触发延迟（毫秒），默认 500。 */
  readonly longPressDelay?: number;
  /** 用户自定义根类名。 */
  readonly className?: string;
  /** 主题类名。 */
  readonly theme?: string;
  /** 测试标识。 */
  readonly 'data-testid'?: string;
}

interface TriggerElementProps {
  onContextMenu?: React.MouseEventHandler<Element>;
  onContextMenuCapture?: React.MouseEventHandler<Element>;
  onPointerDown?: React.PointerEventHandler<Element>;
  onPointerCancel?: React.PointerEventHandler<Element>;
  onPointerLeave?: React.PointerEventHandler<Element>;
  onKeyDown?: React.KeyboardEventHandler<Element>;
  ref?: React.Ref<HTMLElement>;
}

interface MenuPosition {
  readonly x: number;
  readonly y: number;
}

interface CustomLongPressSession {
  readonly pointerId: number | undefined;
  readonly startPoint: { readonly x: number; readonly y: number };
  readonly timerId: number;
}

const MIN_VIEWPORT_MARGIN_PX = 8;

function isFocusable(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement && typeof element.focus === 'function';
}

function matchesPointerId(
  activePointerId: number | undefined,
  eventPointerId: number | undefined,
): boolean {
  if (activePointerId === undefined || eventPointerId === undefined) {
    return true;
  }

  return activePointerId === eventPointerId;
}

function hasMovedBeyondThreshold(
  start: { readonly x: number; readonly y: number },
  next: { readonly x: number; readonly y: number },
): boolean {
  return (
    Math.abs(next.x - start.x) > TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX ||
    Math.abs(next.y - start.y) > TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX
  );
}

function clampPosition(
  x: number,
  y: number,
  overlayWidth: number,
  overlayHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): MenuPosition {
  let clampedX = x;
  let clampedY = y;

  if (clampedX + overlayWidth > viewportWidth - MIN_VIEWPORT_MARGIN_PX) {
    clampedX = viewportWidth - MIN_VIEWPORT_MARGIN_PX - overlayWidth;
  }

  if (clampedY + overlayHeight > viewportHeight - MIN_VIEWPORT_MARGIN_PX) {
    clampedY = viewportHeight - MIN_VIEWPORT_MARGIN_PX - overlayHeight;
  }

  if (clampedX < MIN_VIEWPORT_MARGIN_PX) {
    clampedX = MIN_VIEWPORT_MARGIN_PX;
  }

  if (clampedY < MIN_VIEWPORT_MARGIN_PX) {
    clampedY = MIN_VIEWPORT_MARGIN_PX;
  }

  return { x: clampedX, y: clampedY };
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

export function CContextMenu({
  children,
  menuList,
  onSelect,
  closeOnSelect = true,
  disabled = false,
  trigger = 'both',
  longPressDelay = TOUCH_LONG_PRESS_DELAY_MS,
  className,
  theme,
  'data-testid': dataTestId,
}: CContextMenuProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const menuInstanceId = React.useId().replace(/:/g, '');
  const rootMenuId = `${menuInstanceId}-context-menu`;

  const [isOpen, setIsOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<MenuPosition | null>(null);
  const [openBranchByDepth, setOpenBranchByDepth] = React.useState<string[]>([]);
  const [portalContainer, setPortalContainer] = React.useState<HTMLDivElement | null>(null);

  const triggerRef = React.useRef<HTMLElement | null>(null);
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const openedByKeyboardRef = React.useRef(false);
  const focusTriggerOnCloseRef = React.useRef(false);
  const adjustmentPendingRef = React.useRef(false);
  const customSessionRef = React.useRef<CustomLongPressSession | null>(null);

  const isBrowser = typeof document !== 'undefined';

  const allowsContextMenu = trigger === 'contextmenu' || trigger === 'both';
  const allowsLongPress = trigger === 'longpress' || trigger === 'both';
  const effectiveLongPressDelay = Math.max(0, longPressDelay);
  // 当延迟与共享 helper 的默认值一致时，直接使用 useLongPress 的 pointer 生命周期。
  const useLongPressForPointer =
    allowsLongPress && effectiveLongPressDelay === TOUCH_LONG_PRESS_DELAY_MS;

  const onSelectRef = React.useRef(onSelect);
  const closeOnSelectRef = React.useRef(closeOnSelect);
  const disabledRef = React.useRef(disabled);
  const allowsContextMenuRef = React.useRef(allowsContextMenu);
  const allowsLongPressRef = React.useRef(allowsLongPress);

  React.useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  React.useEffect(() => {
    closeOnSelectRef.current = closeOnSelect;
  }, [closeOnSelect]);

  React.useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  React.useEffect(() => {
    allowsContextMenuRef.current = allowsContextMenu;
  }, [allowsContextMenu]);

  React.useEffect(() => {
    allowsLongPressRef.current = allowsLongPress;
  }, [allowsLongPress]);

  const clearCustomSession = React.useCallback((): void => {
    const session = customSessionRef.current;
    if (session === null) {
      return;
    }

    window.clearTimeout(session.timerId);
    customSessionRef.current = null;
  }, []);

  const handleCustomPointerMoveRef = React.useRef<(event: PointerEvent) => void>(() => {});
  const handleCustomPointerEndRef = React.useRef<(event: PointerEvent) => void>(() => {});

  const cleanupCustomDocumentListeners = React.useCallback((): void => {
    if (typeof document === 'undefined') {
      return;
    }

    document.removeEventListener('pointermove', handleCustomPointerMoveRef.current);
    document.removeEventListener('pointerup', handleCustomPointerEndRef.current);
    document.removeEventListener('pointercancel', handleCustomPointerEndRef.current);
  }, []);

  const openMenu = React.useCallback(
    (position: MenuPosition, byKeyboard: boolean): void => {
      if (disabledRef.current) {
        return;
      }

      longPressRef.current.cancel();
      clearCustomSession();
      cleanupCustomDocumentListeners();

      openedByKeyboardRef.current = byKeyboard;
      focusTriggerOnCloseRef.current = byKeyboard;
      setOpenBranchByDepth([]);
      setMenuPosition(position);
      adjustmentPendingRef.current = true;
      setIsOpen(true);
    },
    [clearCustomSession, cleanupCustomDocumentListeners],
  );

  const closeMenu = React.useCallback((): void => {
    setIsOpen(false);
    setOpenBranchByDepth([]);
    longPressRef.current.cancel();
    longPressRef.current.clearContextMenuSuppression();
    clearCustomSession();
    cleanupCustomDocumentListeners();

    if (focusTriggerOnCloseRef.current) {
      const trigger = triggerRef.current;
      if (isFocusable(trigger) && document.body.contains(trigger)) {
        trigger.focus();
      }
    }

    focusTriggerOnCloseRef.current = false;
    openedByKeyboardRef.current = false;
  }, [clearCustomSession, cleanupCustomDocumentListeners]);

  const handleLongPress = React.useCallback(
    (params: { readonly clientX: number; readonly clientY: number }): void => {
      if (disabledRef.current || !allowsLongPressRef.current) {
        return;
      }

      openMenuRef.current({ x: params.clientX, y: params.clientY }, false);
      longPressRef.current.suppressContextMenuAt({ x: params.clientX, y: params.clientY });
    },
    [],
  );

  const longPress = useLongPress({
    onLongPress: (params) => {
      handleLongPressRef.current(params);
    },
    pointerType: 'touch',
  });

  const longPressRef = React.useRef(longPress);
  longPressRef.current = longPress;

  const openMenuRef = React.useRef(openMenu);
  openMenuRef.current = openMenu;

  const closeMenuRef = React.useRef(closeMenu);
  closeMenuRef.current = closeMenu;

  const handleLongPressRef = React.useRef(handleLongPress);
  handleLongPressRef.current = handleLongPress;

  // 自定义长按逻辑：用于覆盖 longPressDelay 的场景。
  handleCustomPointerMoveRef.current = (nativeEvent: PointerEvent): void => {
    const session = customSessionRef.current;
    if (session === null) {
      return;
    }

    if (!matchesPointerId(session.pointerId, nativeEvent.pointerId)) {
      return;
    }

    if (
      hasMovedBeyondThreshold(session.startPoint, {
        x: nativeEvent.clientX,
        y: nativeEvent.clientY,
      })
    ) {
      clearCustomSession();
      cleanupCustomDocumentListeners();
    }
  };

  handleCustomPointerEndRef.current = (nativeEvent: PointerEvent): void => {
    const session = customSessionRef.current;
    if (session === null) {
      return;
    }

    if (!matchesPointerId(session.pointerId, nativeEvent.pointerId)) {
      return;
    }

    clearCustomSession();
    cleanupCustomDocumentListeners();
  };

  const startCustomLongPress = React.useCallback(
    (event: React.PointerEvent<HTMLElement>): void => {
      if (event.pointerType !== 'touch') {
        return;
      }

      if (disabledRef.current || !allowsLongPressRef.current) {
        return;
      }

      clearCustomSession();
      cleanupCustomDocumentListeners();

      const pointerId = event.pointerId;
      const startPoint = { x: event.clientX, y: event.clientY };
      const timerId = window.setTimeout(() => {
        customSessionRef.current = null;
        cleanupCustomDocumentListeners();
        handleLongPressRef.current({ clientX: startPoint.x, clientY: startPoint.y });
      }, effectiveLongPressDelay);

      customSessionRef.current = { pointerId, startPoint, timerId };

      if (typeof document !== 'undefined') {
        document.addEventListener('pointermove', handleCustomPointerMoveRef.current);
        document.addEventListener('pointerup', handleCustomPointerEndRef.current);
        document.addEventListener('pointercancel', handleCustomPointerEndRef.current);
      }
    },
    [clearCustomSession, cleanupCustomDocumentListeners, effectiveLongPressDelay],
  );

  const openBranchAtDepth = React.useCallback((depth: number, id: string): void => {
    setOpenBranchByDepth((previous) => {
      const next = previous.slice(0, depth);
      next[depth] = id;
      return next;
    });
  }, []);

  const toggleBranchAtDepth = React.useCallback((depth: number, id: string): void => {
    setOpenBranchByDepth((previous) => {
      if (previous[depth] === id) {
        return previous.slice(0, depth);
      }

      const next = previous.slice(0, depth);
      next[depth] = id;
      return next;
    });
  }, []);

  const handleSelect = React.useCallback((item: MenuListItem): void => {
    onSelectRef.current?.(item);

    if (closeOnSelectRef.current) {
      closeMenuRef.current();
    }
  }, []);

  const handleCloseAllMenus = React.useCallback((): void => {
    closeMenuRef.current();
  }, []);

  // disabled 变为 true 时关闭菜单。
  React.useEffect(() => {
    if (disabled && isOpen) {
      closeMenuRef.current();
    }
  }, [disabled, isOpen]);

  // 卸载时清理长按状态与抑制。
  React.useEffect(() => {
    return () => {
      clearCustomSession();
      cleanupCustomDocumentListeners();
      longPressRef.current.clearContextMenuSuppression();
    };
  }, [clearCustomSession, cleanupCustomDocumentListeners]);

  // 创建 portal 容器。
  React.useEffect(() => {
    if (!isBrowser || !isOpen) {
      return undefined;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }

      setPortalContainer(null);
    };
  }, [isBrowser, isOpen]);

  // 外部 pointer/mouse down 关闭。
  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleDocumentPointerDown = (event: PointerEvent): void => {
      const overlay = overlayRef.current;
      const trigger = triggerRef.current;

      if (trigger?.contains(event.target as Node)) {
        return;
      }

      if (overlay?.contains(event.target as Node)) {
        return;
      }

      closeMenuRef.current();
    };

    document.addEventListener('pointerdown', handleDocumentPointerDown);
    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
    };
  }, [isOpen]);

  // Esc 关闭。
  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleDocumentKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      focusTriggerOnCloseRef.current = true;
      closeMenuRef.current();
    };

    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [isOpen]);

  React.useLayoutEffect(() => {
    if (!isOpen || portalContainer === null || !openedByKeyboardRef.current) {
      return;
    }

    const overlay = overlayRef.current;
    if (overlay === null) {
      return;
    }

    const firstItem = overlay.querySelector<HTMLElement>('[role="menuitem"]');
    firstItem?.focus();
  }, [isOpen, portalContainer]);

  React.useLayoutEffect(() => {
    if (
      !isOpen ||
      portalContainer === null ||
      menuPosition === null ||
      !adjustmentPendingRef.current
    ) {
      return;
    }

    const overlay = overlayRef.current;
    if (overlay === null) {
      return;
    }

    const rect = overlay.getBoundingClientRect();
    const clamped = clampPosition(
      menuPosition.x,
      menuPosition.y,
      rect.width,
      rect.height,
      window.innerWidth,
      window.innerHeight,
    );

    adjustmentPendingRef.current = false;

    if (clamped.x !== menuPosition.x || clamped.y !== menuPosition.y) {
      setMenuPosition(clamped);
    }
  }, [isOpen, menuPosition, portalContainer]);

  const childProps = children.props as TriggerElementProps;

  const handleContextMenu: React.MouseEventHandler<HTMLElement> = (event) => {
    childProps.onContextMenu?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (disabledRef.current || !allowsContextMenuRef.current) {
      return;
    }

    event.preventDefault();
    openMenuRef.current({ x: event.clientX, y: event.clientY }, false);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    childProps.onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (disabledRef.current || !allowsContextMenuRef.current) {
      return;
    }

    const isContextMenuKey = event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10');
    if (!isContextMenuKey) {
      return;
    }

    event.preventDefault();

    const trigger = triggerRef.current;
    if (trigger === null) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    openMenuRef.current({ x: rect.left, y: rect.bottom }, true);
  };

  const handleRef = (node: HTMLElement | null): void => {
    triggerRef.current = node;
    setRef(childProps.ref, node);
  };

  function wrapHandler<E extends React.SyntheticEvent<Element>>(
    childHandler: React.EventHandler<E> | undefined,
    ourHandler: React.EventHandler<E>,
  ): React.EventHandler<E> {
    return (event) => {
      childHandler?.(event);

      if (!event.defaultPrevented) {
        ourHandler(event);
      }
    };
  }

  const triggerProps: TriggerElementProps = {
    ref: handleRef,
    onContextMenu: handleContextMenu,
    onKeyDown: handleKeyDown,
  };

  if (useLongPressForPointer) {
    triggerProps.onPointerDown = wrapHandler(childProps.onPointerDown, longPress.onPointerDown);
    triggerProps.onPointerCancel = wrapHandler(
      childProps.onPointerCancel,
      longPress.onPointerCancel,
    );
    triggerProps.onPointerLeave = wrapHandler(childProps.onPointerLeave, longPress.onPointerLeave);
    triggerProps.onContextMenuCapture = wrapHandler(
      childProps.onContextMenuCapture,
      longPress.onContextMenuCapture,
    );
  } else if (allowsLongPress) {
    triggerProps.onPointerDown = (event: React.PointerEvent<Element>) => {
      childProps.onPointerDown?.(event);

      if (!event.defaultPrevented) {
        startCustomLongPress(event as React.PointerEvent<HTMLElement>);
      }
    };
    triggerProps.onPointerCancel = (event: React.PointerEvent<Element>) => {
      childProps.onPointerCancel?.(event);

      if (!event.defaultPrevented) {
        clearCustomSession();
        cleanupCustomDocumentListeners();
      }
    };
    triggerProps.onPointerLeave = (event: React.PointerEvent<Element>) => {
      childProps.onPointerLeave?.(event);

      if (!event.defaultPrevented) {
        clearCustomSession();
        cleanupCustomDocumentListeners();
      }
    };
    triggerProps.onContextMenuCapture = (event: React.MouseEvent<Element>) => {
      childProps.onContextMenuCapture?.(event);

      if (!event.defaultPrevented) {
        longPress.onContextMenuCapture(event as React.MouseEvent<HTMLElement>);
      }
    };
  }

  const triggerElement = React.cloneElement(
    children as React.ReactElement<TriggerElementProps>,
    triggerProps,
  );

  return (
    <>
      <span
        className={mergeClasses(
          ['cm-ccontext-menu', isOpen ? 'cm-ccontext-menu--open' : ''],
          resolvedTheme,
          className,
        )}
        data-testid={dataTestId}
        data-context-menu-state={isOpen ? 'open' : 'closed'}
      >
        {triggerElement}
      </span>
      {isBrowser && isOpen && portalContainer !== null && menuPosition !== null
        ? createPortal(
            <div
              ref={overlayRef}
              className="cm-ccontext-menu__overlay"
              data-testid="ccontext-menu-overlay"
              style={{
                position: 'fixed',
                left: menuPosition.x,
                top: menuPosition.y,
              }}
            >
              <MenuTree
                items={menuList}
                depth={0}
                listId={rootMenuId}
                menuInstanceId={menuInstanceId}
                openBranchByDepth={openBranchByDepth}
                onOpenBranchAtDepth={openBranchAtDepth}
                onToggleBranchAtDepth={toggleBranchAtDepth}
                onCloseAllMenus={handleCloseAllMenus}
                onSelect={handleSelect}
                closeOnSelect={closeOnSelect}
              />
            </div>,
            portalContainer,
          )
        : null}
    </>
  );
}
