declare module 'react-native' {
  import * as React from 'react';

  export type StyleProp<T> = T | readonly StyleProp<T>[] | null | undefined;

  export interface DOMInteropProps {
    className?: string;
    id?: string;
    hidden?: boolean;
    role?: React.AriaRole;
    tabIndex?: number;
    title?: string;
    name?: string;
    value?: string | number | readonly string[];
    disabled?: boolean;
    required?: boolean;
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
    [key: `data-${string}`]: string | number | boolean | undefined;
    onClick?: React.MouseEventHandler<HTMLElement>;
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
  }

  export interface ViewStyle {
    [key: string]: string | number | boolean | undefined;
  }

  export type TextStyle = ViewStyle;

  export interface ViewProps extends DOMInteropProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    testID?: string;
    accessibilityLabel?: string;
    accessibilityRole?: React.AriaRole;
    accessibilityState?: {
      checked?: boolean | 'mixed';
      disabled?: boolean;
      expanded?: boolean;
      selected?: boolean;
    };
    onLayout?: () => void;
  }

  export type TextProps = ViewProps;

  export interface PressableProps extends ViewProps {
    onPress?: () => void;
    onPressIn?: () => void;
    onPressOut?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }

  export const View: React.ForwardRefExoticComponent<ViewProps & React.RefAttributes<HTMLElement>>;
  export const Text: React.ForwardRefExoticComponent<TextProps & React.RefAttributes<HTMLElement>>;
  export const Pressable: React.ForwardRefExoticComponent<
    PressableProps & React.RefAttributes<HTMLElement>
  >;
  export const StyleSheet: {
    create<T extends Record<string, ViewStyle | TextStyle>>(styles: T): T;
  };
}
