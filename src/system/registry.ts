import { defaultThemeDefinition } from '@/theme/default';
import { win98ThemeDefinition } from '@/theme/win98';
import { winXpThemeDefinition } from '@/theme/winxp';
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

const SYSTEM_TYPE_DEFINITIONS: Record<SystemTypeId, SystemTypeDefinition> = {
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

const projectThemeDefinition = ({
  id,
  label,
  systemType,
  className,
}: ThemeDefinition): ThemeDefinition => ({
  id,
  label,
  systemType,
  className,
});

const THEME_DEFINITIONS: Record<ThemeId, ThemeDefinition> = {
  [THEME.win98]: projectThemeDefinition(win98ThemeDefinition),
  [THEME.winxp]: projectThemeDefinition(winXpThemeDefinition),
  [THEME.default]: projectThemeDefinition(defaultThemeDefinition),
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
