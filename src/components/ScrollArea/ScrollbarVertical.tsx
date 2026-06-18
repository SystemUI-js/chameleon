import type React from 'react';
import { CButton } from '../Button/Button';
import type { AxisState } from './scrollMetrics';
import { useScrollbarDrag } from './useScrollbarDrag';

export interface ScrollbarVerticalProps {
  readonly axisState: AxisState;
  readonly onScrollBy: (delta: number) => void;
  readonly onScrollTo: (offset: number) => void;
  readonly step: number;
}

export function ScrollbarVertical({
  axisState,
  onScrollBy,
  onScrollTo,
  step,
}: ScrollbarVerticalProps): React.ReactElement | null {
  const {
    handleDecrement,
    handleIncrement,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useScrollbarDrag({
    axisState,
    onScrollBy,
    onScrollTo,
    step,
    orientation: 'vertical',
  });

  return (
    <div
      className="cm-scroll-area__scrollbar-vertical"
      data-testid="scroll-area-scrollbar-vertical"
      data-scrollbar-orientation="vertical"
    >
      <CButton
        size="compact"
        className="cm-scroll-area__scrollbar-vertical-decrement"
        data-testid="scroll-area-scrollbar-vertical-decrement"
        onClick={handleDecrement}
        aria-label="Scroll up"
      >
        ▲
      </CButton>
      <div className="cm-scroll-area__scrollbar-vertical-track">
        <CButton
          size="compact"
          className="cm-scroll-area__scrollbar-vertical-thumb"
          data-testid="scroll-area-scrollbar-vertical-thumb"
          style={{
            transform: `translateY(${axisState.thumbOffset}px)`,
            height: axisState.thumbSize,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          aria-label="Scroll thumb"
        />
      </div>
      <CButton
        size="compact"
        className="cm-scroll-area__scrollbar-vertical-increment"
        data-testid="scroll-area-scrollbar-vertical-increment"
        onClick={handleIncrement}
        aria-label="Scroll down"
      >
        ▼
      </CButton>
    </div>
  );
}
