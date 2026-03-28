import React from 'react';

export interface CWindowBodyProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export class CWindowBody extends React.Component<CWindowBodyProps> {
  protected getClassName(): string {
    return this.props.className ?? 'cm-window__body';
  }

  public render(): React.ReactElement {
    return (
      <div data-testid="window-body" className={this.getClassName()} style={this.props.style}>
        {this.props.children}
      </div>
    );
  }
}
