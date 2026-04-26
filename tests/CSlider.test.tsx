import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { CSlider as PackageEntryCSlider } from '../src';
import { CSlider } from '../src/components/CSlider';

function ControlledSlider(): React.ReactElement {
  const [value, setValue] = React.useState(20);

  return (
    <CSlider
      data-testid="controlled-slider"
      min={0}
      max={100}
      step={10}
      value={value}
      onChange={setValue}
    />
  );
}

describe('CSlider', () => {
  it('exports CSlider from package entry', () => {
    expect(PackageEntryCSlider).toBe(CSlider);
  });

  it('renders fill using the normalized current value', () => {
    render(<CSlider data-testid="slider" min={0} max={100} value={120} />);
    expect(screen.getByTestId('slider-fill')).toHaveStyle({ width: '100%' });
  });

  it('advances value when track is pressed', () => {
    render(<ControlledSlider />);
    fireEvent.click(screen.getByTestId('controlled-slider-track'));
    expect(screen.getByTestId('controlled-slider-fill')).toHaveStyle({ width: '30%' });
  });
});
