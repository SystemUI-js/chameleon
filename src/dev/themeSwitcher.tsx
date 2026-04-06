import type { ReactElement, ReactNode } from 'react';
import { Theme } from '@/components';
import { defaultThemeDefinition } from '@/theme/default';
import type { ThemeDefinition, ThemeId } from '@/theme/types';
import { win98ThemeDefinition } from '@/theme/win98';
import { winXpThemeDefinition } from '@/theme/winxp';

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
  readonly testId?: string | null;
}

export function DevThemeRoot({
  theme = DEFAULT_DEV_SELECTION.theme,
  children,
  testId,
}: DevThemeRootProps): ReactElement {
  const themeDefinition = resolveDevThemeDefinition(theme);
  const rootTestId = testId === undefined ? 'theme-root' : testId;

  return (
    <Theme name={themeDefinition.className}>
      <div data-testid={rootTestId}>{children}</div>
    </Theme>
  );
}
