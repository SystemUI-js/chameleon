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

/**
 * 统一判断滚动条是否应该显示。
 *
 * 综合考虑 overflow 设置、scrollbarVisibility Props 与轴向的动态滚动状态：
 * - overflow 为 'hidden' 或 'clip'，或 scrollbarVisibility 为 'hidden' 时永不显示
 * - scrollbarVisibility 为 'always' 时强制显示
 * - overflow 为 'scroll' 时即使内容未溢出也显示
 * - overflow 为 'auto'（默认情况）时按 axisState.scrollable 动态决定
 */
function shouldShowScrollbar(
  axisState: AxisState,
  overflow: React.CSSProperties['overflowX'] | React.CSSProperties['overflowY'],
  scrollbarVisibility: CScrollAreaScrollbarVisibility,
): boolean {
  // hidden 或 clip 强制屏蔽自定义滚动条，scrollbarVisibility="hidden" 同理
  if (overflow === 'hidden' || overflow === 'clip' || scrollbarVisibility === 'hidden') {
    return false;
  }

  // scrollbarVisibility="always" 总是显示
  if (scrollbarVisibility === 'always') {
    return true;
  }

  // overflow="scroll" 与原生行为一致：始终显示滚动条
  if (overflow === 'scroll') {
    return true;
  }

  // overflow="auto" 时根据内容是否真正溢出来决定（依赖 ResizeObserver 同步的 axisState）
  return axisState.scrollable;
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
  // 当 overflow 被强制屏蔽（hidden/clip）或 scrollbarVisibility 为 hidden 时
  // 不应将 viewport 的 scrollTop/scrollLeft 反馈到 axis state，避免被清零
  const horizontalScrollOffsetActive =
    overflowX !== 'hidden' && overflowX !== 'clip' && scrollbarVisibility !== 'hidden';
  const verticalScrollOffsetActive =
    overflowY !== 'hidden' && overflowY !== 'clip' && scrollbarVisibility !== 'hidden';
  const syncAxisStates = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    setVerticalAxisState(
      computeAxisState(
        viewport.clientHeight,
        viewport.scrollHeight,
        verticalScrollOffsetActive ? viewport.scrollTop : 0,
        20,
        'vertical',
      ),
    );
    setHorizontalAxisState(
      computeAxisState(
        viewport.clientWidth,
        viewport.scrollWidth,
        horizontalScrollOffsetActive ? viewport.scrollLeft : 0,
        20,
        'horizontal',
      ),
    );
  }, [horizontalScrollOffsetActive, verticalScrollOffsetActive]);

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

  const showVerticalScrollbar = shouldShowScrollbar(
    verticalAxisState,
    overflowY,
    scrollbarVisibility,
  );
  const showHorizontalScrollbar = shouldShowScrollbar(
    horizontalAxisState,
    overflowX,
    scrollbarVisibility,
  );

  const rootClasses = mergeClasses(
    [
      'cm-scroll-area',
      showVerticalScrollbar ? 'cm-scroll-area--has-vertical' : undefined,
      showHorizontalScrollbar ? 'cm-scroll-area--has-horizontal' : undefined,
    ].filter((c): c is string => c !== undefined),
    resolvedTheme,
    className,
  );

  const viewportClasses = mergeClasses(
    [
      'cm-scroll-area__viewport',
      showVerticalScrollbar ? 'has-vertical' : undefined,
      showHorizontalScrollbar ? 'has-horizontal' : undefined,
    ].filter((c): c is string => c !== undefined),
  );

  return (
    <div
      className={rootClasses}
      style={style}
      data-testid={dataTestId}
      data-scroll-area-host="true"
      data-scrollbar-visibility={scrollbarVisibility}
      data-scrollbar-horizontal-visible={String(showHorizontalScrollbar)}
      data-scrollbar-vertical-visible={String(showVerticalScrollbar)}
      data-scroll-axis-vertical={serializeAxisState(verticalAxisState)}
      data-scroll-axis-horizontal={serializeAxisState(horizontalAxisState)}
    >
      <div
        {...divProps}
        ref={viewportRef}
        className={viewportClasses}
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
