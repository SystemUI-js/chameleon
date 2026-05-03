import React from 'react';
import { domEnv } from '../../runtime/dom-env';
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from '../../runtime/react-native-web';
import { WidgetInteractionBehavior, type WidgetFrameMovePosition } from '../Widget/Widget';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';

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
  <Text testID="window-title-text" className="cm-window__title-bar__text">
    {children}
  </Text>
);

export class CWindowTitle extends React.Component<CWindowTitleProps> {
  private activeDrag: {
    pointer: { x: number; y: number };
    pose: { x: number; y: number; width: number; height: number };
  } | null = null;

  private dragMoved = false;

  private isControlTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return (
      target.closest('[data-testid="window-title-controls"]') !== null ||
      target.closest('button,[role="button"],a,input,select,textarea') !== null
    );
  }

  public componentWillUnmount(): void {
    this.detachDragListeners();
  }

  private handleWindowMouseMove = (event: MouseEvent): void => {
    if (this.activeDrag === null) {
      return;
    }

    const deltaX = event.clientX - this.activeDrag.pointer.x;
    const deltaY = event.clientY - this.activeDrag.pointer.y;
    const nextPosition = {
      x: this.activeDrag.pose.x + deltaX,
      y: this.activeDrag.pose.y + deltaY,
    };

    this.dragMoved = true;

    if (this.props.moveBehavior === WidgetInteractionBehavior.Outline) {
      this.props.onWindowMovePreview?.(nextPosition);
      return;
    }

    this.props.onWindowMove?.(nextPosition);
  };

  private handleWindowMouseUp = (event: MouseEvent): void => {
    if (this.activeDrag === null) {
      return;
    }

    const deltaX = event.clientX - this.activeDrag.pointer.x;
    const deltaY = event.clientY - this.activeDrag.pointer.y;
    const nextPosition = {
      x: this.activeDrag.pose.x + deltaX,
      y: this.activeDrag.pose.y + deltaY,
    };

    if (this.dragMoved || this.props.moveBehavior === WidgetInteractionBehavior.Outline) {
      this.props.onWindowMove?.(nextPosition);
    }

    this.props.onWindowMovePreviewClear?.();
    this.detachDragListeners();
    this.activeDrag = null;
    domEnv.setTimeout(() => {
      this.dragMoved = false;
    }, 0);
  };

  private detachDragListeners(): void {
    domEnv.removeEventListener('mousemove', this.handleWindowMouseMove);
    domEnv.removeEventListener('mouseup', this.handleWindowMouseUp);
  }

  private handleMouseDown = (event: React.MouseEvent<HTMLElement>): void => {
    if (this.isControlTarget(event.target)) {
      return;
    }

    const pose = this.props.getWindowPose?.();
    if (pose === undefined) {
      return;
    }

    event.preventDefault();

    this.activeDrag = {
      pointer: { x: event.clientX, y: event.clientY },
      pose,
    };
    this.dragMoved = false;

    if (this.props.moveBehavior === WidgetInteractionBehavior.Outline) {
      this.props.onWindowMovePreview?.({ x: pose.x, y: pose.y });
    }

    domEnv.addEventListener('mousemove', this.handleWindowMouseMove);
    domEnv.addEventListener('mouseup', this.handleWindowMouseUp);
  };

  private handlePress = (): void => {
    if (this.dragMoved) {
      return;
    }

    this.props.onWindowMovePreviewClear?.();
  };

  public render(): React.ReactElement {
    const resolvedTheme = normalizeThemeClassName(this.props.theme);
    const hasActionButton = React.Children.count(this.props.actionButton) > 0;
    const controlsClassName = mergeClasses(
      ['cm-window__title-bar__controls'],
      resolvedTheme,
      this.props.actionButtonPosition === 'left'
        ? 'cm-window__title-bar__controls--left'
        : 'cm-window__title-bar__controls--right',
    );
    const titleContent =
      React.Children.count(this.props.children) === 1 &&
      (typeof this.props.children === 'string' || typeof this.props.children === 'number') ? (
        <WindowTitleBarText>{this.props.children}</WindowTitleBarText>
      ) : (
        this.props.children
      );
    const controls = hasActionButton ? (
      <View testID="window-title-controls" className={controlsClassName}>
        {this.props.actionButton}
      </View>
    ) : null;

    return (
      <Pressable
        testID="window-title"
        accessibilityRole="none"
        onMouseDown={this.handleMouseDown}
        onPress={this.handlePress}
        style={this.props.style}
        className={mergeClasses(
          ['cm-window__title-bar'],
          resolvedTheme,
          [
            hasActionButton ? 'cm-window__title-bar--with-controls' : undefined,
            this.props.className,
          ]
            .filter(Boolean)
            .join(' '),
        )}
      >
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
      </Pressable>
    );
  }
}
