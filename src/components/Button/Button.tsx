import type React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CButtonVariant = 'default' | 'primary' | 'ghost';
export type CButtonType = 'button' | 'submit' | 'reset';
export type CButtonSize = 'compact' | 'small' | 'medium' | 'large';
export type CButtonDisplayType = 'round' | 'rect';

export interface CButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: CButtonVariant;
  size?: CButtonSize;
  displayType?: CButtonDisplayType;
  borderRadius?: React.CSSProperties['borderRadius'];
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
  size = 'medium',
  displayType = 'rect',
  borderRadius = '50%',
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
  const buttonStyle =
    displayType === 'round' ? { ...buttonProps.style, borderRadius } : buttonProps.style;

  if (variant !== 'default') {
    baseClasses.push(`cm-button--${variant}`);
  }

  baseClasses.push(`cm-button--${size}`);
  baseClasses.push(`cm-button--${displayType}`);

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
      style={buttonStyle}
      data-testid={dataTestId}
      tabIndex={showFocusEffect ? undefined : -1}
    >
      {children}
    </button>
  );
}
