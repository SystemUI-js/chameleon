import React from 'react';
import { generateUUID } from '@/utils/uuid';

export interface WidgetLayoutProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface CWidgetProps extends WidgetLayoutProps {
  children?: React.ReactNode;
}

type WidgetFrameOptions = {
  className?: string;
  testId?: string;
  style?: React.CSSProperties;
};

export class CWidget extends React.Component<CWidgetProps> {
  public readonly uuid = generateUUID();

  protected renderFrame(
    content: React.ReactNode,
    layout?: WidgetLayoutProps,
    options?: WidgetFrameOptions,
  ): React.ReactElement {
    const { x, y, width, height } = layout ?? this.props;
    const frameStyle: React.CSSProperties = {
      left: x,
      top: y,
      width,
      height,
      position: 'absolute',
      ...options?.style,
    };

    return (
      <div
        data-testid={options?.testId ?? 'widget-frame'}
        className={options?.className}
        style={frameStyle}
      >
        {content}
      </div>
    );
  }

  public render() {
    return this.renderFrame(this.props.children);
  }
}
