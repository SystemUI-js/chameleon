import { CScreenManager } from '@/components/Screen/ScreenManager';
import { DevThemeRoot } from './themeSwitcher';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <CScreenManager>
      <DevThemeRoot />
    </CScreenManager>,
  );
}
