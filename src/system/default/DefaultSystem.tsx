import React from 'react';
import { CWindow } from '@/components/Window/Window';
import { CWindowManager } from '@/components/Window/WindowManager';
import { CWindowTitle } from '@/components/Window/WindowTitle';
import type { ThemeDefinition } from '../types';
import { DefaultScreen } from './DefaultScreen';

interface DefaultBootLayout {
  readonly title: string;
  readonly body: React.ReactElement;
  readonly frame: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
}

export interface DefaultSystemProps {
  readonly themeDefinition: ThemeDefinition;
}

const DEFAULT_BOOT_LAYOUT: DefaultBootLayout = {
  title: 'Default Window',
  body: <div data-testid="default-window-body">Default content</div>,
  frame: {
    x: 32,
    y: 28,
    width: 332,
    height: 228,
  },
};

export const DefaultSystem = ({ themeDefinition }: DefaultSystemProps): React.ReactElement => {
  const [bootLayout] = React.useState<DefaultBootLayout>(() => DEFAULT_BOOT_LAYOUT);

  return (
    <DefaultScreen themeDefinition={themeDefinition}>
      <CWindowManager>
        <CWindow
          x={bootLayout.frame.x}
          y={bootLayout.frame.y}
          width={bootLayout.frame.width}
          height={bootLayout.frame.height}
        >
          <CWindowTitle>{bootLayout.title}</CWindowTitle>
          {bootLayout.body}
        </CWindow>
      </CWindowManager>
    </DefaultScreen>
  );
};
