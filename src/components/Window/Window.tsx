import React from 'react';
import { Drag } from '@system-ui-js/multi-drag';
import { CWidget, type CWidgetProps } from '../Widget/Widget';
import { CWindowTitle, type WindowPosition } from './WindowTitle';

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

type WindowState = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ResizeStart = {
  rect: WindowState;
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

export class CWindow extends CWidget {
  declare public props: CWindowProps;
  public state: WindowState;
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

  public constructor(props: CWindowProps) {
    super(props);
    this.state = {
      x: props.x ?? 0,
      y: props.y ?? 0,
      width: props.width ?? 0,
      height: props.height ?? 0,
    };
  }

  public componentDidMount(): void {
    this.setupResizeDrags();
  }

  public componentDidUpdate(prevProps: CWindowProps): void {
    if (
      prevProps.x !== this.props.x ||
      prevProps.y !== this.props.y ||
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ) {
      this.setState({
        x: this.props.x ?? this.state.x,
        y: this.props.y ?? this.state.y,
        width: this.props.width ?? this.state.width,
        height: this.props.height ?? this.state.height,
      });
    }

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

  public getDragPose = () => {
    return {
      position: {
        x: this.state.x,
        y: this.state.y,
      },
      width: this.state.width,
      height: this.state.height,
    };
  };

  public handleWindowMove = (position: WindowPosition): void => {
    this.setState((prevState: Readonly<WindowState>) => ({
      ...prevState,
      ...position,
    }));
  };

  protected getWindowContentClassName(): string {
    return 'cm-window';
  }

  protected getWindowFrameClassName(): string {
    return 'cm-window-frame';
  }

  private getNormalizedResizeOptions(): Required<
    Pick<CWindowResizeOptions, 'edgeWidth' | 'minContentWidth' | 'minContentHeight'>
  > &
    Pick<CWindowResizeOptions, 'maxContentWidth' | 'maxContentHeight'> {
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
    base: WindowState,
    direction: ResizeDirection,
    deltaX: number,
    deltaY: number,
  ): WindowState {
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

    if (this.props.resizable === false) {
      return;
    }

    RESIZE_DIRECTIONS.forEach((direction) => {
      const handle = this.resizeHandleRefs[direction].current;

      if (!handle) {
        return;
      }

      const onPointerDown = () => {
        this.resizeStartByDirection.set(direction, {
          rect: { ...this.state },
          posePosition: {
            x: this.state.x,
            y: this.state.y,
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

  private renderResizeHandles(): React.ReactNode {
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
        data-testid={`window-resize-${direction}`}
        style={this.getResizeRegionStyle(regions[direction], direction)}
      />
    ));
  }

  private mapComposedChildren(): React.ReactNode {
    return React.Children.map(this.props.children, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      if (this.isWindowTitleElement(child.type)) {
        return React.cloneElement(child, {
          onWindowMove: this.handleWindowMove,
          getWindowPose: this.getDragPose,
        });
      }

      return child;
    });
  }

  private isWindowTitleElement(type: unknown): boolean {
    if (type === CWindowTitle) {
      return true;
    }

    if (typeof type !== 'function') {
      return false;
    }

    const candidate = type as { prototype?: unknown };
    return candidate.prototype instanceof CWindowTitle;
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

    return this.renderFrame(
      <>
        {content}
        {this.renderResizeHandles()}
      </>,
      {
        x: this.state.x,
        y: this.state.y,
        width: this.state.width,
        height: this.state.height,
      },
      {
        className: this.getWindowFrameClassName(),
        testId: 'window-frame',
        style: {
          position: 'relative',
        },
      },
    );
  }
}
