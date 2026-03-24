import { createRoot } from 'react-dom/client';
import { CommonControlsPreview } from './commonControlsPreview';
import { DEFAULT_DEV_SELECTION, DevSystemRoot } from './themeSwitcher';

const PREVIEW_HOST_SELECTOR =
  '[data-testid="default-window-body"], [data-testid="windows-window-body"]';
const MAX_PREVIEW_MOUNT_ATTEMPTS = 12;

function mountCommonControlsPreview(attempt = 0): void {
  const previewHost = document.querySelector<HTMLElement>(PREVIEW_HOST_SELECTOR);

  if (previewHost) {
    const previewRoot = createRoot(previewHost);
    previewRoot.render(<CommonControlsPreview />);
    return;
  }

  if (attempt < MAX_PREVIEW_MOUNT_ATTEMPTS) {
    window.requestAnimationFrame(() => {
      mountCommonControlsPreview(attempt + 1);
    });
  }
}

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<DevSystemRoot {...DEFAULT_DEV_SELECTION} />);
  mountCommonControlsPreview();
}
