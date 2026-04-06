function tokenizeClassNames(classNames: string | undefined): string[] {
  if (!classNames) {
    return [];
  }

  return classNames
    .split(/\s+/)
    .map((className) => className.trim())
    .filter((className) => className.length > 0);
}

export function mergeClasses(baseClasses: string[], theme?: string, className?: string): string {
  const themeClasses = theme ? [theme] : [];
  const mergedClasses = [...baseClasses, ...themeClasses, ...tokenizeClassNames(className)].filter(
    (value) => value.length > 0,
  );

  return Array.from(new Set(mergedClasses)).join(' ');
}
