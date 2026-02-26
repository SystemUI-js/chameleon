import { CScreen } from '@/components/Screen/Screen';
import { CWindow } from '@/components/Window/Window';
import { CWindowManager } from '@/components/Window/WindowManager';
import React from 'react';

export class Win98Theme extends React.Component {
  render() {
    return (
      <CScreen>
        <CWindowManager>
          <CWindow />
        </CWindowManager>
      </CScreen>
    );
  }
}
