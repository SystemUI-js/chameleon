import { Drag, DragOperationType, type Pose } from '@system-ui-js/multi-drag';
import React from 'react';
import { createLongPressController, type UseLongPressResult } from '../shared/useLongPress';
import { mergeClasses } from '../Theme/mergeClasses';
import { resolveThemeClassName } from '../Theme/themeName';
import { useTheme } from '../Theme/useTheme';
import {
  CIcon,
  type CIconActiveTrigger,
  type CIconDragCallbacks,
  type CIconOpenTrigger,
  type CIconPosition,
  type CIconProps,
} from './Icon';
import './index.scss';

export type { CIconActiveTrigger, CIconOpenTrigger };

export interface CIconContainerConfig {
  position?: CIconPosition;
  activeTrigger?: CIconActiveTrigger;
  openTrigger?: CIconOpenTrigger;
}

export type CIconContainerItem = CIconProps;

type CIconContainerRuntimeItem = CIconContainerItem & CIconDragCallbacks;

type IconSlotRecord = {
  element: HTMLDivElement;
  drag: Drag;
  generation: number;
  longPress: UseLongPressResult;
  removeDragStartListener: () => void;
};

function getResolvedPosition(
  item: CIconContainerItem | undefined,
  config: CIconContainerConfig | undefined,
  explicitPosition: CIconPosition | undefined,
): CIconPosition {
  const mergedPosition = explicitPosition ?? (item ? getMergedPosition(item, config) : undefined);

  return mergedPosition ?? { x: 0, y: 0 };
}

export interface CIconContainerProps {
  iconList: readonly CIconContainerItem[];
  config?: CIconContainerConfig;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

function getInitialActiveIndex(iconList: readonly CIconContainerItem[]): number | null {
  const initialIndex = iconList.findIndex((item) => item.active);
  return initialIndex >= 0 ? initialIndex : null;
}

function getMergedPosition(
  item: CIconContainerItem,
  config: CIconContainerConfig | undefined,
): CIconPosition | undefined {
  return item.position ?? config?.position;
}

function getItemSlotKey(index: number): string {
  return `icon-item-slot-${index}`;
}

function createPositionUpdater(
  index: number,
  position: CIconPosition,
): (prev: Array<CIconPosition | undefined>) => Array<CIconPosition | undefined> {
  return (previousPositions) => {
    const nextPositions = [...previousPositions];
    nextPositions[index] = position;
    return nextPositions;
  };
}

function arePositionsEqual(
  left: CIconPosition | undefined,
  right: CIconPosition | undefined,
): boolean {
  if (left === right) {
    return true;
  }

  if (left === undefined || right === undefined) {
    return false;
  }

  return left.x === right.x && left.y === right.y;
}

function arePositionListsEqual(
  left: readonly (CIconPosition | undefined)[],
  right: readonly (CIconPosition | undefined)[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((position, index) => arePositionsEqual(position, right[index]));
}

export function CIconContainer({
  iconList,
  config,
  className,
  theme,
  'data-testid': dataTestId,
}: CIconContainerProps): React.ReactElement {
  const resolvedTheme = resolveThemeClassName(useTheme(theme));
  const baseClasses = ['cm-icon-container'];
  const isMountedRef = React.useRef(true);
  const slotElementRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const slotRecordsRef = React.useRef(new Map<number, IconSlotRecord>());
  const latestIconListRef = React.useRef<readonly CIconContainerRuntimeItem[]>(iconList);
  const latestConfigRef = React.useRef(config);
  const hadExplicitActiveRef = React.useRef(iconList.some((item) => item.active !== undefined));
  const propPositionsRef = React.useRef<Array<CIconPosition | undefined>>(
    iconList.map((item) => getMergedPosition(item, config)),
  );
  const positionsRef = React.useRef<Array<CIconPosition | undefined>>([]);
  const isActiveControlled = iconList.some((item) => item.active !== undefined);
  const controlledActiveIndex = isActiveControlled ? getInitialActiveIndex(iconList) : null;
  const [activeIndex, setActiveIndex] = React.useState<number | null>(() =>
    getInitialActiveIndex(iconList),
  );
  const [positions, setPositions] = React.useState<Array<CIconPosition | undefined>>(
    () => propPositionsRef.current,
  );

  React.useEffect(() => {
    latestIconListRef.current = iconList;
    latestConfigRef.current = config;
    positionsRef.current = positions;
  }, [config, iconList, positions]);

  const cleanupSlotRecord = React.useCallback((index: number): void => {
    const record = slotRecordsRef.current.get(index);

    if (!record) {
      return;
    }

    record.longPress.cancel();
    record.generation += 1;
    record.removeDragStartListener();
    record.drag.setDisabled();
    slotRecordsRef.current.delete(index);
  }, []);

  React.useEffect(() => {
    const nextPropPositions = iconList.map((item) => getMergedPosition(item, config));

    if (!arePositionListsEqual(propPositionsRef.current, nextPropPositions)) {
      propPositionsRef.current = nextPropPositions;
      setPositions(nextPropPositions);
      return;
    }

    propPositionsRef.current = nextPropPositions;
  }, [config, iconList]);

  React.useEffect(() => {
    const hadExplicitActive = hadExplicitActiveRef.current;

    if (!isActiveControlled) {
      setActiveIndex((previousActiveIndex) => {
        if (hadExplicitActive) {
          return null;
        }

        if (previousActiveIndex !== null && previousActiveIndex < iconList.length) {
          return previousActiveIndex;
        }

        return null;
      });
    }

    hadExplicitActiveRef.current = isActiveControlled;
  }, [iconList.length, isActiveControlled]);

  React.useEffect(() => {
    isMountedRef.current = true;
    const recordsSnapshot = slotRecordsRef.current;

    return () => {
      isMountedRef.current = false;
      for (const index of Array.from(recordsSnapshot.keys())) {
        cleanupSlotRecord(index);
      }
      slotElementRefs.current = [];
    };
  }, [cleanupSlotRecord]);

  React.useEffect(() => {
    const activeIndexes = new Set<number>();

    slotElementRefs.current.forEach((element, index) => {
      if (!element) {
        cleanupSlotRecord(index);
        return;
      }

      activeIndexes.add(index);
      const existingRecord = slotRecordsRef.current.get(index);

      if (existingRecord?.element === element) {
        return;
      }

      if (existingRecord) {
        cleanupSlotRecord(index);
      }

      const drag = new Drag(element, {
        getPose: () => {
          const latestItem = latestIconListRef.current[index];
          const explicitPosition = positionsRef.current[index];
          const resolvedPosition = getResolvedPosition(
            latestItem,
            latestConfigRef.current,
            explicitPosition,
          );
          const rect = element.getBoundingClientRect();

          return {
            position: resolvedPosition,
            width: rect.width,
            height: rect.height,
          } satisfies Pose;
        },
        setPose: (_element, pose) => {
          const currentRecord = slotRecordsRef.current.get(index);

          if (
            !isMountedRef.current ||
            !currentRecord ||
            currentRecord.element !== element ||
            currentRecord.generation !== record.generation ||
            !pose.position
          ) {
            return;
          }

          if (currentRecord.longPress) {
            currentRecord.longPress.cancel();
          }

          const nextPosition = { x: pose.position.x, y: pose.position.y };

          setPositions(createPositionUpdater(index, nextPosition));

          latestIconListRef.current[index]?.onDrag?.(nextPosition);
        },
        setPoseOnEnd: (_element, pose) => {
          const currentRecord = slotRecordsRef.current.get(index);

          if (
            !isMountedRef.current ||
            !currentRecord ||
            currentRecord.element !== element ||
            currentRecord.generation !== record.generation
          ) {
            return;
          }

          currentRecord.longPress.cancel();

          if (!pose.position) {
            return;
          }

          const nextPosition = { x: pose.position.x, y: pose.position.y };
          latestIconListRef.current[index]?.onDragEnd?.(nextPosition);
        },
      });

      const record: IconSlotRecord = {
        element,
        drag,
        generation: 0,
        longPress: null as unknown as UseLongPressResult,
        removeDragStartListener: () => undefined,
      };

      const handleLongPress = (clientX: number, clientY: number): void => {
        if (!isMountedRef.current) {
          return;
        }

        const currentRecord = slotRecordsRef.current.get(index);

        if (
          !currentRecord ||
          currentRecord.element !== element ||
          currentRecord.generation !== record.generation
        ) {
          return;
        }

        const buttonElement = currentRecord.element.querySelector('button');

        if (!(buttonElement instanceof HTMLButtonElement)) {
          currentRecord.longPress.cancel();
          return;
        }

        setActiveIndex(index);
        buttonElement.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
            button: 2,
          }),
        );
        currentRecord.longPress.suppressContextMenuAt({ x: clientX, y: clientY });
        currentRecord.longPress.cancel();
      };

      const longPress = createLongPressController({
        onLongPress: ({ clientX, clientY }) => {
          handleLongPress(clientX, clientY);
        },
        pointerType: 'touch',
      });

      record.longPress = longPress;

      const handleDragStart = (): void => {
        const currentRecord = slotRecordsRef.current.get(index);

        if (
          !isMountedRef.current ||
          !currentRecord ||
          currentRecord.element !== element ||
          currentRecord.generation !== record.generation
        ) {
          return;
        }

        const nextPosition = getResolvedPosition(
          latestIconListRef.current[index],
          latestConfigRef.current,
          positionsRef.current[index],
        );

        currentRecord.longPress.cancel();

        latestIconListRef.current[index]?.onDragStart?.(nextPosition);
      };

      drag.addEventListener(DragOperationType.Start, handleDragStart);
      record.removeDragStartListener = () => {
        drag.removeEventListener(DragOperationType.Start, handleDragStart);
      };
      slotRecordsRef.current.set(index, record);
    });

    for (const index of Array.from(slotRecordsRef.current.keys())) {
      if (!activeIndexes.has(index) || index >= iconList.length) {
        cleanupSlotRecord(index);
      }
    }
  });

  return (
    <div
      data-testid={dataTestId ?? 'icon-container'}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
    >
      {iconList.map((item, index) => {
        const { onActive, onContextMenu, ...restItemProps } = item;
        const finalPosition = positions[index];
        const finalActiveTrigger = item.activeTrigger ?? config?.activeTrigger;
        const finalOpenTrigger = item.openTrigger ?? config?.openTrigger;

        const handleActive = (nextActive: boolean): void => {
          if (!isActiveControlled) {
            setActiveIndex(nextActive ? index : null);
          }

          onActive?.(nextActive);
        };

        const isItemActive = (isActiveControlled ? controlledActiveIndex : activeIndex) === index;

        return (
          <div
            key={getItemSlotKey(index)}
            ref={(element) => {
              slotElementRefs.current[index] = element;
            }}
            style={{ display: 'inline-flex' }}
            onPointerDown={(event) => {
              slotRecordsRef.current.get(index)?.longPress.onPointerDown(event);
            }}
            onPointerCancel={(event) => {
              slotRecordsRef.current.get(index)?.longPress.onPointerCancel(event);
            }}
            onPointerLeave={(event) => {
              slotRecordsRef.current.get(index)?.longPress.onPointerLeave(event);
            }}
            onContextMenuCapture={(event) => {
              slotRecordsRef.current.get(index)?.longPress.onContextMenuCapture(event);
            }}
          >
            <CIcon
              {...restItemProps}
              data-testid={`icon-item-${index}`}
              position={finalPosition}
              activeTrigger={finalActiveTrigger}
              openTrigger={finalOpenTrigger}
              active={isItemActive}
              onActive={handleActive}
              onContextMenu={onContextMenu}
            />
          </div>
        );
      })}
    </div>
  );
}
