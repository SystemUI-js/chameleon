import React, { useEffect, useRef } from 'react';
import { Pressable, View } from '../../runtime/react-native-web';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CScrollBarOrientation = 'vertical' | 'horizontal';

export interface CScrollBarProps {
  readonly orientation: CScrollBarOrientation;
  readonly scrollSize: number;
  readonly viewportSize: number;
  readonly scrollPosition: number;
  readonly maxScrollPosition: number;
  readonly thumbSize: number;
  readonly thumbPosition: number;
  readonly visible: boolean;
  readonly onScrollPositionChange: (position: number) => void;
  readonly className?: string;
  readonly theme?: string;
  readonly 'data-testid'?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getThumbTravelDistance(trackSize: number, thumbSize: number): number {
  return Math.max(0, trackSize - thumbSize);
}

export function CScrollBar({
  orientation,
  scrollPosition,
  maxScrollPosition,
  thumbSize,
  thumbPosition,
  visible,
  onScrollPositionChange,
  className,
  theme,
  'data-testid': dataTestId,
}: CScrollBarProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));

  const isVertical = orientation === 'vertical';
  const cursorAxis = isVertical ? 'clientY' : 'clientX';

  const trackRef = useRef<HTMLElement | null>(null);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ position: 0, cursor: 0 });
  const moveHandlerRef = useRef<((e: MouseEvent | TouchEvent) => void) | null>(null);
  const upHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (moveHandlerRef.current) {
        document.removeEventListener('mousemove', moveHandlerRef.current);
        document.removeEventListener('touchmove', moveHandlerRef.current);
      }
      if (upHandlerRef.current) {
        document.removeEventListener('mouseup', upHandlerRef.current);
        document.removeEventListener('touchend', upHandlerRef.current);
      }
    };
  }, []);

  const baseClasses = [
    'cm-scroll-bar',
    `cm-scroll-bar--${orientation}`,
    !visible && 'cm-scroll-bar--hidden',
  ].filter(Boolean) as string[];

  const handleTrackClick: React.MouseEventHandler<HTMLElement> = (event): void => {
    const trackEl = trackRef.current;
    if (!trackEl) {
      return;
    }

    const rect = trackEl.getBoundingClientRect();
    const cursorPos = event[cursorAxis];
    const trackStart = isVertical ? rect.top : rect.left;
    const trackSize = isVertical ? rect.height : rect.width;

    const thumbTravelDistance = getThumbTravelDistance(trackSize, thumbSize);
    const targetThumbPosition = cursorPos - trackStart - thumbSize / 2;
    const rawPosition =
      thumbTravelDistance > 0 ? (targetThumbPosition / thumbTravelDistance) * maxScrollPosition : 0;
    const nextPosition = clamp(rawPosition, 0, maxScrollPosition);

    onScrollPositionChange(nextPosition);
  };

  const handleThumbMouseDown = (event: React.MouseEvent | React.TouchEvent): void => {
    event.preventDefault();

    const client = 'touches' in event ? event.touches[0] : event;
    draggingRef.current = true;
    dragStartRef.current = {
      position: scrollPosition,
      cursor: client[cursorAxis],
    };

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent): void => {
      if (!draggingRef.current) {
        return;
      }

      const clientMove = 'touches' in moveEvent ? moveEvent.touches[0] : moveEvent;
      const delta = clientMove[cursorAxis] - dragStartRef.current.cursor;
      const trackEl = trackRef.current;
      if (!trackEl) {
        return;
      }
      const trackSize = isVertical
        ? trackEl.getBoundingClientRect().height
        : trackEl.getBoundingClientRect().width;
      const thumbTravelDistance = getThumbTravelDistance(trackSize, thumbSize);
      const scale = thumbTravelDistance > 0 ? maxScrollPosition / thumbTravelDistance : 0;
      const deltaScroll = delta * scale;
      const nextPosition = clamp(dragStartRef.current.position + deltaScroll, 0, maxScrollPosition);

      onScrollPositionChange(nextPosition);
    };

    const handleMouseUp = (): void => {
      draggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
      moveHandlerRef.current = null;
      upHandlerRef.current = null;
    };

    moveHandlerRef.current = handleMouseMove;
    upHandlerRef.current = handleMouseUp;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
  };

  const thumbStyle = isVertical
    ? { height: thumbSize, top: thumbPosition }
    : { width: thumbSize, left: thumbPosition };

  return (
    <View
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      aria-hidden={!visible}
      testID={dataTestId}
    >
      <Pressable
        ref={(el) => {
          trackRef.current = el as HTMLElement | null;
        }}
        className="cm-scroll-bar__track"
        onClick={handleTrackClick}
      />
      <View
        className="cm-scroll-bar__thumb"
        style={thumbStyle}
        onMouseDown={handleThumbMouseDown}
        onTouchStart={handleThumbMouseDown}
      />
    </View>
  );
}
