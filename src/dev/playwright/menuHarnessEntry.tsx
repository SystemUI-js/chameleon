import { createRoot } from 'react-dom/client';
import { MenuHarnessApp } from './menuHarness';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<MenuHarnessApp />);
}
