import { useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { CWindow } from '@/components/Window/Window';
import { CWindowTitle } from '@/components/Window/WindowTitle';
import {
  DEV_SYSTEM_TYPE,
  DEV_THEME,
  DevSystemRoot,
  type DevSystemTypeId,
  type DevThemeId,
} from '../themeSwitcher';
import type { SystemThemeSelection } from '@/system/types';

type HarnessRoute =
  | {
      kind: 'fixture';
      fixture: string;
    }
  | {
      kind: 'system-theme';
      systemType: DevSystemTypeId;
      theme: DevThemeId;
    };

const DEFAULT_FIXTURE = 'default';
const DEV_SYSTEM_TYPE_IDS = Object.values(DEV_SYSTEM_TYPE);
const DEV_THEME_IDS = Object.values(DEV_THEME);

const isDevSystemTypeId = (value: string | null): value is DevSystemTypeId => {
  return value !== null && DEV_SYSTEM_TYPE_IDS.includes(value as DevSystemTypeId);
};

const isDevThemeId = (value: string | null): value is DevThemeId => {
  return value !== null && DEV_THEME_IDS.includes(value as DevThemeId);
};

const readHarnessRoute = (): HarnessRoute => {
  try {
    const url = new URL(window.location.href);
    const fixture = url.searchParams.get('fixture');

    if (fixture !== null) {
      return {
        kind: 'fixture',
        fixture,
      };
    }

    const systemType = url.searchParams.get('systemType');
    const theme = url.searchParams.get('theme');

    if (isDevSystemTypeId(systemType) && isDevThemeId(theme)) {
      return {
        kind: 'system-theme',
        systemType,
        theme,
      };
    }
  } catch {
    return {
      kind: 'fixture',
      fixture: DEFAULT_FIXTURE,
    };
  }

  return {
    kind: 'fixture',
    fixture: DEFAULT_FIXTURE,
  };
};

const useHarnessRoute = (): HarnessRoute => {
  const [route, setRoute] = useState<HarnessRoute>(() => readHarnessRoute());

  useEffect(() => {
    const updateRoute = () => {
      setRoute(readHarnessRoute());
    };

    window.addEventListener('popstate', updateRoute);

    return () => {
      window.removeEventListener('popstate', updateRoute);
    };
  }, []);

  return route;
};

const renderFixture = (fixture: string): ReactNode => {
  switch (fixture) {
    case 'default':
      return (
        <CWindow x={10} y={20} width={240} height={160}>
          <CWindowTitle>Default Window</CWindowTitle>
          <div>Default content</div>
        </CWindow>
      );
    case 'drag-only':
      return (
        <CWindow x={12} y={24} width={200} height={120} resizable={false}>
          <CWindowTitle>Drag only</CWindowTitle>
        </CWindow>
      );
    case 'min-clamp':
      return (
        <CWindow x={30} y={30} width={40} height={30}>
          <CWindowTitle>Clamp min</CWindowTitle>
        </CWindow>
      );
    case 'max-clamp':
      return (
        <CWindow
          x={50}
          y={60}
          width={120}
          height={100}
          resizeOptions={{
            minContentWidth: 20,
            minContentHeight: 30,
            maxContentWidth: 150,
            maxContentHeight: 110,
          }}
        >
          <CWindowTitle>Clamp max</CWindowTitle>
        </CWindow>
      );
    default:
      return <div data-testid="fixture-error">Unknown fixture: {fixture}</div>;
  }
};

const App = () => {
  const route = useHarnessRoute();
  const [selection, setSelection] = useState<SystemThemeSelection | null>(null);

  useEffect(() => {
    if (route.kind === 'system-theme') {
      setSelection({ systemType: route.systemType, theme: route.theme });
    }
  }, [route]);

  const handleSelectionChange = (newSelection: SystemThemeSelection) => {
    if (route.kind !== 'system-theme') {
      return;
    }

    const nextUrl = new URL(window.location.href);

    nextUrl.searchParams.delete('fixture');
    nextUrl.searchParams.set('systemType', newSelection.systemType);
    nextUrl.searchParams.set('theme', newSelection.theme);

    window.history.replaceState({}, '', nextUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (route.kind === 'system-theme') {
    if (selection === null) {
      return null;
    }

    return (
      <DevSystemRoot
        systemType={selection.systemType}
        theme={selection.theme}
        onSelectionChange={handleSelectionChange}
      />
    );
  }

  return <>{renderFixture(route.fixture)}</>;
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
