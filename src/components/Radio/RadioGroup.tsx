import React from 'react';
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
  'aria-label'?: string;
  'aria-labelledby'?: string;
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
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'data-testid': dataTestId,
}: CRadioGroupProps): React.ReactElement {
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

  const classNames = ['cm-radio-group'];

  if (className) {
    classNames.push(className);
  }

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-required={required || undefined}
        className={classNames.join(' ')}
        data-testid={dataTestId}
        role="radiogroup"
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
