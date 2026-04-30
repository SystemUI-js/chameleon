import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

const EMPTY_SELECT_VALUE = '';

export interface CSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CSelectProps {
  options: readonly CSelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (nextValue: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  theme?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

interface ResolvedSelectOption extends CSelectOption {
  id: string;
  isPlaceholder?: boolean;
}

function getFirstEnabledOptionValue(options: readonly CSelectOption[]): string {
  return options.find((option) => !option.disabled)?.value ?? EMPTY_SELECT_VALUE;
}

function findSelectableIndex(
  options: readonly ResolvedSelectOption[],
  value: string | undefined,
): number {
  if (value !== undefined) {
    const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);

    if (selectedIndex >= 0) {
      return selectedIndex;
    }
  }

  return options.findIndex((option) => !option.disabled);
}

function moveHighlight(
  options: readonly ResolvedSelectOption[],
  currentValue: string | undefined,
  direction: 1 | -1,
): string | undefined {
  if (options.length === 0) {
    return undefined;
  }

  const enabledOptions = options.filter((option) => !option.disabled);

  if (enabledOptions.length === 0) {
    return undefined;
  }

  const currentIndex = enabledOptions.findIndex((option) => option.value === currentValue);

  if (currentIndex < 0) {
    return enabledOptions[direction === 1 ? 0 : enabledOptions.length - 1]?.value;
  }

  const nextIndex = currentIndex + direction;

  if (nextIndex < 0) {
    return enabledOptions[enabledOptions.length - 1]?.value;
  }

  if (nextIndex >= enabledOptions.length) {
    return enabledOptions[0]?.value;
  }

  return enabledOptions[nextIndex]?.value;
}

function getBoundaryHighlightValue(
  options: readonly ResolvedSelectOption[],
  boundary: 'first' | 'last',
): string | undefined {
  const enabledOptions = options.filter((option) => !option.disabled);

  if (enabledOptions.length === 0) {
    return undefined;
  }

  return boundary === 'first'
    ? enabledOptions[0]?.value
    : enabledOptions[enabledOptions.length - 1]?.value;
}

export function CSelect({
  options,
  value,
  defaultValue,
  onChange,
  name,
  disabled,
  required,
  placeholder,
  className,
  theme,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: CSelectProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const isControlled = value !== undefined;
  const [isOpen, setIsOpen] = React.useState(false);
  const listboxId = React.useId();
  const initialValue = React.useMemo(() => {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    if (placeholder !== undefined) {
      return EMPTY_SELECT_VALUE;
    }

    return getFirstEnabledOptionValue(options);
  }, [defaultValue, options, placeholder]);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(initialValue);
  const resolvedOptions = React.useMemo<ResolvedSelectOption[]>(() => {
    const mappedOptions = options.map((option, index) => ({
      ...option,
      id: `${listboxId}-option-${index}`,
    }));

    if (placeholder === undefined) {
      return mappedOptions;
    }

    return [
      {
        id: `${listboxId}-option-placeholder`,
        label: placeholder,
        value: EMPTY_SELECT_VALUE,
        disabled: true,
        isPlaceholder: true,
      },
      ...mappedOptions,
    ];
  }, [listboxId, options, placeholder]);
  const selectedValue = isControlled ? (value ?? EMPTY_SELECT_VALUE) : uncontrolledValue;
  const selectedOption =
    resolvedOptions.find((option) => option.value === selectedValue) ??
    resolvedOptions.find((option) => option.value === getFirstEnabledOptionValue(options));
  const [highlightedValue, setHighlightedValue] = React.useState<string | undefined>(() => {
    const selectedIndex = findSelectableIndex(resolvedOptions, selectedValue);

    return selectedIndex >= 0 ? resolvedOptions[selectedIndex]?.value : undefined;
  });
  const triggerClasses = ['cm-select'];

  if (disabled) {
    triggerClasses.push('cm-select--disabled');
  }

  if (isOpen) {
    triggerClasses.push('cm-select--open');
  }

  if (selectedOption?.isPlaceholder) {
    triggerClasses.push('cm-select--placeholder');
  }

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextIndex = findSelectableIndex(resolvedOptions, selectedValue);
    setHighlightedValue(nextIndex >= 0 ? resolvedOptions[nextIndex]?.value : undefined);
  }, [isOpen, resolvedOptions, selectedValue]);

  const commitValue = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      setIsOpen(false);
      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  const openListbox = React.useCallback(() => {
    if (disabled) {
      return;
    }

    const nextIndex = findSelectableIndex(resolvedOptions, selectedValue);
    setHighlightedValue(nextIndex >= 0 ? resolvedOptions[nextIndex]?.value : undefined);
    setIsOpen(true);
  }, [disabled, resolvedOptions, selectedValue]);

  const handleTriggerClick = (): void => {
    if (disabled) {
      return;
    }

    if (isOpen) {
      setIsOpen(false);
      return;
    }

    openListbox();
  };

  const moveHighlightFromKey = React.useCallback(
    (direction: 1 | -1) => {
      setHighlightedValue((currentValue) =>
        moveHighlight(resolvedOptions, currentValue, direction),
      );
    },
    [resolvedOptions],
  );

  const setBoundaryHighlight = React.useCallback(
    (boundary: 'first' | 'last') => {
      setHighlightedValue(getBoundaryHighlightValue(resolvedOptions, boundary));
    },
    [resolvedOptions],
  );

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleTriggerKeyDown: React.KeyboardEventHandler<HTMLElement> = (event): void => {
    if (disabled) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      if (!isOpen) {
        openListbox();
        return;
      }

      moveHighlightFromKey(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (!isOpen) {
        openListbox();
        return;
      }

      if (highlightedValue !== undefined) {
        commitValue(highlightedValue);
      }

      return;
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (!isOpen) {
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setBoundaryHighlight(event.key === 'Home' ? 'first' : 'last');
    }
  };

  const handleBlur: React.FocusEventHandler<HTMLElement> = (event): void => {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setIsOpen(false);
  };

  return (
    <View className={mergeClasses(['cm-select-shell'], resolvedTheme)} onBlur={handleBlur}>
      <Pressable
        role="combobox"
        aria-label={ariaLabel}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-required={required || undefined}
        aria-activedescendant={
          isOpen
            ? resolvedOptions.find((option) => option.value === highlightedValue)?.id
            : undefined
        }
        className={mergeClasses(triggerClasses, resolvedTheme, className)}
        data-value={selectedOption?.value ?? EMPTY_SELECT_VALUE}
        disabled={disabled}
        name={name}
        required={required}
        testID={dataTestId}
        value={selectedOption?.value ?? EMPTY_SELECT_VALUE}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        <View className="cm-select__value">
          <Text>{selectedOption?.label ?? placeholder ?? ''}</Text>
        </View>
        <View aria-hidden="true" className="cm-select__caret">
          <Text>▾</Text>
        </View>
      </Pressable>

      {isOpen ? (
        <View
          id={listboxId}
          role="listbox"
          className={mergeClasses(['cm-select__listbox'], resolvedTheme)}
        >
          {resolvedOptions.map((option) => {
            const optionClasses = ['cm-select__option'];

            if (option.disabled) {
              optionClasses.push('cm-select__option--disabled');
            }

            if (option.value === selectedOption?.value) {
              optionClasses.push('cm-select__option--selected');
            }

            if (option.value === highlightedValue) {
              optionClasses.push('cm-select__option--highlighted');
            }

            return (
              <Pressable
                key={option.id}
                id={option.id}
                role="option"
                aria-selected={option.value === selectedOption?.value}
                className={mergeClasses(optionClasses, resolvedTheme)}
                data-value={option.value}
                disabled={option.disabled}
                onClick={() => {
                  if (!option.disabled) {
                    commitValue(option.value);
                  }
                }}
                onMouseEnter={() => {
                  if (!option.disabled) {
                    setHighlightedValue(option.value);
                  }
                }}
              >
                <Text>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
