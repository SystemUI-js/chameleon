import type React from 'react';
import { View } from 'react-native';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CButtonSeparatorOrientation = 'horizontal' | 'vertical';

export interface CButtonSeparatorProps {
  orientation?: CButtonSeparatorOrientation;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

function resolveThemeClass(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }

  return theme.startsWith('cm-theme--') ? theme : `cm-theme--${theme}`;
}

export function CButtonSeparator({
  orientation = 'vertical',
  className,
  theme,
  'data-testid': dataTestId,
}: CButtonSeparatorProps): React.ReactElement {
  const resolvedTheme = resolveThemeClass(useTheme(theme));
  const baseClasses = ['cm-button-separator', `cm-button-separator--${orientation}`];

  return (
    <View
      aria-hidden="true"
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      testID={dataTestId}
    />
  );
}
