import { SystemHost } from '@/system/SystemHost';
import {
  resolveSystemTypeDefinition,
  resolveThemeDefinition,
  SYSTEM_TYPE,
  THEME,
} from '@/system/registry';
import type {
  SystemThemeSelection,
  SystemTypeDefinition,
  SystemTypeId,
  ThemeDefinition,
  ThemeId,
} from '@/system/types';
import type { ReactElement } from 'react';

export const DEV_SYSTEM_TYPE = SYSTEM_TYPE;

export const DEV_THEME = THEME;

export type DevThemeId = (typeof DEV_THEME)[keyof typeof DEV_THEME];

export type DevSystemTypeId = (typeof DEV_SYSTEM_TYPE)[keyof typeof DEV_SYSTEM_TYPE];

export const DEFAULT_DEV_SELECTION = {
  systemType: DEV_SYSTEM_TYPE.default,
  theme: DEV_THEME.default,
} as const satisfies SystemThemeSelection;

interface DevSelectionInput {
  readonly systemType?: SystemTypeId;
  readonly theme?: ThemeId;
}

const resolveDevSelection = ({
  systemType = DEFAULT_DEV_SELECTION.systemType,
  theme = DEFAULT_DEV_SELECTION.theme,
}: DevSelectionInput = {}): SystemThemeSelection => ({
  systemType,
  theme,
});

export function resolveDevSystemDefinition(
  systemType: DevSystemTypeId = DEFAULT_DEV_SELECTION.systemType,
): SystemTypeDefinition {
  return resolveSystemTypeDefinition(systemType);
}

export function resolveDevThemeDefinition(selection: DevSelectionInput = {}): ThemeDefinition {
  return resolveThemeDefinition(resolveDevSelection(selection));
}

interface DevSystemRootProps {
  readonly systemType?: DevSystemTypeId;
  readonly theme?: DevThemeId;
}

export function DevSystemRoot({
  systemType = DEFAULT_DEV_SELECTION.systemType,
  theme = DEFAULT_DEV_SELECTION.theme,
}: DevSystemRootProps): ReactElement {
  resolveDevSystemDefinition(systemType);
  resolveDevThemeDefinition({ systemType, theme });

  return <SystemHost systemType={systemType} theme={theme} />;
}
