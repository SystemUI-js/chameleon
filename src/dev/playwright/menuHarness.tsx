import { type ReactNode, useState } from 'react';
import { CButton, CMenu, type MenuListItem } from '@/components';
import { DevThemeRoot, type DevThemeId } from '../themeSwitcher';
import { readHarnessRoute } from './harnessRoute';

const DEFAULT_FIXTURE = 'click';

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

const MIXED_MENU_LIST: readonly MenuListItem[] = [
  {
    id: 'file',
    key: 'file',
    title: 'File (hover default)',
    children: [
      { id: 'file-new', key: 'file-new', title: 'New' },
      { id: 'file-open', key: 'file-open', title: 'Open' },
    ],
  },
  {
    id: 'view',
    key: 'view',
    title: 'View (click override)',
    trigger: 'click',
    children: [{ id: 'view-zoom', key: 'view-zoom', title: 'Zoom' }],
  },
];

interface HarnessLayoutProps {
  readonly children: ReactNode;
}

const HarnessLayout = ({ children }: HarnessLayoutProps): JSX.Element => {
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

const ClickFixture = (): JSX.Element => {
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

const HoverFixture = (): JSX.Element => {
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

const MixedFixture = (): JSX.Element => {
  const [selectedItem, setSelectedItem] = useState<MenuListItem | null>(null);

  return (
    <HarnessLayout>
      <CMenu
        data-testid="menu-demo"
        trigger="click"
        menuList={MIXED_MENU_LIST}
        onSelect={setSelectedItem}
      >
        <CButton data-testid="menu-demo-trigger">Mixed Menu</CButton>
      </CMenu>
      <p data-testid="menu-selection-value">Selected: {selectedItem?.title ?? 'none'}</p>
      <p>
        Default parent branches open on hover after the root click; items with{' '}
        <code>trigger=&quot;click&quot;</code> still require click.
      </p>
    </HarnessLayout>
  );
};

const renderFixture = (fixture: string): JSX.Element => {
  switch (fixture) {
    case 'click':
      return <ClickFixture />;
    case 'hover':
      return <HoverFixture />;
    case 'mixed':
      return <MixedFixture />;
    default:
      return <div data-testid="fixture-error">Unknown fixture: {fixture}</div>;
  }
};

interface ThemedFixtureContainerProps {
  readonly theme: DevThemeId;
  readonly fixture: string;
}

const ThemedFixtureContainer = ({ theme, fixture }: ThemedFixtureContainerProps): JSX.Element => {
  return (
    <DevThemeRoot theme={theme}>
      <div style={{ padding: '24px' }}>{renderFixture(fixture)}</div>
    </DevThemeRoot>
  );
};

export const MenuHarnessApp = (): JSX.Element => {
  const route = readHarnessRoute();
  const fixture = route.fixture === 'default' ? DEFAULT_FIXTURE : route.fixture;

  return <ThemedFixtureContainer theme={route.theme} fixture={fixture} />;
};
