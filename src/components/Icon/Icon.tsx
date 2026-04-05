import type React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CIconPosition = { x: number; y: number };

export type CIconActiveTrigger = 'click' | 'hover';

export type CIconOpenTrigger = 'click' | 'doubleClick';

export interface CIconProps {
  title?: string;
  icon: React.ReactNode;
  active?: boolean;
  onActive?: (active: boolean) => void;
  activeTrigger?: CIconActiveTrigger;
  onDragStart?: (position: CIconPosition) => void;
  onDrag?: (position: CIconPosition) => void;
  onDragEnd?: (position: CIconPosition) => void;
  position?: CIconPosition;
  onContextMenu?: (event: React.MouseEvent) => void;
  onOpen?: () => void;
  openTrigger?: CIconOpenTrigger;
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

export function CIcon({
  title,
  icon,
  active,
  onActive,
  activeTrigger,
  onDragStart: _onDragStart,
  onDrag: _onDrag,
  onDragEnd: _onDragEnd,
  position,
  onContextMenu,
  onOpen,
  openTrigger,
  className,
  theme,
  'data-testid': dataTestId,
}: CIconProps): React.ReactElement {
  const resolvedTheme = resolveThemeClass(useTheme(theme));
  const baseClasses = ['cm-icon'];

  if (active) {
    baseClasses.push('cm-icon--active');
  }

  const inlineStyle: React.CSSProperties = {};
  if (position !== undefined) {
    inlineStyle.position = 'absolute';
    inlineStyle.left = position.x;
    inlineStyle.top = position.y;
  }

  const shouldHandleClick = activeTrigger === 'click' || openTrigger === 'click';
  const shouldHandleDoubleClick = openTrigger === 'doubleClick';
  const shouldHandleMouseEnter = activeTrigger === 'hover';
  const shouldHandleContextMenu = onActive !== undefined || onContextMenu !== undefined;

  const handleClick = (): void => {
    if (activeTrigger === 'click') {
      onActive?.(true);
    }

    if (openTrigger === 'click') {
      onOpen?.();
    }
  };

  const handleDoubleClick = (): void => {
    if (openTrigger === 'doubleClick') {
      onOpen?.();
    }
  };

  const handleMouseEnter = (): void => {
    if (activeTrigger === 'hover') {
      onActive?.(true);
    }
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onActive?.(true);
    onContextMenu?.(event);
  };

  return (
    <button
      type="button"
      data-testid={dataTestId}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      style={position !== undefined ? inlineStyle : undefined}
      onClick={shouldHandleClick ? handleClick : undefined}
      onDoubleClick={shouldHandleDoubleClick ? handleDoubleClick : undefined}
      onMouseEnter={shouldHandleMouseEnter ? handleMouseEnter : undefined}
      onContextMenu={shouldHandleContextMenu ? handleContextMenu : undefined}
    >
      <span className="cm-icon__content">{icon}</span>
      {title !== undefined && <span className="cm-icon__title">{title}</span>}
    </button>
  );
}
