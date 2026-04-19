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

  const handleChange = (): void => {
    if (!isDisabled && !isChecked) {
      groupContext.onRadioChange(value);
    }
  };

  return (
    <View className={mergeClasses(classNames, resolvedTheme)}>
      <Pressable
        className="cm-radio__input"
        testID={dataTestId}
        role="radio"
        aria-checked={isChecked}
        disabled={isDisabled}
        name={groupContext.name}
        onClick={handleChange}
        required={groupContext.required}
        value={value}
      >
        <Text className="cm-radio__label">{content}</Text>
      </Pressable>
    </View>
  );
}
