import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  DEFAULT_DEV_SELECTION,
  DEV_SYSTEM_TYPE,
  DEV_THEME,
  DevSystemRoot,
  resolveDevSystemDefinition,
  resolveDevThemeDefinition,
} from '../src/dev/themeSwitcher';

describe('dev system selection', () => {
  it('uses default system and theme selection', () => {
    expect(DEFAULT_DEV_SELECTION).toEqual({
      systemType: DEV_SYSTEM_TYPE.default,
      theme: DEV_THEME.default,
    });
  });

  it('resolves system metadata from the dev system constants', () => {
    expect(resolveDevSystemDefinition(DEV_SYSTEM_TYPE.default)).toEqual({
      id: DEV_SYSTEM_TYPE.default,
      label: 'Default',
      className: 'cm-system--default',
    });
  });

  it('resolves theme metadata from the dev selection pair', () => {
    expect(
      resolveDevThemeDefinition({
        systemType: DEV_SYSTEM_TYPE.windows,
        theme: DEV_THEME.winxp,
      }),
    ).toEqual({
      id: DEV_THEME.winxp,
      label: 'Windows XP',
      systemType: DEV_SYSTEM_TYPE.windows,
      className: 'cm-theme--winxp',
    });
  });

  it('renders the default/default system when props are omitted', () => {
    render(<DevSystemRoot />);

    expect(screen.getByTestId('default-window-body')).toBeInTheDocument();
    expect(screen.queryByTestId('windows-window-body')).not.toBeInTheDocument();
  });

  it('rejects invalid theme for chosen system', () => {
    expect(() =>
      DevSystemRoot({
        systemType: DEV_SYSTEM_TYPE.default,
        theme: DEV_THEME.winxp,
      }),
    ).toThrow('Invalid theme "winxp" for system type "default"');
  });
});
