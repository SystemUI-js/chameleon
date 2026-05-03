import type React from 'react';

export interface ViewStyle {
  [key: string]: string | number | boolean | undefined;
}

export type StyleProp<T> = T | readonly StyleProp<T>[] | null | undefined;

export type AccessibilityState = {
  checked?: boolean;
  disabled?: boolean;
  selected?: boolean;
};

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
  onMouseDown?: React.MouseEventHandler<HTMLElement>;
  onMouseUp?: React.MouseEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onTouchStart?: React.TouchEventHandler<HTMLElement>;
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

export type ViewProps = DOMInteropProps & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: React.AriaRole;
  accessibilityState?: AccessibilityState;
};

export type PressableProps = ViewProps & {
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};
