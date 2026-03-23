import type React from 'react';
import { CWidget, type CWidgetProps } from '../Widget/Widget';
import './index.scss';

export type DockPosition = 'top' | 'right' | 'bottom' | 'left';

interface CDockBaseProps extends CWidgetProps {
  children?: React.ReactNode;
  position?: DockPosition;
  defaultPosition?: DockPosition;
  onPositionChange?: (position: DockPosition) => void;
  onHeightChange?: (height: number) => void;
  gapStart?: number;
  gapEnd?: number;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

type CDockHeightProps =
  | {
      height: number;
      defaultHeight?: number;
    }
  | {
      height?: number;
      defaultHeight: number;
    };

export type CDockProps = CDockBaseProps & CDockHeightProps;

type DockState = {
  resolvedPosition: DockPosition;
  resolvedHeight?: number;
};

export class CDock extends CWidget {
  declare public props: CDockProps;
  public state: DockState;

  public constructor(props: CDockProps) {
    super(props);
    this.state = {
      resolvedPosition: props.position ?? props.defaultPosition ?? 'top',
      resolvedHeight: props.height ?? props.defaultHeight,
    };
  }

  public componentDidUpdate(prevProps: CDockProps): void {
    if (prevProps.position !== this.props.position || prevProps.height !== this.props.height) {
      this.setState({
        resolvedPosition: this.props.position ?? this.state.resolvedPosition,
        resolvedHeight: this.props.height ?? this.state.resolvedHeight,
      });
    }
  }

  private getDockEdgeStyle(
    resolvedPosition: DockPosition,
    gapStart: number,
    gapEnd: number,
    thickness?: number,
  ): React.CSSProperties {
    switch (resolvedPosition) {
      case 'top':
        return {
          top: 0,
          left: gapStart,
          right: gapEnd,
          height: thickness,
        };
      case 'bottom':
        return {
          bottom: 0,
          left: gapStart,
          right: gapEnd,
          height: thickness,
        };
      case 'left':
        return {
          left: 0,
          top: gapStart,
          bottom: gapEnd,
          width: thickness,
        };
      case 'right':
        return {
          right: 0,
          top: gapStart,
          bottom: gapEnd,
          width: thickness,
        };
    }
  }

  private getDockFrameClassName(resolvedPosition: DockPosition): string {
    const classNames = ['cm-dock', `cm-dock--${resolvedPosition}`];

    if (this.props.className) {
      classNames.push(this.props.className);
    }

    return classNames.join(' ');
  }

  private getDockFrameStyle(dockEdgeStyle: React.CSSProperties): React.CSSProperties {
    const visualStyle = { ...(this.props.style ?? {}) };

    delete visualStyle.position;
    delete visualStyle.top;
    delete visualStyle.right;
    delete visualStyle.bottom;
    delete visualStyle.left;
    delete visualStyle.width;
    delete visualStyle.height;

    return {
      ...visualStyle,
      ...dockEdgeStyle,
      position: 'absolute',
    };
  }

  public render() {
    const { resolvedPosition, resolvedHeight } = this.state;
    const gapStart = this.props.gapStart ?? 0;
    const gapEnd = this.props.gapEnd ?? 0;
    const dockEdgeStyle = this.getDockEdgeStyle(resolvedPosition, gapStart, gapEnd, resolvedHeight);

    return this.renderFrame(
      this.props.children,
      {},
      {
        className: this.getDockFrameClassName(resolvedPosition),
        style: this.getDockFrameStyle(dockEdgeStyle),
        testId: this.props['data-testid'] ?? 'dock-frame',
      },
    );
  }
}
