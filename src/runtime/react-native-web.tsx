/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import type { PressableProps, ViewProps, ViewStyle } from './platform-types';

export type {
  AccessibilityState,
  DOMInteropProps,
  PressableProps,
  StyleProp,
  ViewProps,
  ViewStyle,
} from './platform-types';

type DomProps = React.HTMLAttributes<HTMLElement> & Record<string, unknown>;

function flattenStyle(style: StyleProp<ViewStyle>): ViewStyle | undefined {
  if (style == null) {
    return undefined;
  }

  if (Array.isArray(style)) {
    return style.reduce<ViewStyle>((accumulator, item) => {
      const flattenedItem = flattenStyle(item);

      if (flattenedItem !== undefined) {
        Object.assign(accumulator, flattenedItem);
      }

      return accumulator;
    }, {});
  }

  return style as ViewStyle;
}

function extractDomProps({
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  children: _children,
  style,
  testID,
  ...restProps
}: ViewProps): DomProps {
  const domProps: DomProps = {
    ...restProps,
    style: flattenStyle(style),
  };

  if (testID !== undefined) {
    domProps['data-testid'] = testID;
  }

  if (accessibilityLabel !== undefined && domProps['aria-label'] === undefined) {
    domProps['aria-label'] = accessibilityLabel;
  }

  if (accessibilityRole !== undefined && domProps.role === undefined) {
    domProps.role = accessibilityRole;
  }

  if (accessibilityState?.checked !== undefined && domProps['aria-checked'] === undefined) {
    domProps['aria-checked'] = accessibilityState.checked;
  }

  if (accessibilityState?.disabled !== undefined && domProps['aria-disabled'] === undefined) {
    domProps['aria-disabled'] = accessibilityState.disabled;
  }

  if (accessibilityState?.selected !== undefined && domProps['aria-selected'] === undefined) {
    domProps['aria-selected'] = accessibilityState.selected;
  }

  return domProps;
}

export const View = React.forwardRef<HTMLElement, ViewProps>(function View(props, ref) {
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} {...extractDomProps(props)}>
      {props.children}
    </div>
  );
});

export const Text = React.forwardRef<HTMLElement, ViewProps>(function Text(props, ref) {
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} {...extractDomProps(props)}>
      {props.children}
    </span>
  );
});

export const Pressable = React.forwardRef<HTMLElement, PressableProps>(function Pressable(
  {
    disabled = false,
    onClick,
    onKeyDown,
    onKeyUp,
    onMouseDown,
    onMouseUp,
    onPress,
    onPressIn,
    onPressOut,
    type: _type,
    ...props
  },
  ref,
) {
  const domProps = extractDomProps(props);
  const role = domProps.role;
  const shouldUseNativeButton =
    _type !== undefined ||
    role === 'button' ||
    role === 'checkbox' ||
    role === 'radio' ||
    role === 'option' ||
    role === 'combobox' ||
    role === 'menuitem' ||
    role === 'tab';

  if (!shouldUseNativeButton && domProps.role === undefined) {
    domProps.role = 'button';
  }

  if (!shouldUseNativeButton && domProps.tabIndex === undefined) {
    domProps.tabIndex = disabled ? -1 : 0;
  }

  if (disabled) {
    domProps['aria-disabled'] = true;
  }

  const sharedHandlers = {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
      onPress?.();
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);

      if (disabled) {
        return;
      }

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        onPressIn?.();
      }
    },
    onKeyUp: (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyUp?.(event);

      if (disabled) {
        return;
      }

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        onPressOut?.();
        onPress?.();
      }
    },
    onMouseDown: (event: React.MouseEvent<HTMLElement>) => {
      onMouseDown?.(event);

      if (!disabled) {
        onPressIn?.();
      }
    },
    onMouseUp: (event: React.MouseEvent<HTMLElement>) => {
      onMouseUp?.(event);

      if (!disabled) {
        onPressOut?.();
      }
    },
  };

  if (shouldUseNativeButton) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        {...(domProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        type={_type ?? 'button'}
        disabled={disabled}
        onClick={sharedHandlers.onClick as React.MouseEventHandler<HTMLButtonElement>}
        onKeyDown={sharedHandlers.onKeyDown as React.KeyboardEventHandler<HTMLButtonElement>}
        onKeyUp={sharedHandlers.onKeyUp as React.KeyboardEventHandler<HTMLButtonElement>}
        onMouseDown={sharedHandlers.onMouseDown}
        onMouseUp={sharedHandlers.onMouseUp}
      >
        {props.children}
      </button>
    );
  }

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: DOM shim intentionally makes div interactive */
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      {...domProps}
      onClick={sharedHandlers.onClick}
      onKeyDown={sharedHandlers.onKeyDown}
      onKeyUp={sharedHandlers.onKeyUp}
      onMouseDown={sharedHandlers.onMouseDown}
      onMouseUp={sharedHandlers.onMouseUp}
    >
      {props.children}
    </div>
  );
});

export const StyleSheet = {
  create<T extends Record<string, unknown>>(styles: T): T {
    return styles;
  },
};
