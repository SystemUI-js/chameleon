import React from 'react';
import { View } from 'react-native';
import { WidgetInteractionBehavior, type WidgetPreviewRect } from '../Widget/Widget';
import type { CWidgetProps, CWidgetResizeOptions, ResizeDirection } from '../Widget/Widget';
import { CWidget } from '../Widget/Widget';
import { CWindowTitle } from './WindowTitle';

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
    return (
      type === CWindowTitle ||
      (typeof type === 'function' && type.prototype instanceof CWindowTitle)
    );
  }

  protected isFrameMoveHandleElement(type: unknown): boolean {
    return this.isWindowTitleElement(type);
  }

  protected getResizeHandleTestId(direction: ResizeDirection): string {
    return `window-resize-${direction}`;
  }

  protected getPreviewFrameStyle(rect: WidgetPreviewRect) {
    return super.getPreviewFrameStyle(rect);
  }

  public render(): React.ReactElement {
    const frame = this.getFrameState();
    const innerClassName = this.mergeThemeClassName('cm-window__inner', this.props.theme);
    const contentThemeClassName = this.mergeThemeClassName('cm-window', this.props.theme);
    const content = (
      <View testID="window-content" className={contentThemeClassName}>
        {this.mapComposedChildren()}
        {this.renderResizeHandles()}
      </View>
    );

    return this.renderFrame(
      <View testID="window-inner" className={innerClassName}>
        {content}
      </View>,
      { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
      {
        testId: 'window-frame',
        className: 'cm-window-frame',
        previewTestId: 'window-preview-frame',
        previewClassName: 'cm-window-preview-frame',
      },
    );
  }
}
