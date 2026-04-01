import React from 'react';
import { mergeClasses, ResolvedThemeClassName } from '../Theme';

export interface CWindowBodyProps {
  children?: React.ReactNode;
  className?: string;
  theme?: string;
  style?: React.CSSProperties;
}

export class CWindowBody extends React.Component<CWindowBodyProps> {
  protected getClassName(theme?: string): string {
    return mergeClasses(['cm-window__body'], theme, this.props.className);
  }

  public render(): React.ReactElement {
    return (
      <ResolvedThemeClassName theme={this.props.theme}>
        {(theme) => (
          <div
            data-testid="window-body"
            className={this.getClassName(theme)}
            style={this.props.style}
          >
            {this.props.children}
          </div>
        )}
      </ResolvedThemeClassName>
    );
  }
}
