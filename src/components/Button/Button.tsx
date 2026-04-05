import type React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
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
  onPointerEnter?: React.PointerEventHandler<HTMLButtonElement>;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

function resolveThemeClass(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }
  return theme.startsWith('cm-theme--') ? theme : `cm-theme--${theme}`;
}

export function CButton({
  children,
  variant = 'default',
  type = 'button',
  disabled,
  onClick,
  onPointerEnter,
  className,
  theme,
  'data-testid': dataTestId,
}: CButtonProps): React.ReactElement {
  const resolvedTheme = resolveThemeClass(useTheme(theme));
  const baseClasses = ['cm-button'];

  if (variant !== 'default') {
    baseClasses.push(`cm-button--${variant}`);
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      data-testid={dataTestId}
    >
      {children}
    </button>
  );
}
