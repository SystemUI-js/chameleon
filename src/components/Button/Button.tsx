import type React from 'react';
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
  'data-testid'?: string;
}

export function CButton({
  children,
  variant = 'default',
  type = 'button',
  disabled,
  onClick,
  className,
  'data-testid': dataTestId,
}: CButtonProps): React.ReactElement {
  const classNames = ['cm-button'];

  if (variant !== 'default') {
    classNames.push(`cm-button--${variant}`);
  }

  if (className) {
    classNames.push(className);
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classNames.join(' ')}
      data-testid={dataTestId}
    >
      {children}
    </button>
  );
}
