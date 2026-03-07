import { CScreen } from '@/components/Screen/Screen';
import { CWindow } from '@/components/Window/Window';
import { CWindowManager } from '@/components/Window/WindowManager';
import { CWindowTitle } from '@/components/Window/WindowTitle';
import React from 'react';

export class Win98WindowTitle extends CWindowTitle {
  public render(): React.ReactElement {
    return this.renderTitle(
      this.props.children,
      'cm-window__title-bar cm-window__title-bar--win98',
    );
  }
}

export class Win98Theme extends React.Component {
  public render(): React.ReactElement {
    // Given Win98 theme root, when rendered, then it mounts screen -> manager -> window.
    return (
      <CScreen>
        <CWindowManager>
          <CWindow x={24} y={24} width={320} height={220}>
            <Win98WindowTitle>Win98 Window</Win98WindowTitle>
            <div data-testid="win98-window-body">Win98 content</div>
          </CWindow>
        </CWindowManager>
      </CScreen>
    );
  }
}
