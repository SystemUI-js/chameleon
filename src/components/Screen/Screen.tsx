import React from 'react';
import { CGrid } from './Grid';
import { generateUUID } from '@/utils/uuid';

interface Props {
  children?: React.ReactNode;
}

export class CScreen extends React.Component<Props> {
  public uuid = generateUUID();
  render() {
    return <CGrid grid={[3, 3]}>{this.props.children}</CGrid>;
  }
}

// 本来想搞跨屏拖动的，但是感觉有一些问题无法解决，比如：组件树的序列化问题，组件状态（比如滚动位置）无法同步。如果以后打算做跨屏拖动，尽量让状态统一存在同一个地方
