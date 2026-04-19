import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CDock } from '../src/components/Dock/Dock';

describe('CDock', () => {
  it('renders children inside dock frame', () => {
    render(
      <CDock data-testid="dock-frame" defaultHeight={32}>
        <div>Dock content</div>
      </CDock>,
    );

    expect(screen.getByTestId('dock-frame')).toBeInTheDocument();
    expect(screen.getByText('Dock content')).toBeInTheDocument();
  });
});
