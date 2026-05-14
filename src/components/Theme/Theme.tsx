import React from 'react';
import { normalizeThemeClassName } from './normalizeThemeClassName';

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

  const finalTheme = React.useMemo(() => normalizeThemeClassName(name), [name]);
  const contextValue = React.useMemo<ThemeContextValue>(
    () => ({ theme: finalTheme, hasThemeProvider: true }),
    [finalTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={finalTheme}>{children}</div>
    </ThemeContext.Provider>
  );
}
