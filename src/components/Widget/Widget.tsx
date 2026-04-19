import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { generateUUID } from '@/utils/uuid';
import { normalizeThemeClassName, ThemeContext, type ThemeContextValue } from '../Theme';

export interface WidgetLayoutProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface CWidgetResizeOptions {
  edgeWidth?: number;
  minContentWidth?: number;
  minContentHeight?: number;
  maxContentWidth?: number;
  maxContentHeight?: number;
}

export interface CWidgetProps extends WidgetLayoutProps {
  children?: React.ReactNode;
  theme?: string;
  active?: boolean;
  onActive?: (active: boolean) => void;
  resizable?: boolean;
  moveBehavior?: WidgetInteractionBehavior;
  resizeBehavior?: WidgetInteractionBehavior;
  resizeOptions?: CWidgetResizeOptions;
}

export type WidgetFrameState = Required<WidgetLayoutProps>;
export type WidgetFramePatch = Partial<WidgetFrameState>;

export enum WidgetInteractionBehavior {
  Live = 'live',
  Outline = 'outline',
}

export enum WidgetPreviewSource {
  Move = 'move',
  Resize = 'resize',
}

export type WidgetPreviewRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface WidgetPreviewState {
  active: boolean;
  behavior: WidgetInteractionBehavior;
  source: WidgetPreviewSource | null;
  rect: WidgetPreviewRect | null;
}

export type WidgetFrameMovePosition = { x: number; y: number };
export type ResizeStart = { rect: WidgetFrameState; posePosition: { x: number; y: number } };
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
export type ResizeRegionPosition = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  width?: number | string;
  height?: number | string;
};

export const getResizeCursor = (_direction: ResizeDirection): string => 'default';

type WidgetFrameOptions = {
  className?: string;
  theme?: string;
  testId?: string;
  style?: StyleProp<ViewStyle>;
};

type WidgetFrameMoveHandleProps = {
  onWindowMove: (position: WidgetFrameMovePosition) => void;
  onWindowMovePreview: (position: WidgetFrameMovePosition) => void;
  onWindowMovePreviewClear: () => void;
  getWindowPose: () => WidgetFrameState;
  moveBehavior: WidgetInteractionBehavior;
};

export interface WidgetState extends WidgetFrameState {
  active: boolean;
  preview: WidgetPreviewState;
}

export class CWidget<TState extends WidgetState = WidgetState> extends React.Component<
  CWidgetProps,
  TState
> {
  public static readonly contextType = ThemeContext;
  declare public context: ThemeContextValue;

  public readonly uuid = generateUUID();

  public constructor(props: CWidgetProps) {
    super(props);
    this.state = CWidget.getInitialState(props) as TState;
  }

  public componentDidUpdate(prevProps: Readonly<CWidgetProps>): void {
    if (prevProps.active !== this.props.active && this.props.active !== undefined) {
      this.setState((current) => ({ ...current, active: this.props.active as boolean }));
    }

    if (
      prevProps.x !== this.props.x ||
      prevProps.y !== this.props.y ||
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ) {
      this.setState((current) => ({
        ...current,
        x: this.props.x ?? current.x,
        y: this.props.y ?? current.y,
        width: this.props.width ?? current.width,
        height: this.props.height ?? current.height,
      }));
    }
  }

  protected static getInitialFrameState(props: WidgetLayoutProps): WidgetFrameState {
    return {
      x: props.x ?? 0,
      y: props.y ?? 0,
      width: props.width ?? 0,
      height: props.height ?? 0,
    };
  }

  protected static getInitialState(props: CWidgetProps): WidgetState {
    return {
      ...CWidget.getInitialFrameState(props),
      active: props.active ?? true,
      preview: {
        active: false,
        behavior: WidgetInteractionBehavior.Live,
        source: null,
        rect: null,
      },
    };
  }

  protected getFrameState(): WidgetFrameState {
    return {
      x: this.state.x,
      y: this.state.y,
      width: this.state.width,
      height: this.state.height,
    };
  }

  protected getPreviewState(): WidgetPreviewState {
    return this.state.preview;
  }

  protected getMoveBehavior(): WidgetInteractionBehavior {
    return this.props.moveBehavior ?? WidgetInteractionBehavior.Live;
  }

  protected getPreviewFrameStyle(rect: WidgetPreviewRect): StyleProp<ViewStyle> {
    return {
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  protected getDragPose = (): WidgetFrameState => this.getFrameState();

  protected applyFrameMovePosition = (position: WidgetFrameMovePosition): void => {
    this.setState((current) => ({ ...current, x: position.x, y: position.y }));
  };

  protected applyFrameMovePreviewPosition = (position: WidgetFrameMovePosition): void => {
    this.setState((current) => ({
      ...current,
      preview: {
        active: true,
        behavior: this.getMoveBehavior(),
        source: WidgetPreviewSource.Move,
        rect: { ...this.getFrameState(), x: position.x, y: position.y },
      },
    }));
  };

  protected clearFrameMovePreview = (): void => {
    this.setState((current) => ({
      ...current,
      preview: {
        active: false,
        behavior: this.getMoveBehavior(),
        source: null,
        rect: null,
      },
    }));
  };

  protected setWidgetActive(active: boolean): void {
    if (this.props.active === undefined) {
      this.setState((current) => ({ ...current, active }));
    }
    this.props.onActive?.(active);
  }

  protected getWidgetActive(): boolean {
    return this.props.active ?? this.state.active;
  }

  protected mergeThemeClassName(className?: string, theme?: string): string | undefined {
    const resolvedTheme = normalizeThemeClassName(theme ?? this.context?.theme);
    return [resolvedTheme, className].filter(Boolean).join(' ') || undefined;
  }

  protected isFrameMoveHandleElement(_type: unknown): boolean {
    return false;
  }

  protected getFrameMoveHandleProps(): WidgetFrameMoveHandleProps {
    return {
      onWindowMove: this.applyFrameMovePosition,
      onWindowMovePreview: this.applyFrameMovePreviewPosition,
      onWindowMovePreviewClear: this.clearFrameMovePreview,
      getWindowPose: this.getDragPose,
      moveBehavior: this.getMoveBehavior(),
    };
  }

  protected mapComposedChildren(): React.ReactNode {
    return React.Children.map(this.props.children, (child) => {
      if (!React.isValidElement(child) || !this.isFrameMoveHandleElement(child.type)) {
        return child;
      }

      return React.cloneElement(child, this.getFrameMoveHandleProps());
    });
  }

  protected renderResizeHandles(): React.ReactNode {
    return null;
  }

  protected renderPreviewFrame(options?: WidgetFrameOptions): React.ReactNode {
    const preview = this.getPreviewState();

    if (!preview.active || !preview.rect) {
      return null;
    }

    return (
      <View
        testID="widget-preview-frame"
        accessibilityLabel={this.mergeThemeClassName(options?.className, options?.theme)}
        style={this.getPreviewFrameStyle(preview.rect)}
      />
    );
  }

  protected renderFrame(
    content: React.ReactNode,
    layout?: WidgetLayoutProps,
    options?: WidgetFrameOptions,
  ): React.ReactElement {
    const frame = layout ? { ...this.getFrameState(), ...layout } : this.getFrameState();

    return (
      <>
        <Pressable
          testID={options?.testId ?? 'widget-frame'}
          accessibilityLabel={this.mergeThemeClassName(options?.className, options?.theme)}
          onPressIn={() => {
            if (!this.getWidgetActive()) {
              this.setWidgetActive(true);
            }
          }}
          style={{
            position: 'absolute',
            left: frame.x,
            top: frame.y,
            width: frame.width,
            height: frame.height,
          }}
        >
          {content}
        </Pressable>
        {this.renderPreviewFrame(options)}
      </>
    );
  }

  public render(): React.ReactElement {
    return this.renderFrame(this.props.children);
  }
}
