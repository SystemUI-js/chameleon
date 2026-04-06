import type React from 'react';
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
  let resolvedDefaultValue: string | undefined;

  if (!isControlled) {
    resolvedDefaultValue = defaultValue ?? (placeholder ? '' : undefined);
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    onChange?.(event.target.value);
  };

  return (
    <select
      name={name}
      disabled={disabled}
      required={required}
      value={isControlled ? value : undefined}
      defaultValue={resolvedDefaultValue}
      onChange={handleChange}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      aria-label={ariaLabel}
      data-testid={dataTestId}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option
          key={`${option.label}-${option.value}`}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
