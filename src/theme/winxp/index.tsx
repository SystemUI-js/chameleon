import { CScreen } from '@/components/Screen/Screen';
import { CWindow } from '@/components/Window/Window';
import { CWindowManager } from '@/components/Window/WindowManager';
import { CWindowTitle } from '@/components/Window/WindowTitle';
import React from 'react';

export class WinXpWindowTitle extends CWindowTitle {
  public render(): React.ReactElement {
    return this.renderTitle(
      this.props.children,
      'cm-window__title-bar cm-window__title-bar--winxp',
    );
  }
}

export class WinXpTheme extends React.Component {
  public render(): React.ReactElement {
    return (
      <CScreen>
        <CWindowManager>
          <CWindow x={40} y={32} width={340} height={236}>
            <WinXpWindowTitle>WinXP Window</WinXpWindowTitle>
            <div data-testid="winxp-window-body">WinXP content</div>
          </CWindow>
        </CWindowManager>
      </CScreen>
    );
  }
}
