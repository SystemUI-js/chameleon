import { Drag, type Pose } from '@system-ui-js/multi-drag';
import React from 'react';
import { generateUUID } from '@/utils/uuid';

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
  resizable?: boolean;
  resizeOptions?: CWidgetResizeOptions;
}

export type WidgetFrameState = Required<WidgetLayoutProps>;

export type WidgetFramePatch = Partial<WidgetFrameState>;

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

type WidgetComponentState = Record<string, unknown>;

type WidgetFrameOptions = {
  className?: string;
  testId?: string;
  style?: React.CSSProperties;
};

type WidgetFrameMoveHandleProps = {
  onWindowMove: (position: WidgetFrameMovePosition) => void;
  getWindowPose: () => Pose;
};

export class CWidget extends React.Component<CWidgetProps, WidgetComponentState> {
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
  private readonly resizePointerDownHandlers = new Map<
    ResizeDirection,
    (event: PointerEvent) => void
  >();

  public constructor(props: CWidgetProps) {
    super(props);
    this.state = CWidget.getInitialFrameState(props);
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
      ...(prevState as WidgetFrameState),
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

  protected syncControlledFrameProps(prevProps: Readonly<WidgetLayoutProps>): void {
    if (
      prevProps.x !== this.props.x ||
      prevProps.y !== this.props.y ||
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ) {
      this.setState((prevState) => ({
        ...(prevState as WidgetFrameState),
        x: this.props.x ?? (prevState as WidgetFrameState).x,
        y: this.props.y ?? (prevState as WidgetFrameState).y,
        width: this.props.width ?? (prevState as WidgetFrameState).width,
        height: this.props.height ?? (prevState as WidgetFrameState).height,
      }));
    }
  }

  protected getFrameState(): WidgetFrameState {
    return this.state as WidgetFrameState;
  }

  protected isFrameMoveHandleElement(_type: unknown): boolean {
    return false;
  }

  protected getFrameMoveHandleProps(): WidgetFrameMoveHandleProps {
    return {
      onWindowMove: this.applyFrameMovePosition,
      getWindowPose: this.getDragPose,
    };
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
      };

      this.resizePointerDownHandlers.set(direction, onPointerDown);
      handle.addEventListener('pointerdown', onPointerDown);

      this.resizeDragInstances.set(
        direction,
        new Drag(handle, {
          getPose: this.getDragPose,
          setPose: (_element, pose) => {
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

            this.setState(nextRect);
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

    RESIZE_DIRECTIONS.forEach((direction) => {
      const handle = this.resizeHandleRefs[direction].current;
      const pointerDownHandler = this.resizePointerDownHandlers.get(direction);

      if (!handle || !pointerDownHandler) {
        return;
      }

      handle.removeEventListener('pointerdown', pointerDownHandler);
    });

    this.resizePointerDownHandlers.clear();
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

    return (
      <div
        data-testid={options?.testId ?? 'widget-frame'}
        className={options?.className}
        style={frameStyle}
      >
        {content}
      </div>
    );
  }

  public render() {
    return this.renderFrame(this.props.children);
  }
}
