import { useState } from 'react';
import { ComponentCatalog } from './ComponentCatalog';
import { DEFAULT_DEV_SELECTION, type DevThemeId } from './themeSwitcher';

export const DevCatalogApp = (): JSX.Element => {
  const [theme, setTheme] = useState<DevThemeId>(DEFAULT_DEV_SELECTION.theme);

  return <ComponentCatalog theme={theme} onThemeChange={setTheme} />;
};
