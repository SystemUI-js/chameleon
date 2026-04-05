import React from 'react';
import { ThemeContext } from './Theme';
import { normalizeThemeName } from './themeName';

export function useTheme(theme?: string): string | undefined {
  const context = React.useContext(ThemeContext);
  const explicitTheme = normalizeThemeName(theme);

  if (explicitTheme !== undefined) {
    return explicitTheme;
  }

  return normalizeThemeName(context.theme);
}
