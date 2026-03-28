import React from 'react';
import { CStartBar } from '@/components/StartBar/StartBar';
import { CWindow } from '@/components/Window/Window';
import { CWindowManager } from '@/components/Window/WindowManager';
import { CWindowTitle } from '@/components/Window/WindowTitle';
import type { ThemeDefinition } from '../types';
import { WindowsScreen } from './WindowsScreen';
import { CWindowBody } from '@/components';

interface WindowBootLayout {
  readonly title: string;
  readonly bodyTestId: string;
  readonly bodyText: string;
  readonly frame: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
}

export interface WindowsSystemProps {
  readonly themeDefinition: ThemeDefinition;
}

const WINDOWS_BOOT_LAYOUT: WindowBootLayout = {
  title: 'Windows Window',
  bodyTestId: 'windows-window-body',
  bodyText: 'Windows content',
  frame: {
    x: 24,
    y: 24,
    width: 320,
    height: 220,
  },
};

const createWindowsBootLayoutBody = (layout: WindowBootLayout): React.ReactElement => (
  <div data-testid={layout.bodyTestId}>{layout.bodyText}</div>
);

export const WindowsSystem = ({ themeDefinition }: WindowsSystemProps): React.ReactElement => {
  const [bootLayout] = React.useState<WindowBootLayout>(() => WINDOWS_BOOT_LAYOUT);

  return (
    <WindowsScreen themeDefinition={themeDefinition}>
      <CWindowManager>
        <CWindow
          x={bootLayout.frame.x}
          y={bootLayout.frame.y}
          width={bootLayout.frame.width}
          height={bootLayout.frame.height}
        >
          <CWindowTitle>{bootLayout.title}</CWindowTitle>
          <CWindowBody>{createWindowsBootLayoutBody(bootLayout)}</CWindowBody>
        </CWindow>
      </CWindowManager>
      <CStartBar data-testid="windows-start-bar" startLabel="Start" />
    </WindowsScreen>
  );
};
