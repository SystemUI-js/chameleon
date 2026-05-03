import React from 'react';
import { CButton, CRadio, CRadioGroup, CSelect, type CSelectOption } from '@/components';
import { Text, View } from '../runtime/react-native-web';

const SIZE_OPTIONS: readonly CSelectOption[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

export function CommonControlsPreview(): React.ReactElement {
  const [buttonClicks, setButtonClicks] = React.useState(0);
  const [selectedFruit, setSelectedFruit] = React.useState('apple');
  const [selectedSize, setSelectedSize] = React.useState('medium');

  return (
    <View className="cm-common-controls-preview">
      <View className="cm-common-controls-preview__header">
        <Text className="cm-common-controls-preview__eyebrow">Common controls</Text>
        <Text className="cm-common-controls-preview__title">
          Button, radio, and select previews
        </Text>
        <Text className="cm-common-controls-preview__description">
          Each section keeps one stable interactive demo alongside default and disabled states.
        </Text>
      </View>

      <View className="cm-common-controls-preview__grid">
        <View className="cm-common-controls-preview__panel">
          <Text className="cm-common-controls-preview__panel-title">Buttons</Text>
          <View className="cm-common-controls-preview__stack">
            <View className="cm-common-controls-preview__row">
              <CButton
                data-testid="button-demo-primary"
                variant="primary"
                onClick={() => {
                  setButtonClicks((currentClicks) => currentClicks + 1);
                }}
              >
                Primary action
              </CButton>
              <CButton>Default action</CButton>
              <CButton variant="ghost">Ghost action</CButton>
            </View>
            <View className="cm-common-controls-preview__row">
              <CButton disabled>Disabled default</CButton>
              <CButton variant="primary" disabled>
                Disabled primary
              </CButton>
            </View>
            <Text className="cm-common-controls-preview__value">
              Primary button clicks: {buttonClicks}
            </Text>
          </View>
        </View>

        <View className="cm-common-controls-preview__panel">
          <Text className="cm-common-controls-preview__panel-title">Radio group</Text>
          <View className="cm-common-controls-preview__stack">
            <CRadioGroup
              aria-label="Favorite fruit"
              data-testid="radio-demo-fruit"
              name="fruit"
              value={selectedFruit}
              onChange={setSelectedFruit}
            >
              <View className="cm-common-controls-preview__choice-row">
                <CRadio value="apple">Apple</CRadio>
                <CRadio value="orange">Orange</CRadio>
              </View>
            </CRadioGroup>
            <CRadioGroup name="fruit-disabled" defaultValue="apple" disabled>
              <View className="cm-common-controls-preview__choice-row">
                <CRadio value="apple">Apple disabled</CRadio>
                <CRadio value="orange">Orange disabled</CRadio>
              </View>
            </CRadioGroup>
            <Text className="cm-common-controls-preview__value">
              Selected fruit: {selectedFruit}
            </Text>
          </View>
        </View>

        <View className="cm-common-controls-preview__panel">
          <Text className="cm-common-controls-preview__panel-title">Select</Text>
          <View className="cm-common-controls-preview__stack">
            <CSelect
              data-testid="select-demo-size"
              name="size"
              value={selectedSize}
              options={SIZE_OPTIONS}
              onChange={setSelectedSize}
            />
            <CSelect name="size-disabled" value="large" options={SIZE_OPTIONS} disabled />
            <Text className="cm-common-controls-preview__value">Selected size: {selectedSize}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
