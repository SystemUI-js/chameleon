import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from '../../runtime/react-native-web';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import type { CScrollBarProps } from './ScrollBar';
import './index.scss';

export interface CScrollAreaProps {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly contentClassName?: string;
  readonly contentStyle?: StyleProp<ViewStyle>;
  readonly overflowX?: string;
  readonly overflowY?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly tabIndex?: number;
  readonly theme?: string;
  readonly onScroll?: React.UIEventHandler<HTMLElement>;
  readonly 'aria-label'?: string;
  readonly 'data-testid'?: string;
  readonly scrollBarComponent?: React.ComponentType<CScrollBarProps>;
}

interface ScrollState {
  readonly scrollSize: number;
  readonly viewportSize: number;
  readonly scrollPosition: number;
  readonly maxScrollPosition: number;
  readonly visible: boolean;
  readonly thumbSize: number;
  readonly thumbPosition: number;
}

function computeScrollState(
  scrollSize: number,
  viewportSize: number,
  scrollPosition: number,
): ScrollState {
  const maxScrollPosition = Math.max(0, scrollSize - viewportSize);
  const visible = maxScrollPosition > 0;
  const thumbSize =
    viewportSize > 0 && scrollSize > 0
      ? Math.max(16, (viewportSize / scrollSize) * viewportSize)
      : 0;
  const thumbPosition =
    maxScrollPosition > 0
      ? (scrollPosition / maxScrollPosition) * Math.max(0, viewportSize - thumbSize)
      : 0;

  return {
    scrollSize,
    viewportSize,
    scrollPosition,
    maxScrollPosition,
    visible,
    thumbSize,
    thumbPosition,
  };
}

function flattenViewStyle(style: StyleProp<ViewStyle>): ViewStyle {
  if (style == null) {
    return {};
  }

  if (Array.isArray(style)) {
    return style.reduce<ViewStyle>((accumulator, item) => {
      Object.assign(accumulator, flattenViewStyle(item));
      return accumulator;
    }, {});
  }

  if (typeof style === 'object') {
    return style as ViewStyle;
  }

  return {};
}

function resolveDefaultTabIndex(
  tabIndex: number | undefined,
  overflowX: string | undefined,
  overflowY: string | undefined,
): number | undefined {
  if (tabIndex !== undefined) {
    return tabIndex;
  }

  if (overflowX === 'hidden' && overflowY === 'hidden') {
    return undefined;
  }

  return 0;
}

export function CScrollArea({
  children,
  className,
  contentClassName,
  contentStyle,
  overflowX = 'auto',
  overflowY = 'auto',
  style,
  tabIndex,
  theme,
  onScroll,
  scrollBarComponent: ScrollBarComponent,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: CScrollAreaProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const resolvedTabIndex = resolveDefaultTabIndex(tabIndex, overflowX, overflowY);
  const isDomScrollbarMode = ScrollBarComponent != null;

  const rootStyle: ViewStyle = {
    ...flattenViewStyle(style),
  };

  if (!isDomScrollbarMode) {
    rootStyle.overflowX = overflowX;
    rootStyle.overflowY = overflowY;
  }

  const scrollableRef = useRef<HTMLElement | null>(null);
  const [verticalState, setVerticalState] = useState<ScrollState | null>(null);
  const [horizontalState, setHorizontalState] = useState<ScrollState | null>(null);

  const measureScrollbar = useCallback((): void => {
    const scrollRoot = scrollableRef.current;
    if (!scrollRoot) {
      return;
    }

    const scrollHeight = scrollRoot.scrollHeight;
    const scrollWidth = scrollRoot.scrollWidth;
    const clientHeight = scrollRoot.clientHeight;
    const clientWidth = scrollRoot.clientWidth;
    const scrollTop = scrollRoot.scrollTop;
    const scrollLeft = scrollRoot.scrollLeft;

    if (overflowY !== 'hidden') {
      setVerticalState(computeScrollState(scrollHeight, clientHeight, scrollTop));
    }

    if (overflowX !== 'hidden') {
      setHorizontalState(computeScrollState(scrollWidth, clientWidth, scrollLeft));
    }
  }, [overflowX, overflowY]);

  const handleScroll: React.UIEventHandler<HTMLElement> = useCallback(
    (event) => {
      measureScrollbar();
      onScroll?.(event);
    },
    [measureScrollbar, onScroll],
  );

  const handleVerticalScrollPositionChange = useCallback((position: number): void => {
    const scrollRoot = scrollableRef.current;
    if (scrollRoot) {
      scrollRoot.scrollTop = position;
      setVerticalState((prev) => (prev ? { ...prev, scrollPosition: position } : null));
    }
  }, []);

  const handleHorizontalScrollPositionChange = useCallback((position: number): void => {
    const scrollRoot = scrollableRef.current;
    if (scrollRoot) {
      scrollRoot.scrollLeft = position;
      setHorizontalState((prev) => (prev ? { ...prev, scrollPosition: position } : null));
    }
  }, []);

  useEffect(() => {
    if (!isDomScrollbarMode) {
      return;
    }

    measureScrollbar();

    const scrollRoot = scrollableRef.current;
    if (!scrollRoot) {
      return;
    }

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        measureScrollbar();
      });
      resizeObserver.observe(scrollRoot);
      return () => {
        resizeObserver.disconnect();
      };
    } else {
      const handleResize = (): void => measureScrollbar();
      window.addEventListener('resize', handleResize);
      scrollRoot.addEventListener('scroll', measureScrollbar);
      return () => {
        window.removeEventListener('resize', handleResize);
        scrollRoot.removeEventListener('scroll', measureScrollbar);
      };
    }
  }, [isDomScrollbarMode, measureScrollbar]);

  const baseClasses = ['cm-scroll-area'];
  if (isDomScrollbarMode) {
    baseClasses.push('cm-scroll-area--dom-scrollbar');
  }

  if (isDomScrollbarMode) {
    const verticalScrollBar =
      overflowY !== 'hidden' && verticalState ? (
        <ScrollBarComponent
          orientation="vertical"
          scrollSize={verticalState.scrollSize}
          viewportSize={verticalState.viewportSize}
          scrollPosition={verticalState.scrollPosition}
          maxScrollPosition={verticalState.maxScrollPosition}
          thumbSize={verticalState.thumbSize}
          thumbPosition={verticalState.thumbPosition}
          visible={verticalState.visible}
          onScrollPositionChange={handleVerticalScrollPositionChange}
        />
      ) : null;

    const horizontalScrollBar =
      overflowX !== 'hidden' && horizontalState ? (
        <ScrollBarComponent
          orientation="horizontal"
          scrollSize={horizontalState.scrollSize}
          viewportSize={horizontalState.viewportSize}
          scrollPosition={horizontalState.scrollPosition}
          maxScrollPosition={horizontalState.maxScrollPosition}
          thumbSize={horizontalState.thumbSize}
          thumbPosition={horizontalState.thumbPosition}
          visible={horizontalState.visible}
          onScrollPositionChange={handleHorizontalScrollPositionChange}
        />
      ) : null;

    return (
      <View
        className={mergeClasses(baseClasses, resolvedTheme, className)}
        style={rootStyle}
        tabIndex={resolvedTabIndex}
        aria-label={ariaLabel}
        testID={dataTestId}
      >
        <View
          className={mergeClasses([
            'cm-scroll-area__viewport',
            'cm-scroll-area--hide-native-scrollbar',
          ])}
          style={{ overflowX, overflowY }}
          onScroll={handleScroll}
          ref={(el) => {
            scrollableRef.current = el as HTMLElement | null;
          }}
        >
          <View
            className={mergeClasses(['cm-scroll-area__content'], undefined, contentClassName)}
            style={contentStyle}
            data-scroll-area-content="true"
          >
            {children}
          </View>
        </View>
        {verticalScrollBar}
        {horizontalScrollBar}
      </View>
    );
  }

  return (
    <View
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      style={rootStyle}
      tabIndex={resolvedTabIndex}
      onScroll={onScroll}
      aria-label={ariaLabel}
      testID={dataTestId}
    >
      <View
        className={mergeClasses(['cm-scroll-area__content'], undefined, contentClassName)}
        style={contentStyle}
        data-scroll-area-content="true"
      >
        {children}
      </View>
    </View>
  );
}
