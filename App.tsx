import React from 'react';
import { CommonControlsHarnessApp } from './src/dev/playwright/commonControlsHarness';
import { MenuHarnessApp } from './src/dev/playwright/menuHarness';
import { WindowHarnessApp } from './src/dev/playwright/windowHarness';
import { DevCatalogApp } from './src/dev/App';

type ExpoPreviewRoute = 'catalog' | 'window' | 'menu' | 'common-controls';

const PATHNAME_ROUTE_MAP = new Map<string, ExpoPreviewRoute>([
  ['/', 'catalog'],
  ['/index.html', 'catalog'],
  ['/playwright-window.html', 'window'],
  ['/playwright-menu.html', 'menu'],
  ['/playwright-common-controls.html', 'common-controls'],
]);

const SCREEN_ROUTE_MAP = new Map<string, ExpoPreviewRoute>([
  ['catalog', 'catalog'],
  ['window', 'window'],
  ['menu', 'menu'],
  ['common-controls', 'common-controls'],
]);

const resolvePreviewRoute = (): ExpoPreviewRoute => {
  if (typeof window === 'undefined') {
    return 'catalog';
  }

  try {
    const url = new URL(window.location.href);
    const screen = SCREEN_ROUTE_MAP.get(url.searchParams.get('screen') ?? '');

    if (screen !== undefined) {
      return screen;
    }

    return PATHNAME_ROUTE_MAP.get(url.pathname) ?? 'catalog';
  } catch {
    return 'catalog';
  }
};

const renderPreviewRoute = (route: ExpoPreviewRoute): React.JSX.Element => {
  switch (route) {
    case 'window':
      return <WindowHarnessApp />;
    case 'menu':
      return <MenuHarnessApp />;
    case 'common-controls':
      return <CommonControlsHarnessApp />;
    case 'catalog':
    default:
      return <DevCatalogApp />;
  }
};

export const App = (): React.JSX.Element => {
  return renderPreviewRoute(resolvePreviewRoute());
};
