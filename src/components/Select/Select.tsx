import React from 'react';
import { View } from 'react-native';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CSelectProps {
  options: readonly CSelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (nextValue: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  theme?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

export function CSelect({
  options,
  value,
  defaultValue,
  onChange,
  name,
  disabled,
  required,
  placeholder,
  className,
  theme,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: CSelectProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const baseClasses = ['cm-select'];
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? (placeholder ? '' : undefined),
  );
  const selectedValue = isControlled ? value : uncontrolledValue;

  const handleChange: React.ChangeEventHandler<HTMLElement> = (event): void => {
    const nextValue = event.target.value;

    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onChange?.(nextValue);
  };

  return (
    <View
      name={name}
      role="combobox"
      disabled={disabled}
      required={required}
      value={selectedValue}
      onChange={handleChange}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      aria-label={ariaLabel}
      testID={dataTestId}
    >
      {placeholder ? (
        <View role="option" value="" disabled hidden={selectedValue !== ''}>
          {placeholder}
        </View>
      ) : null}
      {options.map((option) => (
        <View
          key={`${option.label}-${option.value}`}
          role="option"
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </View>
      ))}
    </View>
  );
}
