export type ScrollAxisId = 'vertical' | 'horizontal';

export interface AxisState {
  readonly id: ScrollAxisId;
  readonly viewportSize: number;
  readonly contentSize: number;
  readonly scrollOffset: number;
  readonly maxScrollOffset: number;
  readonly scrollable: boolean;
  readonly canScrollBackward: boolean;
  readonly canScrollForward: boolean;
  readonly trackSize: number;
  readonly thumbSize: number;
  readonly thumbOffset: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function computeAxisState(
  viewportSize: number,
  contentSize: number,
  scrollOffset: number,
  minThumbSize = 20,
  id: ScrollAxisId = 'vertical',
): AxisState {
  const normalizedViewportSize = Math.max(0, viewportSize);
  const normalizedContentSize = Math.max(0, contentSize);
  const maxScrollOffset = Math.max(0, normalizedContentSize - normalizedViewportSize);
  const normalizedScrollOffset = clamp(scrollOffset, 0, maxScrollOffset);
  const scrollable = maxScrollOffset > 0;
  const trackSize = normalizedViewportSize;
  const unclampedThumbSize =
    normalizedContentSize > 0
      ? Math.floor((normalizedViewportSize / normalizedContentSize) * normalizedViewportSize)
      : normalizedViewportSize;
  const thumbSize = clamp(Math.max(minThumbSize, unclampedThumbSize), 0, trackSize);
  const maxThumbOffset = Math.max(0, trackSize - thumbSize);
  const thumbOffset = scrollable
    ? clamp((normalizedScrollOffset / maxScrollOffset) * maxThumbOffset, 0, maxThumbOffset)
    : 0;

  return {
    id,
    viewportSize: normalizedViewportSize,
    contentSize: normalizedContentSize,
    scrollOffset: normalizedScrollOffset,
    maxScrollOffset,
    scrollable,
    canScrollBackward: normalizedScrollOffset > 0,
    canScrollForward: normalizedScrollOffset < maxScrollOffset,
    trackSize,
    thumbSize,
    thumbOffset,
  };
}

export function getInitialAxisState(id: ScrollAxisId): AxisState {
  return computeAxisState(0, 0, 0, 20, id);
}
