import { CScreen } from '@/components/Screen/Screen';
import { CWindow } from '@/components/Window/Window';
import { CWindowManager } from '@/components/Window/WindowManager';
import { CWindowTitle } from '@/components/Window/WindowTitle';
import React from 'react';

export class DefaultWindowTitle extends CWindowTitle {
  public render(): React.ReactElement {
    return this.renderTitle(
      this.props.children,
      'cm-window__title-bar cm-window__title-bar--winxp',
    );
  }
}

export class DefaultTheme extends React.Component {
  public render(): React.ReactElement {
    return (
      <CScreen>
        <CWindowManager>
          <CWindow x={32} y={28} width={332} height={228}>
            <DefaultWindowTitle>Default Window</DefaultWindowTitle>
            <div data-testid="default-window-body">Default content</div>
          </CWindow>
        </CWindowManager>
      </CScreen>
    );
  }
}
