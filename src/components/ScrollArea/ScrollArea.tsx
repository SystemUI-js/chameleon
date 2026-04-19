import type React from 'react';
import { View } from 'react-native';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly children?: React.ReactNode;
  readonly overflowX?: React.CSSProperties['overflowX'];
  readonly overflowY?: React.CSSProperties['overflowY'];
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
  'data-testid': dataTestId,
  ...divProps
}: CScrollAreaProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const resolvedTabIndex = resolveDefaultTabIndex(tabIndex, overflowX, overflowY);

  return (
    <View
      {...divProps}
      testID={dataTestId}
      className={mergeClasses(['cm-scroll-area'], resolvedTheme, className)}
      style={{ ...style, overflowX, overflowY }}
      tabIndex={resolvedTabIndex}
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
