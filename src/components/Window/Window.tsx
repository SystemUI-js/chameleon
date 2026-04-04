import type React from 'react';
import type {
  CWidgetProps,
  CWidgetResizeOptions,
  ResizeDirection,
  WidgetInteractionBehavior,
} from '../Widget/Widget';
import { CWidget } from '../Widget/Widget';
import { CWindowTitle } from './WindowTitle';
import './index.scss';

export type CWindowResizeOptions = CWidgetResizeOptions;
export type CWindowInteractionBehavior = WidgetInteractionBehavior;

export interface CWindowProps extends CWidgetProps {
  children?: React.ReactNode;
  theme?: string;
  moveBehavior?: CWindowInteractionBehavior;
  resizeBehavior?: CWindowInteractionBehavior;
}

export class CWindow extends CWidget {
  declare public props: CWindowProps;

  protected isWindowTitleElement(type: unknown): boolean {
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
    return this.mergeThemeClassName('cm-window', this.props.theme) ?? 'cm-window';
  }

  protected getWindowFrameClassName(): string {
    return this.mergeThemeClassName('cm-window-frame', this.props.theme) ?? 'cm-window-frame';
  }

  protected getWindowPreviewFrameClassName(): string {
    return (
      this.mergeThemeClassName('cm-window-preview-frame', this.props.theme) ??
      'cm-window-preview-frame'
    );
  }

  protected renderPreviewFrame(): React.ReactNode {
    const preview = this.getPreviewState();

    if (!preview.active || !preview.rect || preview.behavior !== 'outline') {
      return null;
    }

    return (
      <div
        aria-hidden="true"
        data-testid="window-preview-frame"
        className={this.getWindowPreviewFrameClassName()}
        style={{
          left: preview.rect.x,
          top: preview.rect.y,
          width: preview.rect.width,
          height: preview.rect.height,
          position: 'absolute',
        }}
      />
    );
  }

  protected getWindowInnerClassName(): string {
    return 'cm-window__inner';
  }

  protected getResizeHandleTestId(direction: ResizeDirection): string {
    return `window-resize-${direction}`;
  }

  protected isFrameMoveHandleElement(type: unknown): boolean {
    return this.isWindowTitleElement(type);
  }

  public render() {
    const frame = this.getFrameState();

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

    return this.renderFrame(
      inner,
      {
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
      },
      {
        className: this.getWindowFrameClassName(),
        theme: this.props.theme,
        testId: 'window-frame',
      },
    );
  }
}
