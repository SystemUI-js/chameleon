/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';

type BaseProps = {
  children?: React.ReactNode;
  style?: unknown;
  className?: string;
  id?: string;
  hidden?: boolean;
  role?: React.AriaRole;
  tabIndex?: number;
  title?: string;
  name?: string;
  value?: string | number;
  disabled?: boolean;
  required?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: React.AriaRole;
  accessibilityState?: {
    checked?: boolean | 'mixed';
    disabled?: boolean;
    expanded?: boolean;
    selected?: boolean;
  };
  'aria-label'?: string;
  'aria-hidden'?: React.AriaAttributes['aria-hidden'];
  'aria-haspopup'?: React.AriaAttributes['aria-haspopup'];
  'aria-expanded'?: React.AriaAttributes['aria-expanded'];
  'aria-checked'?: React.AriaAttributes['aria-checked'];
  'aria-disabled'?: React.AriaAttributes['aria-disabled'];
  'aria-controls'?: string;
  'aria-selected'?: React.AriaAttributes['aria-selected'];
  'aria-required'?: React.AriaAttributes['aria-required'];
  'aria-labelledby'?: string;
  'aria-activedescendant'?: string;
  'data-testid'?: string;
  'data-scroll-area-content'?: string;
  'data-value'?: string;
  [key: `data-${string}`]: unknown;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onPointerEnter?: React.PointerEventHandler<HTMLElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  onContextMenu?: React.MouseEventHandler<HTMLElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLElement>;
  onScroll?: React.UIEventHandler<HTMLElement>;
};

type PressableProps = BaseProps & {
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

function flattenStyle(style: unknown): React.CSSProperties | undefined {
  if (style == null) {
    return undefined;
  }

  if (Array.isArray(style)) {
    return style.reduce<React.CSSProperties>((accumulator, item) => {
      const flattenedItem = flattenStyle(item);

      if (flattenedItem !== undefined) {
        Object.assign(accumulator, flattenedItem);
      }

      return accumulator;
    }, {});
  }

  return style as React.CSSProperties;
}

function resolveRole(props: BaseProps): React.AriaRole | undefined {
  return props.role ?? props.accessibilityRole;
}

function toTestProps(props: BaseProps): Record<string, unknown> {
  const dataAttributes = Object.fromEntries(
    Object.entries(props).filter(([key]) => key.startsWith('data-')),
  );

  return {
    id: props.id,
    hidden: props.hidden,
    role: resolveRole(props),
    tabIndex: props.tabIndex,
    title: props.title,
    name: props.name,
    value: props.value,
    required: props.required,
    className: props.className,
    'data-testid': props.testID ?? props['data-testid'],
    'data-scroll-area-content': props['data-scroll-area-content'],
    'data-value': props['data-value'],
    'aria-label': props.accessibilityLabel ?? props['aria-label'],
    'aria-hidden': props['aria-hidden'],
    'aria-haspopup': props['aria-haspopup'],
    'aria-expanded': props['aria-expanded'] ?? props.accessibilityState?.expanded,
    'aria-checked': props['aria-checked'] ?? props.accessibilityState?.checked,
    'aria-disabled': props['aria-disabled'] ?? props.accessibilityState?.disabled,
    'aria-controls': props['aria-controls'],
    'aria-selected': props['aria-selected'] ?? props.accessibilityState?.selected,
    'aria-required': props['aria-required'],
    'aria-labelledby': props['aria-labelledby'],
    'aria-activedescendant': props['aria-activedescendant'],
    style: flattenStyle(props.style),
    ...dataAttributes,
  };
}

export const View = React.forwardRef<HTMLElement, BaseProps>(function View(props, ref) {
  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: react-native View mock forwards focus events for tests */
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      {...toTestProps(props)}
      onBlur={props.onBlur}
      onContextMenu={props.onContextMenu}
      onDoubleClick={props.onDoubleClick}
      onFocus={props.onFocus}
      onKeyDown={props.onKeyDown}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onPointerEnter={props.onPointerEnter}
      onPointerLeave={props.onPointerLeave}
      onScroll={props.onScroll}
    >
      {props.children}
    </div>
  );
});

export const Text = React.forwardRef<HTMLElement, BaseProps>(function Text(props, ref) {
  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: react-native Text mock forwards events for tests */
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      {...toTestProps(props)}
      onBlur={props.onBlur}
      onClick={props.onClick}
      onContextMenu={props.onContextMenu}
      onDoubleClick={props.onDoubleClick}
      onFocus={props.onFocus}
      onKeyDown={props.onKeyDown}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onPointerEnter={props.onPointerEnter}
      onPointerLeave={props.onPointerLeave}
    >
      {props.children}
    </span>
  );
});

export const Pressable = React.forwardRef<HTMLButtonElement, PressableProps>(
  function Pressable(props, ref) {
    return (
      <button
        ref={ref}
        type={props.type ?? 'button'}
        {...toTestProps(props)}
        disabled={props.disabled ?? props.accessibilityState?.disabled}
        onBlur={props.onBlur}
        onContextMenu={props.onContextMenu}
        onDoubleClick={props.onDoubleClick}
        onMouseDown={props.disabled ? undefined : props.onPressIn}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        onMouseUp={props.disabled ? undefined : props.onPressOut}
        onPointerEnter={props.onPointerEnter}
        onPointerLeave={props.onPointerLeave}
        onClick={(event) => {
          props.onClick?.(event);

          if (!event.defaultPrevented) {
            props.onPress?.();
          }
        }}
      >
        {props.children}
      </button>
    );
  },
);

export const StyleSheet = {
  create<T extends Record<string, unknown>>(styles: T): T {
    return styles;
  },
};
