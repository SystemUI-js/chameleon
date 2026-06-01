import type React from 'react';
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
  showActiveEffect?: boolean;
  showFocusEffect?: boolean;
  active?: boolean;
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
  showActiveEffect = true,
  showFocusEffect = true,
  active = false,
  onClick,
  onPointerEnter,
  className,
  theme,
  'data-testid': dataTestId,
  ...buttonProps
}: CButtonProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const baseClasses = ['cm-button'];

  if (variant !== 'default') {
    baseClasses.push(`cm-button--${variant}`);
  }

  if (compact) {
    baseClasses.push('cm-button--compact');
  }

  if (!showActiveEffect) {
    baseClasses.push('cm-button--no-active');
  }

  if (!showFocusEffect) {
    baseClasses.push('cm-button--no-focus');
  }

  if (active) {
    baseClasses.push('cm-button--active');
  }

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      data-testid={dataTestId}
      tabIndex={showFocusEffect ? undefined : -1}
    >
      {children}
    </button>
  );
}
