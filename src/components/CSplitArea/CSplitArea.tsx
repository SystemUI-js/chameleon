import React from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from '../../runtime/react-native-web';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CSplitAreaDirection = 'horizontal' | 'vertical';

export interface CSplitAreaProps {
  readonly children?: React.ReactNode;
  readonly direction?: CSplitAreaDirection;
  readonly separatorMovable?: boolean;
  readonly className?: string;
  readonly theme?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly 'data-testid'?: string;
}

type DragSession = {
  readonly index: number;
  readonly startCoordinate: number;
  readonly availableSize: number;
  readonly startRatios: readonly number[];
};

const MIN_PANEL_SIZE = 24;

function createEqualRatios(count: number): number[] {
  if (count <= 0) return [];
  return Array.from({ length: count }, () => 1 / count);
}

function getCoordinate(
  event: Pick<MouseEvent, 'clientX' | 'clientY'>,
  direction: CSplitAreaDirection,
): number {
  return direction === 'horizontal' ? event.clientX : event.clientY;
}

function getAvailableSize(element: HTMLElement, direction: CSplitAreaDirection): number {
  const rect = element.getBoundingClientRect();
  return direction === 'horizontal' ? rect.width : rect.height;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function resizeRatios(session: DragSession, coordinate: number): number[] {
  const nextRatios = [...session.startRatios];
  const beforeRatio = session.startRatios[session.index] ?? 0;
  const afterRatio = session.startRatios[session.index + 1] ?? 0;
  const pairRatio = beforeRatio + afterRatio;

  if (session.availableSize <= 0 || pairRatio <= 0) {
    return nextRatios;
  }

  const beforeStartSize = beforeRatio * session.availableSize;
  const afterStartSize = afterRatio * session.availableSize;
  const minSize = Math.min(MIN_PANEL_SIZE, (beforeStartSize + afterStartSize) / 2);
  const delta = clamp(
    coordinate - session.startCoordinate,
    minSize - beforeStartSize,
    afterStartSize - minSize,
  );

  nextRatios[session.index] = (beforeStartSize + delta) / session.availableSize;
  nextRatios[session.index + 1] = (afterStartSize - delta) / session.availableSize;

  return nextRatios;
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
  const items = React.Children.toArray(children).filter(Boolean);
  const rootRef = React.useRef<HTMLElement | null>(null);
  const dragSessionRef = React.useRef<DragSession | null>(null);
  const [ratios, setRatios] = React.useState<number[]>(() => createEqualRatios(items.length));
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const rootClassName = mergeClasses(
    ['cm-split-area', `cm-split-area--${direction}`],
    resolvedTheme,
    className,
  );

  React.useEffect(() => {
    setRatios(createEqualRatios(items.length));
  }, [items.length]);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent): void => {
      const session = dragSessionRef.current;

      if (session === null) {
        return;
      }

      setRatios(resizeRatios(session, getCoordinate(event, direction)));
    };

    const handleMouseUp = (): void => {
      dragSessionRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [direction]);

  const startSeparatorDrag = (index: number, event: React.MouseEvent<HTMLElement>): void => {
    if (!separatorMovable || event.button !== 0 || rootRef.current === null) {
      return;
    }

    event.preventDefault();
    dragSessionRef.current = {
      index,
      startCoordinate: getCoordinate(event.nativeEvent, direction),
      availableSize: getAvailableSize(rootRef.current, direction),
      startRatios: ratios,
    };
  };

  return (
    <View
      ref={rootRef}
      testID={dataTestId}
      className={rootClassName}
      style={[style, { flexDirection: direction === 'horizontal' ? 'row' : 'column' }]}
    >
      {items.map((item, index) => {
        const key =
          React.isValidElement(item) && item.key !== null ? String(item.key) : `panel-${index}`;

        return (
          <React.Fragment key={key}>
            <View
              testID={`${dataTestId ?? 'split-area'}-panel-${index}`}
              className="cm-split-area__panel"
              data-split-area-panel="true"
              style={{ flexGrow: ratios[index] ?? 0, flexShrink: 1, flexBasis: 0 }}
            >
              {item}
            </View>
            {index < items.length - 1 ? (
              <Pressable
                testID={`${dataTestId ?? 'split-area'}-separator-${index}`}
                aria-label="Resize split area panels"
                className={mergeClasses(
                  [
                    'cm-split-area__separator',
                    `cm-split-area__separator--${direction}`,
                    separatorMovable
                      ? 'cm-split-area__separator--movable'
                      : 'cm-split-area__separator--static',
                  ],
                  undefined,
                  undefined,
                )}
                disabled={!separatorMovable}
                onMouseDown={(event) => {
                  startSeparatorDrag(index, event);
                }}
              >
                <View aria-hidden="true" className="cm-split-area__separator-handle" />
              </Pressable>
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}
