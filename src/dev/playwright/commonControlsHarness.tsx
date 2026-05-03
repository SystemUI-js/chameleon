import React, { type ReactNode, useState } from 'react';
import {
  CButton,
  CButtonGroup,
  CButtonSeparator,
  CRadio,
  CRadioGroup,
  CSelect,
  type CSelectOption,
} from '@/components';
import { View } from '../../runtime/react-native-web';
import { type DevThemeId, DevThemeRoot } from '../themeSwitcher';
import { readHarnessRoute } from './harnessRoute';

const SIZE_OPTIONS: readonly CSelectOption[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
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

const DefaultFixture = (): React.JSX.Element => {
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

const DisabledFixture = (): React.JSX.Element => {
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

const GroupedButtonsFixture = (): React.JSX.Element => {
  return (
    <HarnessLayout>
      <CButtonGroup data-testid="button-group-demo" variant="primary">
        <CButton data-testid="button-group-first">Back</CButton>
        <CButton data-testid="button-group-second">Next</CButton>
        <CButtonSeparator data-testid="button-group-separator" />
        <CButton data-testid="button-group-third" variant="ghost">
          Cancel
        </CButton>
      </CButtonGroup>
      <CButtonGroup data-testid="button-group-vertical-demo" orientation="vertical">
        <CButton data-testid="button-group-vertical-first">Top</CButton>
        <CButtonSeparator data-testid="button-group-vertical-separator" />
        <CButton data-testid="button-group-vertical-second">Bottom</CButton>
      </CButtonGroup>
    </HarnessLayout>
  );
};

const GroupedButtonsDisabledFixture = (): React.JSX.Element => {
  return (
    <HarnessLayout>
      <CButtonGroup data-testid="button-group-disabled-demo" disabled variant="primary">
        <CButton data-testid="button-group-disabled-first">Save</CButton>
        <CButton data-testid="button-group-disabled-second">Apply</CButton>
        <CButtonSeparator data-testid="button-group-disabled-separator" />
        <CButton data-testid="button-group-disabled-third" variant="ghost">
          Reset
        </CButton>
      </CButtonGroup>
      <CButtonGroup
        data-testid="button-group-vertical-disabled-demo"
        disabled
        orientation="vertical"
      >
        <CButton data-testid="button-group-vertical-disabled-first">North</CButton>
        <CButtonSeparator data-testid="button-group-vertical-disabled-separator" />
        <CButton data-testid="button-group-vertical-disabled-second">South</CButton>
      </CButtonGroup>
    </HarnessLayout>
  );
};

const renderFixture = (fixture: string): React.JSX.Element => {
  switch (fixture) {
    case 'default':
      return <DefaultFixture />;
    case 'disabled':
      return <DisabledFixture />;
    case 'grouped-buttons':
      return <GroupedButtonsFixture />;
    case 'grouped-buttons-disabled':
      return <GroupedButtonsDisabledFixture />;
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

export const CommonControlsHarnessApp = (): React.JSX.Element => {
  const route = readHarnessRoute();

  return <ThemedFixtureContainer theme={route.theme} fixture={route.fixture} />;
};
