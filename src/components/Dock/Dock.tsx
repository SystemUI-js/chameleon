import React from 'react';
import { CWidget, type CWidgetProps, type WidgetState } from '../Widget/Widget';

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
  | { height: number; defaultHeight?: number }
  | { height?: number; defaultHeight: number };

export type CDockProps = CDockBaseProps & CDockHeightProps;

type DockState = WidgetState & { resolvedPosition: DockPosition; resolvedHeight?: number };

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
      this.setState((current) => ({
        ...current,
        resolvedPosition: this.props.position ?? current.resolvedPosition,
        resolvedHeight: this.props.height ?? current.resolvedHeight,
      }));
    }
  }

  public render(): React.ReactElement {
    return this.renderFrame(
      this.props.children,
      {},
      { testId: this.props['data-testid'] ?? 'dock-frame' },
    );
  }
}
