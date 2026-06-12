import React from 'react';

/**
 * 长按手势常量。
 * 这些值与 IconContainer 原始实现保持一致。
 */
export const TOUCH_LONG_PRESS_DELAY_MS = 500;
export const TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX = 6;
export const SYNTHETIC_CONTEXT_MENU_SUPPRESSION_MS = 1000;

export interface LongPressPoint {
  readonly x: number;
  readonly y: number;
}

export interface LongPressSuppression {
  readonly x: number;
  readonly y: number;
  readonly expiresAt: number;
}

export interface UseLongPressOptions {
  /**
   * 长按触发时调用，参数为 pointerdown 发生时的客户端坐标。
   * 调用方通常需要在此回调中触发自定义的 contextmenu 行为，
   * 然后调用 `suppressContextMenuAt` 抑制后续原生右键菜单。
   */
  readonly onLongPress: (params: { readonly clientX: number; readonly clientY: number }) => void;

  /**
   * 长按被取消时调用（移动超过阈值、抬起、取消或离开元素）。
   */
  readonly onCancel?: () => void;

  /**
   * 响应哪种指针类型。默认只响应触摸长按。
   */
  readonly pointerType?: 'touch' | 'mouse' | 'pen' | 'all';
}

export interface UseLongPressResult {
  /**
   * 附加到目标元素的 onPointerDown。
   */
  readonly onPointerDown: React.PointerEventHandler<HTMLElement>;

  /**
   * 附加到目标元素的 onPointerCancel。
   */
  readonly onPointerCancel: React.PointerEventHandler<HTMLElement>;

  /**
   * 附加到目标元素的 onPointerLeave。
   */
  readonly onPointerLeave: React.PointerEventHandler<HTMLElement>;

  /**
   * 附加到目标元素的 onContextMenuCapture，用于抑制合成的 contextmenu 重复触发。
   */
  readonly onContextMenuCapture: React.MouseEventHandler<HTMLElement>;

  /**
   * 在触发自定义 contextmenu 后调用，记录一个抑制窗口，
   * 在此期间同一位置的原生 contextmenu 会被阻止。
   */
  readonly suppressContextMenuAt: (point: LongPressPoint) => void;

  /**
   * 清除正在进行的 contextmenu 抑制状态。
   */
  readonly clearContextMenuSuppression: () => void;

  /**
   * 立即取消当前进行中的长按并清理监听器。
   */
  readonly cancel: () => void;
}

function hasMovedBeyondThreshold(start: LongPressPoint, next: LongPressPoint): boolean {
  return (
    Math.abs(next.x - start.x) > TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX ||
    Math.abs(next.y - start.y) > TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX
  );
}

function matchesPointerType(
  eventPointerType: string,
  configuredPointerType: 'touch' | 'mouse' | 'pen' | 'all',
): boolean {
  if (configuredPointerType === 'all') {
    return true;
  }

  return eventPointerType === configuredPointerType;
}

/**
 * 创建可复用的长按控制器。
 *
 * 该控制器以命令式对象形式返回，适用于需要为多个动态目标（如 IconContainer 的每个 slot）
 * 管理长按状态的场景。若只需单个元素的长按，请使用 `useLongPress` hook。
 */
export function createLongPressController(options: UseLongPressOptions): UseLongPressResult {
  let timerId: number | undefined;
  let startPoint: LongPressPoint | undefined;
  let activePointerId: number | undefined;
  let firedLongPress = false;
  let suppression: LongPressSuppression | undefined;

  const clearTimer = (): void => {
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      timerId = undefined;
    }
  };

  const cleanupDocumentListeners = (): void => {
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerEndLike);
    document.removeEventListener('pointercancel', handlePointerEndLike);
  };

  const resetSession = (): void => {
    clearTimer();
    cleanupDocumentListeners();
    startPoint = undefined;
    activePointerId = undefined;
    firedLongPress = false;
  };

  const cancel = (): void => {
    const hadSession = activePointerId !== undefined;

    resetSession();

    if (hadSession) {
      options.onCancel?.();
    }
  };

  function handlePointerMove(nativeEvent: PointerEvent): void {
    if (startPoint === undefined) {
      return;
    }

    if (activePointerId !== undefined && nativeEvent.pointerId !== activePointerId) {
      return;
    }

    if (
      hasMovedBeyondThreshold(startPoint, {
        x: nativeEvent.clientX,
        y: nativeEvent.clientY,
      })
    ) {
      cancel();
    }
  }

  function handlePointerEndLike(nativeEvent: PointerEvent): void {
    if (startPoint === undefined) {
      return;
    }

    if (activePointerId !== undefined && nativeEvent.pointerId !== activePointerId) {
      return;
    }

    cancel();
  }

  const onPointerDown: React.PointerEventHandler<HTMLElement> = (event) => {
    if (!matchesPointerType(event.pointerType, options.pointerType ?? 'touch')) {
      return;
    }

    cancel();
    suppression = undefined;

    activePointerId = event.pointerId;
    startPoint = { x: event.clientX, y: event.clientY };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerEndLike);
    document.addEventListener('pointercancel', handlePointerEndLike);

    timerId = window.setTimeout(() => {
      if (startPoint === undefined || firedLongPress) {
        return;
      }

      firedLongPress = true;
      options.onLongPress({ clientX: startPoint.x, clientY: startPoint.y });
      resetSession();
    }, TOUCH_LONG_PRESS_DELAY_MS);
  };

  const onPointerCancel: React.PointerEventHandler<HTMLElement> = () => {
    cancel();
  };

  const onPointerLeave: React.PointerEventHandler<HTMLElement> = () => {
    cancel();
  };

  const suppressContextMenuAt = (point: LongPressPoint): void => {
    suppression = {
      x: point.x,
      y: point.y,
      expiresAt: Date.now() + SYNTHETIC_CONTEXT_MENU_SUPPRESSION_MS,
    };
  };

  const clearContextMenuSuppression = (): void => {
    suppression = undefined;
  };

  const onContextMenuCapture: React.MouseEventHandler<HTMLElement> = (event) => {
    if (!suppression) {
      return;
    }

    if (Date.now() > suppression.expiresAt) {
      suppression = undefined;
      return;
    }

    const isSameLongPressLocation =
      Math.abs(event.nativeEvent.clientX - suppression.x) <= TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX &&
      Math.abs(event.nativeEvent.clientY - suppression.y) <= TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX;

    if (!isSameLongPressLocation) {
      return;
    }

    suppression = undefined;
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    onPointerDown,
    onPointerCancel,
    onPointerLeave,
    onContextMenuCapture,
    suppressContextMenuAt,
    clearContextMenuSuppression,
    cancel,
  };
}

/**
 * 为单个元素提供长按行为的 React hook。
 *
 * 内部使用 `createLongPressController`，并确保回调更新时不会重建控制器，
 * 从而避免丢失进行中的长按状态。
 */
export function useLongPress(options: UseLongPressOptions): UseLongPressResult {
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  const controllerRef = React.useRef<UseLongPressResult | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = createLongPressController({
      get onLongPress() {
        return optionsRef.current.onLongPress;
      },
      get onCancel() {
        return optionsRef.current.onCancel;
      },
      get pointerType() {
        return optionsRef.current.pointerType;
      },
    });
  }

  return controllerRef.current;
}
