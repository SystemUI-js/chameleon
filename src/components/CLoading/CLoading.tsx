import type React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CLoadingVariant = 'spinner' | 'dots' | 'bar';
export type CLoadingSize = 'small' | 'medium' | 'large';

export interface CLoadingProps {
  variant?: CLoadingVariant;
  size?: CLoadingSize | number | string;
  label?: React.ReactNode;
  progress?: number;
  indeterminate?: boolean;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

const NAMED_SIZES: readonly CLoadingSize[] = ['small', 'medium', 'large'];

function isNamedSize(size: unknown): size is CLoadingSize {
  return typeof size === 'string' && NAMED_SIZES.includes(size as CLoadingSize);
}

function clampProgress(value: number | undefined): number {
  if (value === undefined) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

export function CLoading({
  variant = 'spinner',
  size = 'medium',
  label,
  progress,
  indeterminate = true,
  className,
  theme,
  'data-testid': dataTestId,
}: CLoadingProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const baseClasses = ['cm-loading'];

  baseClasses.push(`cm-loading--${variant}`);

  if (isNamedSize(size)) {
    baseClasses.push(`cm-loading--${size}`);
  }

  if (variant === 'bar' && indeterminate) {
    baseClasses.push('cm-loading--indeterminate');
  }

  const clampedProgress = clampProgress(progress);

  const style: React.CSSProperties = {};

  if (!isNamedSize(size)) {
    const sizeValue = typeof size === 'number' ? `${size}px` : size;
    (style as Record<string, string>)['--cm-loading-size'] = sizeValue;
  }

  const ariaProps: React.AriaAttributes = {};

  if (variant === 'bar') {
    ariaProps['aria-valuemin'] = 0;
    ariaProps['aria-valuemax'] = 100;

    if (!indeterminate) {
      ariaProps['aria-valuenow'] = clampedProgress;
    }
  }

  const isStringLabel = typeof label === 'string';

  return (
    <div
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      style={style}
      data-testid={dataTestId}
      role="status"
      aria-live="polite"
      aria-label={isStringLabel ? label : undefined}
      {...ariaProps}
    >
      <div className="cm-loading__indicator">
        {variant === 'bar' && (
          <div
            className="cm-loading__fill"
            data-testid={dataTestId ? `${dataTestId}-fill` : undefined}
            style={{ width: indeterminate ? undefined : `${clampedProgress}%` }}
          />
        )}
      </div>
      {label !== undefined && <div className="cm-loading__label">{label}</div>}
    </div>
  );
}
