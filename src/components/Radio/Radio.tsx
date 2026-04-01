import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import { RadioGroupContext } from './RadioGroup';
import './index.scss';

export interface CRadioProps {
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
  label?: React.ReactNode;
  theme?: string;
  'data-testid'?: string;
}

function resolveThemeClass(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }

  return theme.startsWith('cm-theme--') ? theme : `cm-theme--${theme}`;
}

export function CRadio({
  value,
  disabled = false,
  children,
  label,
  theme,
  'data-testid': dataTestId,
}: CRadioProps): React.ReactElement {
  const resolvedTheme = resolveThemeClass(useTheme(theme));
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
    <label className={mergeClasses(classNames, resolvedTheme)}>
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
