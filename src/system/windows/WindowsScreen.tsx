import React from 'react';
import { CScreen } from '@/components/Screen/Screen';
import type { ThemeDefinition } from '../types';

interface WindowsScreenProps {
  readonly children?: React.ReactNode;
  readonly themeDefinition: ThemeDefinition;
}

const WINDOWS_SYSTEM_CLASS_NAME = 'cm-system--windows';

export class WindowsScreen extends React.Component<WindowsScreenProps> {
  public render(): React.ReactElement {
    const { children, themeDefinition } = this.props;

    return (
      <CScreen
        className={`${WINDOWS_SYSTEM_CLASS_NAME} ${themeDefinition.className}`}
        systemType={themeDefinition.systemType}
        theme={themeDefinition.id}
      >
        {children}
      </CScreen>
    );
  }
}
