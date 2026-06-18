import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CInputSize = 'small' | 'middle' | 'large';
export type CInputStatus = 'default' | 'error' | 'warning';

export interface CInputSuggestionOption {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
}

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
  suggestionOptions?: readonly CInputSuggestionOption[];
  suggestionDebounce?: number;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  onPressEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onSearch?: (value: string) => void;
  onSelect?: (value: string, option: CInputSuggestionOption) => void;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

const getEnabledSuggestionIndexes = (
  suggestionOptions: readonly CInputSuggestionOption[],
): number[] =>
  suggestionOptions.reduce<number[]>((enabledIndexes, option, index) => {
    if (!option.disabled) {
      enabledIndexes.push(index);
    }

    return enabledIndexes;
  }, []);

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
  suggestionOptions = [],
  suggestionDebounce = 0,
  onChange,
  onClear,
  onPressEnter,
  onFocus,
  onBlur,
  onSearch,
  onSelect,
  className,
  theme,
  'data-testid': dataTestId,
}: CInputProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const searchTimerRef = React.useRef<number | null>(null);
  const generatedListboxId = React.useId();
  const listboxId = `${id ?? generatedListboxId}-suggestions`;

  // 受控/非受控：当 value !== undefined 时为受控模式
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
  const [isFocused, setIsFocused] = React.useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = React.useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState<number | null>(null);

  const currentValue = isControlled ? value : internalValue;
  const hasSuggestions = suggestionOptions.length > 0;
  const canShowSuggestions = isFocused && !disabled && !readOnly && hasSuggestions;
  const shouldShowSuggestions = canShowSuggestions && isSuggestionOpen;
  const activeSuggestionId =
    shouldShowSuggestions && activeSuggestionIndex !== null
      ? `${listboxId}-option-${activeSuggestionIndex}`
      : undefined;

  const clearSearchTimer = React.useCallback((): void => {
    if (searchTimerRef.current !== null) {
      window.clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  }, []);

  const scheduleSearch = React.useCallback(
    (nextValue: string): void => {
      clearSearchTimer();

      if (onSearch === undefined) {
        return;
      }

      const debounceDelay = Math.max(0, suggestionDebounce);

      if (debounceDelay === 0) {
        onSearch(nextValue);
        return;
      }

      searchTimerRef.current = window.setTimeout(() => {
        searchTimerRef.current = null;
        onSearch(nextValue);
      }, debounceDelay);
    },
    [clearSearchTimer, onSearch, suggestionDebounce],
  );

  React.useEffect(() => clearSearchTimer, [clearSearchTimer]);

  React.useEffect(() => {
    if (autoFocus && !disabled) {
      inputRef.current?.focus();
    }
  }, [autoFocus, disabled]);

  React.useEffect(() => {
    if (disabled || readOnly || !hasSuggestions) {
      setIsSuggestionOpen(false);
      setActiveSuggestionIndex(null);
    }
  }, [disabled, hasSuggestions, readOnly]);

  React.useEffect(() => {
    if (
      activeSuggestionIndex !== null &&
      (activeSuggestionIndex >= suggestionOptions.length ||
        suggestionOptions[activeSuggestionIndex]?.disabled)
    ) {
      setActiveSuggestionIndex(null);
    }
  }, [activeSuggestionIndex, suggestionOptions]);

  React.useEffect(() => {
    const handleDocumentMouseDown = (event: MouseEvent): void => {
      const target = event.target;

      if (target instanceof Node && !rootRef.current?.contains(target)) {
        setIsSuggestionOpen(false);
        setActiveSuggestionIndex(null);
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, []);

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

  const setActiveSuggestionByStep = (step: 1 | -1): void => {
    const enabledIndexes = getEnabledSuggestionIndexes(suggestionOptions);

    if (enabledIndexes.length === 0) {
      setActiveSuggestionIndex(null);
      return;
    }

    const currentEnabledPosition =
      activeSuggestionIndex === null ? -1 : enabledIndexes.indexOf(activeSuggestionIndex);
    const fallbackPosition = step === 1 ? 0 : enabledIndexes.length - 1;
    const nextPosition =
      currentEnabledPosition === -1
        ? fallbackPosition
        : (currentEnabledPosition + step + enabledIndexes.length) % enabledIndexes.length;

    setActiveSuggestionIndex(enabledIndexes[nextPosition] ?? null);
  };

  const emitSuggestionSelection = (option: CInputSuggestionOption): void => {
    if (option.disabled) {
      return;
    }

    const input = inputRef.current;

    if (!isControlled) {
      setInternalValue(option.value);
    }

    if (input) {
      input.value = option.value;
      const selectEvent = {
        target: input,
        currentTarget: input,
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(option.value, selectEvent);
    }

    onSelect?.(option.value, option);
    setIsSuggestionOpen(false);
    setActiveSuggestionIndex(null);
    input?.blur();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (disabled || readOnly) {
      return;
    }

    const nextValue = event.target.value;

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue, event);
    scheduleSearch(nextValue);
    setIsSuggestionOpen(hasSuggestions);
    setActiveSuggestionIndex(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown' && canShowSuggestions) {
      event.preventDefault();
      setIsSuggestionOpen(true);
      setActiveSuggestionByStep(1);
      return;
    }

    if (event.key === 'ArrowUp' && canShowSuggestions) {
      event.preventDefault();
      setIsSuggestionOpen(true);
      setActiveSuggestionByStep(-1);
      return;
    }

    if (event.key === 'Escape' && shouldShowSuggestions) {
      event.preventDefault();
      setIsSuggestionOpen(false);
      setActiveSuggestionIndex(null);
      return;
    }

    if (event.key === 'Enter') {
      const activeOption =
        shouldShowSuggestions && activeSuggestionIndex !== null
          ? suggestionOptions[activeSuggestionIndex]
          : undefined;

      if (activeOption !== undefined && !activeOption.disabled) {
        event.preventDefault();
        emitSuggestionSelection(activeOption);
        return;
      }

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
      scheduleSearch('');
      input.focus();
    }

    setIsSuggestionOpen(hasSuggestions);
    setActiveSuggestionIndex(null);
    onClear?.();
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
    setIsFocused(true);
    setIsSuggestionOpen(hasSuggestions);
    onFocus?.(event);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    setIsFocused(false);
    setIsSuggestionOpen(false);
    setActiveSuggestionIndex(null);
    onBlur?.(event);
  };

  const shouldShowClear = allowClear && currentValue.length > 0;

  return (
    <span ref={rootRef} className={mergeClasses(baseClasses, resolvedTheme, className)}>
      {prefix !== undefined && <span className="cm-input__prefix">{prefix}</span>}
      <input
        ref={inputRef}
        className="cm-input__field"
        data-testid={dataTestId}
        disabled={disabled}
        id={id}
        maxLength={maxLength}
        name={name}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        role="combobox"
        type="text"
        value={currentValue}
        aria-activedescendant={activeSuggestionId}
        aria-autocomplete={hasSuggestions ? 'list' : undefined}
        aria-controls={hasSuggestions ? listboxId : undefined}
        aria-disabled={disabled || undefined}
        aria-expanded={hasSuggestions ? shouldShowSuggestions : undefined}
        aria-haspopup={hasSuggestions ? 'listbox' : undefined}
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
      {shouldShowSuggestions && (
        <div className="cm-input__suggestions" id={listboxId} role="listbox">
          {suggestionOptions.map((option, index) => {
            const isActive = activeSuggestionIndex === index;
            const optionClasses = ['cm-input__suggestion'];

            if (isActive) {
              optionClasses.push('cm-input__suggestion--active');
            }

            if (option.disabled) {
              optionClasses.push('cm-input__suggestion--disabled');
            }

            return (
              <div
                key={option.value}
                id={`${listboxId}-option-${index}`}
                className={mergeClasses(optionClasses)}
                role="option"
                aria-disabled={option.disabled || undefined}
                aria-selected={isActive}
                tabIndex={-1}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    emitSuggestionSelection(option);
                  }
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  emitSuggestionSelection(option);
                }}
              >
                {option.label ?? option.value}
              </div>
            );
          })}
        </div>
      )}
    </span>
  );
}
