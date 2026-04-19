import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
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

export function CRadio({
  value,
  disabled = false,
  children,
  label,
  theme,
  'data-testid': dataTestId,
}: CRadioProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
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

  if (isChecked) {
    classNames.push('cm-radio--checked');
  }

  const handlePress = (): void => {
    if (!isChecked && !isDisabled) {
      groupContext.onRadioChange(value);
    }
  };

  return (
    <Pressable
      role="radio"
      accessibilityRole="radio"
      accessibilityState={{ checked: isChecked, disabled: isDisabled }}
      aria-checked={isChecked}
      aria-disabled={isDisabled}
      data-value={value}
      name={groupContext.name}
      value={value}
      required={groupContext.required}
      className={mergeClasses(classNames, resolvedTheme)}
      testID={dataTestId}
      disabled={isDisabled}
      onPress={handlePress}
    >
      <View aria-hidden="true" className="cm-radio__input" />
      {content !== undefined ? <Text className="cm-radio__label">{content}</Text> : null}
    </Pressable>
  );
}
