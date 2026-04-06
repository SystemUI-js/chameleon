import { Drag, DragOperationType, type Pose } from '@system-ui-js/multi-drag';
import React from 'react';
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

type IconSlotPointerSession = {
  pointerId: number;
  firedLongPress: boolean;
  dragTakenOver: boolean;
  timerId?: number;
  cleanupDocumentListeners: () => void;
};

type IconSlotRecord = {
  element: HTMLDivElement;
  drag: Drag;
  generation: number;
  pointerSession?: IconSlotPointerSession;
  suppressedContextMenu?: {
    x: number;
    y: number;
    expiresAt: number;
  };
  removeDragStartListener: () => void;
};

const TOUCH_LONG_PRESS_DELAY_MS = 500;
const TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX = 6;
const SYNTHETIC_CONTEXT_MENU_SUPPRESSION_MS = 1000;

function getResolvedPosition(
  item: CIconContainerItem | undefined,
  config: CIconContainerConfig | undefined,
  explicitPosition: CIconPosition | undefined,
): CIconPosition {
  const mergedPosition = explicitPosition ?? (item ? getMergedPosition(item, config) : undefined);

  return mergedPosition ?? { x: 0, y: 0 };
}

function hasMovedBeyondLongPressThreshold(
  start: { x: number; y: number },
  next: { x: number; y: number },
): boolean {
  return (
    Math.abs(next.x - start.x) > TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX ||
    Math.abs(next.y - start.y) > TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX
  );
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

  const clearPointerSession = React.useCallback((record: IconSlotRecord): void => {
    const activeSession = record.pointerSession;

    if (!activeSession) {
      return;
    }

    if (activeSession.timerId !== undefined) {
      window.clearTimeout(activeSession.timerId);
    }

    activeSession.cleanupDocumentListeners();
    record.pointerSession = undefined;
  }, []);

  const cleanupSlotRecord = React.useCallback(
    (index: number): void => {
      const record = slotRecordsRef.current.get(index);

      if (!record) {
        return;
      }

      clearPointerSession(record);
      record.suppressedContextMenu = undefined;
      record.generation += 1;
      record.removeDragStartListener();
      record.drag.setDisabled();
      slotRecordsRef.current.delete(index);
    },
    [clearPointerSession],
  );

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

          if (currentRecord.pointerSession) {
            currentRecord.pointerSession.dragTakenOver = true;
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

          clearPointerSession(currentRecord);

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
        suppressedContextMenu: undefined,
        removeDragStartListener: () => undefined,
      };

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

        if (currentRecord.pointerSession) {
          currentRecord.pointerSession.dragTakenOver = true;
        }

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

  const handleTouchPointerDown = React.useCallback(
    (index: number, event: React.PointerEvent<HTMLDivElement>): void => {
      if (event.pointerType !== 'touch' || !isMountedRef.current) {
        return;
      }

      const record = slotRecordsRef.current.get(index);

      if (!record) {
        return;
      }

      clearPointerSession(record);
      record.suppressedContextMenu = undefined;

      const pointerId = event.pointerId;
      const startPoint = { x: event.clientX, y: event.clientY };

      const handlePointerMove = (nativeEvent: PointerEvent): void => {
        const currentRecord = slotRecordsRef.current.get(index);
        const activeSession = currentRecord?.pointerSession;

        if (
          !isMountedRef.current ||
          !currentRecord ||
          currentRecord !== record ||
          !activeSession ||
          nativeEvent.pointerId !== pointerId
        ) {
          return;
        }

        if (
          hasMovedBeyondLongPressThreshold(startPoint, {
            x: nativeEvent.clientX,
            y: nativeEvent.clientY,
          })
        ) {
          activeSession.dragTakenOver = true;
          clearPointerSession(currentRecord);
        }
      };

      const handlePointerEndLike = (nativeEvent: PointerEvent): void => {
        const currentRecord = slotRecordsRef.current.get(index);

        if (!currentRecord?.pointerSession || nativeEvent.pointerId !== pointerId) {
          return;
        }

        clearPointerSession(currentRecord);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerEndLike);
      document.addEventListener('pointercancel', handlePointerEndLike);

      const cleanupDocumentListeners = (): void => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerEndLike);
        document.removeEventListener('pointercancel', handlePointerEndLike);
      };

      const timerId = window.setTimeout(() => {
        const currentRecord = slotRecordsRef.current.get(index);
        const activeSession = currentRecord?.pointerSession;

        if (
          !isMountedRef.current ||
          !currentRecord ||
          currentRecord !== record ||
          !activeSession ||
          activeSession.pointerId !== pointerId ||
          activeSession.dragTakenOver ||
          activeSession.firedLongPress
        ) {
          return;
        }

        const buttonElement = currentRecord.element.querySelector('button');

        if (!(buttonElement instanceof HTMLButtonElement)) {
          clearPointerSession(currentRecord);
          return;
        }

        activeSession.firedLongPress = true;
        setActiveIndex(index);
        buttonElement.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: startPoint.x,
            clientY: startPoint.y,
            button: 2,
          }),
        );
        currentRecord.suppressedContextMenu = {
          x: startPoint.x,
          y: startPoint.y,
          expiresAt: Date.now() + SYNTHETIC_CONTEXT_MENU_SUPPRESSION_MS,
        };
        clearPointerSession(currentRecord);
      }, TOUCH_LONG_PRESS_DELAY_MS);

      record.pointerSession = {
        pointerId,
        firedLongPress: false,
        dragTakenOver: false,
        timerId,
        cleanupDocumentListeners,
      };
    },
    [clearPointerSession],
  );

  const handleTouchPointerCancel = React.useCallback(
    (index: number): void => {
      const record = slotRecordsRef.current.get(index);

      if (!record) {
        return;
      }

      clearPointerSession(record);
    },
    [clearPointerSession],
  );

  const handleContextMenuCapture = React.useCallback(
    (index: number, event: React.SyntheticEvent<HTMLDivElement, MouseEvent>): void => {
      const record = slotRecordsRef.current.get(index);

      if (!record) {
        return;
      }

      if (!record.suppressedContextMenu) {
        return;
      }

      if (Date.now() > record.suppressedContextMenu.expiresAt) {
        record.suppressedContextMenu = undefined;
        return;
      }

      const isSameLongPressLocation =
        Math.abs(event.nativeEvent.clientX - record.suppressedContextMenu.x) <=
          TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX &&
        Math.abs(event.nativeEvent.clientY - record.suppressedContextMenu.y) <=
          TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX;

      if (!isSameLongPressLocation) {
        return;
      }

      record.suppressedContextMenu = undefined;
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

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
              handleTouchPointerDown(index, event);
            }}
            onPointerCancel={() => {
              handleTouchPointerCancel(index);
            }}
            onContextMenuCapture={(event) => {
              handleContextMenuCapture(index, event);
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
