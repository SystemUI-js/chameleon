/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';

type StyleValue = React.CSSProperties | readonly StyleValue[] | null | undefined;

type AccessibilityState = {
  checked?: boolean;
  disabled?: boolean;
  selected?: boolean;
};

type BaseProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  style?: StyleValue;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: React.AriaRole;
  accessibilityState?: AccessibilityState;
};

type PressableProps = BaseProps & {
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

function flattenStyle(style: StyleValue): React.CSSProperties | undefined {
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

  return style;
}

function extractDomProps({
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  children: _children,
  style,
  testID,
  ...restProps
}: BaseProps): React.HTMLAttributes<HTMLElement> {
  const domProps: React.HTMLAttributes<HTMLElement> = {
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

export function View(props: BaseProps): React.ReactElement {
  return <div {...extractDomProps(props)}>{props.children}</div>;
}

export function Text(props: BaseProps): React.ReactElement {
  return <span {...extractDomProps(props)}>{props.children}</span>;
}

export function Pressable({
  disabled = false,
  onClick,
  onKeyDown,
  onKeyUp,
  onPress,
  onPressIn,
  onPressOut,
  type: _type,
  ...props
}: PressableProps): React.ReactElement {
  const domProps = extractDomProps(props);

  if (domProps.role === undefined) {
    domProps.role = 'button';
  }

  if (domProps.tabIndex === undefined) {
    domProps.tabIndex = disabled ? -1 : 0;
  }

  if (disabled) {
    domProps['aria-disabled'] = true;
  }

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: DOM shim intentionally makes div interactive */
    /* biome-ignore lint/a11y/useKeyWithClickEvents: shim adds explicit keyboard activation handling below */
    <div
      {...domProps}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
        onPress?.();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (disabled) {
          return;
        }

        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          onPressIn?.();
        }
      }}
      onKeyUp={(event) => {
        onKeyUp?.(event);

        if (disabled) {
          return;
        }

        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          onPressOut?.();
          onPress?.();
        }
      }}
      onMouseDown={() => {
        if (!disabled) {
          onPressIn?.();
        }
      }}
      onMouseUp={() => {
        if (!disabled) {
          onPressOut?.();
        }
      }}
    >
      {props.children}
    </div>
  );
}

export const StyleSheet = {
  create<T extends Record<string, unknown>>(styles: T): T {
    return styles;
  },
};
