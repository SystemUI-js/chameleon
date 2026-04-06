import { type ReactNode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CButton, CRadio, CRadioGroup, CSelect, type CSelectOption } from '@/components';
import { DevThemeRoot, type DevThemeId } from '../themeSwitcher';
import { readHarnessRoute } from './harnessRoute';

const SIZE_OPTIONS: readonly CSelectOption[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

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
