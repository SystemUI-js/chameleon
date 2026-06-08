import type React from 'react';
import {
  CWidget,
  type CWidgetProps,
  type CWidgetResizeOptions,
  type ResizeDirection,
  WidgetInteractionBehavior,
  type WidgetPreviewRect,
} from '../Widget/Widget';
import { CWindowTitle } from './WindowTitle';
import './index.scss';

export type CWindowResizeOptions = CWidgetResizeOptions;
export type CWindowInteractionBehavior = WidgetInteractionBehavior;

export interface CWindowProps extends CWidgetProps {
  children?: React.ReactNode;
  theme?: string;
  moveBehavior?: CWindowInteractionBehavior;
  resizeBehavior?: CWindowInteractionBehavior;
  /** 以父容器中心为原点定位，x/y 状态作为拖拽偏移量。 */
  readonly centered?: boolean;
  /** 全屏模式下自动禁用 resize */
  readonly fullscreen?: boolean;
}

function formatCenteredOffset(offset: number): string {
  if (offset === 0) {
    return '50%';
  }

  const operator = offset > 0 ? '+' : '-';
  return `calc(50% ${operator} ${Math.abs(offset)}px)`;
}

export class CWindow extends CWidget {
  declare public props: CWindowProps;

  /** 判断当前是否处于全屏模式 */
  protected isFullscreen(): boolean {
    return this.props.fullscreen === true;
  }

  /** 全屏模式下禁用 resize handle 渲染 */
  protected override renderResizeHandles(): React.ReactNode {
    if (this.isFullscreen()) {
      return null;
    }
    return super.renderResizeHandles();
  }

  /** 全屏模式下跳过 resize drag 初始化 */
  protected override setupResizeDrags(): void {
    if (this.isFullscreen()) {
      return;
    }
    super.setupResizeDrags();
  }

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

  protected getWindowFrameStyle(frame: { x: number; y: number }): React.CSSProperties | undefined {
    if (this.props.centered !== true) {
      return undefined;
    }

    return {
      left: formatCenteredOffset(frame.x),
      top: formatCenteredOffset(frame.y),
      transform: 'translate(-50%, -50%)',
    };
  }

  protected renderPreviewFrame(): React.ReactNode {
    const preview = this.getPreviewState();

    if (
      !preview.active ||
      !preview.rect ||
      preview.behavior !== WidgetInteractionBehavior.Outline
    ) {
      return null;
    }

    return (
      <div
        aria-hidden="true"
        data-testid="window-preview-frame"
        className={this.getWindowPreviewFrameClassName()}
        style={this.getPreviewFrameStyle(preview.rect)}
      />
    );
  }

  protected getPreviewFrameStyle(rect: WidgetPreviewRect): React.CSSProperties {
    return super.getPreviewFrameStyle(rect);
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

  protected getFrameMoveHandleProps(): Record<string, unknown> {
    return {
      onWindowMove: this.applyFrameMovePosition,
      onWindowMovePreview: this.applyFrameMovePreviewPosition,
      onWindowMovePreviewClear: this.clearFrameMovePreview,
      getWindowPose: this.getDragPose,
      moveBehavior: this.getMoveBehavior(),
    };
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
        style: this.getWindowFrameStyle(frame),
      },
    );
  }
}
