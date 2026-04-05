import type React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { resolveThemeClassName } from '../Theme/themeName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CButtonVariant = 'default' | 'primary' | 'ghost';
export type CButtonType = 'button' | 'submit' | 'reset';

export interface CButtonProps {
  children?: React.ReactNode;
  variant?: CButtonVariant;
  type?: CButtonType;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

export function CButton({
  children,
  variant = 'default',
  type = 'button',
  disabled,
  onClick,
  className,
  theme,
  'data-testid': dataTestId,
}: CButtonProps): React.ReactElement {
  const resolvedTheme = resolveThemeClassName(useTheme(theme));
  const baseClasses = ['cm-button'];

  if (variant !== 'default') {
    baseClasses.push(`cm-button--${variant}`);
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      data-testid={dataTestId}
    >
      {children}
    </button>
  );
}
