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

  if (disabled) {
    baseClasses.push('cm-checkbox--disabled');
  }

  const handleToggle = (): void => {
    const nextChecked = !isChecked;

    if (!isControlled) {
      setUncontrolledChecked(nextChecked);
    }

    onChange?.(nextChecked);
  };

  return (
    <View className={mergeClasses(baseClasses, resolvedTheme, className)}>
      <Pressable
        {...inputProps}
        testID={dataTestId}
        role="checkbox"
        aria-checked={isChecked}
        className="cm-checkbox__input"
        disabled={disabled}
        onClick={handleToggle}
      >
        <Text className="cm-checkbox__label">{content}</Text>
      </Pressable>
    </View>
  );
}
