import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ResolvedThemeClassName,
  mergeClasses,
  Theme as PackageEntryTheme,
  Theme,
  useTheme,
} from '../src';

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

    const themeProbe = screen.getByTestId('theme-probe');
    const providerWrapper = themeProbe.parentElement as HTMLElement;

    expect(PackageEntryTheme).toBe(Theme);
    expect(themeProbe).toHaveAttribute('data-theme', 'cm-theme--win98');
    expect(providerWrapper).toHaveClass('cm-theme--win98');
    expect(providerWrapper).not.toHaveClass('win98');
  });

  it('provides theme from provider', () => {
    render(
      <Theme name="winxp">
        <ThemeProbe />
      </Theme>,
    );

    expect(screen.getByTestId('theme-probe')).toHaveAttribute('data-theme', 'cm-theme--winxp');
  });

  it('uses explicit theme prop before provider theme', () => {
    render(
      <Theme name="win98">
        <ThemeProbe theme="default" />
      </Theme>,
    );

    expect(screen.getByTestId('theme-probe')).toHaveAttribute('data-theme', 'cm-theme--default');
  });

  describe('nested Theme rejection', () => {
    it('rejects directly nested Theme', () => {
      expect(() =>
        render(
          <Theme name="win98">
            <Theme name="winxp">
              <ThemeProbe />
            </Theme>
          </Theme>,
        ),
      ).toThrow('Nested Theme is not supported');
    });

    it('rejects nested Theme with different names', () => {
      expect(() =>
        render(
          <Theme name="theme-a">
            <Theme name="theme-b">
              <ThemeProbe />
            </Theme>
          </Theme>,
        ),
      ).toThrow('Nested Theme is not supported');
    });

    it('rejects nested Theme with the same name', () => {
      expect(() =>
        render(
          <Theme name="win98">
            <Theme name="win98">
              <ThemeProbe />
            </Theme>
          </Theme>,
        ),
      ).toThrow('Nested Theme is not supported');
    });

    it('rejects three-level deep nested Theme', () => {
      expect(() =>
        render(
          <Theme name="level1">
            <Theme name="level2">
              <Theme name="level3">
                <ThemeProbe />
              </Theme>
            </Theme>
          </Theme>,
        ),
      ).toThrow('Nested Theme is not supported');
    });

    it('rejects nested Theme even when outer provider has blank name', () => {
      expect(() =>
        render(
          <Theme name="   ">
            <Theme name="win98">
              <ThemeProbe />
            </Theme>
          </Theme>,
        ),
      ).toThrow('Nested Theme is not supported');
    });
  });

  it('does not inject a theme for empty provider values', () => {
    render(
      <Theme name="   ">
        <ThemeProbe />
      </Theme>,
    );

    expect(screen.getByTestId('theme-probe')).not.toHaveAttribute('data-theme');
  });

  it('blank outer provider still counts as a provider node for nesting boundary', () => {
    render(
      <Theme name="   ">
        <ThemeProbe theme="explicit-override" />
      </Theme>,
    );

    expect(screen.getByTestId('theme-probe')).toHaveAttribute(
      'data-theme',
      'cm-theme--explicit-override',
    );
  });

  it('returns undefined when no explicit theme or provider exists', () => {
    render(<ThemeProbe />);

    expect(screen.getByTestId('theme-probe')).not.toHaveAttribute('data-theme');
  });

  it('normalizes short theme names in shared resolver', () => {
    render(
      <ResolvedThemeClassName theme="win98">
        {(resolvedTheme) => <div data-testid="resolved-theme" data-theme={resolvedTheme} />}
      </ResolvedThemeClassName>,
    );

    expect(screen.getByTestId('resolved-theme')).toHaveAttribute('data-theme', 'cm-theme--win98');
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
