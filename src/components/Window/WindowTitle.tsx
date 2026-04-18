import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { WidgetInteractionBehavior, type WidgetFrameMovePosition } from '../Widget/Widget';

export type WindowPosition = WidgetFrameMovePosition;
export type WindowTitleActionButtonPosition = 'left' | 'right';

export interface CWindowTitleProps {
  children?: React.ReactNode;
  className?: string;
  theme?: string;
  style?: StyleProp<ViewStyle>;
  moveBehavior?: WidgetInteractionBehavior;
  onWindowMove?: (position: WindowPosition) => void;
  onWindowMovePreview?: (position: WindowPosition) => void;
  onWindowMovePreviewClear?: () => void;
  getWindowPose?: () => { x: number; y: number; width: number; height: number };
  actionButton?: React.ReactNode;
  actionButtonPosition?: WindowTitleActionButtonPosition;
}

export interface WindowTitleBarTextProps {
  children?: React.ReactNode;
}

export const WindowTitleBarText: React.FC<WindowTitleBarTextProps> = ({ children }) => (
  <Text testID="window-title-text">{children}</Text>
);

export class CWindowTitle extends React.Component<CWindowTitleProps> {
  private handlePressIn = (): void => {
    if (this.props.moveBehavior === WidgetInteractionBehavior.Outline) {
      const pose = this.props.getWindowPose?.();
      if (pose) {
        this.props.onWindowMovePreview?.({ x: pose.x, y: pose.y });
      }
    }
  };

  private handlePress = (): void => {
    const pose = this.props.getWindowPose?.();
    if (pose) {
      this.props.onWindowMove?.({ x: pose.x, y: pose.y });
    }
    this.props.onWindowMovePreviewClear?.();
  };

  public render(): React.ReactElement {
    const hasActionButton = React.Children.count(this.props.actionButton) > 0;
    const titleContent =
      React.Children.count(this.props.children) === 1 &&
      (typeof this.props.children === 'string' || typeof this.props.children === 'number') ? (
        <WindowTitleBarText>{this.props.children}</WindowTitleBarText>
      ) : (
        this.props.children
      );
    const controls = hasActionButton ? (
      <View testID="window-title-controls">{this.props.actionButton}</View>
    ) : null;

    return (
      <Pressable
        testID="window-title"
        onPressIn={this.handlePressIn}
        onPress={this.handlePress}
        style={this.props.style}
      >
        <View>
          {this.props.actionButtonPosition === 'left' ? (
            <>
              {controls}
              {titleContent}
            </>
          ) : (
            <>
              {titleContent}
              {controls}
            </>
          )}
        </View>
      </Pressable>
    );
  }
}
