import React from 'react';
import { ThemeContext } from './Theme';

function normalizeTheme(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }

  const normalizedTheme = theme.trim();

  return normalizedTheme.length > 0 ? normalizedTheme : undefined;
}

export function useTheme(theme?: string): string | undefined {
  const context = React.useContext(ThemeContext);
  const explicitTheme = normalizeTheme(theme);

  if (explicitTheme !== undefined) {
    return explicitTheme;
  }

  return normalizeTheme(context.theme);
}
