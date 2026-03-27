import type React from 'react';
import { getDockEdgeStyle, getDockFrameClassName, getDockFrameStyle } from '../Dock/dockLayout';
import { CWidget, type CWidgetProps } from '../Widget/Widget';
import './index.scss';

type StartBarState = {
  resolvedHeight?: number;
};

export interface CStartBarProps extends Omit<CWidgetProps, 'x' | 'y' | 'width'> {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  height?: number;
  defaultHeight?: number;
  gapStart?: number;
  gapEnd?: number;
  startLabel?: string;
  'data-testid'?: string;
}

export class CStartBar extends CWidget<CStartBarProps, StartBarState> {
  declare public props: CStartBarProps;

  public constructor(props: CStartBarProps) {
    super(props);
    this.state = {
      ...this.state,
      resolvedHeight: props.height ?? props.defaultHeight,
    };
  }

  public componentDidUpdate(prevProps: CStartBarProps): void {
    super.componentDidUpdate(prevProps);

    if (prevProps.height !== this.props.height) {
      this.setState({
        resolvedHeight: this.props.height ?? this.state.resolvedHeight,
      });
    }
  }

  public render(): React.ReactElement {
    const { resolvedHeight } = this.state;
    const gapStart = this.props.gapStart ?? 0;
    const gapEnd = this.props.gapEnd ?? 0;
    const startLabel = this.props.startLabel ?? 'Start';

    const effectiveHeight = resolvedHeight ?? 30;

    const dockEdgeStyle = getDockEdgeStyle('bottom', gapStart, gapEnd, effectiveHeight);

    const baseClassName = getDockFrameClassName('bottom', this.props.className);
    const frameClassName = baseClassName.replace('cm-dock', 'cm-start-bar');

    const frameStyle = getDockFrameStyle(dockEdgeStyle, this.props.style);

    const testId = this.props['data-testid'] ?? 'start-bar';

    return (
      <div data-testid={testId} className={frameClassName} style={frameStyle}>
        <button type="button" data-testid={`${testId}-button`} className="cm-start-bar__button">
          {startLabel}
        </button>
        <div data-testid={`${testId}-content`} className="cm-start-bar__content">
          {this.props.children}
        </div>
      </div>
    );
  }
}
