export function normalizeThemeName(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }

  const normalizedTheme = theme.trim();

  return normalizedTheme.length > 0 ? normalizedTheme : undefined;
}

export function resolveThemeClassName(theme: string | undefined): string | undefined {
  const normalizedTheme = normalizeThemeName(theme);

  if (normalizedTheme === undefined) {
    return undefined;
  }

  return normalizedTheme.startsWith('cm-theme--')
    ? normalizedTheme
    : `cm-theme--${normalizedTheme}`;
}
