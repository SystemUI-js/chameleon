import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import type { AxisState } from './scrollMetrics';

export interface UseScrollbarDragOptions {
  readonly axisState: AxisState;
  readonly onScrollBy: (delta: number) => void;
  readonly onScrollTo: (offset: number) => void;
  readonly step: number;
  readonly orientation: 'vertical' | 'horizontal';
}

export interface UseScrollbarDragResult {
  readonly dragRef: React.MutableRefObject<{
    isDragging: boolean;
    startPointer: number;
    startScrollOffset: number;
    thumbElement?: HTMLButtonElement;
    pointerId?: number;
  }>;
  readonly handleDecrement: () => void;
  readonly handleIncrement: () => void;
  readonly handlePointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  readonly handlePointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
  readonly handlePointerUp: (event: React.PointerEvent<HTMLButtonElement>) => void;
  readonly handlePointerCancel: (event: React.PointerEvent<HTMLButtonElement>) => void;
}

export function useScrollbarDrag({
  axisState,
  onScrollBy,
  onScrollTo,
  step,
  orientation,
}: UseScrollbarDragOptions): UseScrollbarDragResult {
  const dragRef = useRef<{
    isDragging: boolean;
    startPointer: number;
    startScrollOffset: number;
    thumbElement?: HTMLButtonElement;
    pointerId?: number;
  }>({
    isDragging: false,
    startPointer: 0,
    startScrollOffset: 0,
  });

  const endDrag = useCallback(() => {
    if (dragRef.current.isDragging) {
      // Release pointer capture if we have an element and pointerId
      if (dragRef.current.thumbElement && dragRef.current.pointerId !== undefined) {
        dragRef.current.thumbElement.releasePointerCapture(dragRef.current.pointerId);
      }
      dragRef.current.isDragging = false;
      dragRef.current.thumbElement = undefined;
      dragRef.current.pointerId = undefined;
    }
  }, []);

  useEffect(() => {
    const handleWindowBlur = () => {
      endDrag();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        endDrag();
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      endDrag();
    };
  }, [endDrag]);

  const handleDecrement = useCallback(() => {
    onScrollBy(-step);
  }, [onScrollBy, step]);

  const handleIncrement = useCallback(() => {
    onScrollBy(step);
  }, [onScrollBy, step]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      dragRef.current = {
        isDragging: true,
        startPointer: orientation === 'vertical' ? event.clientY : event.clientX,
        startScrollOffset: axisState.scrollOffset,
        thumbElement: target,
        pointerId: event.pointerId,
      };
    },
    [axisState.scrollOffset, orientation],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragRef.current.isDragging) {
        return;
      }

      const delta =
        orientation === 'vertical'
          ? event.clientY - dragRef.current.startPointer
          : event.clientX - dragRef.current.startPointer;
      const trackSize = axisState.trackSize;
      const thumbSize = axisState.thumbSize;
      const maxScrollOffset = axisState.maxScrollOffset;
      const maxThumbOffset = Math.max(0, trackSize - thumbSize);

      if (maxThumbOffset === 0) {
        return;
      }

      const mappedOffset = (delta / maxThumbOffset) * maxScrollOffset;
      onScrollTo(dragRef.current.startScrollOffset + mappedOffset);
    },
    [axisState.trackSize, axisState.thumbSize, axisState.maxScrollOffset, onScrollTo, orientation],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (dragRef.current.isDragging) {
        endDrag();
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [endDrag],
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (dragRef.current.isDragging) {
        endDrag();
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [endDrag],
  );

  return {
    dragRef,
    handleDecrement,
    handleIncrement,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
}
