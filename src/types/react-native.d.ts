declare module 'react-native' {
  import * as React from 'react';

  export type AccessibilityHasPopup = boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';

  export interface DOMInteropProps {
    className?: string;
    role?: string;
    tabIndex?: number;
    id?: string;
    hidden?: boolean;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    name?: string;
    value?: string;
    required?: boolean;
    onChange?: React.ChangeEventHandler<HTMLElement>;
    onClick?: React.MouseEventHandler<HTMLElement>;
    onDoubleClick?: React.MouseEventHandler<HTMLElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
    onPointerEnter?: React.PointerEventHandler<HTMLElement>;
    onPointerLeave?: React.PointerEventHandler<HTMLElement>;
    onContextMenu?: React.MouseEventHandler<HTMLElement>;
    onScroll?: React.UIEventHandler<HTMLElement>;
    'data-menu-state'?: string;
    'data-menu-depth'?: number;
    'data-menu-item-id'?: string;
    'data-menu-item-key'?: string;
    'data-menu-item-type'?: string;
    'data-system-type'?: string;
    'data-theme'?: string;
    'data-scroll-area-content'?: string;
    'aria-label'?: string;
    'aria-checked'?: boolean;
    'aria-controls'?: string;
    'aria-expanded'?: boolean;
    'aria-labelledby'?: string;
    'aria-selected'?: boolean;
    'aria-haspopup'?: AccessibilityHasPopup;
    'aria-hidden'?: boolean;
  }

  export type StyleProp<T> = T | readonly unknown[] | null | undefined;

  export interface ViewStyle {
    [key: string]: string | number | boolean | undefined;
  }

  export type TextStyle = ViewStyle;

  export interface ViewProps extends DOMInteropProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    testID?: string;
    accessibilityLabel?: string;
    onLayout?: () => void;
  }

  export type TextProps = ViewProps;

  export interface PressableProps extends ViewProps {
    onPress?: () => void;
    onPressIn?: () => void;
    onPressOut?: () => void;
    disabled?: boolean;
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
