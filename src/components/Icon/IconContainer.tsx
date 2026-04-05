import { Drag, DragOperationType, type Pose } from '@system-ui-js/multi-drag';
import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import {
  CIcon,
  type CIconActiveTrigger,
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

export type CIconContainerItem = Omit<CIconProps, 'onDragStart' | 'onDrag' | 'onDragEnd'>;

type CIconContainerRuntimeItem = CIconContainerItem &
  Pick<CIconProps, 'onDragStart' | 'onDrag' | 'onDragEnd'>;

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
  suppressNativeContextMenu: boolean;
  dispatchingSyntheticContextMenu: boolean;
  removeDragStartListener: () => void;
};

const TOUCH_LONG_PRESS_DELAY_MS = 500;
const TOUCH_LONG_PRESS_MOVE_THRESHOLD_PX = 6;

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

function resolveThemeClass(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }

  return theme.startsWith('cm-theme--') ? theme : `cm-theme--${theme}`;
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

export function CIconContainer({
  iconList,
  config,
  className,
  theme,
  'data-testid': dataTestId,
}: CIconContainerProps): React.ReactElement {
  const resolvedTheme = resolveThemeClass(useTheme(theme));
  const baseClasses = ['cm-icon-container'];
  const isMountedRef = React.useRef(true);
  const slotElementRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const slotRecordsRef = React.useRef(new Map<number, IconSlotRecord>());
  const latestIconListRef = React.useRef<readonly CIconContainerRuntimeItem[]>(iconList);
  const latestConfigRef = React.useRef(config);
  const positionsRef = React.useRef<Array<CIconPosition | undefined>>([]);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(() =>
    getInitialActiveIndex(iconList),
  );
  const [positions, setPositions] = React.useState<Array<CIconPosition | undefined>>(() =>
    iconList.map((item) => getMergedPosition(item, config)),
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
      record.suppressNativeContextMenu = false;
      record.dispatchingSyntheticContextMenu = false;
      record.generation += 1;
      record.removeDragStartListener();
      record.drag.setDisabled();
      slotRecordsRef.current.delete(index);
    },
    [clearPointerSession],
  );

  React.useEffect(() => {
    setPositions(iconList.map((item) => getMergedPosition(item, config)));
  }, [config, iconList]);

  React.useEffect(() => {
    setActiveIndex((previousActiveIndex) => {
      if (previousActiveIndex !== null && previousActiveIndex < iconList.length) {
        return previousActiveIndex;
      }

      return getInitialActiveIndex(iconList);
    });
  }, [iconList]);

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
        suppressNativeContextMenu: false,
        dispatchingSyntheticContextMenu: false,
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
      record.suppressNativeContextMenu = false;
      record.dispatchingSyntheticContextMenu = false;

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
        currentRecord.dispatchingSyntheticContextMenu = false;
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
        currentRecord.dispatchingSyntheticContextMenu = true;
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

      if (record.dispatchingSyntheticContextMenu) {
        event.stopPropagation();
        return;
      }

      if (record.suppressNativeContextMenu) {
        record.suppressNativeContextMenu = false;
        event.preventDefault();
        event.stopPropagation();
      }
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
          setActiveIndex(nextActive ? index : null);
          onActive?.(nextActive);
        };

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
              active={activeIndex === index}
              onActive={handleActive}
              onContextMenu={onContextMenu}
            />
          </div>
        );
      })}
    </div>
  );
}
