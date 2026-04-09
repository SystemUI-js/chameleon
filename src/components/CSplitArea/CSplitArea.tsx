import { Drag, type Pose } from '@system-ui-js/multi-drag';
import React from 'react';
import { mergeClasses, ResolvedThemeClassName } from '../Theme';
import './index.scss';

export type CSplitAreaDirection = 'horizontal' | 'vertical';

export interface CSplitAreaProps {
  readonly children?: React.ReactNode;
  readonly direction?: CSplitAreaDirection;
  readonly separatorMovable?: boolean;
  readonly className?: string;
  readonly theme?: string;
  readonly style?: React.CSSProperties;
  readonly 'data-testid'?: string;
}

type SplitAreaItem = {
  readonly id: string;
  readonly node: React.ReactNode;
};

type DragSession = {
  readonly separatorIndex: number;
  readonly startRatios: number[];
  readonly containerSize: number;
  readonly startPosition: number;
};

const MIN_PANEL_SIZE_PX = 48;

function createEqualRatios(count: number): number[] {
  if (count <= 0) {
    return [];
  }

  return Array.from({ length: count }, () => 1 / count);
}

function normalizeRatios(ratios: readonly number[]): number[] {
  const safeRatios = ratios.map((ratio) => (Number.isFinite(ratio) && ratio > 0 ? ratio : 0));
  const total = safeRatios.reduce((sum, ratio) => sum + ratio, 0);

  if (safeRatios.length === 0 || total <= 0) {
    return createEqualRatios(safeRatios.length);
  }

  return safeRatios.map((ratio) => ratio / total);
}

function areIdsEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function reconcileRatios(
  previousRatios: readonly number[],
  previousIds: readonly string[],
  nextIds: readonly string[],
): number[] {
  if (nextIds.length === 0) {
    return [];
  }

  if (previousIds.length === 0) {
    return createEqualRatios(nextIds.length);
  }

  if (areIdsEqual(previousIds, nextIds)) {
    return normalizeRatios(previousRatios.slice(0, nextIds.length));
  }

  const previousRatiosById = new Map<string, number>();
  previousIds.forEach((id, index) => {
    previousRatiosById.set(id, previousRatios[index] ?? 0);
  });

  const isRemovalOnly =
    nextIds.length < previousIds.length && nextIds.every((id) => previousRatiosById.has(id));

  if (!isRemovalOnly) {
    return createEqualRatios(nextIds.length);
  }

  return normalizeRatios(nextIds.map((id) => previousRatiosById.get(id) ?? 0));
}

function buildSplitAreaItems(children: React.ReactNode): SplitAreaItem[] {
  return React.Children.toArray(children)
    .filter((child) => child !== null && child !== undefined && typeof child !== 'boolean')
    .map((child, index) => {
      const key =
        React.isValidElement(child) && child.key !== null ? String(child.key) : `index-${index}`;

      return {
        id: key,
        node: child,
      } satisfies SplitAreaItem;
    });
}

function getPrimarySize(rect: DOMRect, direction: CSplitAreaDirection): number {
  return direction === 'horizontal' ? rect.width : rect.height;
}

function getPrimaryPosition(rect: DOMRect, direction: CSplitAreaDirection): number {
  return direction === 'horizontal' ? rect.left : rect.top;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getUpdatedRatiosFromDelta(
  ratios: readonly number[],
  separatorIndex: number,
  containerSize: number,
  delta: number,
): number[] {
  if (containerSize <= 0 || separatorIndex < 0 || separatorIndex >= ratios.length - 1) {
    return normalizeRatios(ratios);
  }

  const nextRatios = [...ratios];
  const leftRatio = nextRatios[separatorIndex] ?? 0;
  const rightRatio = nextRatios[separatorIndex + 1] ?? 0;
  const pairRatio = leftRatio + rightRatio;
  const minRatio = Math.min(MIN_PANEL_SIZE_PX / containerSize, pairRatio / 2);
  const leftNextRatio = clamp(leftRatio + delta / containerSize, minRatio, pairRatio - minRatio);

  nextRatios[separatorIndex] = leftNextRatio;
  nextRatios[separatorIndex + 1] = pairRatio - leftNextRatio;

  return normalizeRatios(nextRatios);
}

export function CSplitArea({
  children,
  direction = 'horizontal',
  separatorMovable = false,
  className,
  theme,
  style,
  'data-testid': dataTestId,
}: CSplitAreaProps): React.ReactElement {
  const items = React.useMemo(() => buildSplitAreaItems(children), [children]);
  const itemIds = React.useMemo(() => items.map((item) => item.id), [items]);
  const [ratios, setRatios] = React.useState<number[]>(() => createEqualRatios(items.length));
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const separatorRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const dragSessionRef = React.useRef<DragSession | null>(null);
  const previousIdsRef = React.useRef<readonly string[]>(itemIds);
  const ratiosRef = React.useRef(ratios);
  const normalizedRatios = React.useMemo(() => normalizeRatios(ratios), [ratios]);

  React.useEffect(() => {
    ratiosRef.current = ratios;
  }, [ratios]);

  React.useEffect(() => {
    setRatios((previousRatios) => reconcileRatios(previousRatios, previousIdsRef.current, itemIds));
    previousIdsRef.current = itemIds;
  }, [itemIds]);

  React.useEffect(() => {
    if (!separatorMovable || items.length <= 1) {
      return undefined;
    }

    const dragInstances = separatorRefs.current.map((separatorElement, separatorIndex) => {
      if (!separatorElement) {
        return undefined;
      }

      const handlePointerDown = (event: PointerEvent): void => {
        if (event.button !== 0) {
          return;
        }

        const containerElement = containerRef.current;

        if (!containerElement) {
          return;
        }

        dragSessionRef.current = {
          separatorIndex,
          startRatios: [...ratiosRef.current],
          containerSize: getPrimarySize(containerElement.getBoundingClientRect(), direction),
          startPosition: getPrimaryPosition(separatorElement.getBoundingClientRect(), direction),
        } satisfies DragSession;
      };

      separatorElement.addEventListener('pointerdown', handlePointerDown);

      const drag = new Drag(separatorElement, {
        getPose: (element) => {
          const rect = element.getBoundingClientRect();

          return {
            position: { x: rect.left, y: rect.top },
            width: rect.width,
            height: rect.height,
          } satisfies Pose;
        },
        setPose: (_element, pose) => {
          const dragSession = dragSessionRef.current;

          if (!dragSession || dragSession.separatorIndex !== separatorIndex || !pose.position) {
            return;
          }

          const primaryPosition = direction === 'horizontal' ? pose.position.x : pose.position.y;
          const delta = primaryPosition - dragSession.startPosition;

          setRatios(
            getUpdatedRatiosFromDelta(
              dragSession.startRatios,
              separatorIndex,
              dragSession.containerSize,
              delta,
            ),
          );
        },
        setPoseOnEnd: (_element, pose) => {
          const dragSession = dragSessionRef.current;

          if (!dragSession || dragSession.separatorIndex !== separatorIndex || !pose.position) {
            dragSessionRef.current = null;
            return;
          }

          const primaryPosition = direction === 'horizontal' ? pose.position.x : pose.position.y;
          const delta = primaryPosition - dragSession.startPosition;

          setRatios(
            getUpdatedRatiosFromDelta(
              dragSession.startRatios,
              separatorIndex,
              dragSession.containerSize,
              delta,
            ),
          );
          dragSessionRef.current = null;
        },
      });

      return {
        drag,
        separatorElement,
        handlePointerDown,
      };
    });

    return () => {
      dragSessionRef.current = null;
      dragInstances.forEach((instance) => {
        if (!instance) {
          return;
        }

        instance.separatorElement.removeEventListener('pointerdown', instance.handlePointerDown);
        instance.drag.setDisabled();
      });
    };
  }, [direction, items.length, separatorMovable]);

  return (
    <ResolvedThemeClassName theme={theme}>
      {(resolvedTheme) => (
        <div
          ref={containerRef}
          data-testid={dataTestId}
          className={mergeClasses(
            [
              'cm-split-area',
              `cm-split-area--${direction}`,
              separatorMovable ? 'cm-split-area--movable' : 'cm-split-area--static',
            ],
            resolvedTheme,
            className,
          )}
          style={style}
        >
          {items.map((item, index) => {
            const ratio = normalizedRatios[index] ?? 0;
            const panelStyle = {
              flex: `0 0 ${ratio * 100}%`,
            } satisfies React.CSSProperties;

            return (
              <React.Fragment key={item.id}>
                <div
                  data-split-area-panel={index}
                  className="cm-split-area__panel"
                  style={panelStyle}
                >
                  {item.node}
                </div>
                {index < items.length - 1 ? (
                  <div
                    ref={(element) => {
                      separatorRefs.current[index] = element;
                    }}
                    data-split-area-separator={index}
                    data-separator-orientation={
                      direction === 'horizontal' ? 'vertical' : 'horizontal'
                    }
                    className={[
                      'cm-split-area__separator',
                      `cm-split-area__separator--${direction}`,
                      separatorMovable
                        ? 'cm-split-area__separator--movable'
                        : 'cm-split-area__separator--static',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    <span className="cm-split-area__separator-handle" />
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </ResolvedThemeClassName>
  );
}
