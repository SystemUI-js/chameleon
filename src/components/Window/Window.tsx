import type React from 'react';
import { CWidget, type CWidgetProps } from '../Widget/Widget';
import './index.scss';
import { CWindowTitle } from './WindowTitle';

export interface CWindowResizeOptions {
  edgeWidth?: number;
  minContentWidth?: number;
  minContentHeight?: number;
  maxContentWidth?: number;
  maxContentHeight?: number;
}

export interface CWindowProps extends CWidgetProps {
  children?: React.ReactNode;
  resizable?: boolean;
  resizeOptions?: CWindowResizeOptions;
}

export class CWindow extends CWidget<CWindowProps> {
  declare public props: CWindowProps;

  protected supportsResize(): boolean {
    return true;
  }

  protected isMoveHandleElement(type: unknown): boolean {
    if (type === CWindowTitle) {
      return true;
    }

    if (typeof type !== 'function') {
      return false;
    }

    const candidate = type as { prototype?: unknown };
    return candidate.prototype instanceof CWindowTitle;
  }

  protected getWindowContentClassName(): string {
    return 'cm-window';
  }

  protected getWindowFrameClassName(): string {
    return 'cm-window-frame';
  }

  protected getWindowInnerClassName(): string {
    return 'cm-window__inner';
  }

  public render() {
    const content = (
      <div
        data-testid="window-content"
        className={this.getWindowContentClassName()}
        data-window-uuid={this.uuid}
      >
        {this.mapComposedChildren()}
      </div>
    );

    const inner = (
      <div data-testid="window-inner" className={this.getWindowInnerClassName()}>
        {content}
        {this.renderResizeHandles()}
      </div>
    );

    return this.renderFrame(inner, undefined, {
      className: this.getWindowFrameClassName(),
      testId: 'window-frame',
    });
  }
}
