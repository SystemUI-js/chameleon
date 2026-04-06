import React from 'react';
import { CScreen } from '@/components/Screen/Screen';
import type { ThemeDefinition } from '../types';

interface DefaultScreenProps {
  readonly children?: React.ReactNode;
  readonly themeDefinition: ThemeDefinition;
}

const DEFAULT_SYSTEM_CLASS_NAME = 'cm-system--default';

export class DefaultScreen extends React.Component<DefaultScreenProps> {
  public render(): React.ReactElement {
    const { children, themeDefinition } = this.props;

    return (
      <CScreen
        className={`${DEFAULT_SYSTEM_CLASS_NAME} ${themeDefinition.className}`}
        systemType={themeDefinition.systemType}
        theme={themeDefinition.id}
      >
        {children}
      </CScreen>
    );
  }
}
