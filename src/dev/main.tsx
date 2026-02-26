import { CScreenManager } from '@/components/Screen/ScreenManager';
import { Win98Theme } from '@/theme/win98';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <CScreenManager>
      <Win98Theme />
    </CScreenManager>,
  );
}
