import type React from 'react';
import { Pressable } from 'react-native';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CButtonVariant = 'default' | 'primary' | 'ghost';
export type CButtonType = 'button' | 'submit' | 'reset';

export interface CButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: CButtonVariant;
  compact?: boolean;
  type?: CButtonType;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onPointerEnter?: React.PointerEventHandler<HTMLButtonElement>;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

export function CButton({
  children,
  variant = 'default',
  compact = false,
  type = 'button',
  disabled,
  onClick,
  onPointerEnter,
  className,
  theme,
  'data-testid': dataTestId,
  ...buttonProps
}: CButtonProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const baseClasses = ['cm-button'];
  const handlePointerEnter: React.MouseEventHandler<HTMLElement> = (event): void => {
    if (onPointerEnter !== undefined) {
      onPointerEnter(event as unknown as React.PointerEvent<HTMLButtonElement>);
    }
  };

  if (variant !== 'default') {
    baseClasses.push(`cm-button--${variant}`);
  }

  if (compact) {
    baseClasses.push('cm-button--compact');
  }

  return (
    <Pressable
      {...buttonProps}
      testID={dataTestId}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onPointerEnter === undefined ? undefined : handlePointerEnter}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
    >
      {children}
    </Pressable>
  );
}
