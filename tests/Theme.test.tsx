import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Theme as PackageEntryTheme, mergeClasses, Theme, useTheme } from '../src';

interface ThemeProbeProps {
  theme?: string;
}

function ThemeProbe({ theme }: ThemeProbeProps): React.ReactElement {
  const resolvedTheme = useTheme(theme);

  return <div data-testid="theme-probe" data-theme={resolvedTheme} />;
}

describe('Theme', () => {
  it('exports Theme from package entry', () => {
    render(
      <PackageEntryTheme name="win98">
        <ThemeProbe />
      </PackageEntryTheme>,
    );

    expect(PackageEntryTheme).toBe(Theme);
    expect(screen.getByTestId('theme-probe')).toHaveAttribute('data-theme', 'win98');
  });

  it('provides theme from provider', () => {
    render(
      <Theme name="winxp">
        <ThemeProbe />
      </Theme>,
    );

    expect(screen.getByTestId('theme-probe')).toHaveAttribute('data-theme', 'winxp');
  });

  it('uses explicit theme prop before provider theme', () => {
    render(
      <Theme name="win98">
        <ThemeProbe theme="default" />
      </Theme>,
    );

    expect(screen.getByTestId('theme-probe')).toHaveAttribute('data-theme', 'default');
  });

  it('uses the nearest nested provider theme', () => {
    render(
      <Theme name="win98">
        <Theme name="winxp">
          <ThemeProbe />
        </Theme>
      </Theme>,
    );

    expect(screen.getByTestId('theme-probe')).toHaveAttribute('data-theme', 'winxp');
  });

  it('does not inject a theme for empty provider values', () => {
    render(
      <Theme name="   ">
        <ThemeProbe />
      </Theme>,
    );

    expect(screen.getByTestId('theme-probe')).not.toHaveAttribute('data-theme');
  });

  it('returns undefined when no explicit theme or provider exists', () => {
    render(<ThemeProbe />);

    expect(screen.getByTestId('theme-probe')).not.toHaveAttribute('data-theme');
  });
});

describe('mergeClasses', () => {
  it('merges classes in order and removes duplicates', () => {
    expect(
      mergeClasses(
        ['cm-button', 'cm-button--primary'],
        'cm-theme--win98',
        'custom cm-button cm-theme--win98 custom',
      ),
    ).toBe('cm-button cm-button--primary cm-theme--win98 custom');
  });

  it('returns base classes when theme and className are absent', () => {
    expect(mergeClasses(['cm-button', 'cm-button--ghost'])).toBe('cm-button cm-button--ghost');
  });
});
