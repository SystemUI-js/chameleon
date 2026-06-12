import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { CList } from '@/components';
import { DEV_THEME, DevThemeRoot, type DevThemeId } from '../themeSwitcher';

type HarnessRoute = {
  theme: DevThemeId;
  fixture: string;
};

type ListFixtureItem = {
  readonly id: string;
  readonly label: string;
};

const DEFAULT_FIXTURE = 'horizontal';
const DEV_THEME_IDS = Object.values(DEV_THEME);

const LIST_ITEMS: readonly ListFixtureItem[] = [
  { id: 'one', label: 'Item one' },
  { id: 'two', label: 'Item two' },
  { id: 'three', label: 'Item three' },
  { id: 'four', label: 'Item four' },
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
}

const HarnessLayout = ({ children }: HarnessLayoutProps): ReactNode => {
  return (
    <main
      data-testid="clist-layout-playground"
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

interface FixtureListProps {
  readonly testId: string;
  readonly gap?:
    | number
    | string
    | { readonly row?: number | string; readonly column?: number | string };
  readonly wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse';
  readonly width?: number;
}

interface FixtureItemProps {
  readonly item: ListFixtureItem;
  readonly testId: string;
  readonly index: number;
}

const FixtureItem = ({ item, testId, index }: FixtureItemProps): ReactNode => {
  return (
    <span
      data-testid={`${testId}-item-${index + 1}`}
      style={{
        boxSizing: 'border-box',
        display: 'inline-block',
        minWidth: '96px',
        padding: '8px 12px',
      }}
    >
      {item.label}
    </span>
  );
};

FixtureItem.displayName = 'FixtureItem';

const FixtureList = ({
  testId,
  gap,
  wrap = 'nowrap',
  width = 520,
}: FixtureListProps): ReactNode => {
  return (
    <CList
      data-testid={testId}
      aria-label={`${testId} demo`}
      items={LIST_ITEMS}
      getItemKey={(item) => item.id}
      renderItem={(item, index) => <FixtureItem item={item} testId={testId} index={index} />}
      direction="horizontal"
      wrap={wrap}
      gap={gap}
      style={{ width }}
    />
  );
};

const HorizontalFixture = (): ReactNode => {
  return (
    <HarnessLayout>
      <FixtureList testId="clist-horizontal" wrap gap={12} />
      <p>Horizontal list fixture with wrapping enabled.</p>
    </HarnessLayout>
  );
};

const WrapFixture = (): ReactNode => {
  return (
    <HarnessLayout>
      <FixtureList testId="clist-wrap" wrap="wrap-reverse" gap={8} width={260} />
      <p>Wrap-reverse fixture for modifier coverage.</p>
    </HarnessLayout>
  );
};

const NumericGapFixture = (): ReactNode => {
  return (
    <HarnessLayout>
      <FixtureList testId="clist-numeric-gap" gap={18} />
      <p>Numeric gap fixture.</p>
    </HarnessLayout>
  );
};

const ObjectGapFixture = (): ReactNode => {
  return (
    <HarnessLayout>
      <FixtureList testId="clist-object-gap" gap={{ row: 10, column: '24px' }} />
      <p>Object gap fixture.</p>
    </HarnessLayout>
  );
};

const renderFixture = (fixture: string): ReactNode => {
  switch (fixture) {
    case 'horizontal':
      return <HorizontalFixture />;
    case 'wrap':
      return <WrapFixture />;
    case 'numeric-gap':
      return <NumericGapFixture />;
    case 'object-gap':
      return <ObjectGapFixture />;
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
