import React from 'react';
import { View } from '../../runtime/react-native-web';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import {
  CIcon,
  type CIconActiveTrigger,
  type CIconDragCallbacks,
  type CIconOpenTrigger,
  type CIconPosition,
  type CIconProps,
} from './Icon';

export type { CIconActiveTrigger, CIconOpenTrigger };

export interface CIconContainerConfig {
  position?: CIconPosition;
  activeTrigger?: CIconActiveTrigger;
  openTrigger?: CIconOpenTrigger;
}

export type CIconContainerItem = CIconProps;

export interface CIconContainerProps {
  iconList: readonly CIconContainerItem[];
  config?: CIconContainerConfig;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

type CIconContainerRuntimeItem = CIconContainerItem & CIconDragCallbacks;

type IconSlotRecord = {
  cleanup: () => void;
  element: HTMLElement;
};

type IconDragSession = {
  didMove: boolean;
  index: number;
  latestPosition: CIconPosition;
  startPosition: CIconPosition;
  startX: number;
  startY: number;
};

function getMergedPosition(
  item: CIconContainerItem,
  config: CIconContainerConfig | undefined,
): CIconPosition | undefined {
  return item.position ?? config?.position;
}

function getResolvedPosition(
  item: CIconContainerItem | undefined,
  config: CIconContainerConfig | undefined,
  explicitPosition: CIconPosition | undefined,
): CIconPosition {
  return explicitPosition ?? (item ? getMergedPosition(item, config) : undefined) ?? { x: 0, y: 0 };
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

function createPositionUpdater(
  index: number,
  position: CIconPosition,
): (prev: Array<CIconPosition | undefined>) => Array<CIconPosition | undefined> {
  return (previousPositions) => {
    const currentPosition = previousPositions[index];

    if (arePositionsEqual(currentPosition, position)) {
      return previousPositions;
    }

    const nextPositions = [...previousPositions];
    nextPositions[index] = position;
    return nextPositions;
  };
}

function createDragMoveHandler(
  session: IconDragSession,
  latestIconListRef: React.MutableRefObject<readonly CIconContainerRuntimeItem[]>,
  setPositions: React.Dispatch<React.SetStateAction<Array<CIconPosition | undefined>>>,
): (event: MouseEvent) => void {
  return (nativeEvent: MouseEvent): void => {
    const nextPosition = {
      x: session.startPosition.x + (nativeEvent.clientX - session.startX),
      y: session.startPosition.y + (nativeEvent.clientY - session.startY),
    };

    if (!session.didMove && arePositionsEqual(nextPosition, session.startPosition)) {
      return;
    }

    session.didMove = true;
    session.latestPosition = nextPosition;
    setPositions(createPositionUpdater(session.index, nextPosition));
    latestIconListRef.current[session.index]?.onDrag?.(nextPosition);
  };
}

function attachIconDragHandlers(
  element: HTMLElement,
  index: number,
  latestIconListRef: React.MutableRefObject<readonly CIconContainerRuntimeItem[]>,
  latestConfigRef: React.MutableRefObject<CIconContainerConfig | undefined>,
  positionsRef: React.MutableRefObject<Array<CIconPosition | undefined>>,
  setPositions: React.Dispatch<React.SetStateAction<Array<CIconPosition | undefined>>>,
): () => void {
  const handleMouseDown = (event: MouseEvent): void => {
    if (event.button !== 0) {
      return;
    }

    const startPosition = getResolvedPosition(
      latestIconListRef.current[index],
      latestConfigRef.current,
      positionsRef.current[index],
    );
    const session: IconDragSession = {
      didMove: false,
      index,
      latestPosition: startPosition,
      startPosition,
      startX: event.clientX,
      startY: event.clientY,
    };

    latestIconListRef.current[index]?.onDragStart?.(startPosition);

    const handleMouseMove = createDragMoveHandler(session, latestIconListRef, setPositions);
    const handleMouseUp = (): void => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      if (!session.didMove) {
        return;
      }

      latestIconListRef.current[index]?.onDragEnd?.(session.latestPosition);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  element.addEventListener('mousedown', handleMouseDown);

  return () => {
    element.removeEventListener('mousedown', handleMouseDown);
  };
}

export function CIconContainer({
  iconList,
  config,
  className,
  theme,
  'data-testid': dataTestId,
}: CIconContainerProps): React.ReactElement {
  const controlledActiveIndex = iconList.findIndex((item) => item.active);
  const containerElementRef = React.useRef<HTMLElement | null>(null);
  const latestIconListRef = React.useRef<readonly CIconContainerRuntimeItem[]>(iconList);
  const latestConfigRef = React.useRef(config);
  const slotRecordsRef = React.useRef(new Map<number, IconSlotRecord>());
  const initialPositions = React.useMemo(
    () => iconList.map((item) => getMergedPosition(item, config)),
    [config, iconList],
  );
  const propPositionsRef = React.useRef(initialPositions);
  const [positions, setPositions] =
    React.useState<Array<CIconPosition | undefined>>(initialPositions);
  const positionsRef = React.useRef(positions);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(
    controlledActiveIndex >= 0 ? controlledActiveIndex : null,
  );

  React.useEffect(() => {
    latestIconListRef.current = iconList;
    latestConfigRef.current = config;
    positionsRef.current = positions;
  }, [config, iconList, positions]);

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
    if (controlledActiveIndex >= 0) {
      setActiveIndex(controlledActiveIndex);
    }
  }, [controlledActiveIndex]);

  React.useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const container = containerElementRef.current;

    if (!(container instanceof HTMLElement)) {
      return;
    }

    const slotElements = container.querySelectorAll<HTMLElement>('[data-testid^="icon-slot-"]');
    const activeIndexes = new Set<number>();
    const slotRecords = slotRecordsRef.current;

    slotElements.forEach((element, index) => {
      activeIndexes.add(index);
      const existingRecord = slotRecords.get(index);

      if (existingRecord?.element === element) {
        return;
      }

      existingRecord?.cleanup();

      slotRecords.set(index, {
        element,
        cleanup: attachIconDragHandlers(
          element,
          index,
          latestIconListRef,
          latestConfigRef,
          positionsRef,
          setPositions,
        ),
      });
    });

    for (const [index, record] of slotRecords.entries()) {
      if (!activeIndexes.has(index) || index >= iconList.length) {
        record.cleanup();
        slotRecords.delete(index);
      }
    }

    return () => {
      for (const record of slotRecords.values()) {
        record.cleanup();
      }
      slotRecords.clear();
    };
  }, [iconList.length]);

  return (
    <View
      ref={(element) => {
        containerElementRef.current = element as HTMLElement | null;
      }}
      testID={dataTestId ?? 'icon-container'}
      className={mergeClasses(['cm-icon-container'], normalizeThemeClassName(theme), className)}
    >
      {iconList.map((item, index) => {
        const { onActive, ...restItemProps } = item;
        const position = positions[index];
        const isActive = index === activeIndex;
        const key = item['data-testid'] ?? `icon-item-${index}`;
        const resolvedActiveTrigger = item.activeTrigger ?? config?.activeTrigger ?? 'click';
        const resolvedOpenTrigger = item.openTrigger ?? config?.openTrigger;

        return (
          <View key={key} testID={`icon-slot-${index}`}>
            <CIcon
              {...restItemProps}
              data-testid={`icon-item-${index}`}
              position={position}
              active={isActive}
              activeTrigger={resolvedActiveTrigger}
              openTrigger={resolvedOpenTrigger}
              onActive={(nextActive) => {
                setActiveIndex(nextActive ? index : null);
                onActive?.(nextActive);
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
