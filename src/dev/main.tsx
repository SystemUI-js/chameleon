import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { ComponentCatalog } from './ComponentCatalog';
import { DEFAULT_DEV_SELECTION, type DevThemeId } from './themeSwitcher';

const App = () => {
  const [theme, setTheme] = useState<DevThemeId>(DEFAULT_DEV_SELECTION.theme);

  return <ComponentCatalog theme={theme} onThemeChange={setTheme} />;
};

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
