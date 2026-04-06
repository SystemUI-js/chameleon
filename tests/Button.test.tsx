import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CButton } from '../src/components/Button/Button';
import { CButton as PackageEntryCButton, Theme } from '../src';

function MenuTriggerProbe({ children }: { children: React.ReactElement }): React.ReactElement {
  return React.cloneElement(children, {
    'aria-haspopup': 'menu',
    'aria-expanded': false,
    'aria-controls': 'menu-popup',
  });
}

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

  it('forwards aria props injected by cloneElement', () => {
    render(
      <MenuTriggerProbe>
        <CButton data-testid="menu-trigger">Open menu</CButton>
      </MenuTriggerProbe>,
    );

    const button = screen.getByRole('button', { name: 'Open menu' });

    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'menu-popup');
  });

  describe('theme prop', () => {
    it('applies theme class from explicit theme prop', () => {
      render(<CButton theme="cm-theme--win98">Themed</CButton>);

      const button = screen.getByRole('button', { name: 'Themed' });

      expect(button).toHaveClass('cm-button');
      expect(button).toHaveClass('cm-theme--win98');
    });

    it('applies theme class from Theme provider when no explicit prop', () => {
      render(
        <Theme name="win98">
          <CButton data-testid="provider-themed">Provider Theme</CButton>
        </Theme>,
      );

      const button = screen.getByTestId('provider-themed');

      expect(button).toHaveClass('cm-button');
      expect(button).toHaveClass('cm-theme--win98');
    });

    it('explicit theme prop overrides Theme provider', () => {
      render(
        <Theme name="win98">
          <CButton theme="cm-theme--winxp" data-testid="override-themed">
            Override
          </CButton>
        </Theme>,
      );

      const button = screen.getByTestId('override-themed');

      expect(button).toHaveClass('cm-button');
      expect(button).toHaveClass('cm-theme--winxp');
      expect(button).not.toHaveClass('cm-theme--win98');
    });

    it('merges className with theme following correct order: base → theme → className', () => {
      render(
        <CButton className="custom-class" theme="cm-theme--win98">
          Merged
        </CButton>,
      );

      const button = screen.getByRole('button', { name: 'Merged' });

      expect(button).toHaveClass('cm-button');
      expect(button).toHaveClass('cm-theme--win98');
      expect(button).toHaveClass('custom-class');
    });
  });
});
