import React from 'react';
import { Drag, type Pose } from '@system-ui-js/multi-drag';

export type WindowPosition = {
  x: number;
  y: number;
};

export interface CWindowTitleProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onWindowMove?: (position: WindowPosition) => void;
  getWindowPose?: () => Pose;
}

export class CWindowTitle extends React.Component<CWindowTitleProps> {
  protected readonly titleRef = React.createRef<HTMLDivElement>();
  private drag?: Drag;

  public componentDidMount(): void {
    const element = this.titleRef.current;

    if (!element) {
      return;
    }

    this.drag = new Drag(element, {
      getPose: () => this.getEffectivePose(element),
      setPose: (_element, pose) => {
        const { position } = pose;

        if (!position) {
          return;
        }

        this.props.onWindowMove?.({ x: position.x, y: position.y });
      },
    });
  }

  public componentWillUnmount(): void {
    this.drag?.setDisabled();
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
    return (
      <div
        ref={this.titleRef}
        data-testid="window-title"
        className={className ?? 'cm-window__title-bar'}
        style={this.props.style}
      >
        {content}
      </div>
    );
  }

  public render(): React.ReactElement {
    return this.renderTitle(this.props.children, this.props.className);
  }
}
