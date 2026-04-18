declare module 'react-native' {
  import * as React from 'react';

  export type StyleProp<T> = T | readonly unknown[] | null | undefined;

  export interface ViewStyle {
    [key: string]: string | number | boolean | undefined;
  }

  export type TextStyle = ViewStyle;

  export interface ViewProps {
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

  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const Pressable: React.ComponentType<PressableProps>;
  export const StyleSheet: {
    create<T extends Record<string, ViewStyle | TextStyle>>(styles: T): T;
  };
}
