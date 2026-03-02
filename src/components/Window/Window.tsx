import React from 'react';
import { CWidget, type CWidgetProps } from '../Widget/Widget';
import { CWindowTitle, type WindowPosition } from './WindowTitle';

export interface CWindowProps extends CWidgetProps {
  children?: React.ReactNode;
}

type WindowState = {
  x: number;
  y: number;
};

export class CWindow extends CWidget {
  declare public props: CWindowProps;
  public state: WindowState;

  public constructor(props: CWindowProps) {
    super(props);
    this.state = {
      x: props.x ?? 0,
      y: props.y ?? 0,
    };
  }

  public componentDidUpdate(prevProps: CWindowProps): void {
    if (prevProps.x !== this.props.x || prevProps.y !== this.props.y) {
      this.setState({
        x: this.props.x ?? this.state.x,
        y: this.props.y ?? this.state.y,
      });
    }
  }

  public getDragPose = () => {
    const frame = this.windowFrameRef.current;
    const rect = frame?.getBoundingClientRect();

    return {
      position: {
        x: this.state.x,
        y: this.state.y,
      },
      width: rect?.width ?? this.props.width ?? 0,
      height: rect?.height ?? this.props.height ?? 0,
    };
  };

  public handleWindowMove = (position: WindowPosition): void => {
    this.setState(position);
  };

  private readonly windowFrameRef = React.createRef<HTMLDivElement>();

  private mapComposedChildren(): React.ReactNode {
    return React.Children.map(this.props.children, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      if (this.isWindowTitleElement(child.type)) {
        return React.cloneElement(child, {
          onWindowMove: this.handleWindowMove,
          getWindowPose: this.getDragPose,
        });
      }

      return child;
    });
  }

  private isWindowTitleElement(type: unknown): boolean {
    if (type === CWindowTitle) {
      return true;
    }

    if (typeof type !== 'function') {
      return false;
    }

    const candidate = type as { prototype?: unknown };
    return candidate.prototype instanceof CWindowTitle;
  }

  public render() {
    const content = (
      <div data-testid="window-content" className="cm-window" data-window-uuid={this.uuid}>
        {this.mapComposedChildren()}
      </div>
    );

    return this.renderFrame(
      <div ref={this.windowFrameRef}>{content}</div>,
      {
        x: this.state.x,
        y: this.state.y,
        width: this.props.width,
        height: this.props.height,
      },
      {
        className: 'cm-window-frame',
        testId: 'window-frame',
      },
    );
  }
}
