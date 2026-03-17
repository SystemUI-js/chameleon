import React from 'react';
import { CScreen } from '@/components/Screen/Screen';
import { CWindow } from '@/components/Window/Window';
import { CWindowManager } from '@/components/Window/WindowManager';
import { CWindowTitle } from '@/components/Window/WindowTitle';
import './styles/index.scss';

export class DefaultWindow extends CWindow {
  protected override getWindowContentClassName(): string {
    return `${super.getWindowContentClassName()} cm-default-window`;
  }

  protected override getWindowFrameClassName(): string {
    return `${super.getWindowFrameClassName()} cm-default-window-frame`;
  }
}

export class DefaultWindowTitle extends CWindowTitle {
  public render(): React.ReactElement {
    return this.renderTitle(
      this.props.children,
      'cm-window__title-bar cm-window__title-bar--default cm-default-window-title',
    );
  }
}

export class DefaultTheme extends React.Component {
  public render(): React.ReactElement {
    return (
      <CScreen>
        <CWindowManager>
          <DefaultWindow x={32} y={28} width={332} height={228}>
            <DefaultWindowTitle>Default Window</DefaultWindowTitle>
            <div data-testid="default-window-body">Default content</div>
          </DefaultWindow>
        </CWindowManager>
      </CScreen>
    );
  }
}
