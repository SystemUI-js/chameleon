import type { StyleProp, ViewStyle } from '../../runtime/react-native-web';
import type { DockPosition } from './Dock';

export function getDockEdgeStyle(
  resolvedPosition: DockPosition,
  gapStart: number,
  gapEnd: number,
  thickness?: number,
): ViewStyle {
  switch (resolvedPosition) {
    case 'top':
      return {
        top: 0,
        left: gapStart,
        right: gapEnd,
        height: thickness,
      };
    case 'bottom':
      return {
        bottom: 0,
        left: gapStart,
        right: gapEnd,
        height: thickness,
      };
    case 'left':
      return {
        left: 0,
        top: gapStart,
        bottom: gapEnd,
        width: thickness,
      };
    case 'right':
      return {
        right: 0,
        top: gapStart,
        bottom: gapEnd,
        width: thickness,
      };
  }
}

export function getDockFrameClassName(resolvedPosition: DockPosition, className?: string): string {
  const classNames = ['cm-dock', `cm-dock--${resolvedPosition}`];

  if (className) {
    classNames.push(className);
  }

  return classNames.join(' ');
}

export function getDockFrameStyle(
  dockEdgeStyle: ViewStyle,
  propsStyle?: StyleProp<ViewStyle>,
): ViewStyle {
  const visualStyle = Array.isArray(propsStyle)
    ? Object.assign({}, ...propsStyle.filter((entry): entry is ViewStyle => entry != null))
    : { ...(propsStyle ?? {}) };

  delete visualStyle.position;
  delete visualStyle.top;
  delete visualStyle.right;
  delete visualStyle.bottom;
  delete visualStyle.left;
  delete visualStyle.width;
  delete visualStyle.height;

  return {
    ...visualStyle,
    ...dockEdgeStyle,
    position: 'absolute',
  };
}
