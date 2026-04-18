import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { CWindow } from '../src/components/Window/Window';
import { CWindowBody } from '../src/components/Window/WindowBody';
import { CWindowTitle } from '../src/components/Window/WindowTitle';

describe('CWindow composition', () => {
  it('renders title and body within a window frame', () => {
    render(
      <CWindow x={10} y={20} width={240} height={160}>
        <CWindowTitle>Window</CWindowTitle>
        <CWindowBody>Body content</CWindowBody>
      </CWindow>,
    );

    expect(screen.getByTestId('window-frame')).toBeInTheDocument();
    expect(screen.getByTestId('window-title')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('keeps action buttons visible in title', () => {
    render(
      <CWindow>
        <CWindowTitle actionButton={<span>X</span>}>Actions</CWindowTitle>
      </CWindow>,
    );

    fireEvent.click(screen.getByTestId('window-title'));
    expect(screen.getByText('X')).toBeInTheDocument();
  });
});
