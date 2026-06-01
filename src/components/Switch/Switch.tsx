import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CSwitchProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'checked' | 'className' | 'defaultChecked' | 'disabled' | 'onChange' | 'type'
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
  label?: React.ReactNode;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

export function CSwitch({
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  children,
  label,
  className,
  theme,
  'data-testid': dataTestId,
  ...inputProps
}: CSwitchProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = checked ?? uncontrolledChecked;
  const content = children ?? label;
  const baseClasses = ['cm-switch'];

  if (disabled) {
    baseClasses.push('cm-switch--disabled');
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const nextChecked = event.target.checked;

    if (!isControlled) {
      setUncontrolledChecked(nextChecked);
    }

    onChange?.(nextChecked);
  };

  return (
    <label className={mergeClasses(baseClasses, resolvedTheme, className)}>
      <input
        {...inputProps}
        checked={isChecked}
        className="cm-switch__input"
        data-testid={dataTestId}
        disabled={disabled}
        onChange={handleChange}
        type="checkbox"
      />
      <span className="cm-switch__slider" />
      <span className="cm-switch__label">{content}</span>
    </label>
  );
}
