import { type ReactNode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CButton, CMenu, type MenuListItem } from '@/components';
import { DEV_THEME, DevThemeRoot, type DevThemeId } from '../themeSwitcher';

type HarnessRoute = {
  theme: DevThemeId;
  fixture: string;
};

const DEFAULT_FIXTURE = 'click';
const DEV_THEME_IDS = Object.values(DEV_THEME);

const isDevThemeId = (value: string | null): value is DevThemeId => {
  return value !== null && DEV_THEME_IDS.includes(value as DevThemeId);
};

const MENU_LIST: readonly MenuListItem[] = [
  {
    id: 'file',
    key: 'file',
    title: 'File',
    children: [
      { id: 'file-new', key: 'file-new', title: 'New' },
      { id: 'file-open', key: 'file-open', title: 'Open' },
    ],
  },
  {
    id: 'view',
    key: 'view',
    title: 'View',
    children: [{ id: 'view-zoom', key: 'view-zoom', title: 'Zoom' }],
  },
];

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

const ClickFixture = (): ReactNode => {
  const [selectedItem, setSelectedItem] = useState<MenuListItem | null>(null);

  return (
    <HarnessLayout>
      <CMenu
        data-testid="menu-demo"
        trigger="click"
        menuList={MENU_LIST}
        onSelect={setSelectedItem}
      >
        <CButton data-testid="menu-demo-trigger">Menu</CButton>
      </CMenu>
      <p data-testid="menu-selection-value">Selected: {selectedItem?.title ?? 'none'}</p>
    </HarnessLayout>
  );
};

const HoverFixture = (): ReactNode => {
  const [selectedItem, setSelectedItem] = useState<MenuListItem | null>(null);

  return (
    <HarnessLayout>
      <CMenu
        data-testid="menu-demo"
        trigger="hover"
        menuList={MENU_LIST}
        onSelect={setSelectedItem}
      >
        <CButton data-testid="menu-demo-trigger">Hover Menu</CButton>
      </CMenu>
      <p data-testid="menu-selection-value">Selected: {selectedItem?.title ?? 'none'}</p>
    </HarnessLayout>
  );
};

const renderFixture = (fixture: string): ReactNode => {
  switch (fixture) {
    case 'click':
      return <ClickFixture />;
    case 'hover':
      return <HoverFixture />;
    default:
      return <div data-testid="fixture-error">Unknown fixture: {fixture}</div>;
  }
};

interface ThemedFixtureContainerProps {
  readonly theme: DevThemeId;
  readonly fixture: string;
}

const ThemedFixtureContainer = ({ theme, fixture }: ThemedFixtureContainerProps): ReactNode => {
  return (
    <DevThemeRoot theme={theme}>
      <div style={{ padding: '24px' }}>{renderFixture(fixture)}</div>
    </DevThemeRoot>
  );
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
