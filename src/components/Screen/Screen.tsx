import React from 'react';
import { View } from 'react-native';
import { generateUUID } from '@/utils/uuid';
import { CGrid } from '../Grid';

interface CScreenProps {
  children?: React.ReactNode;
  className?: string;
  screenClassName?: string;
  systemType?: string;
  theme?: string;
}

export class CScreen extends React.Component<CScreenProps> {
  public uuid = generateUUID();

  public render(): React.ReactElement {
    const { children, className, screenClassName, systemType, theme } = this.props;

    return (
      <View
        testID="screen-root"
        className={className}
        data-system-type={systemType}
        data-theme={theme}
        style={{ position: 'relative', width: '100%', minHeight: '100vh' }}
      >
        <CGrid grid={[3, 3]} className={screenClassName ? `c-grid ${screenClassName}` : undefined}>
          {children}
        </CGrid>
      </View>
    );
  }
}
