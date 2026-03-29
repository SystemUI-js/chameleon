import { defaultThemeDefinition } from '@/theme/default';
import type { ThemeDefinition, ThemeId } from '@/theme/types';
import { win98ThemeDefinition } from '@/theme/win98';
import { winXpThemeDefinition } from '@/theme/winxp';
import type { ReactElement, ReactNode } from 'react';

export const DEV_THEME = {
  default: 'default',
  win98: 'win98',
  winxp: 'winxp',
} as const satisfies Record<ThemeId, ThemeId>;

export type DevThemeId = (typeof DEV_THEME)[keyof typeof DEV_THEME];

export const DEFAULT_DEV_SELECTION = {
  theme: DEV_THEME.default,
} as const;

const DEV_THEME_DEFINITIONS: Record<DevThemeId, ThemeDefinition> = {
  default: defaultThemeDefinition,
  win98: win98ThemeDefinition,
  winxp: winXpThemeDefinition,
};

export function resolveDevThemeDefinition(
  theme: DevThemeId = DEFAULT_DEV_SELECTION.theme,
): ThemeDefinition {
  return DEV_THEME_DEFINITIONS[theme];
}

interface DevThemeRootProps {
  readonly theme?: DevThemeId;
  readonly children?: ReactNode;
}

export function DevThemeRoot({
  theme = DEFAULT_DEV_SELECTION.theme,
  children,
}: DevThemeRootProps): ReactElement {
  const themeDefinition = resolveDevThemeDefinition(theme);

  return (
    <div data-testid="theme-root" className={themeDefinition.className}>
      {children}
    </div>
  );
}
