import type { ReactElement } from 'react';
import { DefaultSystem } from './default/DefaultSystem';
import {
  assertValidSystemThemeSelection,
  resolveThemeDefinition,
  resolveSystemTypeDefinition,
} from './registry';
import type { SystemTypeId, ThemeId } from './types';
import { WindowsSystem } from './windows/WindowsSystem';

export interface SystemHostProps {
  readonly systemType: SystemTypeId;
  readonly theme: ThemeId;
}

const SYSTEM_SHELL_BY_TYPE = {
  windows: WindowsSystem,
  default: DefaultSystem,
} as const;

export const SystemHost = ({ systemType, theme }: SystemHostProps): ReactElement => {
  assertValidSystemThemeSelection({ systemType, theme });

  const systemDefinition = resolveSystemTypeDefinition(systemType);
  const themeDefinition = resolveThemeDefinition({ systemType, theme });
  const ActiveSystemShell = SYSTEM_SHELL_BY_TYPE[systemDefinition.id];

  return <ActiveSystemShell key={systemType} themeDefinition={themeDefinition} />;
};
