import React from 'react';
import { RadioGroupContext } from './RadioGroup';
import './index.scss';

export interface CRadioProps {
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
  label?: React.ReactNode;
  'data-testid'?: string;
}

export function CRadio({
  value,
  disabled = false,
  children,
  label,
  'data-testid': dataTestId,
}: CRadioProps): React.ReactElement {
  const groupContext = React.useContext(RadioGroupContext);

  if (groupContext === null) {
    throw new Error('CRadio must be used within CRadioGroup.');
  }

  const isDisabled = groupContext.disabled || disabled;
  const isChecked = groupContext.selectedValue === value;
  const content = children ?? label;
  const classNames = ['cm-radio'];

  if (isDisabled) {
    classNames.push('cm-radio--disabled');
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      groupContext.onRadioChange(value);
    }
  };

  return (
    <label className={classNames.join(' ')}>
      <input
        checked={isChecked}
        className="cm-radio__input"
        data-testid={dataTestId}
        disabled={isDisabled}
        name={groupContext.name}
        onChange={handleChange}
        required={groupContext.required}
        type="radio"
        value={value}
      />
      <span className="cm-radio__label">{content}</span>
    </label>
  );
}
