import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CStartBar } from '../src/components/StartBar/StartBar';

describe('CStartBar', () => {
  it('renders start button and content area', () => {
    render(
      <CStartBar data-testid="start-bar" startLabel="开始">
        <div>Items</div>
      </CStartBar>,
    );

    expect(screen.getByTestId('start-bar')).toBeInTheDocument();
    expect(screen.getByText('开始')).toBeInTheDocument();
    expect(screen.getByTestId('start-bar-content')).toBeInTheDocument();
  });
});
