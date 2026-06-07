import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CTimePickerProps {
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly format?: 'HH:mm' | 'HH:mm:ss';
  readonly hourStep?: number;
  readonly minuteStep?: number;
  readonly secondStep?: number;
  readonly allowClear?: boolean;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onChange?: (nextValue: string | null) => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly className?: string;
  readonly theme?: string;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly 'data-testid'?: string;
}

type TimeParts = {
  readonly hour: string;
  readonly minute: string;
  readonly second: string;
};

const TIME_PATTERN = /^(?<hour>[01]\d|2[0-3]):(?<minute>[0-5]\d)(?::(?<second>[0-5]\d))?$/;
const DEFAULT_PARTS = {
  hour: '00',
  minute: '00',
  second: '00',
} satisfies TimeParts;

function formatNumber(value: number): string {
  return value.toString().padStart(2, '0');
}

function createSteppedOptions(maxExclusive: number, step: number | undefined): readonly string[] {
  const normalizedStep =
    step === undefined || !Number.isFinite(step) || step < 1 ? 1 : Math.floor(step);

  return Array.from({ length: Math.ceil(maxExclusive / normalizedStep) }, (_, index) =>
    formatNumber(index * normalizedStep),
  ).filter((value) => Number(value) < maxExclusive);
}

function normalizeTimeValue(
  value: string | null | undefined,
  format: CTimePickerProps['format'],
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const match = TIME_PATTERN.exec(value);

  if (!match?.groups) {
    return null;
  }

  const { hour, minute, second = '00' } = match.groups;

  return format === 'HH:mm:ss' ? `${hour}:${minute}:${second}` : `${hour}:${minute}`;
}

function splitTimeValue(value: string | null): TimeParts {
  if (value === null) {
    return DEFAULT_PARTS;
  }

  const [hour = '00', minute = '00', second = '00'] = value.split(':');

  return {
    hour,
    minute,
    second,
  } satisfies TimeParts;
}

function joinTimeValue(parts: TimeParts, format: CTimePickerProps['format']): string {
  if (format === 'HH:mm:ss') {
    return `${parts.hour}:${parts.minute}:${parts.second}`;
  }

  return `${parts.hour}:${parts.minute}`;
}

export function CTimePicker({
  value,
  defaultValue,
  placeholder,
  onChange,
  disabled = false,
  format = 'HH:mm',
  hourStep,
  minuteStep,
  secondStep,
  allowClear = false,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  theme,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'data-testid': dataTestId,
}: CTimePickerProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const isControlled = value !== undefined;
  const isOpenControlled = open !== undefined;
  const rootRef = React.useRef<HTMLFieldSetElement>(null);
  const initialValueRef = React.useRef(normalizeTimeValue(defaultValue, format));
  const [uncontrolledValue, setUncontrolledValue] = React.useState(initialValueRef.current);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const panelId = React.useId();
  const selectedValue = normalizeTimeValue(isControlled ? value : uncontrolledValue, format);
  const selectedParts = splitTimeValue(selectedValue);
  const isOpen = !disabled && (isOpenControlled ? open : uncontrolledOpen);
  const hourOptions = React.useMemo(() => createSteppedOptions(24, hourStep), [hourStep]);
  const minuteOptions = React.useMemo(() => createSteppedOptions(60, minuteStep), [minuteStep]);
  const secondOptions = React.useMemo(() => createSteppedOptions(60, secondStep), [secondStep]);

  const setOpenState = React.useCallback(
    (nextOpen: boolean): void => {
      if (disabled) {
        return;
      }

      if (!isOpenControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [disabled, isOpenControlled, onOpenChange],
  );

  React.useEffect(() => {
    if (!isOpen) return;

    const handleDocumentMouseDown = (event: MouseEvent): void => {
      if (!(event.target instanceof Node)) return;
      if (rootRef.current !== null && !rootRef.current.contains(event.target)) {
        setOpenState(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [isOpen, setOpenState]);

  const emitChange = (nextParts: TimeParts): void => {
    if (disabled) {
      return;
    }

    const nextValue = joinTimeValue(nextParts, format);

    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onChange?.(nextValue);
  };

  const handleInputClick = (): void => {
    setOpenState(true);
  };

  const handleClear = (): void => {
    if (disabled) {
      return;
    }

    if (!isControlled) {
      setUncontrolledValue(null);
    }

    onChange?.(null);
  };

  const handleHourSelect = (hour: string): void => {
    emitChange({
      hour,
      minute: selectedParts.minute,
      second: selectedParts.second,
    });
  };

  const handleMinuteSelect = (minute: string): void => {
    emitChange({
      hour: selectedParts.hour,
      minute,
      second: selectedParts.second,
    });
  };

  const handleSecondSelect = (second: string): void => {
    emitChange({
      hour: selectedParts.hour,
      minute: selectedParts.minute,
      second,
    });
  };

  const renderOption = (
    columnName: 'hour' | 'minute' | 'second',
    optionValue: string,
    selectedPart: string,
    onSelect: (nextValue: string) => void,
  ): React.ReactElement => {
    const isSelected = optionValue === selectedPart;

    return (
      <button
        key={optionValue}
        type="button"
        className={mergeClasses([
          'cm-time-picker__option',
          isSelected ? 'cm-time-picker__option--selected' : '',
        ])}
        aria-label={`${columnName} ${optionValue}`}
        role="option"
        aria-selected={isSelected}
        disabled={disabled}
        onClick={() => onSelect(optionValue)}
        data-testid={dataTestId ? `${dataTestId}__${columnName}-option-${optionValue}` : undefined}
      >
        {optionValue}
      </button>
    );
  };

  return (
    <fieldset
      ref={rootRef}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={mergeClasses(
        [
          'cm-time-picker',
          disabled ? 'cm-time-picker--disabled' : 'cm-time-picker--enabled',
          isOpen ? 'cm-time-picker--open' : '',
        ],
        resolvedTheme,
        className,
      )}
      data-testid={dataTestId}
    >
      <input
        aria-label="Selected time"
        className="cm-time-picker__input"
        value={selectedValue ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        readOnly
        role="combobox"
        onClick={handleInputClick}
        aria-haspopup="listbox"
        aria-controls={panelId}
        aria-expanded={isOpen}
        data-testid={dataTestId ? `${dataTestId}__input` : undefined}
      />
      {allowClear && selectedValue !== null && !disabled ? (
        <button
          type="button"
          className="cm-time-picker__clear"
          aria-label="Clear time"
          onClick={handleClear}
          data-testid={dataTestId ? `${dataTestId}__clear` : undefined}
        >
          x
        </button>
      ) : null}
      {isOpen ? (
        <div
          className="cm-time-picker__panel"
          id={panelId}
          role="listbox"
          aria-label="Time options"
          data-testid={dataTestId ? `${dataTestId}__panel` : undefined}
        >
          <div className="cm-time-picker__column">
            {hourOptions.map((hour) =>
              renderOption('hour', hour, selectedParts.hour, handleHourSelect),
            )}
          </div>
          <div className="cm-time-picker__column">
            {minuteOptions.map((minute) =>
              renderOption('minute', minute, selectedParts.minute, handleMinuteSelect),
            )}
          </div>
          {format === 'HH:mm:ss' ? (
            <div className="cm-time-picker__column">
              {secondOptions.map((second) =>
                renderOption('second', second, selectedParts.second, handleSecondSelect),
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
}
