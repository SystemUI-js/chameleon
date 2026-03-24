import React from 'react';
import { CButton, CRadio, CRadioGroup, CSelect, type CSelectOption } from '@/components';

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
    <div className="cm-common-controls-preview">
      <header className="cm-common-controls-preview__header">
        <p className="cm-common-controls-preview__eyebrow">Common controls</p>
        <h2 className="cm-common-controls-preview__title">Button, radio, and select previews</h2>
        <p className="cm-common-controls-preview__description">
          Each section keeps one stable interactive demo alongside default and disabled states.
        </p>
      </header>

      <div className="cm-common-controls-preview__grid">
        <section className="cm-common-controls-preview__panel">
          <h3 className="cm-common-controls-preview__panel-title">Buttons</h3>
          <div className="cm-common-controls-preview__stack">
            <div className="cm-common-controls-preview__row">
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
            </div>
            <div className="cm-common-controls-preview__row">
              <CButton disabled>Disabled default</CButton>
              <CButton variant="primary" disabled>
                Disabled primary
              </CButton>
            </div>
            <p className="cm-common-controls-preview__value">
              Primary button clicks: {buttonClicks}
            </p>
          </div>
        </section>

        <section className="cm-common-controls-preview__panel">
          <h3 className="cm-common-controls-preview__panel-title">Radio group</h3>
          <div className="cm-common-controls-preview__stack">
            <CRadioGroup
              aria-label="Favorite fruit"
              data-testid="radio-demo-fruit"
              name="fruit"
              value={selectedFruit}
              onChange={setSelectedFruit}
            >
              <div className="cm-common-controls-preview__choice-row">
                <CRadio value="apple">Apple</CRadio>
                <CRadio value="orange">Orange</CRadio>
              </div>
            </CRadioGroup>
            <CRadioGroup name="fruit-disabled" defaultValue="apple" disabled>
              <div className="cm-common-controls-preview__choice-row">
                <CRadio value="apple">Apple disabled</CRadio>
                <CRadio value="orange">Orange disabled</CRadio>
              </div>
            </CRadioGroup>
            <p className="cm-common-controls-preview__value">Selected fruit: {selectedFruit}</p>
          </div>
        </section>

        <section className="cm-common-controls-preview__panel">
          <h3 className="cm-common-controls-preview__panel-title">Select</h3>
          <div className="cm-common-controls-preview__stack">
            <CSelect
              data-testid="select-demo-size"
              name="size"
              value={selectedSize}
              options={SIZE_OPTIONS}
              onChange={setSelectedSize}
            />
            <CSelect name="size-disabled" value="large" options={SIZE_OPTIONS} disabled />
            <p className="cm-common-controls-preview__value">Selected size: {selectedSize}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
