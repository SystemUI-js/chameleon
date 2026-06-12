import type React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CProgressVariant = 'bar' | 'circle' | 'ring';
export type CProgressSize = 'small' | 'medium' | 'large';
export type CProgressStatus = 'default' | 'active' | 'success' | 'exception';

export interface CProgressClassNames {
  readonly root?: string;
  readonly label?: string;
  readonly track?: string;
  readonly fill?: string;
  readonly value?: string;
  readonly circle?: string;
}

export interface CProgressProps {
  readonly variant?: CProgressVariant;
  readonly value?: number;
  readonly max?: number;
  readonly indeterminate?: boolean;
  readonly label?: React.ReactNode;
  readonly showValue?: boolean;
  readonly format?: (percent: number, value: number, max: number) => React.ReactNode;
  readonly size?: CProgressSize | number | string;
  readonly status?: CProgressStatus;
  readonly className?: string;
  readonly classNames?: CProgressClassNames;
  readonly theme?: string;
  readonly 'data-testid'?: string;
}

const NAMED_SIZES: readonly CProgressSize[] = ['small', 'medium', 'large'];

function isNamedSize(size: unknown): size is CProgressSize {
  return typeof size === 'string' && NAMED_SIZES.includes(size as CProgressSize);
}

function resolveMax(max: number | undefined): number {
  if (typeof max === 'number' && Number.isFinite(max) && max > 0) {
    return max;
  }

  return 100;
}

function resolveValue(value: number | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  return 0;
}

function clampPercent(percent: number): number {
  return Math.max(0, Math.min(100, percent));
}

export function CProgress({
  variant = 'bar',
  value,
  max,
  indeterminate = false,
  label,
  showValue = false,
  format,
  size = 'medium',
  status = 'default',
  className,
  classNames,
  theme,
  'data-testid': dataTestId,
}: CProgressProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const resolvedMax = resolveMax(max);
  const resolvedValue = resolveValue(value);
  const isIndeterminate = value === undefined || indeterminate;
  const percent = isIndeterminate ? 0 : clampPercent((resolvedValue / resolvedMax) * 100);

  const baseClasses = [
    'cm-cprogress',
    `cm-cprogress--${variant}`,
    `cm-cprogress--status-${status}`,
  ];

  if (isNamedSize(size)) {
    baseClasses.push(`cm-cprogress--size-${size}`);
  }

  if (isIndeterminate) {
    baseClasses.push('cm-cprogress--indeterminate');
  }

  const rootClassName = mergeClasses(baseClasses, resolvedTheme, className);
  const labelClassName = mergeClasses(['cm-cprogress__label'], undefined, classNames?.label);
  const valueClassName = mergeClasses(['cm-cprogress__value'], undefined, classNames?.value);

  const ariaProps: React.AriaAttributes = {
    'aria-valuemin': 0,
    'aria-valuemax': resolvedMax,
  };

  if (!isIndeterminate) {
    ariaProps['aria-valuenow'] = resolvedValue;
  }

  const sizeStyle: React.CSSProperties & Record<string, string | undefined> = {};

  if (!isNamedSize(size)) {
    const sizeValue = typeof size === 'number' ? `${size}px` : size;
    sizeStyle['--cm-cprogress-size'] = sizeValue;
  }

  const showLabel = label !== undefined || showValue;
  const displayValue = format
    ? format(percent, resolvedValue, resolvedMax)
    : `${Math.round(percent)}%`;

  return (
    <div
      className={rootClassName}
      role="progressbar"
      style={sizeStyle}
      data-testid={dataTestId}
      {...ariaProps}
    >
      {variant === 'bar' && (
        <div
          className={mergeClasses(['cm-cprogress__track'], undefined, classNames?.track)}
          data-testid={dataTestId ? `${dataTestId}-track` : undefined}
        >
          <div
            className={mergeClasses(['cm-cprogress__fill'], undefined, classNames?.fill)}
            data-testid={dataTestId ? `${dataTestId}-fill` : undefined}
            style={{ width: isIndeterminate ? undefined : `${percent}%` }}
          />
        </div>
      )}

      {(variant === 'circle' || variant === 'ring') && (
        <div
          className={mergeClasses(['cm-cprogress__circle'], undefined, classNames?.circle)}
          data-testid={dataTestId ? `${dataTestId}-circle` : undefined}
          style={{
            background: isIndeterminate
              ? undefined
              : `conic-gradient(currentColor ${percent}%, transparent ${percent}%)`,
          }}
        />
      )}

      {showLabel && (
        <div
          className={labelClassName}
          data-testid={dataTestId ? `${dataTestId}-label` : undefined}
        >
          {label !== undefined && label}
          {showValue && <span className={valueClassName}>{displayValue}</span>}
        </div>
      )}
    </div>
  );
}
