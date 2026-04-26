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
  onMouseDown?: React.MouseEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onPointerEnter?: React.PointerEventHandler<HTMLElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLElement>;
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

function assignForwardedRef<T>(ref: React.ForwardedRef<T>, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref !== null) {
    ref.current = value;
  }
}

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
      ref={(node) => {
        assignForwardedRef(ref, node);
      }}
      {...toTestProps(props)}
      onBlur={props.onBlur}
      onContextMenu={props.onContextMenu}
      onDoubleClick={props.onDoubleClick}
      onFocus={props.onFocus}
      onKeyDown={props.onKeyDown}
      onMouseDown={props.onMouseDown}
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
      ref={(node) => {
        assignForwardedRef(ref, node);
      }}
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

export const Pressable = React.forwardRef<HTMLElement, PressableProps>(
  function Pressable(props, ref) {
    const explicitRole = resolveRole(props);
    const role = explicitRole ?? 'button';
    const disabled = props.disabled ?? props.accessibilityState?.disabled;
    const shouldUseNativeButton =
      props.type !== undefined ||
      explicitRole === 'button' ||
      explicitRole === 'checkbox' ||
      explicitRole === 'radio' ||
      explicitRole === 'option' ||
      explicitRole === 'combobox' ||
      explicitRole === 'menuitem' ||
      explicitRole === 'tab';

    const sharedHandlers = {
      onBlur: props.onBlur,
      onContextMenu: props.onContextMenu,
      onDoubleClick: props.onDoubleClick,
      onMouseDown: disabled ? undefined : props.onPressIn,
      onMouseEnter: props.onMouseEnter,
      onMouseLeave: props.onMouseLeave,
      onFocus: props.onFocus,
      onPointerEnter: props.onPointerEnter,
      onPointerLeave: props.onPointerLeave,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        props.onClick?.(event);

        if (!event.defaultPrevented && !disabled) {
          props.onPress?.();
        }
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        props.onKeyDown?.(event);

        if (disabled) {
          return;
        }

        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          props.onPressIn?.();
        }
      },
      onKeyUp: (event: React.KeyboardEvent<HTMLElement>) => {
        props.onKeyUp?.(event);

        if (disabled) {
          return;
        }

        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          props.onPressOut?.();
          props.onPress?.();
        }
      },
      onMouseUp: disabled ? undefined : props.onPressOut,
    };

    if (shouldUseNativeButton) {
      return (
        <button
          ref={(node) => {
            assignForwardedRef(ref, node);
          }}
          type={props.type ?? 'button'}
          {...toTestProps(props)}
          disabled={disabled}
          onBlur={sharedHandlers.onBlur as React.FocusEventHandler<HTMLButtonElement>}
          onContextMenu={sharedHandlers.onContextMenu as React.MouseEventHandler<HTMLButtonElement>}
          onDoubleClick={sharedHandlers.onDoubleClick as React.MouseEventHandler<HTMLButtonElement>}
          onMouseDown={sharedHandlers.onMouseDown}
          onMouseEnter={sharedHandlers.onMouseEnter as React.MouseEventHandler<HTMLButtonElement>}
          onMouseLeave={sharedHandlers.onMouseLeave as React.MouseEventHandler<HTMLButtonElement>}
          onFocus={sharedHandlers.onFocus as React.FocusEventHandler<HTMLButtonElement>}
          onKeyDown={sharedHandlers.onKeyDown as React.KeyboardEventHandler<HTMLButtonElement>}
          onKeyUp={sharedHandlers.onKeyUp as React.KeyboardEventHandler<HTMLButtonElement>}
          onMouseUp={sharedHandlers.onMouseUp}
          onPointerEnter={
            sharedHandlers.onPointerEnter as React.PointerEventHandler<HTMLButtonElement>
          }
          onPointerLeave={
            sharedHandlers.onPointerLeave as React.PointerEventHandler<HTMLButtonElement>
          }
          onClick={sharedHandlers.onClick as React.MouseEventHandler<HTMLButtonElement>}
        >
          {props.children}
        </button>
      );
    }

    return (
      /* biome-ignore lint/a11y/noStaticElementInteractions: react-native Pressable mock needs div semantics for container pressables */
      <div
        ref={(node) => {
          assignForwardedRef(ref, node);
        }}
        {...toTestProps(props)}
        role={role}
        tabIndex={props.tabIndex ?? (disabled ? -1 : 0)}
        onBlur={sharedHandlers.onBlur}
        onContextMenu={sharedHandlers.onContextMenu}
        onDoubleClick={sharedHandlers.onDoubleClick}
        onMouseDown={sharedHandlers.onMouseDown}
        onMouseEnter={sharedHandlers.onMouseEnter}
        onMouseLeave={sharedHandlers.onMouseLeave}
        onFocus={sharedHandlers.onFocus}
        onKeyDown={sharedHandlers.onKeyDown}
        onKeyUp={sharedHandlers.onKeyUp}
        onMouseUp={sharedHandlers.onMouseUp}
        onPointerEnter={sharedHandlers.onPointerEnter}
        onPointerLeave={sharedHandlers.onPointerLeave}
        onClick={sharedHandlers.onClick}
      >
        {props.children}
      </div>
    );
  },
);

export const StyleSheet = {
  create<T extends Record<string, unknown>>(styles: T): T {
    return styles;
  },
};
