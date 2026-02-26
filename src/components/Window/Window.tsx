import { generateUUID } from '@/utils/uuid';
import React from 'react';

export class CWindow extends React.Component {
  public uuid = generateUUID();
  render() {
    return <div>{this.uuid}</div>;
  }
}
