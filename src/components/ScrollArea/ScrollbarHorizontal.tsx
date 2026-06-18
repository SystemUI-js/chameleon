import type React from 'react';
import { CButton } from '../Button/Button';
import type { AxisState } from './scrollMetrics';
import { useScrollbarDrag } from './useScrollbarDrag';

export interface ScrollbarHorizontalProps {
  readonly axisState: AxisState;
  readonly onScrollBy: (delta: number) => void;
  readonly onScrollTo: (offset: number) => void;
  readonly step: number;
}

export function ScrollbarHorizontal({
  axisState,
  onScrollBy,
  onScrollTo,
  step,
}: ScrollbarHorizontalProps): React.ReactElement | null {
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
    orientation: 'horizontal',
  });

  return (
    <div
      className="cm-scroll-area__scrollbar-horizontal"
      data-testid="scroll-area-scrollbar-horizontal"
      data-scrollbar-orientation="horizontal"
    >
      <CButton
        size="compact"
        className="cm-scroll-area__scrollbar-horizontal-decrement"
        data-testid="scroll-area-scrollbar-horizontal-decrement"
        onClick={handleDecrement}
        aria-label="Scroll left"
      >
        ◀
      </CButton>
      <div className="cm-scroll-area__scrollbar-horizontal-track">
        <CButton
          size="compact"
          className="cm-scroll-area__scrollbar-horizontal-thumb"
          data-testid="scroll-area-scrollbar-horizontal-thumb"
          style={{
            transform: `translateX(${axisState.thumbOffset}px)`,
            width: axisState.thumbSize,
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
        className="cm-scroll-area__scrollbar-horizontal-increment"
        data-testid="scroll-area-scrollbar-horizontal-increment"
        onClick={handleIncrement}
        aria-label="Scroll right"
      >
        ▶
      </CButton>
    </div>
  );
}
