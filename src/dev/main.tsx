import { createRoot } from 'react-dom/client';
import { useState, useEffect, useCallback } from 'react';
import { CommonControlsPreview } from './commonControlsPreview';
import { DEFAULT_DEV_SELECTION, DevSystemRoot } from './themeSwitcher';
import type { SystemThemeSelection } from '@/system/types';

const PREVIEW_HOST_SELECTOR =
  '[data-testid="default-window-body"], [data-testid="windows-window-body"]';
const MAX_PREVIEW_MOUNT_ATTEMPTS = 12;

function mountCommonControlsPreview(_selection?: SystemThemeSelection, attempt = 0): void {
  const previewHost = document.querySelector<HTMLElement>(PREVIEW_HOST_SELECTOR);

  if (previewHost) {
    const previewRoot = createRoot(previewHost);
    previewRoot.render(<CommonControlsPreview />);
    return;
  }

  if (attempt < MAX_PREVIEW_MOUNT_ATTEMPTS) {
    window.requestAnimationFrame(() => {
      mountCommonControlsPreview(_selection, attempt + 1);
    });
  }
}

const App = () => {
  const [selection, setSelection] = useState<SystemThemeSelection>(DEFAULT_DEV_SELECTION);

  const handleSelectionChange = useCallback((newSelection: SystemThemeSelection) => {
    setSelection(newSelection);
  }, []);

  useEffect(() => {
    // selection argument triggers effect on selection changes
    mountCommonControlsPreview(selection);
  }, [selection]);

  return (
    <DevSystemRoot
      systemType={selection.systemType}
      theme={selection.theme}
      onSelectionChange={handleSelectionChange}
    />
  );
};

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
  mountCommonControlsPreview();
}
