import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CCheckboxProps
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

export function CCheckbox({
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
}: CCheckboxProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = checked ?? uncontrolledChecked;
  const content = children ?? label;
  const baseClasses = ['cm-checkbox'];

  const {
    id,
    name,
    onBlur,
    onClick,
    onFocus,
    onKeyDown,
    required,
    tabIndex,
    title,
    value,
    'aria-label': ariaLabel,
  } = inputProps;

  if (disabled) {
    baseClasses.push('cm-checkbox--disabled');
  }

  if (isChecked) {
    baseClasses.push('cm-checkbox--checked');
  }

  const handleClick: React.MouseEventHandler<HTMLElement> = (event): void => {
    if (disabled) {
      return;
    }

    onClick?.(event as React.MouseEvent<HTMLInputElement>);
  };

  const handlePress = (): void => {
    if (disabled) {
      return;
    }

    const nextChecked = !isChecked;

    if (!isControlled) {
      setUncontrolledChecked(nextChecked);
    }

    onChange?.(nextChecked);
  };

  return (
    <Pressable
      id={id}
      name={name}
      value={value}
      required={required}
      role="checkbox"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked, disabled }}
      aria-checked={isChecked}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      title={title}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      testID={dataTestId}
      disabled={disabled}
      onBlur={onBlur}
      onClick={handleClick}
      onPress={handlePress}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
    >
      <View aria-hidden="true" className="cm-checkbox__input" />
      {content !== undefined ? <Text className="cm-checkbox__label">{content}</Text> : null}
    </Pressable>
  );
}
