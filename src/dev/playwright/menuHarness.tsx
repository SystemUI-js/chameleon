import React, { type ReactNode, useState } from 'react';
import { CButton, CMenu, type MenuListItem } from '@/components';
import { Text, View } from '../../runtime/react-native-web';
import { type DevThemeId, DevThemeRoot } from '../themeSwitcher';
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

const HarnessLayout = ({ children }: HarnessLayoutProps): React.JSX.Element => {
  return (
    <View
      style={{
        display: 'grid',
        gap: '16px',
        padding: '24px',
        alignContent: 'start',
      }}
    >
      {children}
    </View>
  );
};

const ClickFixture = (): React.JSX.Element => {
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
      <Text data-testid="menu-selection-value">Selected: {selectedItem?.title ?? 'none'}</Text>
    </HarnessLayout>
  );
};

const HoverFixture = (): React.JSX.Element => {
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
      <Text data-testid="menu-selection-value">Selected: {selectedItem?.title ?? 'none'}</Text>
    </HarnessLayout>
  );
};

const MixedFixture = (): React.JSX.Element => {
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
      <Text data-testid="menu-selection-value">Selected: {selectedItem?.title ?? 'none'}</Text>
      <Text>
        Default parent branches open on hover after the root click; items with{' '}
        <Text>trigger=&quot;click&quot;</Text> still require click.
      </Text>
    </HarnessLayout>
  );
};

const renderFixture = (fixture: string): React.JSX.Element => {
  switch (fixture) {
    case 'click':
      return <ClickFixture />;
    case 'hover':
      return <HoverFixture />;
    case 'mixed':
      return <MixedFixture />;
    default:
      return <View data-testid="fixture-error">Unknown fixture: {fixture}</View>;
  }
};

interface ThemedFixtureContainerProps {
  readonly theme: DevThemeId;
  readonly fixture: string;
}

const ThemedFixtureContainer = ({
  theme,
  fixture,
}: ThemedFixtureContainerProps): React.JSX.Element => {
  return (
    <DevThemeRoot theme={theme}>
      <View style={{ padding: '24px' }}>{renderFixture(fixture)}</View>
    </DevThemeRoot>
  );
};

export const MenuHarnessApp = (): React.JSX.Element => {
  const route = readHarnessRoute();
  const fixture = route.fixture === 'default' ? DEFAULT_FIXTURE : route.fixture;

  return <ThemedFixtureContainer theme={route.theme} fixture={fixture} />;
};
