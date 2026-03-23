import { createRoot } from 'react-dom/client';
import { DEFAULT_DEV_SELECTION, DevSystemRoot } from './themeSwitcher';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<DevSystemRoot {...DEFAULT_DEV_SELECTION} />);
}
