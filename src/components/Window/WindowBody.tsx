import React from 'react';
import { ResolvedThemeClassName } from '../Theme';

export interface CWindowBodyProps {
  children?: React.ReactNode;
  className?: string;
  theme?: string;
}

export class CWindowBody extends React.Component<CWindowBodyProps> {
  protected getClassName(theme?: string): string {
    return (
      'cm-window__body' +
      (theme ? ` ${theme}` : '') +
      (this.props.className ? ` ${this.props.className}` : '')
    );
  }

  public render(): React.ReactElement {
    return (
      <ResolvedThemeClassName theme={this.props.theme}>
        {(theme) => (
          <div data-testid="window-body" className={this.getClassName(theme)}>
            {this.props.children}
          </div>
        )}
      </ResolvedThemeClassName>
    );
  }
}
