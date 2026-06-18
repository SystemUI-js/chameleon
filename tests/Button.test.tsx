import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { CButton as PackageEntryCButton, Theme } from '../src';
import { CButton } from '../src/components/Button/Button';

function MenuTriggerProbe({
  children,
}: {
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}): React.ReactElement {
  return React.cloneElement(children, {
    'aria-haspopup': 'menu',
    'aria-expanded': false,
    'aria-controls': 'menu-popup',
  });
}

const readThemeStyles = (theme: 'win98' | 'winxp'): string =>
  readFileSync(join(process.cwd(), 'src', 'theme', theme, 'styles', 'index.scss'), 'utf8');

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

  describe('size prop', () => {
    it('defaults to medium size', () => {
      render(<CButton data-testid="default-size">Default</CButton>);

      expect(screen.getByTestId('default-size')).toHaveClass('cm-button', 'cm-button--medium');
    });

    it('applies explicit size class', () => {
      const { rerender } = render(
        <CButton size="compact" data-testid="sized">
          Compact
        </CButton>,
      );

      expect(screen.getByTestId('sized')).toHaveClass('cm-button', 'cm-button--compact');

      rerender(
        <CButton size="small" data-testid="sized">
          Small
        </CButton>,
      );
      expect(screen.getByTestId('sized')).toHaveClass('cm-button', 'cm-button--small');

      rerender(
        <CButton size="large" data-testid="sized">
          Large
        </CButton>,
      );
      expect(screen.getByTestId('sized')).toHaveClass('cm-button', 'cm-button--large');
    });
  });

  describe('displayType prop', () => {
    it('defaults to rect display type', () => {
      render(<CButton data-testid="default-display">Default</CButton>);

      expect(screen.getByTestId('default-display')).toHaveClass('cm-button', 'cm-button--rect');
    });

    it('applies round display type class', () => {
      render(
        <CButton displayType="round" data-testid="round-btn">
          Round
        </CButton>,
      );

      expect(screen.getByTestId('round-btn')).toHaveClass('cm-button', 'cm-button--round');
    });

    it('applies custom borderRadius when displayType is round', () => {
      render(
        <CButton displayType="round" borderRadius="8px" data-testid="custom-radius">
          Custom
        </CButton>,
      );

      expect(screen.getByTestId('custom-radius')).toHaveStyle({ borderRadius: '8px' });
    });

    it('uses default 50% borderRadius when displayType is round', () => {
      render(
        <CButton displayType="round" data-testid="default-radius">
          Default
        </CButton>,
      );

      expect(screen.getByTestId('default-radius')).toHaveStyle({ borderRadius: '50%' });
    });

    it('does not apply borderRadius style when displayType is rect', () => {
      render(
        <CButton displayType="rect" borderRadius="8px" data-testid="rect-no-radius">
          Rect
        </CButton>,
      );

      expect(screen.getByTestId('rect-no-radius')).not.toHaveStyle({ borderRadius: '8px' });
    });
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

    it('keeps button theme selectors self-scoped in theme styles', () => {
      expect(readThemeStyles('win98')).toContain('&.cm-button');
      expect(readThemeStyles('win98')).toContain('&.cm-button--primary');
      expect(readThemeStyles('win98')).toContain('&.cm-button--ghost');
      expect(readThemeStyles('winxp')).toContain('&.cm-button');
      expect(readThemeStyles('winxp')).toContain('&.cm-button--primary');
      expect(readThemeStyles('winxp')).toContain('&.cm-button--ghost');
    });
  });

  describe('showActiveEffect prop', () => {
    it('does not add no-active class by default', () => {
      render(<CButton data-testid="default-active">Default</CButton>);

      const button = screen.getByTestId('default-active');

      expect(button).not.toHaveClass('cm-button--no-active');
    });

    it('adds no-active class when showActiveEffect is false', () => {
      render(
        <CButton showActiveEffect={false} data-testid="no-active">
          No Active
        </CButton>,
      );

      const button = screen.getByTestId('no-active');

      expect(button).toHaveClass('cm-button--no-active');
    });

    it('does not add no-active class when showActiveEffect is true', () => {
      render(
        <CButton showActiveEffect={true} data-testid="with-active">
          With Active
        </CButton>,
      );

      const button = screen.getByTestId('with-active');

      expect(button).not.toHaveClass('cm-button--no-active');
    });

    it('keeps no-active combinable with variants', () => {
      render(
        <>
          <CButton showActiveEffect={false} variant="primary" data-testid="no-active-primary">
            No Active Primary
          </CButton>
          <CButton showActiveEffect={false} variant="ghost" data-testid="no-active-ghost">
            No Active Ghost
          </CButton>
        </>,
      );

      expect(screen.getByTestId('no-active-primary')).toHaveClass(
        'cm-button',
        'cm-button--primary',
        'cm-button--no-active',
      );
      expect(screen.getByTestId('no-active-ghost')).toHaveClass(
        'cm-button',
        'cm-button--ghost',
        'cm-button--no-active',
      );
    });
  });

  describe('showFocusEffect prop', () => {
    it('does not add no-focus class by default', () => {
      render(<CButton data-testid="default-focus">Default</CButton>);

      const button = screen.getByTestId('default-focus');

      expect(button).not.toHaveClass('cm-button--no-focus');
      expect(button).not.toHaveAttribute('tabindex');
    });

    it('adds no-focus class and tabIndex=-1 when showFocusEffect is false', () => {
      render(
        <CButton showFocusEffect={false} data-testid="no-focus">
          No Focus
        </CButton>,
      );

      const button = screen.getByTestId('no-focus');

      expect(button).toHaveClass('cm-button--no-focus');
      expect(button).toHaveAttribute('tabindex', '-1');
    });

    it('does not add no-focus class when showFocusEffect is true', () => {
      render(
        <CButton showFocusEffect={true} data-testid="with-focus">
          With Focus
        </CButton>,
      );

      const button = screen.getByTestId('with-focus');

      expect(button).not.toHaveClass('cm-button--no-focus');
      expect(button).not.toHaveAttribute('tabindex');
    });

    it('keeps no-focus combinable with variants', () => {
      render(
        <>
          <CButton showFocusEffect={false} variant="primary" data-testid="no-focus-primary">
            No Focus Primary
          </CButton>
          <CButton showFocusEffect={false} variant="ghost" data-testid="no-focus-ghost">
            No Focus Ghost
          </CButton>
        </>,
      );

      expect(screen.getByTestId('no-focus-primary')).toHaveClass(
        'cm-button',
        'cm-button--primary',
        'cm-button--no-focus',
      );
      expect(screen.getByTestId('no-focus-primary')).toHaveAttribute('tabindex', '-1');

      expect(screen.getByTestId('no-focus-ghost')).toHaveClass(
        'cm-button',
        'cm-button--ghost',
        'cm-button--no-focus',
      );
      expect(screen.getByTestId('no-focus-ghost')).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('active prop', () => {
    it('does not add active class by default', () => {
      render(<CButton data-testid="default-active-state">Default</CButton>);

      const button = screen.getByTestId('default-active-state');

      expect(button).not.toHaveClass('cm-button--active');
    });

    it('adds active class when active is true', () => {
      render(
        <CButton active data-testid="forced-active">
          Active
        </CButton>,
      );

      const button = screen.getByTestId('forced-active');

      expect(button).toHaveClass('cm-button--active');
    });

    it('does not add active class when active is false', () => {
      render(
        <CButton active={false} data-testid="not-active">
          Not Active
        </CButton>,
      );

      const button = screen.getByTestId('not-active');

      expect(button).not.toHaveClass('cm-button--active');
    });

    it('keeps active combinable with variants', () => {
      render(
        <>
          <CButton active variant="primary" data-testid="active-primary">
            Active Primary
          </CButton>
          <CButton active variant="ghost" data-testid="active-ghost">
            Active Ghost
          </CButton>
        </>,
      );

      expect(screen.getByTestId('active-primary')).toHaveClass(
        'cm-button',
        'cm-button--primary',
        'cm-button--active',
      );
      expect(screen.getByTestId('active-ghost')).toHaveClass(
        'cm-button',
        'cm-button--ghost',
        'cm-button--active',
      );
    });

    it('works with other props combined', () => {
      render(
        <CButton
          active
          showActiveEffect={false}
          size="compact"
          variant="primary"
          data-testid="full-active-combo"
        >
          Full Combo
        </CButton>,
      );

      const button = screen.getByTestId('full-active-combo');

      expect(button).toHaveClass(
        'cm-button',
        'cm-button--primary',
        'cm-button--compact',
        'cm-button--active',
        'cm-button--no-active',
      );
    });
  });

  describe('combined showActiveEffect and showFocusEffect', () => {
    it('adds both no-active and no-focus classes when both are false', () => {
      render(
        <CButton showActiveEffect={false} showFocusEffect={false} data-testid="no-effects">
          No Effects
        </CButton>,
      );

      const button = screen.getByTestId('no-effects');

      expect(button).toHaveClass('cm-button', 'cm-button--no-active', 'cm-button--no-focus');
      expect(button).toHaveAttribute('tabindex', '-1');
    });

    it('works with compact and variants', () => {
      render(
        <CButton
          showActiveEffect={false}
          showFocusEffect={false}
          variant="primary"
          size="compact"
          data-testid="full-combo"
        >
          Full Combo
        </CButton>,
      );

      const button = screen.getByTestId('full-combo');

      expect(button).toHaveClass(
        'cm-button',
        'cm-button--primary',
        'cm-button--compact',
        'cm-button--no-active',
        'cm-button--no-focus',
      );
      expect(button).toHaveAttribute('tabindex', '-1');
    });
  });
});
