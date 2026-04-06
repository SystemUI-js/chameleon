import { Drag, type Pose } from '@system-ui-js/multi-drag';
import React from 'react';
import { mergeClasses, ResolvedThemeClassName } from '../Theme';
import { WidgetInteractionBehavior, type WidgetFrameMovePosition } from '../Widget/Widget';

export type WindowPosition = WidgetFrameMovePosition;
export type WindowTitleActionButtonPosition = 'left' | 'right';

export interface CWindowTitleProps {
  children?: React.ReactNode;
  className?: string;
  theme?: string;
  style?: React.CSSProperties;
  moveBehavior?: WidgetInteractionBehavior;
  onWindowMove?: (position: WindowPosition) => void;
  onWindowMovePreview?: (position: WindowPosition) => void;
  onWindowMovePreviewClear?: () => void;
  getWindowPose?: () => Pose;
  actionButton?: React.ReactNode;
  actionButtonPosition?: WindowTitleActionButtonPosition;
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
  protected readonly controlsRef = React.createRef<HTMLDivElement>();
  private drag?: Drag;
  private isDragActive = false;
  private dragStartPosition?: WindowPosition;
  private pendingOutlinePosition?: WindowPosition;
  private outlineDragCancelled = false;
  private suppressDragSession = false;

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
      setPoseOnEnd: (_element, pose) => {
        this.handleDragEnd(pose);
      },
    });
  }

  public componentWillUnmount(): void {
    if (this.getMoveBehavior() === WidgetInteractionBehavior.Outline) {
      this.props.onWindowMovePreviewClear?.();
    }

    this.resetDragState();
    this.isDragActive = false;
    const activeDrag = this.drag;
    activeDrag?.setDisabled();
    this.drag = undefined;
  }

  private getMoveBehavior(): WidgetInteractionBehavior {
    return this.props.moveBehavior === WidgetInteractionBehavior.Outline
      ? WidgetInteractionBehavior.Outline
      : WidgetInteractionBehavior.Live;
  }

  private resetDragState(): void {
    this.dragStartPosition = undefined;
    this.pendingOutlinePosition = undefined;
  }

  private cancelOutlineDrag(): void {
    if (this.getMoveBehavior() === WidgetInteractionBehavior.Outline) {
      this.outlineDragCancelled = true;
      this.props.onWindowMovePreviewClear?.();
    }

    this.resetDragState();
  }

  private isEventWithinControls(target: EventTarget | null): boolean {
    const controls = this.controlsRef.current;

    return controls !== null && target instanceof Node && controls.contains(target);
  }

  private handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) {
      return;
    }

    if (this.isEventWithinControls(event.target)) {
      this.suppressDragSession = true;
      this.outlineDragCancelled = false;
      this.resetDragState();
      this.props.onWindowMovePreviewClear?.();
      return;
    }

    this.suppressDragSession = false;

    const pose = this.getEffectivePose(event.currentTarget);
    const { position } = pose;

    if (!position) {
      this.resetDragState();
      return;
    }

    this.dragStartPosition = { x: position.x, y: position.y };
    this.pendingOutlinePosition = undefined;
    this.outlineDragCancelled = false;

    if (this.getMoveBehavior() === WidgetInteractionBehavior.Outline) {
      this.props.onWindowMovePreviewClear?.();
    }
  };

  private handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (this.suppressDragSession || this.isEventWithinControls(event.target)) {
      this.suppressDragSession = false;
      this.outlineDragCancelled = false;
      this.resetDragState();
      this.props.onWindowMovePreviewClear?.();
      return;
    }

    this.cancelOutlineDrag();
  };

  private handleDragPose(pose: Partial<Pose>): void {
    if (!this.isDragActive || this.suppressDragSession) {
      return;
    }

    const { position } = pose;

    if (!position) {
      return;
    }

    if (this.getMoveBehavior() === WidgetInteractionBehavior.Outline) {
      this.pendingOutlinePosition = { x: position.x, y: position.y };
      this.props.onWindowMovePreview?.(this.pendingOutlinePosition);
      return;
    }

    this.props.onWindowMove?.({ x: position.x, y: position.y });
  }

  private handleDragEnd(pose: Partial<Pose>): void {
    if (!this.isDragActive) {
      return;
    }

    if (this.suppressDragSession) {
      this.suppressDragSession = false;
      this.outlineDragCancelled = false;
      this.resetDragState();
      this.props.onWindowMovePreviewClear?.();
      return;
    }

    if (this.getMoveBehavior() !== WidgetInteractionBehavior.Outline) {
      this.outlineDragCancelled = false;
      this.resetDragState();
      return;
    }

    if (this.outlineDragCancelled) {
      this.outlineDragCancelled = false;
      this.props.onWindowMovePreviewClear?.();
      this.resetDragState();
      return;
    }

    const endPosition = pose.position
      ? { x: pose.position.x, y: pose.position.y }
      : this.pendingOutlinePosition;

    const hasMovement =
      this.dragStartPosition !== undefined &&
      endPosition !== undefined &&
      (this.dragStartPosition.x !== endPosition.x || this.dragStartPosition.y !== endPosition.y);

    if (hasMovement && endPosition) {
      this.props.onWindowMove?.(endPosition);
    }

    this.props.onWindowMovePreviewClear?.();
    this.outlineDragCancelled = false;
    this.resetDragState();
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
    const actionButtonPosition = this.props.actionButtonPosition ?? 'right';
    const actionButtonContent = React.Children.toArray(this.props.actionButton);
    const hasActionButton = actionButtonContent.length > 0;
    const shouldWrapTitleText =
      React.Children.count(content) === 1 &&
      (typeof content === 'string' || typeof content === 'number');

    const titleContent = shouldWrapTitleText ? (
      <WindowTitleBarText>{content}</WindowTitleBarText>
    ) : (
      content
    );
    const controls = hasActionButton ? (
      <div
        ref={this.controlsRef}
        data-testid="window-title-controls"
        className={mergeClasses([
          'cm-window__title-bar__controls',
          `cm-window__title-bar__controls--${actionButtonPosition}`,
        ])}
      >
        {this.props.actionButton}
      </div>
    ) : null;

    return (
      <ResolvedThemeClassName theme={this.props.theme}>
        {(theme) => (
          <div
            ref={this.titleRef}
            onPointerDown={this.handlePointerDown}
            onPointerCancel={this.handlePointerCancel}
            data-testid="window-title"
            className={mergeClasses(
              hasActionButton
                ? ['cm-window__title-bar', 'cm-window__title-bar--with-controls']
                : ['cm-window__title-bar'],
              theme,
              className,
            )}
            style={this.props.style}
          >
            {hasActionButton && actionButtonPosition === 'left' ? (
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
          </div>
        )}
      </ResolvedThemeClassName>
    );
  }

  public render(): React.ReactElement {
    return this.renderTitle(this.props.children, this.props.className);
  }
}
