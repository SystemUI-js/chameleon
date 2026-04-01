import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
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

function resolveThemeClass(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }
  return theme.startsWith('cm-theme--') ? theme : `cm-theme--${theme}`;
}

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
  const resolvedTheme = resolveThemeClass(useTheme(theme));
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
      <div className={mergeClasses(baseClasses, resolvedTheme, className)} data-testid={dataTestId}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
