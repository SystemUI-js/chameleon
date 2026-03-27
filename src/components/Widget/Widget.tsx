import { Drag, type Pose } from '@system-ui-js/multi-drag';
import React from 'react';
import { generateUUID } from '@/utils/uuid';

export interface WidgetLayoutProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface CWidgetProps extends WidgetLayoutProps {
  children?: React.ReactNode;
}

export interface WidgetFrameState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type WidgetFramePosition = Pick<WidgetFrameState, 'x' | 'y'>;

type WidgetMoveHandleProps = {
  onWindowMove?: (position: WidgetFramePosition) => void;
  getWindowPose?: () => Pose;
};

type WidgetFrameOptions = {
  className?: string;
  testId?: string;
  style?: React.CSSProperties;
};

interface WidgetResizeOptions {
  edgeWidth?: number;
  minContentWidth?: number;
  minContentHeight?: number;
  maxContentWidth?: number;
  maxContentHeight?: number;
}

type WidgetResizeProps = {
  resizable?: boolean;
  resizeOptions?: WidgetResizeOptions;
};

type ResizeStart = {
  rect: WidgetFrameState;
  posePosition: {
    x: number;
    y: number;
  };
};

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

type ResizeRegionPosition = {
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

const getResizeCursor = (direction: ResizeDirection): React.CSSProperties['cursor'] => {
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

export class CWidget<
  TProps extends CWidgetProps = CWidgetProps,
  TState extends object = Record<string, never>,
> extends React.Component<TProps, TState & WidgetFrameState> {
  public readonly uuid = generateUUID();
  public state: TState & WidgetFrameState = {
    x: this.props.x ?? 0,
    y: this.props.y ?? 0,
    width: this.props.width ?? 0,
    height: this.props.height ?? 0,
  } as TState & WidgetFrameState;
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
  private readonly resizePointerDownHandlers = new Map<ResizeDirection, () => void>();

  public componentDidMount(): void {
    this.setupResizeDrags();
  }

  public componentDidUpdate(prevProps: TProps): void {
    const prevResizeProps = prevProps as TProps & WidgetResizeProps;
    const currentResizeProps = this.props as TProps & WidgetResizeProps;
    const framePatch: Partial<WidgetFrameState> = {};

    if (prevProps.x !== this.props.x && this.props.x !== undefined) {
      framePatch.x = this.props.x;
    }

    if (prevProps.y !== this.props.y && this.props.y !== undefined) {
      framePatch.y = this.props.y;
    }

    if (prevProps.width !== this.props.width && this.props.width !== undefined) {
      framePatch.width = this.props.width;
    }

    if (prevProps.height !== this.props.height && this.props.height !== undefined) {
      framePatch.height = this.props.height;
    }

    if (Object.keys(framePatch).length > 0) {
      this.patchFrameState(framePatch);
    }

    if (
      this.supportsResize() &&
      (prevResizeProps.resizable !== currentResizeProps.resizable ||
        prevResizeProps.resizeOptions !== currentResizeProps.resizeOptions)
    ) {
      this.setupResizeDrags();
    }
  }

  public componentWillUnmount(): void {
    this.cleanupResizeDrags();
  }

  protected readonly getDragPose = (): Pose => {
    const { x, y, width, height } = this.state;

    return {
      position: {
        x,
        y,
      },
      width,
      height,
    };
  };

  protected readonly setFrameState = (frame: WidgetFrameState): void => {
    this.setState(frame as Pick<TState & WidgetFrameState, keyof WidgetFrameState>);
  };

  protected readonly patchFrameState = (framePatch: Partial<WidgetFrameState>): void => {
    this.setState((prevState: Readonly<TState & WidgetFrameState>) => ({
      ...prevState,
      ...framePatch,
    }));
  };

  protected readonly applyFrameMove = (position: WidgetFramePosition): void => {
    this.patchFrameState(position);
  };

  protected isMoveHandleElement(_type: unknown): boolean {
    return false;
  }

  protected getMoveHandleProps(): WidgetMoveHandleProps {
    return {
      onWindowMove: this.applyFrameMove,
      getWindowPose: this.getDragPose,
    };
  }

  protected mapComposedChildren(children: React.ReactNode = this.props.children): React.ReactNode {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child) || !this.isMoveHandleElement(child.type)) {
        return child;
      }

      return React.cloneElement(child as React.ReactElement<WidgetMoveHandleProps>, {
        ...this.getMoveHandleProps(),
      });
    });
  }

  protected supportsResize(): boolean {
    return false;
  }

  protected renderResizeHandles(): React.ReactNode {
    if (!this.isResizeEnabled()) {
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
        data-testid={`window-resize-${direction}`}
        style={this.getResizeRegionStyle(regions[direction], direction)}
      />
    ));
  }

  private getResizeProps(): WidgetResizeProps {
    return this.props as TProps & WidgetResizeProps;
  }

  private isResizeEnabled(): boolean {
    return this.supportsResize() && this.getResizeProps().resizable !== false;
  }

  private getNormalizedResizeOptions(): Required<
    Pick<WidgetResizeOptions, 'edgeWidth' | 'minContentWidth' | 'minContentHeight'>
  > &
    Pick<WidgetResizeOptions, 'maxContentWidth' | 'maxContentHeight'> {
    const { resizeOptions } = this.getResizeProps();
    const edgeWidth = this.normalizePositiveValue(resizeOptions?.edgeWidth, DEFAULT_EDGE_WIDTH);
    const minContentWidth = this.normalizePositiveValue(
      resizeOptions?.minContentWidth,
      DEFAULT_MIN_CONTENT_WIDTH,
    );
    const minContentHeight = this.normalizePositiveValue(
      resizeOptions?.minContentHeight,
      DEFAULT_MIN_CONTENT_HEIGHT,
    );

    return {
      edgeWidth,
      minContentWidth,
      minContentHeight,
      maxContentWidth: this.normalizeOptionalMax(resizeOptions?.maxContentWidth, minContentWidth),
      maxContentHeight: this.normalizeOptionalMax(
        resizeOptions?.maxContentHeight,
        minContentHeight,
      ),
    };
  }

  private normalizePositiveValue(value: number | undefined, fallback: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      return fallback;
    }

    return value;
  }

  private normalizeOptionalMax(value: number | undefined, minValue: number): number | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      return undefined;
    }

    return Math.max(value, minValue);
  }

  private clampSize(value: number, min: number, max?: number): number {
    if (typeof max === 'number') {
      return Math.min(Math.max(value, min), max);
    }

    return Math.max(value, min);
  }

  private getResizedRect(
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

  private setupResizeDrags(): void {
    this.cleanupResizeDrags();

    if (!this.isResizeEnabled()) {
      return;
    }

    RESIZE_DIRECTIONS.forEach((direction) => {
      const handle = this.resizeHandleRefs[direction].current;

      if (!handle) {
        return;
      }

      const onPointerDown = () => {
        const dragPose = this.getDragPose();

        this.resizeStartByDirection.set(direction, {
          rect: { ...this.state },
          posePosition: dragPose.position,
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

            this.setFrameState(nextRect);
          },
        }),
      );
    });
  }

  private cleanupResizeDrags(): void {
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

  private getResizeRegionStyle(
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

  protected renderFrame(
    content: React.ReactNode,
    layout?: WidgetLayoutProps,
    options?: WidgetFrameOptions,
  ): React.ReactElement {
    const {
      x = this.state.x,
      y = this.state.y,
      width = this.state.width,
      height = this.state.height,
    } = layout ?? this.state;
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
