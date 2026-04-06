import { defaultThemeDefinition as defaultPureThemeDefinition } from '@/theme/default';
import { win98ThemeDefinition as win98PureThemeDefinition } from '@/theme/win98';
import { winXpThemeDefinition as winXpPureThemeDefinition } from '@/theme/winxp';
import type {
  SystemThemeSelection,
  SystemTypeDefinition,
  SystemTypeId,
  ThemeDefinition,
  ThemeId,
} from './types';

export const SYSTEM_TYPE = {
  windows: 'windows',
  default: 'default',
} as const satisfies Record<string, SystemTypeId>;

export const THEME = {
  win98: 'win98',
  winxp: 'winxp',
  default: 'default',
} as const satisfies Record<string, ThemeId>;

export const SYSTEM_THEME_MATRIX = {
  [SYSTEM_TYPE.windows]: [THEME.win98, THEME.winxp],
  [SYSTEM_TYPE.default]: [THEME.default],
} as const satisfies Record<SystemTypeId, readonly ThemeId[]>;

export const DEFAULT_SYSTEM_TYPE: SystemTypeId = SYSTEM_TYPE.default;

export const DEFAULT_THEME_BY_SYSTEM = {
  [SYSTEM_TYPE.windows]: THEME.win98,
  [SYSTEM_TYPE.default]: THEME.default,
} as const satisfies Record<SystemTypeId, ThemeId>;

export const SYSTEM_TYPE_DEFINITIONS: Record<SystemTypeId, SystemTypeDefinition> = {
  [SYSTEM_TYPE.windows]: {
    id: SYSTEM_TYPE.windows,
    label: 'Windows',
    className: 'cm-system--windows',
  },
  [SYSTEM_TYPE.default]: {
    id: SYSTEM_TYPE.default,
    label: 'Default',
    className: 'cm-system--default',
  },
};

function projectThemeDefinition(
  themeDefinition: { id: ThemeId; label: string; className: string },
  systemType: SystemTypeId,
): ThemeDefinition {
  return {
    id: themeDefinition.id,
    label: themeDefinition.label,
    systemType,
    className: themeDefinition.className,
  };
}

const THEME_DEFINITIONS: Record<ThemeId, ThemeDefinition> = {
  [THEME.win98]: projectThemeDefinition(win98PureThemeDefinition, SYSTEM_TYPE.windows),
  [THEME.winxp]: projectThemeDefinition(winXpPureThemeDefinition, SYSTEM_TYPE.windows),
  [THEME.default]: projectThemeDefinition(defaultPureThemeDefinition, SYSTEM_TYPE.default),
};

export function resolveSystemTypeDefinition(systemType: SystemTypeId): SystemTypeDefinition {
  return SYSTEM_TYPE_DEFINITIONS[systemType];
}

export function assertValidSystemThemeSelection({ systemType, theme }: SystemThemeSelection): void {
  const allowedThemes: readonly ThemeId[] = SYSTEM_THEME_MATRIX[systemType];

  if (!allowedThemes.includes(theme)) {
    throw new Error(`Invalid theme "${theme}" for system type "${systemType}"`);
  }
}

export function resolveThemeDefinition({
  systemType,
  theme,
}: SystemThemeSelection): ThemeDefinition {
  assertValidSystemThemeSelection({ systemType, theme });

  return THEME_DEFINITIONS[theme];
}
