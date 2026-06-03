import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CInputSize = 'small' | 'middle' | 'large';
export type CInputStatus = 'default' | 'error' | 'warning';

export interface CInputProps {
  /** Controlled value — when defined, the component operates in controlled mode */
  value?: string;
  /** Initial value for uncontrolled mode */
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  size?: CInputSize;
  status?: CInputStatus;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  allowClear?: boolean;
  maxLength?: number;
  name?: string;
  id?: string;
  autoFocus?: boolean;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  onPressEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

export function CInput({
  value,
  defaultValue,
  placeholder,
  disabled = false,
  readOnly = false,
  size = 'middle',
  status = 'default',
  prefix,
  suffix,
  allowClear = false,
  maxLength,
  name,
  id,
  autoFocus = false,
  onChange,
  onClear,
  onPressEnter,
  onFocus,
  onBlur,
  className,
  theme,
  'data-testid': dataTestId,
}: CInputProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const inputRef = React.useRef<HTMLInputElement>(null);

  // 受控/非受控：当 value !== undefined 时为受控模式
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');

  const currentValue = isControlled ? value : internalValue;

  React.useEffect(() => {
    if (autoFocus && !disabled) {
      inputRef.current?.focus();
    }
  }, [autoFocus, disabled]);

  const baseClasses = ['cm-input', `cm-input--${size}`];

  if (disabled) {
    baseClasses.push('cm-input--disabled');
  }

  if (readOnly) {
    baseClasses.push('cm-input--readonly');
  }

  if (status !== 'default') {
    baseClasses.push(`cm-input--${status}`);
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (disabled || readOnly) {
      return;
    }

    const nextValue = event.target.value;

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue, event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      onPressEnter?.(event);
    }
  };

  const handleClear = (): void => {
    if (disabled || readOnly || currentValue.length === 0) {
      return;
    }

    const input = inputRef.current;

    if (!isControlled) {
      setInternalValue('');
    }

    if (input) {
      input.value = '';
      const clearEvent = {
        target: input,
        currentTarget: input,
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.('', clearEvent);
      input.focus();
    }

    onClear?.();
  };

  const shouldShowClear = allowClear && currentValue.length > 0;

  return (
    <span className={mergeClasses(baseClasses, resolvedTheme, className)}>
      {prefix !== undefined && <span className="cm-input__prefix">{prefix}</span>}
      <input
        ref={inputRef}
        className="cm-input__field"
        data-testid={dataTestId}
        disabled={disabled}
        id={id}
        maxLength={maxLength}
        name={name}
        onBlur={onBlur}
        onChange={handleChange}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        type="text"
        value={currentValue}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
      />
      {shouldShowClear && (
        <button
          className="cm-input__clear"
          disabled={disabled || readOnly}
          type="button"
          onClick={handleClear}
          aria-label="Clear input"
        >
          x
        </button>
      )}
      {suffix !== undefined && <span className="cm-input__suffix">{suffix}</span>}
    </span>
  );
}
