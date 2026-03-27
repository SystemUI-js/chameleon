import { createRoot } from 'react-dom/client';
import { type ReactNode, useEffect, useState } from 'react';
import {
  DEV_SYSTEM_TYPE,
  DEV_THEME,
  type DevSystemTypeId,
  type DevThemeId,
} from '../themeSwitcher';
import { CButton, CRadio, CRadioGroup, CSelect, type CSelectOption } from '@/components';
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
      fixture?: string;
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

const SIZE_OPTIONS: readonly CSelectOption[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const readHarnessRoute = (): HarnessRoute => {
  try {
    const url = new URL(window.location.href);
    const systemType = url.searchParams.get('systemType');
    const theme = url.searchParams.get('theme');
    const fixture = url.searchParams.get('fixture');

    if (isDevSystemTypeId(systemType) && isDevThemeId(theme)) {
      return {
        kind: 'system-theme',
        systemType,
        theme,
        fixture: fixture ?? undefined,
      };
    }

    if (fixture !== null) {
      return {
        kind: 'fixture',
        fixture,
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

const DefaultFixture = (): ReactNode => {
  const [selectedFruit, setSelectedFruit] = useState('apple');
  const [selectedSize, setSelectedSize] = useState('medium');

  return (
    <HarnessLayout>
      <CButton data-testid="button-demo-primary" variant="primary">
        Primary action
      </CButton>
      <CRadioGroup
        data-testid="radio-demo-fruit"
        name="playwright-fruit"
        value={selectedFruit}
        onChange={setSelectedFruit}
      >
        <CRadio value="apple">Apple</CRadio>
        <CRadio value="orange">Orange</CRadio>
      </CRadioGroup>
      <CSelect
        data-testid="select-demo-size"
        name="playwright-size"
        value={selectedSize}
        options={SIZE_OPTIONS}
        onChange={setSelectedSize}
      />
    </HarnessLayout>
  );
};

const DisabledFixture = (): ReactNode => {
  return (
    <HarnessLayout>
      <CButton data-testid="button-demo-primary" disabled variant="primary">
        Primary action
      </CButton>
      <CRadioGroup
        data-testid="radio-demo-fruit"
        name="playwright-fruit-disabled"
        defaultValue="apple"
      >
        <CRadio value="apple">Apple</CRadio>
        <CRadio value="orange" disabled>
          Orange
        </CRadio>
      </CRadioGroup>
      <CSelect
        data-testid="select-demo-size"
        name="playwright-size-disabled"
        defaultValue="medium"
        options={SIZE_OPTIONS}
        disabled
      />
    </HarnessLayout>
  );
};

const renderFixture = (fixture: string): ReactNode => {
  switch (fixture) {
    case 'default':
      return <DefaultFixture />;
    case 'disabled':
      return <DisabledFixture />;
    default:
      return <div data-testid="fixture-error">Unknown fixture: {fixture}</div>;
  }
};

const App = (): ReactNode => {
  const route = useHarnessRoute();
  const [selection, setSelection] = useState<SystemThemeSelection | null>(null);

  useEffect(() => {
    if (route.kind === 'system-theme') {
      setSelection({ systemType: route.systemType, theme: route.theme });
    }
  }, [route]);

  if (route.kind === 'system-theme') {
    if (selection === null) {
      return null;
    }

    if (route.fixture === 'disabled') {
      return (
        <ThemedDisabledFixtureContainer systemType={selection.systemType} theme={selection.theme} />
      );
    }

    return <ThemedControlsContainer systemType={selection.systemType} theme={selection.theme} />;
  }

  return <>{renderFixture(route.fixture)}</>;
};

interface ThemedControlsContainerProps {
  readonly systemType: DevSystemTypeId;
  readonly theme: DevThemeId;
}

const SYSTEM_CLASS_NAMES: Record<DevSystemTypeId, string> = {
  windows: 'cm-system--windows',
  default: 'cm-system--default',
};

const THEME_CLASS_NAMES: Record<DevThemeId, string> = {
  win98: 'cm-theme--win98',
  winxp: 'cm-theme--winxp',
  default: 'cm-theme--default',
};

const ThemedControlsContainer = ({
  systemType,
  theme,
}: ThemedControlsContainerProps): ReactNode => {
  const [selectedFruit, setSelectedFruit] = useState('apple');
  const [selectedSize, setSelectedSize] = useState('medium');

  return (
    <div
      className={`${SYSTEM_CLASS_NAMES[systemType]} ${THEME_CLASS_NAMES[theme]}`}
      style={{ padding: '24px' }}
    >
      <HarnessLayout>
        <CButton data-testid="button-demo-primary" variant="primary">
          Primary action
        </CButton>
        <CRadioGroup
          data-testid="radio-demo-fruit"
          name="playwright-fruit-themed"
          value={selectedFruit}
          onChange={setSelectedFruit}
        >
          <CRadio value="apple">Apple</CRadio>
          <CRadio value="orange">Orange</CRadio>
        </CRadioGroup>
        <CSelect
          data-testid="select-demo-size"
          name="playwright-size-themed"
          value={selectedSize}
          options={SIZE_OPTIONS}
          onChange={setSelectedSize}
        />
      </HarnessLayout>
    </div>
  );
};

interface ThemedDisabledFixtureContainerProps {
  readonly systemType: DevSystemTypeId;
  readonly theme: DevThemeId;
}

const ThemedDisabledFixtureContainer = ({
  systemType,
  theme,
}: ThemedDisabledFixtureContainerProps): ReactNode => {
  return (
    <div
      className={`${SYSTEM_CLASS_NAMES[systemType]} ${THEME_CLASS_NAMES[theme]}`}
      style={{ padding: '24px' }}
    >
      <HarnessLayout>
        <CButton data-testid="button-demo-primary" disabled variant="primary">
          Primary action
        </CButton>
        <CRadioGroup
          data-testid="radio-demo-fruit"
          name="playwright-fruit-themed-disabled"
          defaultValue="apple"
        >
          <CRadio value="apple">Apple</CRadio>
          <CRadio value="orange" disabled>
            Orange
          </CRadio>
        </CRadioGroup>
        <CSelect
          data-testid="select-demo-size"
          name="playwright-size-themed-disabled"
          defaultValue="medium"
          options={SIZE_OPTIONS}
          disabled
        />
      </HarnessLayout>
    </div>
  );
};

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
