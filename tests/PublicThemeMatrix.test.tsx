import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CDock, CStartBar, CWidget, CWindow, CWindowTitle } from '../src';

describe('RN-hosted component chain', () => {
  it('renders dock, start bar, widget and window without DOM-only assumptions', () => {
    render(
      <>
        <CDock data-testid="theme-matrix-dock" defaultHeight={24} />
        <CStartBar data-testid="theme-matrix-startbar" defaultHeight={24} />
        <CWidget />
        <CWindow>
          <CWindowTitle>Window</CWindowTitle>
        </CWindow>
      </>,
    );

    expect(screen.getByTestId('theme-matrix-dock')).toBeInTheDocument();
    expect(screen.getByTestId('theme-matrix-startbar')).toBeInTheDocument();
    expect(screen.getAllByTestId('widget-frame').length).toBeGreaterThan(0);
    expect(screen.getByTestId('window-title')).toBeInTheDocument();
  });
});
