import React from 'react';
import { normalizeThemeName, resolveThemeClassName } from './themeName';

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

export function Theme({ name, children }: ThemeProps): React.ReactElement {
  const parentContext = React.useContext(ThemeContext);

  if (parentContext.hasThemeProvider) {
    throw new Error('Nested Theme is not supported');
  }

  const contextValue = React.useMemo<ThemeContextValue>(
    () => ({ theme: normalizeThemeName(name), hasThemeProvider: true }),
    [name],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={resolveThemeClassName(name)}>{children}</div>
    </ThemeContext.Provider>
  );
}
