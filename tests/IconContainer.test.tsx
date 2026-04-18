import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { CIconContainer } from '../src/components/Icon/IconContainer';

describe('CIconContainer', () => {
  it('renders one slot per icon', () => {
    render(<CIconContainer iconList={[{ label: 'A' }, { label: 'B' }]} />);

    expect(screen.getByTestId('icon-slot-0')).toBeInTheDocument();
    expect(screen.getByTestId('icon-slot-1')).toBeInTheDocument();
  });

  it('fires active callback when slot is pressed', () => {
    const handleActive = jest.fn();
    render(<CIconContainer iconList={[{ label: 'A', onActive: handleActive }]} />);
    fireEvent.click(screen.getByTestId('icon-slot-0'));
    expect(handleActive).toHaveBeenCalledWith(true);
  });
});
