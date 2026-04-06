import React from 'react';
import { normalizeThemeClassName } from './normalizeThemeClassName';
import { ThemeContext } from './Theme';

export function useTheme(theme?: string): string | undefined {
  const context = React.useContext(ThemeContext);
  const explicitTheme = normalizeThemeClassName(theme);

  if (explicitTheme !== undefined) {
    return explicitTheme;
  }

  return normalizeThemeClassName(context.theme);
}
