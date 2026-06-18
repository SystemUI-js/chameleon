import { type ReactNode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CContextMenu, type MenuListItem } from '@/components';
import { DEV_THEME, DevThemeRoot, type DevThemeId } from '../themeSwitcher';

type HarnessRoute = {
  theme: DevThemeId;
  fixture: string;
};

const DEFAULT_FIXTURE = 'basic';
const DEV_THEME_IDS = Object.values(DEV_THEME);

const CONTEXT_MENU_ITEMS: readonly MenuListItem[] = [
  { id: 'open', key: 'open', title: 'Open', 'data-testid': 'ccontext-menu-item-open' },
  { id: 'delete', key: 'delete', title: 'Delete', 'data-testid': 'ccontext-menu-item-delete' },
];

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
  readonly anchor?: 'default' | 'bottom-right';
}

const HarnessLayout = ({ children, anchor = 'default' }: HarnessLayoutProps): ReactNode => {
  return (
    <main
      data-testid="ccontext-menu-playground"
      style={{
        minHeight: '100vh',
        padding: '24px',
        display: 'grid',
        gap: '16px',
        alignContent: anchor === 'bottom-right' ? 'end' : 'start',
        justifyContent: anchor === 'bottom-right' ? 'end' : 'start',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </main>
  );
};

interface DemoFixtureProps {
  readonly anchor?: 'default' | 'bottom-right';
}

const DemoFixture = ({ anchor = 'default' }: DemoFixtureProps): ReactNode => {
  const [selectedItem, setSelectedItem] = useState<MenuListItem | null>(null);

  return (
    <HarnessLayout anchor={anchor}>
      <CContextMenu
        data-testid="ccontext-menu-demo"
        menuList={CONTEXT_MENU_ITEMS}
        longPressDelay={250}
        onSelect={setSelectedItem}
      >
        <button data-testid="ccontext-menu-target" type="button">
          Context target
        </button>
      </CContextMenu>
      <p data-testid="ccontext-menu-selection-value">Selected: {selectedItem?.title ?? 'none'}</p>
      <button data-testid="ccontext-menu-outside" type="button">
        Outside target
      </button>
    </HarnessLayout>
  );
};

const renderFixture = (fixture: string): ReactNode => {
  switch (fixture) {
    case 'basic':
      return <DemoFixture />;
    case 'clamp':
      return <DemoFixture anchor="bottom-right" />;
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
