import type React from 'react';
import { View } from 'react-native';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CStatusBarItemProps extends React.HTMLAttributes<HTMLDivElement> {
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
      testID={restProps['data-testid'] as string | undefined}
    >
      {children}
    </View>
  );
}
