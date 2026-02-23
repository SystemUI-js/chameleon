import {
  ReactNode,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './Taskbar.scss';
import { useThemeBehavior } from '../theme/ThemeContext';
import type { StartMenuHeightLevel } from '../theme/types';

const DEFAULT_START_MENU_LEVEL: StartMenuHeightLevel = '1x';

export function normalizeStartMenuLevel(input: unknown): StartMenuHeightLevel {
  if (input === '2x') return '2x';
  return '1x';
}

function resolveSnappedLevel(options: {
  baseLevel: StartMenuHeightLevel;
  deltaY: number;
  directionFactor: 1 | -1;
  switchThresholdPx: number;
}): StartMenuHeightLevel {
  const { baseLevel, deltaY, directionFactor, switchThresholdPx } = options;
  const normalizedDeltaY = deltaY * directionFactor;
  if (baseLevel === '1x' && normalizedDeltaY >= switchThresholdPx) return '2x';
  if (baseLevel === '2x' && normalizedDeltaY <= -switchThresholdPx) return '1x';
  return baseLevel;
}

export interface TaskbarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  startButton?: ReactNode;
  startMenu?: ReactNode;
  defaultStartMenuOpen?: boolean;
  startMenuOpen?: boolean;
  onStartMenuOpenChange?: (open: boolean) => void;
  defaultStartMenuLevel?: StartMenuHeightLevel;
  startMenuLevel?: StartMenuHeightLevel;
  onStartMenuLevelChange?: (level: StartMenuHeightLevel) => void;
}

export const Taskbar = forwardRef<HTMLDivElement, TaskbarProps>(
  (
    {
      children,
      startButton,
      startMenu,
      defaultStartMenuOpen = false,
      startMenuOpen,
      onStartMenuOpenChange,
      defaultStartMenuLevel = DEFAULT_START_MENU_LEVEL,
      startMenuLevel,
      onStartMenuLevelChange,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const behavior = useThemeBehavior();
    const isDiscreteHeightEnabled = behavior.startMenuDiscreteHeight.enabled;
    const levelHeights = behavior.startMenuDiscreteHeight.levelHeights;
    const switchThresholdPx = behavior.startMenuDiscreteHeight.switchThresholdPx;
    const resizeDirectionFactor: 1 | -1 = behavior.startMenuMount === 'bottom' ? -1 : 1;

    const isOpenControlled = startMenuOpen !== undefined;
    const [openState, setOpenState] = useState(defaultStartMenuOpen);
    const isMenuOpen = isOpenControlled ? startMenuOpen : openState;

    const isLevelControlled = startMenuLevel !== undefined;
    const [levelState, setLevelState] = useState<StartMenuHeightLevel>(
      normalizeStartMenuLevel(defaultStartMenuLevel),
    );
    const normalizedControlledLevel = normalizeStartMenuLevel(startMenuLevel);
    const menuLevel = isLevelControlled ? normalizedControlledLevel : levelState;

    const dragStartYRef = useRef(0);
    const dragBaseLevelRef = useRef<StartMenuHeightLevel>(menuLevel);
    const pointerIdRef = useRef<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);

    const setMenuOpen = useCallback(
      (next: boolean) => {
        if (!isOpenControlled) setOpenState(next);
        onStartMenuOpenChange?.(next);
      },
      [isOpenControlled, onStartMenuOpenChange],
    );

    const setMenuLevel = useCallback(
      (next: StartMenuHeightLevel) => {
        const normalized = normalizeStartMenuLevel(next);
        if (!isLevelControlled) setLevelState(normalized);
        onStartMenuLevelChange?.(normalized);
      },
      [isLevelControlled, onStartMenuLevelChange],
    );

    useEffect(() => {
      if (!isResizing) return;

      const handlePointerMove = (event: PointerEvent) => {
        if (pointerIdRef.current !== event.pointerId) return;
        const deltaY = event.clientY - dragStartYRef.current;
        const nextLevel = resolveSnappedLevel({
          baseLevel: dragBaseLevelRef.current,
          deltaY,
          directionFactor: resizeDirectionFactor,
          switchThresholdPx,
        });
        setMenuLevel(nextLevel);
      };

      const handlePointerUp = (event: PointerEvent) => {
        if (pointerIdRef.current !== event.pointerId) return;
        const deltaY = event.clientY - dragStartYRef.current;
        const finalLevel = resolveSnappedLevel({
          baseLevel: dragBaseLevelRef.current,
          deltaY,
          directionFactor: resizeDirectionFactor,
          switchThresholdPx,
        });
        setMenuLevel(finalLevel);
        pointerIdRef.current = null;
        setIsResizing(false);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);

      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }, [isResizing, resizeDirectionFactor, setMenuLevel, switchThresholdPx]);

    const startAreaProps = useMemo(
      () =>
        startMenu
          ? {
              role: 'button' as const,
              tabIndex: 0,
              'aria-expanded': Boolean(isMenuOpen),
              onClick: () => setMenuOpen(!isMenuOpen),
              onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                setMenuOpen(!isMenuOpen);
              },
            }
          : {},
      [isMenuOpen, setMenuOpen, startMenu],
    );

    const onResizeHandlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDiscreteHeightEnabled) return;
      event.preventDefault();
      event.stopPropagation();
      pointerIdRef.current = event.pointerId;
      dragStartYRef.current = event.clientY;
      dragBaseLevelRef.current = menuLevel;
      setIsResizing(true);
    };

    const cls = ['cm-taskbar', className].filter(Boolean).join(' ');
    const startMenuCls = [
      'cm-taskbar__start-menu',
      `cm-taskbar__start-menu--${behavior.startMenuMount}`,
      `cm-taskbar__start-menu--${menuLevel}`,
      isResizing ? 'is-resizing' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={cls} {...rest}>
        <div className="cm-taskbar__start" {...startAreaProps}>
          {startButton}
          {startMenu && isMenuOpen ? (
            <div
              className={startMenuCls}
              style={{ height: `${levelHeights[menuLevel]}px` }}
              data-level={menuLevel}
              data-resize-enabled={isDiscreteHeightEnabled}
            >
              <div className="cm-taskbar__start-menu-content">{startMenu}</div>
              {isDiscreteHeightEnabled ? (
                <div
                  className="cm-taskbar__start-menu-resize-handle"
                  onPointerDown={onResizeHandlePointerDown}
                  data-direction="s"
                />
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="cm-taskbar__items">{children}</div>
        <div className="cm-taskbar__system-tray" />
      </div>
    );
  },
);

Taskbar.displayName = 'Taskbar';

export default Taskbar;
