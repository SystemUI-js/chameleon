import type React from 'react';
import { CWidget, type CWidgetProps } from '../Widget/Widget';
import { getDockEdgeStyle, getDockFrameClassName, getDockFrameStyle } from './dockLayout';
import './index.scss';

export type DockPosition = 'top' | 'right' | 'bottom' | 'left';

interface CDockBaseProps extends CWidgetProps {
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

export class CDock extends CWidget<CDockProps, DockState> {
  declare public props: CDockProps;

  public constructor(props: CDockProps) {
    super(props);
    this.state = {
      ...this.state,
      resolvedPosition: props.position ?? props.defaultPosition ?? 'top',
      resolvedHeight: props.height ?? props.defaultHeight,
    };
  }

  public componentDidUpdate(prevProps: CDockProps): void {
    super.componentDidUpdate(prevProps);

    if (prevProps.position !== this.props.position || prevProps.height !== this.props.height) {
      this.setState({
        resolvedPosition: this.props.position ?? this.state.resolvedPosition,
        resolvedHeight: this.props.height ?? this.state.resolvedHeight,
      });
    }
  }

  public render() {
    const { resolvedPosition, resolvedHeight } = this.state;
    const gapStart = this.props.gapStart ?? 0;
    const gapEnd = this.props.gapEnd ?? 0;
    const dockEdgeStyle = getDockEdgeStyle(resolvedPosition, gapStart, gapEnd, resolvedHeight);

    return this.renderFrame(
      this.props.children,
      {},
      {
        className: getDockFrameClassName(resolvedPosition, this.props.className),
        style: getDockFrameStyle(dockEdgeStyle, this.props.style),
        testId: this.props['data-testid'] ?? 'dock-frame',
      },
    );
  }
}
