import type React from 'react';
import { View, type StyleProp, type ViewStyle } from '../../runtime/react-native-web';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
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
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: CScrollAreaProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const resolvedTabIndex = resolveDefaultTabIndex(tabIndex, overflowX, overflowY);
  const rootStyle: ViewStyle = {
    ...flattenViewStyle(style),
    overflowX,
    overflowY,
  };

  return (
    <View
      className={mergeClasses(['cm-scroll-area'], resolvedTheme, className)}
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
