import type React from 'react';
import { View, type ViewProps } from 'react-native';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CStatusBarProps extends ViewProps {
  theme?: string;
}

export function CStatusBar({
  children,
  className,
  theme,
  ...restProps
}: CStatusBarProps): React.ReactElement {
  const resolvedTheme = useTheme(theme);

  return (
    <View {...restProps} className={mergeClasses(['cm-status-bar'], resolvedTheme, className)}>
      {children}
    </View>
  );
}
