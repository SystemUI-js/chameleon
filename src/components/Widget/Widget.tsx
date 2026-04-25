import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
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

export const getResizeCursor = (direction: ResizeDirection): string => {
  switch (direction) {
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'n':
    case 's':
      return 'ns-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'nw':
    case 'se':
      return 'nwse-resize';
    default:
      return 'default';
  }
};

type WidgetFrameOptions = {
  className?: string;
  theme?: string;
  testId?: string;
  previewClassName?: string;
  previewTestId?: string;
  style?: StyleProp<ViewStyle>;
};

type ResizeSession = {
  direction: ResizeDirection;
  rect: WidgetFrameState;
  pointer: { x: number; y: number };
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

  private activeResizeSession: ResizeSession | null = null;

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

  public componentWillUnmount(): void {
    this.detachResizeListeners();
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

  protected getResizeBehavior(): WidgetInteractionBehavior {
    return this.props.resizeBehavior ?? WidgetInteractionBehavior.Live;
  }

  protected getResizeHandleTestId(direction: ResizeDirection): string {
    return `widget-resize-${direction}`;
  }

  protected getResizeDirections(): ResizeDirection[] {
    return ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  }

  protected getResizeEdgeWidth(): number {
    return this.props.resizeOptions?.edgeWidth ?? 4;
  }

  protected getResizeMinWidth(): number {
    return this.props.resizeOptions?.minContentWidth ?? 1;
  }

  protected getResizeMinHeight(): number {
    return this.props.resizeOptions?.minContentHeight ?? 1;
  }

  protected getResizeMaxWidth(): number | undefined {
    return this.props.resizeOptions?.maxContentWidth;
  }

  protected getResizeMaxHeight(): number | undefined {
    return this.props.resizeOptions?.maxContentHeight;
  }

  protected clampSize(value: number, min: number, max?: number): number {
    if (max !== undefined) {
      return Math.min(Math.max(value, min), max);
    }

    return Math.max(value, min);
  }

  protected resolveResizeRect(
    rect: WidgetFrameState,
    direction: ResizeDirection,
    deltaX: number,
    deltaY: number,
  ): WidgetFrameState {
    const nextRect = { ...rect };
    const right = rect.x + rect.width;
    const bottom = rect.y + rect.height;

    if (direction.includes('e')) {
      nextRect.width = this.clampSize(
        rect.width + deltaX,
        this.getResizeMinWidth(),
        this.getResizeMaxWidth(),
      );
    }

    if (direction.includes('s')) {
      nextRect.height = this.clampSize(
        rect.height + deltaY,
        this.getResizeMinHeight(),
        this.getResizeMaxHeight(),
      );
    }

    if (direction.includes('w')) {
      nextRect.width = this.clampSize(
        rect.width - deltaX,
        this.getResizeMinWidth(),
        this.getResizeMaxWidth(),
      );
      nextRect.x = right - nextRect.width;
    }

    if (direction.includes('n')) {
      nextRect.height = this.clampSize(
        rect.height - deltaY,
        this.getResizeMinHeight(),
        this.getResizeMaxHeight(),
      );
      nextRect.y = bottom - nextRect.height;
    }

    return nextRect;
  }

  protected applyFrameRect = (rect: WidgetFrameState): void => {
    this.setState((current) => ({ ...current, ...rect }));
  };

  protected applyResizePreviewRect = (rect: WidgetFrameState): void => {
    this.setState((current) => ({
      ...current,
      preview: {
        active: true,
        behavior: this.getResizeBehavior(),
        source: WidgetPreviewSource.Resize,
        rect,
      },
    }));
  };

  protected clearResizePreview = (): void => {
    this.setState((current) => ({
      ...current,
      preview: {
        active: false,
        behavior: this.getResizeBehavior(),
        source: null,
        rect: null,
      },
    }));
  };

  protected handleResizeDrag = (event: MouseEvent): void => {
    if (this.activeResizeSession === null) {
      return;
    }

    const deltaX = event.clientX - this.activeResizeSession.pointer.x;
    const deltaY = event.clientY - this.activeResizeSession.pointer.y;
    const nextRect = this.resolveResizeRect(
      this.activeResizeSession.rect,
      this.activeResizeSession.direction,
      deltaX,
      deltaY,
    );

    if (this.getResizeBehavior() === WidgetInteractionBehavior.Outline) {
      this.applyResizePreviewRect(nextRect);
      return;
    }

    this.applyFrameRect(nextRect);
  };

  protected finishResizeDrag = (event: MouseEvent): void => {
    if (this.activeResizeSession === null) {
      return;
    }

    const deltaX = event.clientX - this.activeResizeSession.pointer.x;
    const deltaY = event.clientY - this.activeResizeSession.pointer.y;
    const nextRect = this.resolveResizeRect(
      this.activeResizeSession.rect,
      this.activeResizeSession.direction,
      deltaX,
      deltaY,
    );

    if (this.getResizeBehavior() === WidgetInteractionBehavior.Outline) {
      this.clearResizePreview();
    }

    this.applyFrameRect(nextRect);
    this.detachResizeListeners();
    this.activeResizeSession = null;
  };

  protected detachResizeListeners(): void {
    window.removeEventListener('mousemove', this.handleResizeDrag);
    window.removeEventListener('mouseup', this.finishResizeDrag);
  }

  protected startResizeDrag = (
    direction: ResizeDirection,
    event: React.MouseEvent<HTMLElement>,
  ): void => {
    event.preventDefault();
    event.stopPropagation();

    this.activeResizeSession = {
      direction,
      rect: this.getFrameState(),
      pointer: { x: event.clientX, y: event.clientY },
    };

    if (this.getResizeBehavior() === WidgetInteractionBehavior.Outline) {
      this.applyResizePreviewRect(this.activeResizeSession.rect);
    }

    window.addEventListener('mousemove', this.handleResizeDrag);
    window.addEventListener('mouseup', this.finishResizeDrag);
  };

  protected getResizeHandleStyle(direction: ResizeDirection): StyleProp<ViewStyle> {
    const edgeWidth = this.getResizeEdgeWidth();
    const halfEdge = edgeWidth / 2;
    const style: ResizeRegionPosition & ViewStyle = {
      position: 'absolute',
      cursor: getResizeCursor(direction),
      padding: 0,
      background: 'transparent',
    };

    if (direction === 'n') {
      style.left = edgeWidth;
      style.right = edgeWidth;
      style.top = -halfEdge;
      style.height = edgeWidth;
    } else if (direction === 's') {
      style.left = edgeWidth;
      style.right = edgeWidth;
      style.bottom = -halfEdge;
      style.height = edgeWidth;
    } else if (direction === 'e') {
      style.top = edgeWidth;
      style.bottom = edgeWidth;
      style.right = -halfEdge;
      style.width = edgeWidth;
    } else if (direction === 'w') {
      style.top = edgeWidth;
      style.bottom = edgeWidth;
      style.left = -halfEdge;
      style.width = edgeWidth;
    } else if (direction === 'ne') {
      style.top = -halfEdge;
      style.right = -halfEdge;
      style.width = edgeWidth * 2;
      style.height = edgeWidth * 2;
    } else if (direction === 'nw') {
      style.top = -halfEdge;
      style.left = -halfEdge;
      style.width = edgeWidth * 2;
      style.height = edgeWidth * 2;
    } else if (direction === 'se') {
      style.bottom = -halfEdge;
      style.right = -halfEdge;
      style.width = edgeWidth * 2;
      style.height = edgeWidth * 2;
    } else {
      style.bottom = -halfEdge;
      style.left = -halfEdge;
      style.width = edgeWidth * 2;
      style.height = edgeWidth * 2;
    }

    return style;
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
    if (this.props.resizable === false) {
      return null;
    }

    return this.getResizeDirections().map((direction) => (
      <View
        key={direction}
        testID={this.getResizeHandleTestId(direction)}
        onMouseDown={(event) => {
          this.startResizeDrag(direction, event);
        }}
        style={this.getResizeHandleStyle(direction)}
      />
    ));
  }

  protected renderPreviewFrame(options?: WidgetFrameOptions): React.ReactNode {
    const preview = this.getPreviewState();
    const resolvedTheme = options?.theme ?? this.props.theme;

    if (!preview.active || !preview.rect) {
      return null;
    }

    return (
      <View
        testID={options?.previewTestId ?? 'widget-preview-frame'}
        className={this.mergeThemeClassName(options?.previewClassName, resolvedTheme)}
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
    const resolvedTheme = options?.theme ?? this.props.theme;

    return (
      <>
        <View
          testID={options?.testId ?? 'widget-frame'}
          className={this.mergeThemeClassName(options?.className, resolvedTheme)}
          onMouseDown={() => {
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
        </View>
        {this.renderPreviewFrame(options)}
      </>
    );
  }

  public render(): React.ReactElement {
    return this.renderFrame(this.props.children);
  }
}
