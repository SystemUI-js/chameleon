import type * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';
import { ScrollbarHorizontal } from './ScrollbarHorizontal';
import { ScrollbarVertical } from './ScrollbarVertical';
import { type AxisState, computeAxisState, getInitialAxisState } from './scrollMetrics';

export type CScrollAreaScrollbarVisibility = 'auto' | 'always' | 'hidden';

export interface CScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly children?: React.ReactNode;
  readonly overflowX?: React.CSSProperties['overflowX'];
  readonly overflowY?: React.CSSProperties['overflowY'];
  readonly scrollbarVisibility?: CScrollAreaScrollbarVisibility;
  readonly contentClassName?: string;
  readonly contentStyle?: React.CSSProperties;
  readonly theme?: string;
  readonly 'data-testid'?: string;
}

function resolveDefaultTabIndex(
  tabIndex: number | undefined,
  overflowX: React.CSSProperties['overflowX'],
  overflowY: React.CSSProperties['overflowY'],
): number | undefined {
  if (tabIndex !== undefined) {
    return tabIndex;
  }

  if (overflowX === 'hidden' && overflowY === 'hidden') {
    return undefined;
  }

  return 0;
}

function isCustomScrollbarEligible(
  overflow: React.CSSProperties['overflowX'] | React.CSSProperties['overflowY'],
  scrollbarVisibility: CScrollAreaScrollbarVisibility,
): boolean {
  return scrollbarVisibility !== 'hidden' && overflow !== 'hidden';
}

function serializeAxisState(axisState: AxisState): string {
  return JSON.stringify(axisState);
}

export function CScrollArea({
  children,
  className,
  contentClassName,
  contentStyle,
  overflowX = 'auto',
  overflowY = 'auto',
  scrollbarVisibility = 'auto',
  style,
  tabIndex,
  theme,
  'data-testid': dataTestId,
  onScroll,
  ...divProps
}: CScrollAreaProps): React.ReactElement {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [verticalAxisState, setVerticalAxisState] = useState<AxisState>(() =>
    getInitialAxisState('vertical'),
  );
  const [horizontalAxisState, setHorizontalAxisState] = useState<AxisState>(() =>
    getInitialAxisState('horizontal'),
  );
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const resolvedTabIndex = resolveDefaultTabIndex(tabIndex, overflowX, overflowY);
  const horizontalScrollbarEligible = isCustomScrollbarEligible(overflowX, scrollbarVisibility);
  const verticalScrollbarEligible = isCustomScrollbarEligible(overflowY, scrollbarVisibility);
  const syncAxisStates = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    setVerticalAxisState(
      computeAxisState(
        viewport.clientHeight,
        viewport.scrollHeight,
        verticalScrollbarEligible ? viewport.scrollTop : 0,
        20,
        'vertical',
      ),
    );
    setHorizontalAxisState(
      computeAxisState(
        viewport.clientWidth,
        viewport.scrollWidth,
        horizontalScrollbarEligible ? viewport.scrollLeft : 0,
        20,
        'horizontal',
      ),
    );
  }, [horizontalScrollbarEligible, verticalScrollbarEligible]);

  useEffect(() => {
    syncAxisStates();
  }, [syncAxisStates]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;

    if (!viewport || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      syncAxisStates();
    });

    resizeObserver.observe(viewport);

    if (content) {
      resizeObserver.observe(content);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [syncAxisStates]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      syncAxisStates();
      onScroll?.(event);
    },
    [onScroll, syncAxisStates],
  );

  const handleScrollByVertical = useCallback(
    (delta: number) => {
      const viewport = viewportRef.current;

      if (viewport) {
        viewport.scrollTop += delta;
        syncAxisStates();
      }
    },
    [syncAxisStates],
  );

  const handleScrollToVertical = useCallback(
    (offset: number) => {
      const viewport = viewportRef.current;

      if (viewport) {
        viewport.scrollTop = offset;
        syncAxisStates();
      }
    },
    [syncAxisStates],
  );

  const handleScrollByHorizontal = useCallback(
    (delta: number) => {
      const viewport = viewportRef.current;

      if (viewport) {
        viewport.scrollLeft += delta;
        syncAxisStates();
      }
    },
    [syncAxisStates],
  );

  const handleScrollToHorizontal = useCallback(
    (offset: number) => {
      const viewport = viewportRef.current;

      if (viewport) {
        viewport.scrollLeft = offset;
        syncAxisStates();
      }
    },
    [syncAxisStates],
  );

  const showVerticalScrollbar =
    verticalScrollbarEligible && (scrollbarVisibility === 'always' || verticalAxisState.scrollable);
  const showHorizontalScrollbar =
    horizontalScrollbarEligible &&
    (scrollbarVisibility === 'always' || horizontalAxisState.scrollable);

  return (
    <div
      className={mergeClasses(['cm-scroll-area'], resolvedTheme, className)}
      style={style}
      data-testid={dataTestId}
      data-scroll-area-host="true"
      data-scrollbar-visibility={scrollbarVisibility}
      data-scrollbar-horizontal-eligible={String(horizontalScrollbarEligible)}
      data-scrollbar-vertical-eligible={String(verticalScrollbarEligible)}
      data-scroll-axis-vertical={serializeAxisState(verticalAxisState)}
      data-scroll-axis-horizontal={serializeAxisState(horizontalAxisState)}
    >
      <div
        {...divProps}
        ref={viewportRef}
        className="cm-scroll-area__viewport"
        style={{ overflowX, overflowY }}
        tabIndex={resolvedTabIndex}
        onScroll={handleScroll}
        data-testid="scroll-area-viewport"
        data-scroll-area-viewport="true"
      >
        <div
          ref={contentRef}
          className={mergeClasses(['cm-scroll-area__content'], undefined, contentClassName)}
          style={contentStyle}
          data-scroll-area-content="true"
        >
          {children}
        </div>
      </div>
      {showVerticalScrollbar && (
        <ScrollbarVertical
          axisState={verticalAxisState}
          onScrollBy={handleScrollByVertical}
          onScrollTo={handleScrollToVertical}
          step={Math.max(16, Math.floor(verticalAxisState.viewportSize / 10))}
        />
      )}
      {showHorizontalScrollbar && (
        <ScrollbarHorizontal
          axisState={horizontalAxisState}
          onScrollBy={handleScrollByHorizontal}
          onScrollTo={handleScrollToHorizontal}
          step={Math.max(16, Math.floor(horizontalAxisState.viewportSize / 10))}
        />
      )}
      {showVerticalScrollbar && showHorizontalScrollbar && (
        <div
          className="cm-scroll-area__scrollbar-corner"
          data-testid="scroll-area-scrollbar-corner"
        />
      )}
    </div>
  );
}
