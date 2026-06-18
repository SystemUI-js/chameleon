import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { CProgress } from '@/components';
import { DEV_THEME, DevThemeRoot, type DevThemeId } from '../themeSwitcher';

type HarnessRoute = {
  theme: DevThemeId;
  fixture: string;
};

const DEFAULT_FIXTURE = 'bar';
const DEV_THEME_IDS = Object.values(DEV_THEME);

const isDevThemeId = (value: string | null): value is DevThemeId => {
  return value !== null && DEV_THEME_IDS.includes(value as DevThemeId);
};

const readHarnessRoute = (): HarnessRoute => {
  try {
    const url = new URL(window.location.href);
    const theme = url.searchParams.get('theme');
    const fixture = url.searchParams.get('fixture');

    return {
      theme: isDevThemeId(theme) ? theme : DEV_THEME.default,
      fixture: fixture ?? DEFAULT_FIXTURE,
    };
  } catch {
    return {
      theme: DEV_THEME.default,
      fixture: DEFAULT_FIXTURE,
    };
  }
};

interface HarnessLayoutProps {
  readonly children: ReactNode;
}

const HarnessLayout = ({ children }: HarnessLayoutProps): ReactNode => {
  return (
    <main
      data-testid="cprogress-playground"
      style={{
        display: 'grid',
        gap: '16px',
        padding: '24px',
        alignContent: 'start',
      }}
    >
      {children}
    </main>
  );
};

const BarFixture = (): ReactNode => {
  return (
    <HarnessLayout>
      <CProgress data-testid="cprogress-bar" variant="bar" value={42} indeterminate showValue />
      <p>Bar progress fixture.</p>
    </HarnessLayout>
  );
};

const CircleFixture = (): ReactNode => {
  return (
    <HarnessLayout>
      <CProgress data-testid="cprogress-circle" variant="circle" value={64} size={120} />
      <p>Circle progress fixture.</p>
    </HarnessLayout>
  );
};

const RingFixture = (): ReactNode => {
  return (
    <HarnessLayout>
      <CProgress data-testid="cprogress-ring" variant="ring" value={78} size={120} />
      <p>Ring progress fixture.</p>
    </HarnessLayout>
  );
};

const renderFixture = (fixture: string): ReactNode => {
  switch (fixture) {
    case 'bar':
      return <BarFixture />;
    case 'circle':
      return <CircleFixture />;
    case 'ring':
      return <RingFixture />;
    default:
      return (
        <HarnessLayout>
          <div data-testid="fixture-error">Unknown fixture: {fixture}</div>
        </HarnessLayout>
      );
  }
};

interface ThemedFixtureContainerProps {
  readonly theme: DevThemeId;
  readonly fixture: string;
}

const ThemedFixtureContainer = ({ theme, fixture }: ThemedFixtureContainerProps): ReactNode => {
  return <DevThemeRoot theme={theme}>{renderFixture(fixture)}</DevThemeRoot>;
};

const App = (): ReactNode => {
  const route = readHarnessRoute();

  return <ThemedFixtureContainer theme={route.theme} fixture={route.fixture} />;
};

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
