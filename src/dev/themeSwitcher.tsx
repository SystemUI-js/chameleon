import { Win98Theme } from '@/theme/win98';
import { WinXpTheme } from '@/theme/winxp';
import React from 'react';

export const DEV_THEME = {
  win98: 'win98',
  winxp: 'winxp',
} as const;

export type DevThemeId = (typeof DEV_THEME)[keyof typeof DEV_THEME];

const DEV_THEME_COMPONENTS: Record<DevThemeId, React.ComponentType> = {
  [DEV_THEME.win98]: Win98Theme,
  [DEV_THEME.winxp]: WinXpTheme,
};

export const ACTIVE_THEME: DevThemeId = DEV_THEME.win98;

export function resolveDevThemeComponent(themeId: DevThemeId): React.ComponentType {
  return DEV_THEME_COMPONENTS[themeId];
}

interface DevThemeRootProps {
  activeTheme?: DevThemeId;
}

export function DevThemeRoot({
  activeTheme = ACTIVE_THEME,
}: DevThemeRootProps): React.ReactElement {
  const ThemeRoot = resolveDevThemeComponent(activeTheme);
  return <ThemeRoot />;
}
