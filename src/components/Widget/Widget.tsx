import { Drag, type Pose } from '@system-ui-js/multi-drag';
import React from 'react';
import { generateUUID } from '@/utils/uuid';
import {
  mergeClasses,
  normalizeThemeClassName,
  ThemeContext,
  type ThemeContextValue,
} from '../Theme';

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
  x: WidgetFrameState['x'];
  y: WidgetFrameState['y'];
  width: WidgetFrameState['width'];
  height: WidgetFrameState['height'];
};

export interface WidgetPreviewState {
  active: boolean;
  behavior: WidgetInteractionBehavior;
  source: WidgetPreviewSource | null;
  rect: WidgetPreviewRect | null;
}

export type WidgetFrameMovePosition = {
  x: number;
  y: number;
};

export type ResizeStart = {
  rect: WidgetFrameState;
  posePosition: {
    x: number;
    y: number;
  };
};

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export type ResizeRegionPosition = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  width?: number | string;
  height?: number | string;
};

const RESIZE_DIRECTIONS: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const DEFAULT_EDGE_WIDTH = 4;
const DEFAULT_MIN_CONTENT_WIDTH = 1;
const DEFAULT_MIN_CONTENT_HEIGHT = 1;

export const getResizeCursor = (direction: ResizeDirection): React.CSSProperties['cursor'] => {
  switch (direction) {
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'nw':
    case 'se':
      return 'nwse-resize';
  }
};

type WidgetFrameOptions = {
  className?: string;
  theme?: string;
  testId?: string;
  style?: React.CSSProperties;
};

type WidgetFrameMoveHandleProps = {
  onWidgetMove: (position: WidgetFrameMovePosition) => void;
  onWidgetMovePreview: (position: WidgetFrameMovePosition) => void;
  onWidgetMovePreviewClear: () => void;
  getWidgetPose: () => Pose;
  moveBehavior: WidgetInteractionBehavior;
};

export interface WidgetState extends WidgetFrameState {
  preview: WidgetPreviewState;
}

export class CWidget<TState extends WidgetState = WidgetState> extends React.Component<
  CWidgetProps,
  TState
> {
  public static readonly contextType = ThemeContext;
  declare public context: ThemeContextValue;

  public readonly uuid = generateUUID();
  private readonly resizeHandleRefs: Record<ResizeDirection, React.RefObject<HTMLDivElement>> = {
    n: React.createRef<HTMLDivElement>(),
    s: React.createRef<HTMLDivElement>(),
    e: React.createRef<HTMLDivElement>(),
    w: React.createRef<HTMLDivElement>(),
    ne: React.createRef<HTMLDivElement>(),
    nw: React.createRef<HTMLDivElement>(),
    se: React.createRef<HTMLDivElement>(),
    sw: React.createRef<HTMLDivElement>(),
  };

  private readonly resizeDragInstances = new Map<ResizeDirection, Drag>();
  private readonly resizeStartByDirection = new Map<ResizeDirection, ResizeStart>();
  private readonly pendingResizeRectByDirection = new Map<ResizeDirection, WidgetFrameState>();
  private readonly cancelledResizeDirections = new Set<ResizeDirection>();
  private readonly resizePointerDownHandlers = new Map<
    ResizeDirection,
    (event: PointerEvent) => void
  >();
  private readonly resizePointerCancelHandlers = new Map<ResizeDirection, () => void>();

  public constructor(props: CWidgetProps) {
    super(props);
    this.state = CWidget.getInitialState(props) as TState;
  }

  public componentDidMount(): void {
    this.setupResizeDrags();
  }

  public componentDidUpdate(prevProps: Readonly<CWidgetProps>): void {
    this.syncControlledFrameProps(prevProps);

    if (
      prevProps.resizable !== this.props.resizable ||
      prevProps.resizeOptions !== this.props.resizeOptions
    ) {
      this.setupResizeDrags();
    }
  }

  public componentWillUnmount(): void {
    this.cleanupResizeDrags();
  }

  protected static getInitialFrameState(props: WidgetLayoutProps): WidgetFrameState {
    return {
      x: props.x ?? 0,
      y: props.y ?? 0,
      width: props.width ?? 0,
      height: props.height ?? 0,
    };
  }

  protected static getDefaultInteractionBehavior(
    behavior?: WidgetInteractionBehavior,
  ): WidgetInteractionBehavior {
    return behavior === WidgetInteractionBehavior.Outline
      ? WidgetInteractionBehavior.Outline
      : WidgetInteractionBehavior.Live;
  }

  protected static getInitialPreviewState(_props: CWidgetProps): WidgetPreviewState {
    return {
      active: false,
      behavior: WidgetInteractionBehavior.Live,
      source: null,
      rect: null,
    };
  }

  protected static getInitialState(props: CWidgetProps): WidgetState {
    return {
      ...CWidget.getInitialFrameState(props),
      preview: CWidget.getInitialPreviewState(props),
    };
  }

  protected getDragPose = () => {
    const frame = this.getFrameState();

    return {
      position: {
        x: frame.x,
        y: frame.y,
      },
      width: frame.width,
      height: frame.height,
    };
  };

  protected handleFrameMove = (framePatch: WidgetFramePatch): void => {
    this.setState((prevState) => ({
      ...prevState,
      ...framePatch,
    }));
  };

  protected applyFrameMove = (framePatch: WidgetFramePatch): void => {
    this.handleFrameMove(framePatch);
  };

  protected getFrameMovePatch(position: WidgetFrameMovePosition): WidgetFramePatch {
    return position;
  }

  protected applyFrameMovePosition = (position: WidgetFrameMovePosition): void => {
    this.applyFrameMove(this.getFrameMovePatch(position));
  };

  protected applyFrameMovePreviewPosition = (position: WidgetFrameMovePosition): void => {
    const frame = this.getFrameState();

    this.setPreviewRect(
      {
        ...frame,
        ...this.getFrameMovePatch(position),
      },
      {
        source: WidgetPreviewSource.Move,
        behavior: this.getMoveBehavior(),
        active: true,
      },
    );
  };

  protected clearFrameMovePreview = (): void => {
    this.clearPreviewState();
  };

  protected syncControlledFrameProps(prevProps: Readonly<WidgetLayoutProps>): void {
    if (
      prevProps.x !== this.props.x ||
      prevProps.y !== this.props.y ||
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ) {
      this.setState((prevState) => ({
        ...prevState,
        x: this.props.x ?? prevState.x,
        y: this.props.y ?? prevState.y,
        width: this.props.width ?? prevState.width,
        height: this.props.height ?? prevState.height,
      }));
    }
  }

  protected getFrameState(): WidgetFrameState {
    const { x, y, width, height } = this.state;

    return {
      x,
      y,
      width,
      height,
    };
  }

  protected getMoveBehavior(): WidgetInteractionBehavior {
    return CWidget.getDefaultInteractionBehavior(this.props.moveBehavior);
  }

  protected getResizeBehavior(): WidgetInteractionBehavior {
    return CWidget.getDefaultInteractionBehavior(this.props.resizeBehavior);
  }

  protected getPreviewState(): WidgetPreviewState {
    return this.state.preview;
  }

  protected getPreviewBehavior(source: WidgetPreviewSource): WidgetInteractionBehavior {
    return source === WidgetPreviewSource.Resize
      ? this.getResizeBehavior()
      : this.getMoveBehavior();
  }

  protected setPreviewState(preview: WidgetPreviewState): void {
    this.setState((prevState) => ({
      ...prevState,
      preview,
    }));
  }

  protected setPreviewRect(
    rect: WidgetPreviewRect | null,
    options?: {
      source?: WidgetPreviewSource | null;
      behavior?: WidgetInteractionBehavior;
      active?: boolean;
    },
  ): void {
    this.setState((prevState) => ({
      ...prevState,
      preview: {
        ...prevState.preview,
        rect,
        source: options?.source ?? prevState.preview.source ?? null,
        behavior:
          options?.behavior ??
          (options?.source ? this.getPreviewBehavior(options.source) : prevState.preview.behavior),
        active: options?.active ?? rect !== null,
      },
    }));
  }

  protected clearPreviewState(): void {
    this.setPreviewState({
      active: false,
      behavior: WidgetInteractionBehavior.Live,
      source: null,
      rect: null,
    });
  }

  protected areFrameStatesEqual(left: WidgetFrameState, right: WidgetFrameState): boolean {
    return (
      left.x === right.x &&
      left.y === right.y &&
      left.width === right.width &&
      left.height === right.height
    );
  }

  protected clearResizePreview(): void {
    if (this.getPreviewState().source === WidgetPreviewSource.Resize) {
      this.clearPreviewState();
    }
  }

  protected handleResizePose(direction: ResizeDirection, pose: Partial<Pose>): void {
    if (!pose.position) {
      return;
    }

    const resizeStart = this.resizeStartByDirection.get(direction);

    if (!resizeStart) {
      return;
    }

    const deltaX = pose.position.x - resizeStart.posePosition.x;
    const deltaY = pose.position.y - resizeStart.posePosition.y;
    const nextRect = this.getResizedRect(resizeStart.rect, direction, deltaX, deltaY);

    if (this.getResizeBehavior() === WidgetInteractionBehavior.Outline) {
      if (this.areFrameStatesEqual(nextRect, resizeStart.rect)) {
        this.pendingResizeRectByDirection.delete(direction);
        this.clearResizePreview();
        return;
      }

      this.pendingResizeRectByDirection.set(direction, nextRect);
      this.setPreviewRect(nextRect, {
        source: WidgetPreviewSource.Resize,
        behavior: WidgetInteractionBehavior.Outline,
        active: true,
      });
      return;
    }

    this.setState(nextRect);
  }

  protected handleResizeEnd(direction: ResizeDirection, pose: Partial<Pose>): void {
    const resizeStart = this.resizeStartByDirection.get(direction);
    const pendingRect = this.pendingResizeRectByDirection.get(direction);
    const isCancelled = this.cancelledResizeDirections.has(direction);

    this.pendingResizeRectByDirection.delete(direction);
    this.cancelledResizeDirections.delete(direction);

    if (this.getResizeBehavior() !== WidgetInteractionBehavior.Outline) {
      return;
    }

    if (isCancelled) {
      this.clearResizePreview();
      return;
    }

    let nextRect = pendingRect;

    if (pose.position && resizeStart) {
      const deltaX = pose.position.x - resizeStart.posePosition.x;
      const deltaY = pose.position.y - resizeStart.posePosition.y;
      nextRect = this.getResizedRect(resizeStart.rect, direction, deltaX, deltaY);
    }

    const shouldCommit =
      resizeStart !== undefined &&
      nextRect !== undefined &&
      !this.areFrameStatesEqual(nextRect, resizeStart.rect);

    if (shouldCommit && nextRect) {
      this.setState(nextRect);
    }

    this.clearResizePreview();
  }

  protected isFrameMoveHandleElement(_type: unknown): boolean {
    return false;
  }

  protected getWidgetFrameMoveHandleProps(): WidgetFrameMoveHandleProps {
    return {
      onWidgetMove: this.applyFrameMovePosition,
      onWidgetMovePreview: this.applyFrameMovePreviewPosition,
      onWidgetMovePreviewClear: this.clearFrameMovePreview,
      getWidgetPose: this.getDragPose,
      moveBehavior: this.getMoveBehavior(),
    };
  }

  protected getFrameMoveHandleProps(): Record<string, unknown> {
    return this.getWidgetFrameMoveHandleProps();
  }

  protected mapComposedChildren(children: React.ReactNode = this.props.children): React.ReactNode {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      if (!this.isFrameMoveHandleElement(child.type)) {
        return child;
      }

      return React.cloneElement(
        child as React.ReactElement<Record<string, unknown>>,
        this.getFrameMoveHandleProps(),
      );
    });
  }

  protected getResizeHandleTestId(direction: ResizeDirection): string {
    return `widget-resize-${direction}`;
  }

  protected getResizeHandleClassName(_direction: ResizeDirection): string | undefined {
    return undefined;
  }

  protected normalizeTheme(theme: string | undefined): string | undefined {
    return normalizeThemeClassName(theme);
  }

  protected getTheme(theme?: string): string | undefined {
    const explicitTheme = this.normalizeTheme(theme ?? this.props.theme);

    if (explicitTheme !== undefined) {
      return explicitTheme;
    }

    return this.normalizeTheme(this.context.theme);
  }

  protected mergeThemeClassName(className?: string, theme?: string): string | undefined {
    const mergedClassName = mergeClasses([], this.getTheme(theme), className);

    return mergedClassName.length > 0 ? mergedClassName : undefined;
  }

  protected getNormalizedResizeOptions(): Required<
    Pick<CWidgetResizeOptions, 'edgeWidth' | 'minContentWidth' | 'minContentHeight'>
  > &
    Pick<CWidgetResizeOptions, 'maxContentWidth' | 'maxContentHeight'> {
    const edgeWidth = this.normalizePositiveValue(
      this.props.resizeOptions?.edgeWidth,
      DEFAULT_EDGE_WIDTH,
    );
    const minContentWidth = this.normalizePositiveValue(
      this.props.resizeOptions?.minContentWidth,
      DEFAULT_MIN_CONTENT_WIDTH,
    );
    const minContentHeight = this.normalizePositiveValue(
      this.props.resizeOptions?.minContentHeight,
      DEFAULT_MIN_CONTENT_HEIGHT,
    );

    return {
      edgeWidth,
      minContentWidth,
      minContentHeight,
      maxContentWidth: this.normalizeOptionalMax(
        this.props.resizeOptions?.maxContentWidth,
        minContentWidth,
      ),
      maxContentHeight: this.normalizeOptionalMax(
        this.props.resizeOptions?.maxContentHeight,
        minContentHeight,
      ),
    };
  }

  protected normalizePositiveValue(value: number | undefined, fallback: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      return fallback;
    }

    return value;
  }

  protected normalizeOptionalMax(value: number | undefined, minValue: number): number | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      return undefined;
    }

    return Math.max(value, minValue);
  }

  protected clampSize(value: number, min: number, max?: number): number {
    if (typeof max === 'number') {
      return Math.min(Math.max(value, min), max);
    }

    return Math.max(value, min);
  }

  protected getResizedRect(
    base: WidgetFrameState,
    direction: ResizeDirection,
    deltaX: number,
    deltaY: number,
  ): WidgetFrameState {
    const options = this.getNormalizedResizeOptions();

    const affectsWest = direction.includes('w');
    const affectsEast = direction.includes('e');
    const affectsNorth = direction.includes('n');
    const affectsSouth = direction.includes('s');

    let width = base.width;
    let height = base.height;
    let x = base.x;
    let y = base.y;

    if (affectsWest) {
      const nextWidth = this.clampSize(
        base.width - deltaX,
        options.minContentWidth,
        options.maxContentWidth,
      );
      x = base.x + (base.width - nextWidth);
      width = nextWidth;
    }

    if (affectsEast) {
      width = this.clampSize(base.width + deltaX, options.minContentWidth, options.maxContentWidth);
    }

    if (affectsNorth) {
      const nextHeight = this.clampSize(
        base.height - deltaY,
        options.minContentHeight,
        options.maxContentHeight,
      );
      y = base.y + (base.height - nextHeight);
      height = nextHeight;
    }

    if (affectsSouth) {
      height = this.clampSize(
        base.height + deltaY,
        options.minContentHeight,
        options.maxContentHeight,
      );
    }

    return {
      x,
      y,
      width,
      height,
    };
  }

  protected setupResizeDrags(): void {
    this.cleanupResizeDrags();

    if (this.props.resizable === false) {
      return;
    }

    RESIZE_DIRECTIONS.forEach((direction) => {
      const handle = this.resizeHandleRefs[direction].current;

      if (!handle) {
        return;
      }

      const onPointerDown = () => {
        const frame = this.getFrameState();

        this.resizeStartByDirection.set(direction, {
          rect: { ...frame },
          posePosition: {
            x: frame.x,
            y: frame.y,
          },
        });

        this.cancelledResizeDirections.delete(direction);
        this.pendingResizeRectByDirection.delete(direction);
        this.clearResizePreview();
      };

      const onPointerCancel = () => {
        this.cancelledResizeDirections.add(direction);
        this.pendingResizeRectByDirection.delete(direction);
        this.clearResizePreview();
      };

      this.resizePointerDownHandlers.set(direction, onPointerDown);
      this.resizePointerCancelHandlers.set(direction, onPointerCancel);
      handle.addEventListener('pointerdown', onPointerDown);
      handle.addEventListener('pointercancel', onPointerCancel);

      this.resizeDragInstances.set(
        direction,
        new Drag(handle, {
          getPose: this.getDragPose,
          setPose: (_element, pose) => {
            this.handleResizePose(direction, pose);
          },
          setPoseOnEnd: (_element, pose) => {
            this.handleResizeEnd(direction, pose);
          },
        }),
      );
    });
  }

  protected cleanupResizeDrags(): void {
    this.resizeDragInstances.forEach((drag) => {
      drag.setDisabled();
    });
    this.resizeDragInstances.clear();
    this.resizeStartByDirection.clear();
    this.pendingResizeRectByDirection.clear();
    this.cancelledResizeDirections.clear();
    this.clearResizePreview();

    RESIZE_DIRECTIONS.forEach((direction) => {
      const handle = this.resizeHandleRefs[direction].current;
      const pointerDownHandler = this.resizePointerDownHandlers.get(direction);
      const pointerCancelHandler = this.resizePointerCancelHandlers.get(direction);

      if (handle) {
        if (pointerDownHandler) {
          handle.removeEventListener('pointerdown', pointerDownHandler);
        }

        if (pointerCancelHandler) {
          handle.removeEventListener('pointercancel', pointerCancelHandler);
        }
      }
    });

    this.resizePointerDownHandlers.clear();
    this.resizePointerCancelHandlers.clear();
  }

  protected getResizeRegionStyle(
    position: ResizeRegionPosition,
    direction: ResizeDirection,
  ): React.CSSProperties {
    const edgeWidth = this.getNormalizedResizeOptions().edgeWidth;

    return {
      position: 'absolute',
      zIndex: 1,
      top: position.top,
      right: position.right,
      bottom: position.bottom,
      left: position.left,
      width: position.width,
      height: position.height,
      touchAction: 'none',
      userSelect: 'none',
      pointerEvents: 'auto',
      cursor: getResizeCursor(direction),
      minWidth: typeof position.width === 'number' ? position.width : edgeWidth,
      minHeight: typeof position.height === 'number' ? position.height : edgeWidth,
    };
  }

  protected renderResizeHandles(): React.ReactNode {
    if (this.props.resizable === false) {
      return null;
    }

    const edgeWidth = this.getNormalizedResizeOptions().edgeWidth;
    const edgeInset = edgeWidth / 2;

    const regions: Record<ResizeDirection, ResizeRegionPosition> = {
      n: { top: -edgeInset, left: edgeInset, right: edgeInset, height: edgeWidth },
      s: { bottom: -edgeInset, left: edgeInset, right: edgeInset, height: edgeWidth },
      e: { top: edgeInset, right: -edgeInset, bottom: edgeInset, width: edgeWidth },
      w: { top: edgeInset, left: -edgeInset, bottom: edgeInset, width: edgeWidth },
      ne: { top: -edgeInset, right: -edgeInset, width: edgeWidth, height: edgeWidth },
      nw: { top: -edgeInset, left: -edgeInset, width: edgeWidth, height: edgeWidth },
      se: { bottom: -edgeInset, right: -edgeInset, width: edgeWidth, height: edgeWidth },
      sw: { bottom: -edgeInset, left: -edgeInset, width: edgeWidth, height: edgeWidth },
    };

    return RESIZE_DIRECTIONS.map((direction) => (
      <div
        key={direction}
        ref={this.resizeHandleRefs[direction]}
        className={this.getResizeHandleClassName(direction)}
        data-testid={this.getResizeHandleTestId(direction)}
        style={this.getResizeRegionStyle(regions[direction], direction)}
      />
    ));
  }

  protected renderFrame(
    content: React.ReactNode,
    layout?: WidgetLayoutProps,
    options?: WidgetFrameOptions,
  ): React.ReactElement {
    const { x, y, width, height } = layout ?? this.getFrameState();
    const frameStyle: React.CSSProperties = {
      left: x,
      top: y,
      width,
      height,
      position: 'absolute',
      ...options?.style,
    };

    const preview = this.renderPreviewFrame(options);

    return (
      <>
        <div
          data-testid={options?.testId ?? 'widget-frame'}
          className={this.mergeThemeClassName(options?.className, options?.theme)}
          style={frameStyle}
        >
          {content}
        </div>
        {preview}
      </>
    );
  }

  protected getPreviewFrameStyle(rect: WidgetPreviewRect): React.CSSProperties {
    return {
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
      position: 'absolute',
      zIndex: 2,
      pointerEvents: 'none',
    };
  }

  protected renderPreviewFrame(options?: WidgetFrameOptions): React.ReactNode {
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
        className={this.mergeThemeClassName(options?.className, options?.theme)}
        style={this.getPreviewFrameStyle(preview.rect)}
      />
    );
  }

  public render() {
    return this.renderFrame(this.props.children);
  }
}
