import type React from 'react';
import { View, type ViewProps } from 'react-native';
import { renderNativeTextChildren } from '../nativeTextChildren';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CStatusBarItemProps extends ViewProps {
  theme?: string;
}

export function CStatusBarItem({
  children,
  className,
  theme,
  ...restProps
}: CStatusBarItemProps): React.ReactElement {
  const resolvedTheme = useTheme(theme);

  return (
    <View
      {...restProps}
      className={mergeClasses(['cm-status-bar__item'], resolvedTheme, className)}
    >
      {renderNativeTextChildren(children)}
    </View>
  );
}
