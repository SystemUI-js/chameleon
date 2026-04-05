import type React from 'react';
import { resolveThemeClassName } from './themeName';
import { useTheme } from './useTheme';

export interface ResolvedThemeClassNameProps {
  theme?: string;
  children: (theme: string | undefined) => React.ReactElement;
}

export function ResolvedThemeClassName({
  theme,
  children,
}: ResolvedThemeClassNameProps): React.ReactElement {
  const resolvedTheme = resolveThemeClassName(useTheme(theme));

  return children(resolvedTheme);
}
