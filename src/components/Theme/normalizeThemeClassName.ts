export function normalizeThemeClassName(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }

  const normalizedTheme = theme.trim();

  if (normalizedTheme.length === 0) {
    return undefined;
  }

  return normalizedTheme.startsWith('cm-theme--')
    ? normalizedTheme
    : `cm-theme--${normalizedTheme}`;
}
