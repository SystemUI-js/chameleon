import { createRoot } from 'react-dom/client';
import { CommonControlsHarnessApp } from './commonControlsHarness';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<CommonControlsHarnessApp />);
}
