import React from 'react';
import { CMenu, type MenuListItem } from '../Menu/Menu';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CSelectBaseProps {
  options: readonly CSelectOption[];
  name?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  theme?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

export type CSelectSingleProps = CSelectBaseProps & {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (nextValue: string) => void;
};

export type CSelectMultiProps = CSelectBaseProps & {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (nextValue: string[]) => void;
};

export type CSelectProps = CSelectSingleProps | CSelectMultiProps;

const INTERNAL_NATIVE_TEST_ID = 'cm-select-native-control';

const resolveInitialSingleValue = (
  defaultValue: string | undefined,
  placeholder: string | undefined,
  options: readonly CSelectOption[],
): string => defaultValue ?? (placeholder ? '' : (options[0]?.value ?? ''));

const resolveInitialMultiValues = (defaultValue: string[] | undefined): string[] =>
  defaultValue === undefined ? [] : [...defaultValue];

const resolveNextMultiValues = (
  currentValues: readonly string[],
  toggledValue: string,
  options: readonly CSelectOption[],
): string[] => {
  const nextValueSet = new Set(currentValues);

  if (nextValueSet.has(toggledValue)) {
    nextValueSet.delete(toggledValue);
  } else {
    nextValueSet.add(toggledValue);
  }

  // Rebuild from options so multi-select callbacks are deterministic and match display order.
  return options.filter((option) => nextValueSet.has(option.value)).map((option) => option.value);
};

export function CSelect(props: CSelectProps): React.ReactElement {
  const {
    options,
    name,
    disabled,
    required,
    placeholder,
    className,
    theme,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
  } = props;
  const multiple = props.multiple === true;
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const baseClasses = ['cm-select'];
  const isControlled = props.value !== undefined;
  const nativeSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const initialSingleValueRef = React.useRef(
    props.multiple === true
      ? resolveInitialSingleValue(undefined, placeholder, options)
      : resolveInitialSingleValue(props.defaultValue, placeholder, options),
  );
  const initialMultiValuesRef = React.useRef(
    props.multiple === true ? resolveInitialMultiValues(props.defaultValue) : [],
  );
  const [uncontrolledValue, setUncontrolledValue] = React.useState(initialSingleValueRef.current);
  const [uncontrolledValues, setUncontrolledValues] = React.useState(initialMultiValuesRef.current);

  let selectedValue = '';
  let selectedValues: string[] = [];

  if (props.multiple === true) {
    selectedValues = props.value ?? uncontrolledValues;
  } else {
    selectedValue = props.value ?? uncontrolledValue;
  }

  const selectedValueSet = new Set(selectedValues);
  const selectedOption = options.find((option) => option.value === selectedValue);
  const selectedMultiLabels = options
    .filter((option) => selectedValueSet.has(option.value))
    .map((option) => option.label);
  let visibleLabel = selectedOption?.label ?? placeholder ?? '';
  let nativeValue: string | string[] = selectedValue;
  let triggerValue = selectedValue;

  if (multiple) {
    visibleLabel = selectedMultiLabels.join(', ') || (placeholder ?? '');
    nativeValue = selectedValues;
    triggerValue = selectedValues.join(',');
  }
  const menuList = React.useMemo<readonly MenuListItem[]>(
    () =>
      options.map((option) => ({
        id: option.value,
        key: option.value,
        title: option.label,
        disabled: option.disabled,
      })),
    [options],
  );

  React.useEffect(() => {
    const hiddenSelect = nativeSelectRef.current;
    const parentForm = hiddenSelect?.form;

    if (parentForm === undefined || parentForm === null) {
      return undefined;
    }

    const handleReset = (): void => {
      if (isControlled) {
        return;
      }

      if (multiple) {
        setUncontrolledValues(initialMultiValuesRef.current);
        return;
      }

      setUncontrolledValue(initialSingleValueRef.current);
    };

    parentForm.addEventListener('reset', handleReset);

    return () => {
      parentForm.removeEventListener('reset', handleReset);
    };
  }, [isControlled, multiple]);

  const handleSelect = (item: MenuListItem): void => {
    if (disabled || item.disabled) {
      return;
    }

    if (props.multiple === true) {
      const currentValues = props.value ?? uncontrolledValues;
      const nextValues = resolveNextMultiValues(currentValues, item.id, options);

      if (!isControlled) {
        setUncontrolledValues(nextValues);
      }

      props.onChange?.(nextValues);
      return;
    }

    if (!isControlled) {
      setUncontrolledValue(item.id);
    }

    props.onChange?.(item.id);
  };

  const keepHiddenSelectReactControlled = (): void => {};

  const handleTriggerClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (disabled) {
      event.preventDefault();
    }
  };

  return (
    <span className="cm-select__root">
      <select
        ref={nativeSelectRef}
        name={name}
        disabled={disabled}
        required={required}
        multiple={multiple}
        value={nativeValue}
        onChange={keepHiddenSelectReactControlled}
        className="cm-select__native"
        aria-hidden="true"
        tabIndex={-1}
        data-testid={dataTestId ? `${dataTestId}__native` : INTERNAL_NATIVE_TEST_ID}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option
            key={`${option.label}-${option.value}`}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      <CMenu menuList={menuList} trigger="click" onSelect={handleSelect} closeOnSelect={!multiple}>
        <button
          type="button"
          disabled={disabled}
          className={mergeClasses(baseClasses, resolvedTheme, className)}
          aria-label={ariaLabel}
          data-testid={dataTestId}
          data-select-value={triggerValue}
          onClick={handleTriggerClick}
        >
          <span className="cm-select__label">{visibleLabel}</span>
        </button>
      </CMenu>
    </span>
  );
}
