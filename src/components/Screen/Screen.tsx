import React from 'react';
import { generateUUID } from '@/utils/uuid';
import { CGrid } from './Grid';

interface Props {
  children?: React.ReactNode;
  className?: string;
  screenClassName?: string;
  systemType?: string;
  theme?: string;
}

export class CScreen extends React.Component<Props> {
  public uuid = generateUUID();

  public render(): React.ReactElement {
    const { children, className, screenClassName, systemType, theme } = this.props;

    return (
      <div
        data-testid="screen-root"
        className={className}
        data-system-type={systemType}
        data-theme={theme}
      >
        <CGrid grid={[3, 3]} className={screenClassName ? `c-grid ${screenClassName}` : undefined}>
          {children}
        </CGrid>
      </div>
    );
  }
}

// 本来想搞跨屏拖动的，但是感觉有一些问题无法解决，比如：组件树的序列化问题，组件状态（比如滚动位置）无法同步。如果以后打算做跨屏拖动，尽量让状态统一存在同一个地方
