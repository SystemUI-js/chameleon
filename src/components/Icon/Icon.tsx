import type React from 'react';
import { Text, View } from 'react-native';
import { mergeClasses } from '../Theme/mergeClasses';
import { resolveThemeClassName } from '../Theme/themeName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CIconPosition = { x: number; y: number };

export type CIconActiveTrigger = 'click' | 'hover';

export type CIconOpenTrigger = 'click' | 'doubleClick';

export interface CIconDragCallbacks {
  onDragStart?: (position: CIconPosition) => void;
  onDrag?: (position: CIconPosition) => void;
  onDragEnd?: (position: CIconPosition) => void;
}

export interface CIconProps {
  title?: string;
  icon: React.ReactNode;
  active?: boolean;
  onActive?: (active: boolean) => void;
  activeTrigger?: CIconActiveTrigger;
  position?: CIconPosition;
  onContextMenu?: (event: React.MouseEvent) => void;
  onOpen?: () => void;
  openTrigger?: CIconOpenTrigger;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

export function CIcon({
  title,
  icon,
  active,
  onActive,
  activeTrigger,
  position,
  onContextMenu,
  onOpen,
  openTrigger,
  className,
  theme,
  'data-testid': dataTestId,
}: CIconProps): React.ReactElement {
  const resolvedTheme = resolveThemeClassName(useTheme(theme));
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

  const handleContextMenu = (event: React.MouseEvent<HTMLElement>): void => {
    onActive?.(true);
    onContextMenu?.(event);
  };

  return (
    <View
      testID={dataTestId}
      role="button"
      tabIndex={0}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      style={position !== undefined ? inlineStyle : undefined}
      onClick={shouldHandleClick ? handleClick : undefined}
      onDoubleClick={shouldHandleDoubleClick ? handleDoubleClick : undefined}
      onMouseEnter={shouldHandleMouseEnter ? handleMouseEnter : undefined}
      onContextMenu={shouldHandleContextMenu ? handleContextMenu : undefined}
    >
      <View className="cm-icon__content">{icon}</View>
      {title !== undefined && <Text className="cm-icon__title">{title}</Text>}
    </View>
  );
}
