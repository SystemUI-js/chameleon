import React from 'react';
import { CWindow, type CWindowProps } from './Window';

export function createWindow(props: CWindowProps): React.ReactElement {
  return React.createElement(CWindow, props);
}

export { CWindow, type CWindowProps } from './Window';
export { CWindowTitle, type WindowPosition } from './WindowTitle';
export type { CWindowResizeOptions } from './Window';
