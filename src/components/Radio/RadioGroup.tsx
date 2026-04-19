import React from 'react';
import { View } from 'react-native';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CRadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (nextValue: string) => void;
  disabled?: boolean;
  required?: boolean;
  children?: React.ReactNode;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

export interface RadioGroupContextValue {
  name: string;
  selectedValue?: string;
  disabled: boolean;
  required: boolean;
  onRadioChange: (nextValue: string) => void;
}

export const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export function CRadioGroup({
  name,
  value,
  defaultValue,
  onChange,
  disabled = false,
  required = false,
  children,
  className,
  theme,
  'data-testid': dataTestId,
}: CRadioGroupProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setUncontrolledValue(value);
    }
  }, [value]);

  if (name.trim().length === 0) {
    throw new Error('CRadioGroup requires a non-empty name prop.');
  }

  const isControlled = value !== undefined;
  const selectedValue = value ?? uncontrolledValue;

  const handleRadioChange = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  const contextValue = React.useMemo<RadioGroupContextValue>(
    () => ({
      name,
      selectedValue,
      disabled,
      required,
      onRadioChange: handleRadioChange,
    }),
    [disabled, handleRadioChange, name, required, selectedValue],
  );

  const baseClasses = ['cm-radio-group'];

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <View className={mergeClasses(baseClasses, resolvedTheme, className)} testID={dataTestId}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}
