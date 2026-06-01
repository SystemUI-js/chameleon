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

const INTERNAL_NATIVE_TEST_ID = 'cm-select-native-control';

const resolveInitialValue = (
  defaultValue: string | undefined,
  placeholder: string | undefined,
  options: readonly CSelectOption[],
): string => defaultValue ?? (placeholder ? '' : (options[0]?.value ?? ''));

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
  const baseClasses = ['cm-select'];
  const isControlled = value !== undefined;
  const nativeSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const initialValueRef = React.useRef(resolveInitialValue(defaultValue, placeholder, options));
  const [uncontrolledValue, setUncontrolledValue] = React.useState(initialValueRef.current);
  const selectedValue = isControlled ? value : uncontrolledValue;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const visibleLabel = selectedOption?.label ?? placeholder ?? '';
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
      if (!isControlled) {
        setUncontrolledValue(initialValueRef.current);
      }
    };

    parentForm.addEventListener('reset', handleReset);

    return () => {
      parentForm.removeEventListener('reset', handleReset);
    };
  }, [isControlled]);

  const handleSelect = (item: MenuListItem): void => {
    if (disabled) {
      return;
    }

    if (!isControlled) {
      setUncontrolledValue(item.id);
    }

    onChange?.(item.id);
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
        value={selectedValue}
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
      <CMenu menuList={menuList} trigger="click" onSelect={handleSelect}>
        <button
          type="button"
          disabled={disabled}
          className={mergeClasses(baseClasses, resolvedTheme, className)}
          aria-label={ariaLabel}
          data-testid={dataTestId}
          data-select-value={selectedValue}
          onClick={handleTriggerClick}
        >
          <span className="cm-select__label">{visibleLabel}</span>
        </button>
      </CMenu>
    </span>
  );
}
