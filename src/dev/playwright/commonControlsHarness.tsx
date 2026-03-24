import { type ReactNode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CButton, CRadio, CRadioGroup, CSelect, type CSelectOption } from '@/components';

type HarnessRoute = {
  kind: 'fixture';
  fixture: string;
};

const DEFAULT_FIXTURE = 'default';

const SIZE_OPTIONS: readonly CSelectOption[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

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

  return <>{renderFixture(route.fixture)}</>;
};

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
