import {
  ReactNode,
  HTMLAttributes,
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  type MutableRefObject,
  type PointerEvent,
} from 'react';
import { useThemeBehavior } from '../theme/ThemeContext';
import type { DockZoneDef, DockZoneId } from '../theme/types';
import { GlobalRender } from './GlobalRender';
import { useLayeredZIndex } from './useLayeredZIndex';
import './WindowTitleRenderer';
import './Window.scss';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type InteractionMode = 'static' | 'follow';

export interface WindowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onResize'> {
  title: string;
  children?: ReactNode;
  isActive?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onActive?: () => void;
  icon?: ReactNode;

  position?: Position;
  size?: Size;

  initialPosition?: Position;
  initialSize?: Size;

  minWidth?: number;
  minHeight?: number;
  movable?: boolean;
  resizable?: boolean;
  interactionMode?: InteractionMode;
  grabEdge?: number;

  onMoveStart?: () => void;
  onMoving?: (pos: Position) => void;
  onMoveEnd?: (pos: Position) => void;

  onResizeStart?: () => void;
  onResizing?: (data: { size: Size; position: Position }) => void;
  onResizeEnd?: (data: { size: Size; position: Position }) => void;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

type DockZoneMatch = {
  readonly id: DockZoneId;
  readonly rect: { left: number; top: number; width: number; height: number };
};

const GRID_MIN = 1;
const GRID_MAX = 4;
const GRID_SEGMENTS = 3;

function clampGridLine(line: number): number {
  return Math.min(Math.max(line, GRID_MIN), GRID_MAX);
}

function lineToRatio(line: number): number {
  return (clampGridLine(line) - 1) / GRID_SEGMENTS;
}

function resolveDockZoneRect(
  zone: DockZoneDef,
  viewportW: number,
  viewportH: number,
): { left: number; top: number; width: number; height: number } {
  const left = Math.round(lineToRatio(zone.gridColumnStart) * viewportW);
  const right = Math.round(lineToRatio(zone.gridColumnEnd) * viewportW);
  const top = Math.round(lineToRatio(zone.gridRowStart) * viewportH);
  const bottom = Math.round(lineToRatio(zone.gridRowEnd) * viewportH);

  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function distanceToRect(
  x: number,
  y: number,
  rect: { left: number; top: number; width: number; height: number },
): number {
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;

  let dx = 0;
  if (x < rect.left) {
    dx = rect.left - x;
  } else if (x > right) {
    dx = x - right;
  }

  let dy = 0;
  if (y < rect.top) {
    dy = rect.top - y;
  } else if (y > bottom) {
    dy = y - bottom;
  }

  return Math.hypot(dx, dy);
}

function resolveDockZoneMatch(
  zones: readonly DockZoneDef[],
  point: { x: number; y: number },
  thresholdPx: number,
  viewportW: number,
  viewportH: number,
): DockZoneMatch | null {
  let selected: { zone: DockZoneDef; rect: DockZoneMatch['rect']; distance: number } | null = null;

  for (const zone of zones) {
    if (zone.enabled === false) {
      continue;
    }

    const rect = resolveDockZoneRect(zone, viewportW, viewportH);
    const distance = distanceToRect(point.x, point.y, rect);
    if (distance > thresholdPx) {
      continue;
    }

    if (!selected) {
      selected = { zone, rect, distance };
      continue;
    }

    const selectedPriority = selected.zone.priority ?? 0;
    const nextPriority = zone.priority ?? 0;
    const shouldReplace =
      distance < selected.distance ||
      (distance === selected.distance && nextPriority > selectedPriority);

    if (shouldReplace) {
      selected = { zone, rect, distance };
    }
  }

  if (!selected) {
    return null;
  }

  return {
    id: selected.zone.id,
    rect: selected.rect,
  };
}

export const Window = forwardRef<HTMLDivElement, WindowProps>(
  (
    {
      title,
      children,
      isActive = true,
      onClose,
      onMinimize,
      onMaximize,
      onActive,
      icon,
      className = '',
      position: controlledPos,
      size: controlledSize,
      initialPosition = { x: 0, y: 0 },
      initialSize,
      minWidth,
      minHeight,
      movable,
      resizable,
      interactionMode,
      grabEdge = 30,
      onMoveStart,
      onMoving,
      onMoveEnd,
      onResizeStart,
      onResizing,
      onResizeEnd,
      style,
      ...rest
    },
    ref,
  ) => {
    const { windowDefaults, windowDragMode, docking } = useThemeBehavior();
    const resolvedInteractionMode =
      interactionMode ?? windowDefaults.interactionMode ?? windowDragMode;
    const resolvedMovable = movable ?? windowDefaults.movable ?? true;
    const resolvedResizable = resizable ?? windowDefaults.resizable ?? false;
    const resolvedMinWidth = minWidth ?? windowDefaults.minWidth ?? 200;
    const resolvedMinHeight = minHeight ?? windowDefaults.minHeight ?? 100;
    const activateWholeArea = windowDefaults.activateWholeArea ?? true;

    const [pos, setPos] = useState<Position>(controlledPos || initialPosition);
    const [size, setSize] = useState<Size | undefined>(controlledSize || initialSize);
    const [isDragging, setIsDragging] = useState(false);
    const [previewPos, setPreviewPos] = useState<Position | null>(null);
    const { zIndex: stackedZIndex, order: stackOrder } = useLayeredZIndex('base', isActive);
    const onActiveRef = useRef(onActive);
    const isActiveRef = useRef(isActive);
    const activationSourceRef = useRef<'pointer' | 'keyboard' | null>(null);

    const interactionRef = useRef<{
      active: boolean;
      type: 'move' | 'resize';
      mode: InteractionMode;
      direction: ResizeDirection | null;
      startX: number;
      startY: number;
      startLeft: number;
      startTop: number;
      startWidth: number;
      startHeight: number;
      pointerId: number | null;
      capturedElement: HTMLElement | null;
      currentX: number;
      currentY: number;
      currentWidth: number;
      currentHeight: number;
    }>({
      active: false,
      type: 'move',
      mode: 'follow',
      direction: null,
      startX: 0,
      startY: 0,
      startLeft: 0,
      startTop: 0,
      startWidth: 0,
      startHeight: 0,
      pointerId: null,
      capturedElement: null,
      currentX: 0,
      currentY: 0,
      currentWidth: 0,
      currentHeight: 0,
    });

    const internalRef = useRef<HTMLDivElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const activeDockZoneRef = useRef<DockZoneId | null>(null);
    const lastPointerClientRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      onActiveRef.current = onActive;
    }, [onActive]);

    useEffect(() => {
      if (!interactionRef.current.active && controlledPos) {
        setPos(controlledPos);
      }
    }, [controlledPos]);

    useEffect(() => {
      if (!interactionRef.current.active && controlledSize) {
        setSize(controlledSize);
      }
    }, [controlledSize]);

    useEffect(() => {
      if (!isActiveRef.current && isActive) {
        if (activationSourceRef.current !== 'pointer') {
          onActiveRef.current?.();
        }
      }
      activationSourceRef.current = null;
      isActiveRef.current = isActive;
    }, [isActive]);

    const getRect = () => {
      if (internalRef.current) {
        const rect = internalRef.current.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          left: pos.x,
          top: pos.y,
        };
      }
      return {
        width: size?.width || resolvedMinWidth,
        height: size?.height || resolvedMinHeight,
        left: pos.x,
        top: pos.y,
      };
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!activateWholeArea) return;
      if ((e.target as HTMLElement).closest('.cm-window__controls')) return;

      if (!isActive) {
        activationSourceRef.current = 'pointer';
        onActiveRef.current?.();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!activateWholeArea) return;
      if ((e.target as HTMLElement).closest('.cm-window__controls')) return;

      if ((e.key === 'Enter' || e.key === ' ') && !isActive) {
        e.preventDefault();
        activationSourceRef.current = 'keyboard';
        onActiveRef.current?.();
      }
    };

    const handlePointerDown = (
      e: PointerEvent<Element>,
      type: 'move' | 'resize',
      direction: ResizeDirection | null = null,
    ) => {
      if (e.button !== 0) return;
      if (type === 'move' && !resolvedMovable) return;
      if (type === 'resize' && !resolvedResizable) return;

      if ((e.target as HTMLElement).closest('.cm-window__controls')) return;

      if (type === 'move' && !isActive) {
        activationSourceRef.current = 'pointer';
        onActiveRef.current?.();
      }

      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const currentRect = getRect();

      interactionRef.current = {
        active: true,
        type,
        mode: resolvedInteractionMode ?? 'follow',
        direction,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: pos.x,
        startTop: pos.y,
        startWidth: currentRect.width,
        startHeight: currentRect.height,
        pointerId: e.pointerId,
        capturedElement: target,
        currentX: pos.x,
        currentY: pos.y,
        currentWidth: currentRect.width,
        currentHeight: currentRect.height,
      };

      setIsDragging(true);
      lastPointerClientRef.current = { x: e.clientX, y: e.clientY };

      if (type === 'move') {
        onMoveStart?.();
      } else {
        onResizeStart?.();
      }
    };

    const handlePointerMove = useCallback(
      (e: PointerEvent<Element>) => {
        if (!interactionRef.current.active) return;

        e.preventDefault();

        if (rafRef.current) return;

        // Capture event coordinates before RAF to avoid event object being recycled
        const clientX = e.clientX;
        const clientY = e.clientY;

        /* eslint-disable sonarjs/cognitive-complexity */
        rafRef.current = requestAnimationFrame(() => {
          lastPointerClientRef.current = { x: clientX, y: clientY };

          const {
            startX,
            startY,
            startLeft,
            startTop,
            startWidth,
            startHeight,
            type,
            direction,
            mode,
          } = interactionRef.current;

          const dx = clientX - startX;
          const dy = clientY - startY;

          let newX = startLeft;
          let newY = startTop;
          let newW = startWidth;
          let newH = startHeight;

          if (type === 'move') {
            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;

            newX = startLeft + dx;
            newY = startTop + dy;

            newX = Math.min(Math.max(newX, grabEdge - startWidth), viewportW - grabEdge);
            newY = Math.min(Math.max(newY, grabEdge - startHeight), viewportH - grabEdge);
          } else if (type === 'resize' && direction) {
            if (direction.includes('e')) {
              newW = Math.max(resolvedMinWidth, startWidth + dx);
            } else if (direction.includes('w')) {
              const maxDelta = startWidth - resolvedMinWidth;
              const delta = Math.min(dx, maxDelta);
              newW = startWidth - delta;
              newX = startLeft + delta;
            }

            if (direction.includes('s')) {
              newH = Math.max(resolvedMinHeight, startHeight + dy);
            } else if (direction.includes('n')) {
              const maxDelta = startHeight - resolvedMinHeight;
              const delta = Math.min(dy, maxDelta);
              newH = startHeight - delta;
              newY = startTop + delta;
            }
          }

          interactionRef.current.currentX = newX;
          interactionRef.current.currentY = newY;
          interactionRef.current.currentWidth = newW;
          interactionRef.current.currentHeight = newH;

          if (type === 'move') {
            const newPos = { x: newX, y: newY };

            if (mode === 'follow') {
              setPos(newPos);
            } else if (mode === 'static') {
              setPreviewPos(newPos);
            }
            onMoving?.(newPos);

            const dockMatch = resolveDockZoneMatch(
              docking.zones,
              { x: clientX, y: clientY },
              docking.policy.thresholdPx,
              window.innerWidth,
              window.innerHeight,
            );
            if (dockMatch?.id !== activeDockZoneRef.current) {
              if (dockMatch) {
                docking.events?.onDockPreview?.({ zoneId: dockMatch.id });
              } else if (activeDockZoneRef.current) {
                docking.events?.onDockLeave?.();
              }
              activeDockZoneRef.current = dockMatch?.id ?? null;
            }
          } else if (type === 'resize') {
            const newSize = { width: newW, height: newH };
            const newPos = { x: newX, y: newY };

            if (mode === 'follow') {
              setPos(newPos);
              setSize(newSize);
            }
            onResizing?.({ size: newSize, position: newPos });
          }

          rafRef.current = null;
        });
      },
      [
        docking.events,
        docking.policy.thresholdPx,
        docking.zones,
        grabEdge,
        onMoving,
        onResizing,
        resolvedMinHeight,
        resolvedMinWidth,
      ],
    );

    const handlePointerUp = useCallback(() => {
      if (!interactionRef.current.active) return;

      const {
        type,
        mode,
        pointerId,
        capturedElement,
        currentX,
        currentY,
        currentWidth,
        currentHeight,
      } = interactionRef.current;

      if (pointerId !== null && capturedElement) {
        capturedElement.releasePointerCapture(pointerId);
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      interactionRef.current.active = false;
      interactionRef.current.capturedElement = null;
      setIsDragging(false);

      const finalPos = { x: currentX, y: currentY };
      const finalSize = { width: currentWidth, height: currentHeight };

      const dockMatch =
        type === 'move'
          ? resolveDockZoneMatch(
              docking.zones,
              lastPointerClientRef.current,
              docking.policy.thresholdPx,
              window.innerWidth,
              window.innerHeight,
            )
          : null;
      const shouldReleaseDock = dockMatch !== null && docking.policy.mode === 'release';
      const dockedPos = dockMatch ? { x: dockMatch.rect.left, y: dockMatch.rect.top } : null;

      if (type === 'move' && dockMatch) {
        docking.events?.onDockCommit?.({
          zoneId: dockMatch.id,
          x: dockMatch.rect.left,
          y: dockMatch.rect.top,
          width: dockMatch.rect.width,
          height: dockMatch.rect.height,
        });
      }

      if (type === 'move' && shouldReleaseDock && dockMatch) {
        setPos({ x: dockMatch.rect.left, y: dockMatch.rect.top });
        setSize({ width: dockMatch.rect.width, height: dockMatch.rect.height });
        setPreviewPos(null);
      } else if (type === 'move' && mode === 'static' && previewPos) {
        setPos(previewPos);
        setPreviewPos(null);
      } else if (type === 'move' && mode === 'follow') {
        setPos(finalPos);
      } else if (type === 'resize') {
        setPos(finalPos);
        setSize(finalSize);
      }

      if (type === 'move') {
        onMoveEnd?.(shouldReleaseDock && dockedPos ? dockedPos : finalPos);
      } else {
        onResizeEnd?.({ size: finalSize, position: finalPos });
      }

      if (type === 'move' && activeDockZoneRef.current) {
        docking.events?.onDockLeave?.();
        activeDockZoneRef.current = null;
      }
    }, [
      docking.events,
      docking.policy.mode,
      docking.policy.thresholdPx,
      docking.zones,
      onMoveEnd,
      onResizeEnd,
      previewPos,
    ]);

    const setMergedRef = (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = node;
    };

    const cls = [
      'cm-window',
      !isActive && 'cm-window--inactive',
      isDragging && 'isDragging',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const resolvedZIndex = style?.zIndex ?? stackedZIndex;

    const combinedStyle = {
      ...style,
      left: pos.x,
      top: pos.y,
      width: size?.width,
      height: size?.height,
      position: 'absolute' as const,
      zIndex: resolvedZIndex,
    };

    const previewZIndex = `calc(var(--cm-z-index-base) + ${stackOrder + 1})`;

    return (
      <>
        <div
          ref={setMergedRef}
          className={cls}
          style={combinedStyle}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role={activateWholeArea ? 'button' : undefined}
          tabIndex={activateWholeArea ? 0 : undefined}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          {...rest}
        >
          <GlobalRender
            name="window-title"
            title={title}
            icon={icon}
            isActive={isActive}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            onClose={onClose}
            onPointerDown={(e: PointerEvent<HTMLDivElement>) => handlePointerDown(e, 'move')}
          />

          <div className="cm-window__body">{children}</div>

          {resolvedResizable && (
            <>
              {(['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as ResizeDirection[]).map((dir) => (
                <div
                  key={dir}
                  className="cm-window__resize-handle"
                  data-direction={dir}
                  onPointerDown={(e) => handlePointerDown(e, 'resize', dir)}
                />
              ))}
            </>
          )}
        </div>

        {resolvedInteractionMode === 'static' && isDragging && previewPos && (
          <div
            className="cm-window-preview"
            style={{
              position: 'fixed',
              left: previewPos.x,
              top: previewPos.y,
              width: size?.width || resolvedMinWidth,
              height: size?.height || resolvedMinHeight,
              pointerEvents: 'none',
              zIndex: previewZIndex,
            }}
          />
        )}
      </>
    );
  },
);

Window.displayName = 'Window';

export default Window;
