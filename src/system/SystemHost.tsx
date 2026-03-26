import type { ReactElement } from 'react';
import { DefaultSystem } from './default/DefaultSystem';
import {
  assertValidSystemThemeSelection,
  resolveThemeDefinition,
  resolveSystemTypeDefinition,
} from './registry';
import type { SystemThemeSelection, SystemTypeId, ThemeId } from './types';
import { WindowsSystem } from './windows/WindowsSystem';

export interface SystemHostProps {
  readonly systemType: SystemTypeId;
  readonly theme: ThemeId;
  readonly onSelectionChange?: (selection: SystemThemeSelection) => void;
}

const SYSTEM_SHELL_BY_TYPE = {
  windows: WindowsSystem,
  default: DefaultSystem,
} as const;

export const SystemHost = ({
  systemType,
  theme,
  onSelectionChange,
}: SystemHostProps): ReactElement => {
  assertValidSystemThemeSelection({ systemType, theme });

  const systemDefinition = resolveSystemTypeDefinition(systemType);
  const themeDefinition = resolveThemeDefinition({ systemType, theme });
  const ActiveSystemShell = SYSTEM_SHELL_BY_TYPE[systemDefinition.id];

  if (systemDefinition.id === 'default') {
    return (
      <ActiveSystemShell
        key={systemType}
        themeDefinition={themeDefinition}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  return <ActiveSystemShell key={systemType} themeDefinition={themeDefinition} />;
};
