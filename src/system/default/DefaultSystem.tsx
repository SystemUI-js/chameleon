import React from 'react';
import { CSelect } from '@/components/Select/Select';
import { CWindow } from '@/components/Window/Window';
import { CWindowManager } from '@/components/Window/WindowManager';
import { CWindowTitle } from '@/components/Window/WindowTitle';
import { SYSTEM_TYPE_DEFINITIONS } from '@/system/registry';
import { resolveDevSelectionForSystemType } from '@/dev/themeSwitcher';
import type { SystemThemeSelection, SystemTypeDefinition, ThemeDefinition } from '../types';
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
  readonly onSelectionChange?: (selection: SystemThemeSelection) => void;
  readonly availableSystems?: readonly SystemTypeDefinition[];
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

export const DefaultSystem = ({
  themeDefinition,
  onSelectionChange,
  availableSystems = Object.values(SYSTEM_TYPE_DEFINITIONS),
}: DefaultSystemProps): React.ReactElement => {
  const [bootLayout] = React.useState<DefaultBootLayout>(() => DEFAULT_BOOT_LAYOUT);

  const handleSelectionChange = (nextValue: string): void => {
    onSelectionChange?.(resolveDevSelectionForSystemType(nextValue as SystemTypeDefinition['id']));
  };

  return (
    <DefaultScreen themeDefinition={themeDefinition}>
      <CWindowManager>
        <CWindow
          x={bootLayout.frame.x}
          y={bootLayout.frame.y}
          width={bootLayout.frame.width}
          height={bootLayout.frame.height}
        >
          <CWindowTitle className="cm-window__title-bar cm-window__title-bar--with-controls">
            <span data-testid="window-title-text" className="cm-window__title-bar__text">
              {bootLayout.title}
            </span>
            {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */}
            <fieldset
              className="cm-window__title-bar__controls"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span className="cm-window__title-bar__label">切换系统</span>
              <CSelect
                name="system-switch"
                aria-label="切换系统"
                options={availableSystems.map((s) => ({ label: s.label, value: s.id }))}
                value={SYSTEM_TYPE_DEFINITIONS.default.id}
                onChange={handleSelectionChange}
                data-testid="system-switch"
              />
            </fieldset>
          </CWindowTitle>
          {bootLayout.body}
        </CWindow>
      </CWindowManager>
    </DefaultScreen>
  );
};
