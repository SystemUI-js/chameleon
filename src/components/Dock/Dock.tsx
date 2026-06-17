import type React from 'react';
import { CWidget, type CWidgetProps, type WidgetState } from '../Widget/Widget';
import { getDockEdgeStyle, getDockFrameClassName, getDockFrameStyle } from './dockLayout';
import './index.scss';

export type DockPosition = 'top' | 'right' | 'bottom' | 'left';

interface CDockBaseProps extends CWidgetProps {
  theme?: string;
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

type DockState = WidgetState & {
  resolvedPosition: DockPosition;
  resolvedHeight?: number;
};

export class CDock extends CWidget<DockState> {
  declare public props: CDockProps;
  declare public state: DockState;

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
    /* eslint-disable sonarjs/no-unused-vars -- 解构排除 Dock 专属 props，避免透传到 DOM */
    const {
      active: _active,
      children,
      className,
      defaultHeight: _defaultHeight,
      defaultPosition: _defaultPosition,
      gapEnd: _gapEnd,
      gapStart: _gapStart,
      height: _height,
      moveBehavior: _moveBehavior,
      onActive: _onActive,
      onHeightChange: _onHeightChange,
      onPositionChange: _onPositionChange,
      position: _position,
      resizable: _resizable,
      resizeBehavior: _resizeBehavior,
      resizeOptions: _resizeOptions,
      style,
      theme,
      width: _width,
      x: _x,
      y: _y,
      ...domProps
    } = this.props;
    /* eslint-enable sonarjs/no-unused-vars */
    const { resolvedPosition, resolvedHeight } = this.state;
    const gapStart = this.props.gapStart ?? 0;
    const gapEnd = this.props.gapEnd ?? 0;
    const dockEdgeStyle = getDockEdgeStyle(resolvedPosition, gapStart, gapEnd, resolvedHeight);

    const frameClassName = this.mergeThemeClassName(
      getDockFrameClassName(resolvedPosition, className),
      theme,
    );

    return this.renderFrame(
      children,
      {},
      {
        className: frameClassName,
        domProps,
        theme,
        style: getDockFrameStyle(dockEdgeStyle, style),
        testId: this.props['data-testid'] ?? 'dock-frame',
      },
    );
  }
}
