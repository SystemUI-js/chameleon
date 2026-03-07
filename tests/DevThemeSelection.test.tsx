import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  DevThemeRoot,
  DEFAULT_DEV_THEME,
  DEV_THEME,
  resolveDevThemeComponent,
} from '../src/dev/themeSwitcher';
import { DefaultTheme } from '../src/theme/default';
import { Win98Theme } from '../src/theme/win98';
import { WinXpTheme } from '../src/theme/winxp';

describe('dev theme selection', () => {
  it('maps default constant to DefaultTheme', () => {
    expect(resolveDevThemeComponent(DEV_THEME.default)).toBe(DefaultTheme);
  });

  it('maps win98 constant to Win98Theme', () => {
    expect(resolveDevThemeComponent(DEV_THEME.win98)).toBe(Win98Theme);
  });

  it('maps winxp constant to WinXpTheme', () => {
    expect(resolveDevThemeComponent(DEV_THEME.winxp)).toBe(WinXpTheme);
  });

  it('uses default as the shared default theme constant', () => {
    expect(DEFAULT_DEV_THEME).toBe(DEV_THEME.default);
  });

  it('renders default branch when activeTheme is omitted', () => {
    render(<DevThemeRoot />);

    expect(screen.getByTestId('default-window-body')).toBeInTheDocument();
    expect(screen.queryByTestId('win98-window-body')).not.toBeInTheDocument();
    expect(screen.queryByTestId('winxp-window-body')).not.toBeInTheDocument();
  });

  it('renders win98 branch when activeTheme is win98', () => {
    render(<DevThemeRoot activeTheme={DEV_THEME.win98} />);

    expect(screen.getByTestId('win98-window-body')).toBeInTheDocument();
    expect(screen.queryByTestId('default-window-body')).not.toBeInTheDocument();
    expect(screen.queryByTestId('winxp-window-body')).not.toBeInTheDocument();
  });

  it('renders winxp branch when activeTheme is winxp', () => {
    render(<DevThemeRoot activeTheme={DEV_THEME.winxp} />);

    expect(screen.getByTestId('winxp-window-body')).toBeInTheDocument();
    expect(screen.queryByTestId('default-window-body')).not.toBeInTheDocument();
    expect(screen.queryByTestId('win98-window-body')).not.toBeInTheDocument();
  });
});
