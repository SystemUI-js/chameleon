import React from 'react';
import {
  Pressable as RNPressable,
  StyleSheet as RNStyleSheet,
  Text as RNText,
  View as RNView,
} from 'react-native';
import type { PressableProps, ViewProps } from './platform-types';

export type {
  AccessibilityState,
  DOMInteropProps,
  PressableProps,
  StyleProp,
  ViewProps,
  ViewStyle,
} from './platform-types';

function pickNativeViewProps(props: ViewProps) {
  const { children, style, testID, accessibilityLabel, accessibilityRole, accessibilityState } =
    props;

  return {
    children,
    style: style as React.CSSProperties | undefined,
    testID,
    accessibilityLabel,
    accessibilityRole,
    accessibilityState,
  };
}

export const View = React.forwardRef<HTMLElement, ViewProps>(function View(props, _ref) {
  return <RNView {...pickNativeViewProps(props)} />;
});

export const Text = React.forwardRef<HTMLElement, ViewProps>(function Text(props, _ref) {
  return <RNText {...pickNativeViewProps(props)} />;
});

export const Pressable = React.forwardRef<HTMLElement, PressableProps>(function Pressable(
  {
    onPress,
    onPressIn,
    onPressOut,
    disabled,
    children,
    style,
    testID,
    accessibilityLabel,
    accessibilityRole,
    accessibilityState,
  },
  _ref,
) {
  return (
    <RNPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      style={style as React.CSSProperties | undefined}
    >
      {children}
    </RNPressable>
  );
});

export const StyleSheet = RNStyleSheet;
