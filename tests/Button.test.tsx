import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CButton as PackageEntryCButton } from '../src';
import { CButton } from '../src/components/Button/Button';

describe('CButton', () => {
  it('exports CButton from package entry', () => {
    render(
      <PackageEntryCButton data-testid="button-package-entry">Package entry</PackageEntryCButton>,
    );

    const button = screen.getByTestId('button-package-entry');

    expect(PackageEntryCButton).toBe(CButton);
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('cm-button');
  });

  it('renders a native button with children', () => {
    render(<CButton data-testid="button-under-test">Click me</CButton>);

    const button = screen.getByRole('button', { name: 'Click me' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-testid', 'button-under-test');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveClass('cm-button');
  });

  it('defaults type to button', () => {
    render(<CButton>Default type</CButton>);

    expect(screen.getByRole('button', { name: 'Default type' })).toHaveAttribute('type', 'button');
  });

  it('applies variant modifier classes', () => {
    const { rerender } = render(<CButton variant="primary">Primary</CButton>);

    const button = screen.getByRole('button', { name: 'Primary' });

    expect(button).toHaveClass('cm-button');
    expect(button).toHaveClass('cm-button--primary');
    expect(button).not.toHaveClass('cm-button--ghost');

    rerender(<CButton variant="ghost">Ghost</CButton>);

    expect(screen.getByRole('button', { name: 'Ghost' })).toHaveClass('cm-button--ghost');
  });

  it('passes disabled through and blocks clicks', () => {
    const handleClick = jest.fn();

    render(
      <CButton disabled onClick={handleClick}>
        Disabled
      </CButton>,
    );

    const button = screen.getByRole('button', { name: 'Disabled' });

    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
