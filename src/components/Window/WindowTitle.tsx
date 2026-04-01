import { Drag, type Pose } from '@system-ui-js/multi-drag';
import React from 'react';
import { mergeClasses, ResolvedThemeClassName } from '../Theme';
import type { WidgetFrameMovePosition } from '../Widget/Widget';

export type WindowPosition = WidgetFrameMovePosition;

export interface CWindowTitleProps {
  children?: React.ReactNode;
  className?: string;
  theme?: string;
  style?: React.CSSProperties;
  onWindowMove?: (position: WindowPosition) => void;
  getWindowPose?: () => Pose;
}

export interface WindowTitleBarTextProps {
  children?: React.ReactNode;
}

export const WindowTitleBarText: React.FC<WindowTitleBarTextProps> = ({ children }) => (
  <span data-testid="window-title-text" className="cm-window__title-bar__text">
    {children}
  </span>
);

export class CWindowTitle extends React.Component<CWindowTitleProps> {
  protected readonly titleRef = React.createRef<HTMLDivElement>();
  private drag?: Drag;
  private isDragActive = false;

  public componentDidMount(): void {
    this.isDragActive = true;
    const element = this.titleRef.current;

    if (!element) {
      return;
    }

    this.drag = new Drag(element, {
      getPose: () => this.getEffectivePose(element),
      setPose: (_element, pose) => {
        this.handleDragPose(pose);
      },
    });
  }

  public componentWillUnmount(): void {
    this.isDragActive = false;
    const activeDrag = this.drag;
    activeDrag?.setDisabled();
    this.drag = undefined;
  }

  private handleDragPose(pose: Partial<Pose>): void {
    if (!this.isDragActive) {
      return;
    }

    const { position } = pose;

    if (!position) {
      return;
    }

    this.props.onWindowMove?.({ x: position.x, y: position.y });
  }

  protected getEffectivePose(element: HTMLElement): Pose {
    const explicitPose = this.props.getWindowPose?.();

    if (explicitPose) {
      return explicitPose;
    }

    const rect = element.getBoundingClientRect();
    return {
      position: { x: rect.left, y: rect.top },
      width: rect.width,
      height: rect.height,
    };
  }

  protected renderTitle(content: React.ReactNode, className?: string): React.ReactElement {
    const shouldWrapTitleText =
      React.Children.count(content) === 1 &&
      (typeof content === 'string' || typeof content === 'number');

    return (
      <ResolvedThemeClassName theme={this.props.theme}>
        {(theme) => (
          <div
            ref={this.titleRef}
            data-testid="window-title"
            className={mergeClasses(['cm-window__title-bar'], theme, className)}
            style={this.props.style}
          >
            {shouldWrapTitleText ? <WindowTitleBarText>{content}</WindowTitleBarText> : content}
          </div>
        )}
      </ResolvedThemeClassName>
    );
  }

  public render(): React.ReactElement {
    return this.renderTitle(this.props.children, this.props.className);
  }
}
