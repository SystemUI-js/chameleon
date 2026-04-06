import { DEV_THEME, type DevThemeId } from '../themeSwitcher';

export type HarnessRoute = {
  theme: DevThemeId;
  fixture: string;
};

export const DEFAULT_FIXTURE = 'default';

const DEV_THEME_ID_SET: ReadonlySet<string> = new Set(Object.values(DEV_THEME));

export const isDevThemeId = (value: string | null): value is DevThemeId => {
  return value !== null && DEV_THEME_ID_SET.has(value);
};

export const readHarnessRoute = (): HarnessRoute => {
  try {
    const url = new URL(window.location.href);
    const theme = url.searchParams.get('theme');
    const fixture = url.searchParams.get('fixture');

    return {
      theme: isDevThemeId(theme) ? theme : DEV_THEME.default,
      fixture: fixture ?? DEFAULT_FIXTURE,
    };
  } catch {
    return {
      theme: DEV_THEME.default,
      fixture: DEFAULT_FIXTURE,
    };
  }
};
