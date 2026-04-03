import React from 'react';

export interface ThemeContextValue {
  theme: string | undefined;
  hasThemeProvider: boolean;
}

export interface ThemeProps {
  name: string;
  children?: React.ReactNode;
}

export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: undefined,
  hasThemeProvider: false,
});

function normalizeTheme(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }

  const normalizedTheme = theme.trim();

  return normalizedTheme.length > 0 ? normalizedTheme : undefined;
}

export function Theme({ name, children }: ThemeProps): React.ReactElement {
  const parentContext = React.useContext(ThemeContext);

  if (parentContext.hasThemeProvider) {
    throw new Error('Nested Theme is not supported');
  }

  const contextValue = React.useMemo<ThemeContextValue>(
    () => ({ theme: normalizeTheme(name), hasThemeProvider: true }),
    [name],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={name}>{children}</div>
    </ThemeContext.Provider>
  );
}
